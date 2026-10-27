import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Send, X, BookmarkPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, radius, shadow } from '../lib/design'
import { estourouPrazo } from '../lib/tempoResposta'
import { ETAPAS, etapaPorId, RESPOSTAS_PADRAO, aplicarModelo } from '../lib/espera'
import Card from '../components/ui/Card'
import IconButton from '../components/ui/IconButton'
import Avatar from '../components/ui/Avatar'

export default function Chat() {
  const { conversaId } = useParams()
  const [params] = useSearchParams()
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const [mensagens, setMensagens] = useState([])
  const [conversa, setConversa] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [destaquesCliente, setDestaquesCliente] = useState([])
  const [respostasSalvas, setRespostasSalvas] = useState([])
  const prefillFeito = useRef(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (authCarregando) return
    if (!usuario) { navigate('/login'); return }
    // Se o usuário trocar de conversa rápido, a resposta da conversa
    // anterior pode chegar depois da nova — esse "cancelado" evita que
    // ela sobrescreva os dados da conversa certa.
    let cancelado = false
    carregarConversa(() => cancelado)
    return () => { cancelado = true }
  }, [conversaId, usuario, authCarregando])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // Realtime — escuta novas mensagens
  useEffect(() => {
    if (!conversaId) return
    const channel = supabase
      .channel(`chat:${conversaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `conversa_id=eq.${conversaId}`,
      }, (payload) => {
        setMensagens(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversaId])

  const carregarConversa = async (foiCancelado) => {
    setCarregando(true)

    const colunasPrestador = 'prestadores(id, nome, categoria_id, cidade, estado, foto_perfil, user_id)'
    let { data: conv, error: erroConv } = await supabase
      .from('conversas')
      .select('*, ' + colunasPrestador + ', servicos_catalogo(nome)')
      .eq('id', conversaId)
      .single()
    if (erroConv) {
      // Banco sem o catálogo de serviços (supabase/34): segue só com o básico.
      ;({ data: conv } = await supabase
        .from('conversas')
        .select('*, ' + colunasPrestador)
        .eq('id', conversaId)
        .single())
    }

    if (foiCancelado()) return
    setConversa(conv)

    const { data: msgs } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('criado_em', { ascending: true })

    if (foiCancelado()) return
    setMensagens(msgs || [])
    setCarregando(false)

    // Marcar mensagens como lidas
    const ehPrestador = usuario?.id === conv?.prestadores?.user_id
    if (ehPrestador) {
      await supabase.from('conversas').update({ nao_lidas_prestador: 0 }).eq('id', conversaId)

      const { data: destaques } = await supabase
        .from('destaques_cliente')
        .select('*')
        .eq('user_id', conv.cliente_user_id)
        .order('ordem', { ascending: true })
      if (foiCancelado()) return
      setDestaquesCliente(destaques || [])

      const { data: salvas } = await supabase
        .from('respostas_rapidas').select('*').eq('prestador_id', conv.prestador_id).order('criado_em', { ascending: true })
      if (foiCancelado()) return
      setRespostasSalvas(salvas || [])
    } else {
      await supabase.from('conversas').update({ nao_lidas_cliente: 0 }).eq('id', conversaId)
    }
  }

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    setErro('')

    const ehPrestador = conversa?.prestadores?.user_id === usuario?.id
    const remetente = ehPrestador ? 'prestador' : 'cliente'

    const { data: msg, error } = await supabase
      .from('mensagens')
      .insert({
        conversa_id: conversaId,
        prestador_id: conversa?.prestador_id,
        cliente_user_id: conversa?.cliente_user_id,
        remetente,
        texto: texto.trim(),
      })
      .select()
      .single()

    if (error) {
      setErro('Não foi possível enviar sua mensagem. Tente novamente.')
      setEnviando(false)
      return
    }

    // Atualizar última mensagem, contador de não lidas e o relógio de
    // tempo de resposta (pontos de agilidade do prestador — ver
    // src/lib/tempoResposta.js e api/verificar-tempo-resposta.js)
    const agora = new Date().toISOString()
    const atualizacaoConversa = {
      ultima_mensagem: texto.trim(),
      ultima_mensagem_em: agora,
      nao_lidas_prestador: ehPrestador ? 0 : (conversa?.nao_lidas_prestador || 0) + 1,
      nao_lidas_cliente: ehPrestador ? (conversa?.nao_lidas_cliente || 0) + 1 : 0,
    }

    // Primeira resposta do prestador tira a conversa de "novo" (só se o banco já tem a coluna).
    if (ehPrestador && conversa?.etapa === 'novo') {
      atualizacaoConversa.etapa = 'em_orcamento'
    }

    if (!ehPrestador && !conversa?.cliente_aguardando_desde) {
      // Cliente abriu uma janela de espera nova (só se não tinha uma aberta)
      atualizacaoConversa.cliente_aguardando_desde = agora
      atualizacaoConversa.penalizado_em = null
    } else if (ehPrestador && conversa?.cliente_aguardando_desde) {
      // Prestador respondeu — fecha a janela e dá o bônus se foi dentro do prazo
      atualizacaoConversa.cliente_aguardando_desde = null
      if (!estourouPrazo(conversa.cliente_aguardando_desde, agora)) {
        try { await supabase.rpc('incrementar_pontos_resposta_bonus') } catch { /* bônus é best-effort */ }
      }
    }

    await supabase.from('conversas').update(atualizacaoConversa).eq('id', conversaId)
    setConversa(prev => prev ? { ...prev, ...atualizacaoConversa } : prev)

    // Enviar push para o destinatário (o servidor descobre quem é a partir da conversa)
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch('/api/enviar-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          conversaId,
          titulo: 'Nova mensagem no Prestador',
          corpo: texto.trim().slice(0, 80),
          url: `/chat/${conversaId}`,
          tipo: 'mensagem'
        })
      }).catch(() => {})
    })

    setTexto('')
    setEnviando(false)
  }

  const nomeServicoConversa = conversa?.servicos_catalogo?.nome || conversa?.assunto || ''

  // Cliente que chegou do botão "Pedir orçamento" de um serviço do perfil:
  // a mensagem já vem escrita (ele edita e envia pelo fluxo normal).
  useEffect(() => {
    if (prefillFeito.current || carregando || !conversa) return
    const servicoParam = params.get('servico')
    const ehPrest = conversa.prestadores?.user_id === usuario?.id
    if (servicoParam && !ehPrest && mensagens.length === 0 && !texto && nomeServicoConversa) {
      prefillFeito.current = true
      setTexto('Olá! Gostaria de um orçamento para: ' + nomeServicoConversa + '.')
    }
  }, [carregando, conversa, mensagens.length])

  const mudarEtapa = async (etapa) => {
    const anterior = conversa.etapa
    setConversa(prev => ({ ...prev, etapa }))
    const { error } = await supabase.from('conversas').update({ etapa }).eq('id', conversaId)
    if (error) {
      setConversa(prev => ({ ...prev, etapa: anterior }))
      setErro('Não foi possível mudar a etapa agora.')
    }
  }

  const usarResposta = (modelo) => {
    const preenchido = aplicarModelo(modelo, { nome: conversa?.cliente_nome, servico: nomeServicoConversa })
    setTexto(atual => (atual.trim() ? atual.trim() + ' ' + preenchido : preenchido))
  }

  const salvarComoResposta = async () => {
    const corpo = texto.trim()
    if (!corpo) return
    const titulo = window.prompt('Dê um nome curto pra essa resposta rápida (ex: "Horários disponíveis"):')
    if (!titulo || titulo.trim().length < 2) return
    const { data, error } = await supabase
      .from('respostas_rapidas')
      .insert({ prestador_id: conversa.prestador_id, titulo: titulo.trim().slice(0, 40), texto: corpo.slice(0, 1000) })
      .select().single()
    if (error) { setErro('Não foi possível salvar a resposta rápida.'); return }
    setRespostasSalvas(prev => [...prev, data])
  }

  const removerResposta = async (resposta) => {
    if (!window.confirm('Remover a resposta rápida "' + resposta.titulo + '"?')) return
    const { error } = await supabase.from('respostas_rapidas').delete().eq('id', resposta.id)
    if (!error) setRespostasSalvas(prev => prev.filter(r => r.id !== resposta.id))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const ehMinha = (msg) => {
    const ehPrestador = conversa?.prestadores?.user_id === usuario?.id
    return (ehPrestador && msg.remetente === 'prestador') || (!ehPrestador && msg.remetente === 'cliente')
  }

  if (carregando) return (
    <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando conversa...</div>
  )

  const ehPrestadorLogado = conversa?.prestadores?.user_id === usuario?.id
  const nomeContato = ehPrestadorLogado
    ? conversa?.cliente_nome || 'Cliente'
    : conversa?.prestadores?.nome || 'Prestador'
  const fotoContato = ehPrestadorLogado
    ? conversa?.cliente_foto_url
    : conversa?.prestadores?.foto_perfil

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <Card padding={16} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <IconButton icon={<ArrowLeft size={18} />} tone="ghost" size={36} onClick={() => navigate(-1)} aria-label="Voltar" />
        <Avatar nome={nomeContato} foto={fotoContato} size={40} style={{ fontSize: 14 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{nomeContato}</p>
          <p style={{ fontSize: 12, color: colors.textSub, textTransform: ehPrestadorLogado ? 'none' : 'capitalize', margin: 0 }}>
            {ehPrestadorLogado
              ? (nomeServicoConversa ? 'Pedido: ' + nomeServicoConversa : 'Conversa direta')
              : conversa?.prestadores?.categoria_id + ' · ' + conversa?.prestadores?.cidade + ', ' + conversa?.prestadores?.estado}
          </p>
          {!ehPrestadorLogado && nomeServicoConversa && (
            <p style={{ fontSize: 12, fontWeight: 700, color: colors.primaryHover, margin: '2px 0 0' }}>{nomeServicoConversa}</p>
          )}
        </div>
        {ehPrestadorLogado && conversa?.etapa && (
          <select
            value={conversa.etapa}
            onChange={e => mudarEtapa(e.target.value)}
            aria-label="Etapa da conversa"
            style={{
              marginLeft: 'auto', flexShrink: 0, padding: '7px 10px', fontSize: 12, fontWeight: 700, borderRadius: 999,
              border: 'none', cursor: 'pointer', background: etapaPorId(conversa.etapa).bg, color: etapaPorId(conversa.etapa).cor,
            }}
          >
            {ETAPAS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        )}
      </Card>

      {/* Destaques do cliente — dá contexto pro prestador antes de orçar */}
      {ehPrestadorLogado && destaquesCliente.length > 0 && (
        <Card padding={12} style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSub, margin: '0 0 8px 4px' }}>
            Destaques de {nomeContato}
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
            {destaquesCliente.map(d => (
              <button
                key={d.id}
                onClick={() => window.open(d.url, '_blank')}
                style={{
                  flexShrink: 0, width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                  border: `1.5px solid ${colors.border}`, padding: 0, cursor: 'pointer',
                }}
                aria-label={d.titulo}
              >
                {d.tipo === 'video' ? (
                  <video src={d.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={d.url} alt={d.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Mensagens */}
      <Card padding={16} style={{ marginBottom: 12, minHeight: 400, maxHeight: 500, overflowY: 'auto' }}>
        {mensagens.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageCircle size={40} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: colors.textSub }}>Nenhuma mensagem ainda. Diga olá!</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensagens.map((msg, i) => {
              const minha = ehMinha(msg)
              const anterior = mensagens[i - 1]
              const mostrarNome = !anterior || ehMinha(anterior) !== minha

              return (
                <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: minha ? 'flex-end' : 'flex-start' }}>
                  {mostrarNome && (
                    <p style={{ fontSize: 11, fontWeight: 700, margin: '0 4px 3px', color: colors.textSub }}>
                      {minha ? 'Você' : nomeContato}
                    </p>
                  )}
                  <div
                    style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 18, fontSize: 14,
                      ...(minha
                        ? { background: colors.primary, color: '#fff', borderBottomRightRadius: 4 }
                        : { background: colors.bg, color: colors.text, borderBottomLeftRadius: 4, border: `1px solid ${colors.border}` })
                    }}
                  >
                    <p style={{ margin: 0 }}>{msg.texto}</p>
                    <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                      {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      {erro && (
        <p style={{ fontSize: 12, marginBottom: 8, padding: '8px 12px', borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>
          {erro}
        </p>
      )}

      {/* Respostas rápidas (só o prestador) */}
      {ehPrestadorLogado && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 4, scrollbarWidth: 'none' }}>
          {RESPOSTAS_PADRAO.map(r => (
            <button key={r.id} type="button" onClick={() => usarResposta(r.texto)}
              style={{ flexShrink: 0, padding: '7px 13px', fontSize: 12, fontWeight: 600, borderRadius: 999, border: '1px solid ' + colors.border, background: '#fff', color: colors.textSub, cursor: 'pointer' }}>
              {r.titulo}
            </button>
          ))}
          {respostasSalvas.map(r => (
            <span key={r.id} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', borderRadius: 999, border: '1px solid #BBF7D0', background: '#F0FDF4' }}>
              <button type="button" onClick={() => usarResposta(r.texto)}
                style={{ padding: '7px 6px 7px 13px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none', color: colors.primaryHover, cursor: 'pointer' }}>
                {r.titulo}
              </button>
              <button type="button" onClick={() => removerResposta(r)} aria-label={'Remover ' + r.titulo}
                style={{ padding: '0 9px 0 2px', border: 'none', background: 'none', color: colors.primaryHover, cursor: 'pointer', display: 'flex' }}>
                <X size={12} />
              </button>
            </span>
          ))}
          {texto.trim().length > 1 && (
            <button type="button" onClick={salvarComoResposta}
              style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', fontSize: 12, fontWeight: 600, borderRadius: 999, border: '1px dashed ' + colors.border, background: 'none', color: colors.textSub, cursor: 'pointer' }}>
              <BookmarkPlus size={13} /> Salvar texto atual
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <Card padding={10} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: radius.input,
            border: `1px solid ${colors.border}`, background: colors.bg, outline: 'none',
            resize: 'none', maxHeight: 120, fontFamily: 'inherit',
          }}
        />
        <IconButton
          icon={<Send size={18} />}
          tone="primary"
          size={42}
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          aria-label="Enviar mensagem"
          style={{ opacity: (!texto.trim() || enviando) ? 0.4 : 1, boxShadow: shadow.btn }}
        />
      </Card>
    </div>
  )
}

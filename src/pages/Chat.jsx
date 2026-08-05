import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, radius, shadow } from '../lib/design'
import Card from '../components/ui/Card'
import IconButton from '../components/ui/IconButton'
import Avatar from '../components/ui/Avatar'

export default function Chat() {
  const { conversaId } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [mensagens, setMensagens] = useState([])
  const [conversa, setConversa] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarConversa()
  }, [conversaId, usuario])

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

  const carregarConversa = async () => {
    setCarregando(true)

    const { data: conv } = await supabase
      .from('conversas')
      .select('*, prestadores(id, nome, categoria_id, cidade, estado, foto_perfil, user_id)')
      .eq('id', conversaId)
      .single()

    setConversa(conv)

    const { data: msgs } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('criado_em', { ascending: true })

    setMensagens(msgs || [])
    setCarregando(false)

    // Marcar mensagens como lidas
    const ehPrestador = usuario?.id === conv?.prestadores?.user_id
    if (ehPrestador) {
      await supabase.from('conversas').update({ nao_lidas_prestador: 0 }).eq('id', conversaId)
    } else {
      await supabase.from('conversas').update({ nao_lidas_cliente: 0 }).eq('id', conversaId)
    }
  }

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)

    const ehPrestador = conversa?.prestadores?.user_id === usuario?.id
    const remetente = ehPrestador ? 'prestador' : 'cliente'

    const { data: msg } = await supabase
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

    // Atualizar última mensagem e contador de não lidas
    await supabase.from('conversas').update({
      ultima_mensagem: texto.trim(),
      ultima_mensagem_em: new Date().toISOString(),
      nao_lidas_prestador: ehPrestador ? 0 : (conversa?.nao_lidas_prestador || 0) + 1,
      nao_lidas_cliente: ehPrestador ? (conversa?.nao_lidas_cliente || 0) + 1 : 0,
    }).eq('id', conversaId)

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
          <p style={{ fontSize: 12, color: colors.textSub, textTransform: 'capitalize', margin: 0 }}>
            {conversa?.prestadores?.categoria_id} · {conversa?.prestadores?.cidade}, {conversa?.prestadores?.estado}
          </p>
        </div>
      </Card>

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

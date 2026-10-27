import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, spacing, type as typeScale } from '../lib/design'
import { estourouPrazo } from '../lib/tempoResposta'
import { formatarEspera, etapaPorId } from '../lib/espera'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import Avatar from '../components/ui/Avatar'

const aguardando = (c) => !!c.cliente_aguardando_desde
const naoLida = (c) => (c.nao_lidas_prestador || 0) > 0

// Filtros da caixa do prestador. "Todas" esconde o que foi arquivado, a
// menos que o cliente tenha escrito de novo (aí a conversa reaparece).
const FILTROS = [
  { id: 'todas', label: 'Todas', fn: (c) => c.etapa !== 'arquivado' || naoLida(c) || aguardando(c), sempre: true },
  { id: 'aguardando', label: 'Aguardando resposta', fn: aguardando, sempre: true },
  { id: 'nao_lidas', label: 'Não lidas', fn: naoLida, sempre: true },
  { id: 'em_orcamento', label: 'Em orçamento', fn: (c) => c.etapa === 'em_orcamento' },
  { id: 'agendado', label: 'Agendados', fn: (c) => c.etapa === 'agendado' },
  { id: 'concluido', label: 'Concluídos', fn: (c) => c.etapa === 'concluido' },
  { id: 'arquivado', label: 'Arquivadas', fn: (c) => c.etapa === 'arquivado' },
]

export default function Conversas() {
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const [comoPrestador, setComoPrestador] = useState([])
  const [comoCliente, setComoCliente] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [prestadorId, setPrestadorId] = useState(null)
  const [aba, setAba] = useState(null) // 'prestador' | 'cliente'
  const [filtro, setFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const pedidoAtual = useRef(0)

  useEffect(() => {
    if (authCarregando) return
    if (!usuario) { navigate('/login'); return }
    carregarConversas()
  }, [usuario, authCarregando])

  // Realtime — atualiza a lista quando chega mensagem ou muda uma conversa
  useEffect(() => {
    if (!usuario) return
    const channel = supabase
      .channel('conversas_lista')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, () => carregarConversas())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [usuario])

  // Tenta com o nome do serviço; se o banco ainda não tiver o catálogo
  // (supabase/34), cai no select simples em vez de esvaziar a caixa.
  const buscarComServico = async (selecionarComServico, selecionarSimples, coluna, valor) => {
    let r = await supabase.from('conversas').select(selecionarComServico).eq(coluna, valor)
    if (r.error) r = await supabase.from('conversas').select(selecionarSimples).eq(coluna, valor)
    return r.data || []
  }

  const carregarConversas = async () => {
    const meuPedido = ++pedidoAtual.current

    const { data: prest } = await supabase.from('prestadores').select('id').eq('user_id', usuario.id).maybeSingle()

    const [comoPrest, comoCli] = await Promise.all([
      prest ? buscarComServico('*, servicos_catalogo(nome)', '*', 'prestador_id', prest.id) : [],
      buscarComServico(
        '*, prestadores(id, nome, categoria_id, cidade, estado, foto_perfil), servicos_catalogo(nome)',
        '*, prestadores(id, nome, categoria_id, cidade, estado, foto_perfil)',
        'cliente_user_id', usuario.id
      ),
    ])

    // Uma resposta mais lenta de uma chamada anterior não pode sobrescrever a mais nova.
    if (meuPedido !== pedidoAtual.current) return

    setPrestadorId(prest?.id || null)
    setComoPrestador(comoPrest)
    setComoCliente(comoCli)
    setAba(atual => atual || (prest ? 'prestador' : 'cliente'))
    setCarregando(false)
  }

  const naAbaPrestador = aba === 'prestador'
  const agora = new Date()

  const contagens = useMemo(
    () => Object.fromEntries(FILTROS.map(f => [f.id, comoPrestador.filter(f.fn).length])),
    [comoPrestador]
  )
  const totalAguardando = contagens.aguardando || 0

  const visiveis = useMemo(() => {
    if (!naAbaPrestador) {
      return [...comoCliente].sort((a, b) => new Date(b.ultima_mensagem_em || 0) - new Date(a.ultima_mensagem_em || 0))
    }
    const fn = FILTROS.find(f => f.id === filtro)?.fn || FILTROS[0].fn
    const termo = busca.trim().toLowerCase()
    const filtradas = comoPrestador.filter(fn).filter(c => !termo || [
      c.cliente_nome, c.assunto, c.servicos_catalogo?.nome, c.ultima_mensagem,
    ].some(txt => (txt || '').toLowerCase().includes(termo)))

    // Fila de trabalho: quem espera resposta vem primeiro, o que espera há
    // mais tempo no topo; o resto por atividade recente.
    return filtradas.sort((a, b) => {
      const aa = aguardando(a), ab = aguardando(b)
      if (aa !== ab) return aa ? -1 : 1
      if (aa && ab) return new Date(a.cliente_aguardando_desde) - new Date(b.cliente_aguardando_desde)
      return new Date(b.ultima_mensagem_em || 0) - new Date(a.ultima_mensagem_em || 0)
    })
  }, [naAbaPrestador, comoPrestador, comoCliente, filtro, busca])

  if (carregando) return (
    <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando conversas...</div>
  )

  const semNenhuma = comoPrestador.length === 0 && comoCliente.length === 0
  const temAsDuasAbas = comoPrestador.length > 0 && comoCliente.length > 0

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ ...typeScale.subtitle, color: colors.text, marginBottom: 16 }}>Mensagens</h1>

      {temAsDuasAbas && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Chip active={naAbaPrestador} onClick={() => setAba('prestador')} count={comoPrestador.length}>Meus clientes</Chip>
          <Chip active={!naAbaPrestador} onClick={() => setAba('cliente')} count={comoCliente.length}>Profissionais que contatei</Chip>
        </div>
      )}

      {semNenhuma ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <MessageCircle size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: colors.textSub }}>Nenhuma conversa ainda.</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 20px' }}>
            {prestadorId
              ? 'Quando um cliente falar com você, a conversa aparece aqui.'
              : 'Escolha um profissional e converse direto com ele pra combinar o serviço.'}
          </p>
          {prestadorId ? (
            <Button onClick={() => navigate('/pedidos')}>Ver pedidos de clientes</Button>
          ) : (
            <Button onClick={() => navigate('/busca?ordem=distancia')}>Encontrar profissional perto de mim</Button>
          )}
        </Card>
      ) : (
        <>
          {naAbaPrestador && totalAguardando > 0 && filtro !== 'aguardando' && (
            <Card
              interactive
              padding={14}
              onClick={() => setFiltro('aguardando')}
              style={{ marginBottom: 14, background: '#FEF3C7', border: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Clock size={18} color="#92610A" />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#92610A' }}>
                {totalAguardando} cliente{totalAguardando !== 1 ? 's' : ''} aguardando sua resposta
              </p>
            </Card>
          )}

          {naAbaPrestador && (
            <>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar por cliente, serviço ou mensagem..."
                  style={{ width: '100%', padding: '10px 14px 10px 36px', fontSize: 14, borderRadius: 12, border: `1px solid ${colors.border}`, outline: 'none', background: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12, scrollbarWidth: 'none' }}>
                {FILTROS.filter(f => f.sempre || contagens[f.id] > 0 || filtro === f.id).map(f => (
                  <Chip key={f.id} active={filtro === f.id} onClick={() => setFiltro(f.id)} count={contagens[f.id]}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {visiveis.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 14, color: colors.textSub, padding: '32px 0' }}>
              Nenhuma conversa {busca ? 'encontrada com essa busca' : 'nesse filtro'}.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {visiveis.map(conv => {
                const naoLidas = naAbaPrestador ? conv.nao_lidas_prestador : conv.nao_lidas_cliente
                const nome = naAbaPrestador ? conv.cliente_nome || 'Cliente' : conv.prestadores?.nome || 'Prestador'
                const foto = naAbaPrestador ? conv.cliente_foto_url : conv.prestadores?.foto_perfil
                const sub = naAbaPrestador ? '' : `${conv.prestadores?.categoria_id} · ${conv.prestadores?.cidade}`
                const assunto = conv.servicos_catalogo?.nome || conv.assunto
                const etapa = etapaPorId(conv.etapa)
                const espera = naAbaPrestador && aguardando(conv)
                const atrasado = espera && estourouPrazo(conv.cliente_aguardando_desde, agora.toISOString())

                return (
                  <Card key={conv.id} interactive padding={16} onClick={() => navigate(`/chat/${conv.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar nome={nome} foto={foto} size={48} style={{ fontSize: 16 }} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, margin: 0 }}>
                          {conv.ultima_mensagem_em && new Date(conv.ultima_mensagem_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {sub && <p style={{ fontSize: 12, color: colors.textSub, textTransform: 'capitalize', marginBottom: 4 }}>{sub}</p>}

                      {(assunto || naAbaPrestador) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          {assunto && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: '#F0FDF4', color: colors.primaryHover, border: '1px solid #BBF7D0' }}>
                              {assunto}
                            </span>
                          )}
                          {naAbaPrestador && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: etapa.bg, color: etapa.cor }}>
                              {etapa.label}
                            </span>
                          )}
                          {espera && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: atrasado ? '#FEE2E2' : '#FEF3C7', color: atrasado ? '#B91C1C' : '#92610A' }}>
                              {atrasado ? 'Atrasado' : 'Responder'} · {formatarEspera(conv.cliente_aguardando_desde, agora)}
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 12, color: colors.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {conv.ultima_mensagem || 'Nenhuma mensagem ainda'}
                        </p>
                        {naoLidas > 0 && (
                          <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: colors.primary, flexShrink: 0 }}>
                            {naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

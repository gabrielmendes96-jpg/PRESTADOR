import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Image, Tag, Bot, Rocket, Calendar, BarChart3, Trophy,
  ClipboardList, Star, MessageCircle, Gift, CreditCard, ExternalLink,
  Wrench, CheckCircle2, Medal, Crown, TrendingUp, Home as HomeIcon, Check,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'
import { colors, radius, shadow, spacing } from '../lib/design'
import Portfolio from '../components/Portfolio'
import HashtagsInput from '../components/HashtagsInput'
import FotoPerfilUpload from '../components/FotoPerfilUpload'
import RedesSociaisForm from '../components/RedesSociaisForm'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const menuItens = [
  { id: 'perfil', label: 'Meu Perfil', icon: User },
  { id: 'portfolio', label: 'Portfólio', icon: Image },
  { id: 'hashtags', label: 'Meus Serviços', icon: Tag },
  { id: 'assistente', label: 'Assistente IA', icon: Bot },
  { id: 'boost', label: 'Impulsionar', icon: Rocket },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: Calendar },
  { id: 'ganhos', label: 'Desempenho', icon: BarChart3 },
  { id: 'niveis', label: 'Meu Nível', icon: Trophy },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
  { id: 'indicacao', label: 'Indique e Ganhe', icon: Gift },
  { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
]

const niveis = [
  { icon: Medal, nome: 'Bronze', cor: '#B45309' },
  { icon: Medal, nome: 'Prata', cor: '#64748B' },
  { icon: Medal, nome: 'Ouro', cor: '#D97706' },
  { icon: Crown, nome: 'Embaixador', cor: colors.primaryHover },
]

const boostItens = [
  { icon: TrendingUp, titulo: 'Topo das buscas', desc: 'Antes de todos na sua categoria' },
  { icon: HomeIcon, titulo: 'Banner na home', desc: 'Visível para todos os clientes' },
  { icon: Star, titulo: 'Badge de destaque', desc: 'Chama atenção no seu card' },
]

const planosResumo = [
  { id: 'basico', nome: 'Básico', preco: 'R$49/mês' },
  { id: 'profissional', nome: 'Profissional', preco: 'R$99/mês' },
  { id: 'premium', nome: 'Premium', preco: 'R$199/mês' },
]

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, background: colors.bg, outline: 'none', color: colors.text,
}

function TabHeader({ icon: Icon, title, desc }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: colors.text, margin: desc ? '0 0 4px' : 0 }}>
        {Icon && <Icon size={19} color={colors.primary} />} {title}
      </h2>
      {desc && <p style={{ fontSize: 14, color: colors.textSub, margin: 0 }}>{desc}</p>}
    </div>
  )
}

export default function PainelPrestador() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('perfil')
  const [prestador, setPrestador] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroSalvar, setErroSalvar] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [pedidosCategoria, setPedidosCategoria] = useState([])
  const [totalPedidosCategoria, setTotalPedidosCategoria] = useState(0)
  const [pedidosHoje, setPedidosHoje] = useState(0)
  const { categorias } = useCategorias()

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!usuario) navigate('/login')
  }, [usuario, navigate])

  // Carrega dados do prestador
  useEffect(() => {
    if (!usuario) return
    async function carregar() {
      setCarregando(true)
      const { data } = await supabase
        .from('prestadores')
        .select('*')
        .eq('user_id', usuario.id)
        .single()
      setPrestador(data || null)
      setCarregando(false)

      if (data) {
        const { data: avs } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('prestador_id', data.id)
          .order('criado_em', { ascending: false })
        setAvaliacoes(avs || [])

        const { data: msgs } = await supabase
          .from('mensagens')
          .select('*')
          .eq('prestador_id', data.id)
          .order('criado_em', { ascending: false })
        setMensagens(msgs || [])

        // Pedidos abertos da mesma categoria do prestador — feed sempre
        // atualizado do que tem disponível pra ele hoje.
        if (data.categoria_id) {
          const inicioDoDia = new Date()
          inicioDoDia.setHours(0, 0, 0, 0)

          const filtroBase = () => supabase
            .from('pedidos_servico')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', data.categoria_id)
            .eq('status', 'aberto')
            .eq('pago', true)
            .gt('expira_em', new Date().toISOString())

          const { data: lista } = await supabase
            .from('pedidos_servico')
            .select('id, titulo, cidade, estado, orcamento_min, orcamento_max, criado_em')
            .eq('categoria_id', data.categoria_id)
            .eq('status', 'aberto')
            .eq('pago', true)
            .gt('expira_em', new Date().toISOString())
            .order('criado_em', { ascending: false })
            .limit(5)
          setPedidosCategoria(lista || [])

          const { count: total } = await filtroBase()
          setTotalPedidosCategoria(total || 0)

          const { count: hoje } = await filtroBase().gte('criado_em', inicioDoDia.toISOString())
          setPedidosHoje(hoje || 0)
        }
      }
    }
    carregar()
  }, [usuario])

  const salvarPerfil = async () => {
    if (!prestador) return
    setSalvando(true)
    setErroSalvar(false)
    const { error } = await supabase
      .from('prestadores')
      .update({
        nome: prestador.nome,
        descricao: prestador.descricao,
        cidade: prestador.cidade,
        estado: prestador.estado,
        whatsapp: prestador.whatsapp,
        categoria_id: prestador.categoria_id,
        raio_atendimento: prestador.raio_atendimento,
        disponivel: prestador.disponivel,
        mostrar_whatsapp: prestador.mostrar_whatsapp !== false,
        redes_sociais: prestador.redes_sociais || {},
        geocodificado: false, // força re-geocodificação
      })
      .eq('user_id', usuario.id)

    setSalvando(false)

    if (error) {
      setErroSalvar(true)
      setTimeout(() => setErroSalvar(false), 4000)
      return
    }

    // Geocodificar em background
    fetch('/api/geocodificar', { method: 'POST' }).catch(() => {})

    setSucesso(true)
    setTimeout(() => setSucesso(false), 3000)
  }

  if (carregando) return (
    <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando painel...</div>
  )

  if (!prestador) return (
    <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
      <Wrench size={44} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
        Você ainda não tem um perfil de prestador
      </h2>
      <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>
        Crie seu perfil para começar a receber clientes.
      </p>
      <Button onClick={() => navigate('/cadastro-pro')}>Criar meu perfil</Button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: spacing.card, minHeight: '80vh', alignItems: 'flex-start' }}>

      {/* Menu lateral */}
      <aside style={{ width: '224px', flexShrink: 0 }}>
        <div style={{
          background: '#111827', borderRadius: radius.card, padding: 16,
          boxShadow: shadow.card,
          position: 'sticky', top: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {prestador.foto_perfil ? (
              <img src={prestador.foto_perfil} alt={prestador.nome}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${colors.primary}` }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0, background: '#DCFCE7', color: colors.primaryHover }}>
                {prestador.nome?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prestador.nome?.split(' ')[0]}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize', margin: 0 }}>{prestador.plano_id}</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuItens.map(item => {
              const ativo = aba === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setAba(item.id)}
                  className="btn-press"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12, fontSize: 14,
                    textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: ativo ? colors.primary : 'transparent',
                    color: ativo ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontWeight: ativo ? 700 : 500,
                  }}
                >
                  <item.icon size={17} strokeWidth={2} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 12, paddingTop: 12 }}>
            <button
              onClick={() => navigate(`/profissional/${prestador.id}`)}
              className="btn-press"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, fontSize: 14,
                textAlign: 'left', border: 'none', cursor: 'pointer',
                background: 'transparent', color: '#4ADE80', fontWeight: 600,
              }}
            >
              <ExternalLink size={17} strokeWidth={2} />
              Ver meu perfil
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, minWidth: 0 }}>

        {/* ABA: PERFIL */}
        {aba === 'perfil' && (
          <Card padding={24}>
            <TabHeader icon={User} title="Editar perfil" />

            {/* Foto de perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, borderRadius: 16, background: colors.bg }}>
              <FotoPerfilUpload
                prestadorId={prestador.id}
                fotoAtual={prestador.foto_perfil}
                onAtualizar={(url) => setPrestador({ ...prestador, foto_perfil: url })}
              />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>Foto de perfil</p>
                <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>Clique na foto para alterar. Profissionais com foto recebem 3x mais contatos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Nome completo</label>
                <input
                  type="text"
                  value={prestador.nome || ''}
                  onChange={e => setPrestador({ ...prestador, nome: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>WhatsApp</label>
                <input
                  type="text"
                  value={prestador.whatsapp || ''}
                  onChange={e => setPrestador({ ...prestador, whatsapp: e.target.value })}
                  style={inputStyle}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Categoria</label>
                <select
                  value={prestador.categoria_id || ''}
                  onChange={e => setPrestador({ ...prestador, categoria_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Raio de atendimento (km)</label>
                <input
                  type="number"
                  value={prestador.raio_atendimento || 30}
                  onChange={e => setPrestador({ ...prestador, raio_atendimento: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Cidade</label>
                <input
                  type="text"
                  value={prestador.cidade || ''}
                  onChange={e => setPrestador({ ...prestador, cidade: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Estado</label>
                <input
                  type="text"
                  value={prestador.estado || ''}
                  onChange={e => setPrestador({ ...prestador, estado: e.target.value })}
                  maxLength={2}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Sobre você</label>
              <textarea
                value={prestador.descricao || ''}
                onChange={e => setPrestador({ ...prestador, descricao: e.target.value })}
                rows={4}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder="Descreva sua experiência e serviços..."
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prestador.disponivel || false}
                  onChange={e => setPrestador({ ...prestador, disponivel: e.target.checked })}
                />
                <span style={{ fontSize: 14, color: colors.text }}>Disponível para novos clientes</span>
              </label>
            </div>

            {prestador.plano_id === 'premium' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prestador.mostrar_whatsapp !== false}
                    onChange={e => setPrestador({ ...prestador, mostrar_whatsapp: e.target.checked })}
                  />
                  <span style={{ fontSize: 14, color: colors.text }}>Mostrar botão de WhatsApp no meu perfil público</span>
                </label>
                <p style={{ fontSize: 12, color: colors.textSub, margin: '4px 0 0 24px' }}>
                  Recurso exclusivo do plano Premium. Desative se preferir receber contatos só pelo chat do app.
                </p>
              </div>
            )}

            {/* Redes sociais */}
            <div style={{ marginBottom: 20, padding: 16, borderRadius: 16, background: colors.bg }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>Redes sociais e site</p>
              <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 16 }}>Adicione seus perfis para que clientes possam te encontrar em outras plataformas.</p>
              <RedesSociaisForm
                links={prestador.redes_sociais || {}}
                onChange={redes => setPrestador({ ...prestador, redes_sociais: redes })}
              />
            </div>

            {sucesso && (
              <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 12, fontSize: 14, background: '#DCFCE7', color: colors.primaryHover }}>
                <CheckCircle2 size={16} strokeWidth={2.5} /> Perfil atualizado com sucesso!
              </div>
            )}

            {erroSalvar && (
              <div className="fade-in" style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 12, fontSize: 14, background: '#FEF2F2', color: '#B91C1C' }}>
                Não foi possível salvar as alterações. Tente novamente.
              </div>
            )}

            <Button onClick={salvarPerfil} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </Card>
        )}

        {/* ABA: PORTFÓLIO */}
        {aba === 'portfolio' && (
          <Card padding={24}>
            <TabHeader icon={Image} title="Meu portfólio" desc="Adicione fotos e vídeos dos serviços que você já realizou. Perfis com fotos recebem 3x mais contatos!" />
            <Portfolio prestadorId={prestador.id} />
          </Card>
        )}

        {/* ABA: DISPONIBILIDADE */}
        {aba === 'disponibilidade' && (
          <Card padding={24}>
            <TabHeader icon={Calendar} title="Calendário de disponibilidade" desc="Marque os dias que você está disponível para atender clientes." />
            <Button fullWidth icon={<Calendar size={16} />} onClick={() => navigate('/disponibilidade')}>
              Abrir calendário
            </Button>
          </Card>
        )}

        {/* ABA: DESEMPENHO */}
        {aba === 'ganhos' && (
          <Card padding={24}>
            <TabHeader icon={BarChart3} title="Desempenho" desc="Veja quantas pessoas viram seu perfil e como você está evoluindo." />
            <Button fullWidth icon={<BarChart3 size={16} />} onClick={() => navigate('/ganhos')}>
              Ver meu desempenho
            </Button>
          </Card>
        )}

        {/* ABA: NÍVEIS */}
        {aba === 'niveis' && (
          <Card padding={24}>
            <TabHeader icon={Trophy} title="Programa de níveis" desc="Evolua e ganhe benefícios exclusivos na plataforma." />
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {niveis.map(n => (
                <div key={n.nome} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 14, background: colors.bg }}>
                  <n.icon size={22} color={n.cor} style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 11, color: colors.textSub, margin: 0 }}>{n.nome}</p>
                </div>
              ))}
            </div>
            <Button fullWidth icon={<Trophy size={16} />} onClick={() => navigate('/niveis')}>
              Ver meu nível
            </Button>
          </Card>
        )}

        {/* ABA: IMPULSIONAR */}
        {aba === 'boost' && (
          <Card padding={24}>
            <TabHeader icon={Rocket} title="Impulsionar perfil" desc="Apareça no topo das buscas e na home para mais clientes te encontrarem." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {boostItens.map(i => (
                <div key={i.titulo} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: colors.bg }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i.icon size={17} color={colors.primary} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{i.titulo}</p>
                    <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>{i.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button fullWidth icon={<Rocket size={16} />} onClick={() => navigate('/boost')}>
              Ver planos de impulsionamento
            </Button>
          </Card>
        )}

        {/* ABA: ASSISTENTE IA */}
        {aba === 'assistente' && (
          <Card padding={24}>
            <TabHeader icon={Bot} title="Assistente de perfil" desc="A IA analisa seu perfil e te ajuda a melhorá-lo — bio, hashtags e dicas de fotos." />
            <Button fullWidth icon={<Bot size={17} />} onClick={() => navigate('/assistente')}>
              Abrir Assistente de Perfil
            </Button>
          </Card>
        )}

        {/* ABA: PEDIDOS */}
        {aba === 'pedidos' && (
          <Card padding={24}>
            <TabHeader icon={ClipboardList} title="Pedidos disponíveis" desc={`Pedidos abertos na sua categoria — ${pedidosHoje} novo${pedidosHoje !== 1 ? 's' : ''} hoje`} />
            {prestador.plano_id !== 'premium' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Crown size={36} color={colors.secondary} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                  {totalPedidosCategoria > 0
                    ? `${totalPedidosCategoria} pedido${totalPedidosCategoria !== 1 ? 's' : ''} esperando por prestadores da sua categoria`
                    : 'Recurso exclusivo Premium'}
                </p>
                <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>
                  Faça upgrade para o plano Premium e acesse pedidos de clientes que precisam do seu serviço agora.
                </p>
                <Button onClick={() => navigate('/planos')}>Ver planos</Button>
              </div>
            ) : pedidosCategoria.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <ClipboardList size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: colors.textSub }}>Nenhum pedido aberto na sua categoria no momento.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {pedidosCategoria.map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/pedidos/${p.id}`)}
                      className="btn-press"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        padding: 14, borderRadius: 14, background: colors.bg, border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</p>
                        <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>{p.cidade}, {p.estado}</p>
                      </div>
                      {(p.orcamento_min || p.orcamento_max) && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: colors.primary, margin: 0, flexShrink: 0 }}>
                          {p.orcamento_max ? `até R$${p.orcamento_max}` : `a partir de R$${p.orcamento_min}`}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
                <Button icon={<ClipboardList size={16} />} onClick={() => navigate('/pedidos')}>
                  Ver todos os pedidos ({totalPedidosCategoria})
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* ABA: MEUS SERVIÇOS */}
        {aba === 'hashtags' && (
          <Card padding={24}>
            <TabHeader icon={Tag} title="Meus serviços" desc="Adicione hashtags dos serviços que você realiza. Os clientes podem buscar por elas e encontrar você mais facilmente." />
            <p style={{ fontSize: 13, color: colors.primary, marginTop: -12, marginBottom: 16 }}>#pintura #reboco #reforma #banheiro #cozinha</p>
            <HashtagsInput prestadorId={prestador.id} />
          </Card>
        )}

        {/* ABA: INDIQUE E GANHE */}
        {aba === 'indicacao' && (
          <Card padding={24}>
            <TabHeader icon={Gift} title="Indique e ganhe" desc="Indique prestadores e ganhe meses grátis na sua assinatura!" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { meta: 5, recompensa: '1 mês grátis' },
                { meta: 10, recompensa: '2 meses grátis' },
                { meta: 20, recompensa: '4 meses grátis' },
                { meta: 50, recompensa: '1 ano grátis' },
                { meta: 100, recompensa: 'Sempre grátis + Embaixador' },
              ].map(n => (
                <div key={n.meta} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, background: colors.bg }}>
                  <span style={{ fontSize: 14, color: colors.text }}>{n.meta} indicados ativos</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.primaryHover }}>{n.recompensa}</span>
                </div>
              ))}
            </div>
            <Button fullWidth icon={<Gift size={16} />} onClick={() => navigate('/indicacao')}>
              Ver meu link de indicação
            </Button>
          </Card>
        )}

        {/* ABA: AVALIAÇÕES */}
        {aba === 'avaliacoes' && (
          <Card padding={24}>
            <TabHeader icon={Star} title="Minhas avaliações" desc={`${avaliacoes.length} avaliação${avaliacoes.length !== 1 ? 'ões' : ''} recebida${avaliacoes.length !== 1 ? 's' : ''}`} />

            {avaliacoes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Star size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: colors.textSub }}>Você ainda não recebeu avaliações.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.card }}>
                {avaliacoes.map(a => (
                  <div key={a.id} style={{ padding: 16, borderRadius: 14, background: colors.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{a.autor_nome}</p>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={13} fill={n <= a.nota ? colors.secondary : 'none'} color={colors.secondary} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: colors.textSub, margin: 0 }}>{a.comentario}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                      {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ABA: MENSAGENS */}
        {aba === 'mensagens' && (
          <Card padding={24}>
            <TabHeader icon={MessageCircle} title="Mensagens" desc="Veja todas as suas conversas com clientes." />
            <Button icon={<MessageCircle size={16} />} onClick={() => navigate('/mensagens')}>
              Abrir mensagens
            </Button>
          </Card>
        )}

        {/* ABA: ASSINATURA */}
        {aba === 'assinatura' && (
          <Card padding={24}>
            <TabHeader icon={CreditCard} title="Minha assinatura" />

            <div style={{ padding: 20, borderRadius: 18, marginBottom: 20, background: '#DCFCE7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontWeight: 700, textTransform: 'capitalize', color: colors.text, margin: 0 }}>
                  Plano {prestador.plano_id}
                </p>
                <Badge tone="success">{prestador.plano_status === 'ativo' ? 'Ativo' : prestador.plano_status}</Badge>
              </div>
              <p style={{ fontSize: 14, color: colors.primaryHover, margin: 0 }}>
                {prestador.plano_id === 'basico' && 'R$49/mês — Perfil básico na plataforma'}
                {prestador.plano_id === 'profissional' && 'R$99/mês — Destaque nos resultados + selo de plano Profissional'}
                {prestador.plano_id === 'premium' && 'R$199/mês — Topo das buscas + suporte prioritário'}
              </p>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>Quer mudar de plano?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planosResumo.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14,
                    ...(prestador.plano_id === p.id
                      ? { border: `2px solid ${colors.primary}`, background: '#F0FDF4' }
                      : { border: `1px solid ${colors.border}` }),
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{p.nome}</p>
                    <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>{p.preco}</p>
                  </div>
                  {prestador.plano_id === p.id ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: colors.primary }}>
                      <Check size={14} strokeWidth={3} /> Plano atual
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => navigate('/planos')}>Mudar</Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

      </main>
    </div>
  )
}

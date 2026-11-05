import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, Star, MessageCircle, Sparkles, ChevronRight, UserSearch, Search, ClipboardList } from 'lucide-react'
import { usePrestadores, useCategorias } from '../lib/hooks'
import { calcularDistancia, recuperarLocalizacao, pegarLocalizacao, salvarLocalizacao } from '../lib/gps'
import { useAuth } from '../lib/AuthContext'
import { colors, shadow } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import CardPrestador from '../components/CardPrestador'
import CardSkeleton from '../components/CardSkeleton'
import BarraComparacao from '../components/BarraComparacao'
import SearchBar from '../components/ui/SearchBar'

// Visual novo da página inicial: hero escuro com busca em destaque, atalhos de serviços, passos e cartões amplos.
// A versão anterior continua em Home.jsx (ver HomeEscolha.jsx para voltar a ela).

const VERDE_ESCURO = '#0E3B24'
const VERDE_MEDIO = '#14853D'

function Titulo({ children, acao, onAcao }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: colors.text, margin: 0 }}>{children}</h2>
      {acao && (
        <button onClick={onAcao} className="btn-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 14, fontWeight: 700, color: VERDE_MEDIO, background: 'none', border: 'none', padding: 0 }}>
          {acao} <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

const PASSOS = [
  { icone: Search, titulo: 'Busque', texto: 'Digite o serviço ou escolha uma categoria. Veja quem atende perto de você.' },
  { icone: MessageCircle, titulo: 'Converse', texto: 'Fale direto com o profissional e peça o orçamento, sem compromisso.' },
  { icone: Star, titulo: 'Avalie', texto: 'Depois do serviço, conte como foi e ajude outras pessoas a escolher.' },
]

const PONTOS = [
  { icone: Sparkles, titulo: 'Grátis para buscar', texto: 'Procurar e conversar não custa nada.' },
  { icone: Star, titulo: 'Avaliações de clientes', texto: 'Notas de quem já contratou.' },
  { icone: MapPin, titulo: 'Na sua cidade', texto: 'Profissionais por perto.' },
]

export default function HomeNova() {
  const [busca, setBusca] = useState('')
  const [userLoc, setUserLoc] = useState(() => recuperarLocalizacao())
  const [locStatus, setLocStatus] = useState(userLoc ? 'ok' : 'idle')
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { prestadores, loading } = usePrestadores()
  const { categorias } = useCategorias()

  const prestadoresComDist = useMemo(() => prestadores.map(p => ({
    ...p,
    distanciaReal: userLoc && p.latitude && p.longitude ? calcularDistancia(userLoc.lat, userLoc.lng, p.latitude, p.longitude) : null,
  })).sort((a, b) => {
    if (a.distanciaReal && b.distanciaReal) return a.distanciaReal - b.distanciaReal
    return (b.avaliacao || 0) - (a.avaliacao || 0)
  }), [prestadores, userLoc])

  const proximos = prestadoresComDist.slice(0, 6)

  const contagemPorCategoria = useMemo(() => prestadores.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  }, {}), [prestadores])

  const categoriasOrdenadas = useMemo(() => [...categorias]
    .sort((a, b) => (contagemPorCategoria[b.id] || 0) - (contagemPorCategoria[a.id] || 0)), [categorias, contagemPorCategoria])
  const atalhos = categoriasOrdenadas.slice(0, 5)
  const destaques = categoriasOrdenadas.slice(0, 12)

  const handleBusca = () => navigate(`/busca${busca.trim() ? `?q=${encodeURIComponent(busca)}` : ''}`)

  const irPerto = async () => {
    if (!userLoc) {
      setLocStatus('pedindo')
      try {
        const loc = await pegarLocalizacao()
        salvarLocalizacao(loc.lat, loc.lng)
        setUserLoc(loc)
        setLocStatus('ok')
      } catch {
        setLocStatus('negado')
        return
      }
    }
    navigate('/busca?ordem=distancia')
  }

  const nomeUsuario = usuario?.user_metadata?.nome?.split(' ')[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', paddingBottom: 100 }}>

      {/* Hero */}
      <header style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${VERDE_ESCURO} 0%, #115C34 55%, ${VERDE_MEDIO} 100%)`, borderRadius: '0 0 36px 36px', padding: '44px 20px 64px' }}>
        <div aria-hidden="true" style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', right: -120, top: -140, background: 'radial-gradient(circle, rgba(246,198,77,0.28), rgba(246,198,77,0) 70%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', left: -140, bottom: -160, background: 'radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0) 70%)' }} />

        <div className="lg:max-w-6xl lg:mx-auto" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '0 0 10px' }}>
              {saudacao}{nomeUsuario ? `, ${nomeUsuario}` : ''}
            </p>
            <h1 style={{ fontSize: 'clamp(30px, 6.4vw, 50px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 14px' }}>
              O profissional <span style={{ color: colors.secondary }}>certo</span>, perto de você!
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,0.82)', margin: '0 0 26px', maxWidth: 520 }}>
              Busque, converse direto e peça orçamento a quem atende na sua cidade.
            </p>

            <SearchBar value={busca} onChange={e => setBusca(e.target.value)} onSubmit={handleBusca} />

            {atalhos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {atalhos.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/busca?categoria=${cat.id}`)}
                    className="btn-press"
                    style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(4px)' }}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={irPerto}
              disabled={locStatus === 'pedindo'}
              className="btn-press"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22, padding: '14px 16px', maxWidth: '100%', whiteSpace: 'nowrap', borderRadius: 999, fontSize: 'clamp(12.5px, 3.3vw, 15px)', fontWeight: 800, color: VERDE_ESCURO, background: '#fff', border: 'none', boxShadow: '0 12px 28px rgba(0,0,0,0.22)', opacity: locStatus === 'pedindo' ? 0.7 : 1 }}
            >
              <MapPin size={18} style={{ flexShrink: 0 }} /> Encontrar profissional perto de mim
            </button>
            {locStatus === 'pedindo' && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '12px 0 0' }}>Obtendo localização...</p>}
            {locStatus === 'negado' && <p style={{ fontSize: 13, color: '#FECACA', margin: '12px 0 0' }}>Localização negada. Ative nas configurações.</p>}
          </div>
        </div>
      </header>

      <div className="lg:max-w-6xl lg:mx-auto" style={{ padding: '0 16px' }}>

        {/* Pontos de confiança, sobrepostos ao hero */}
        <section style={{ marginTop: -34, marginBottom: 44 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
            {PONTOS.map(({ icone: Icone, titulo, texto }) => (
              <div key={titulo} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 22, padding: '16px 18px', boxShadow: shadow.card }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: '#E8F6EC', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone size={22} color={VERDE_MEDIO} />
                </span>
                <span>
                  <strong style={{ display: 'block', fontSize: 15, color: colors.text }}>{titulo}</strong>
                  <span style={{ fontSize: 13, color: colors.textSub }}>{texto}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Categorias */}
        <section style={{ marginBottom: 52 }}>
          <Titulo acao="Ver todas" onAcao={() => navigate('/busca')}>O que você precisa?</Titulo>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7" style={{ gap: 10 }}>
            {destaques.map(cat => {
              const { icon: Icone, bg, color } = getCategoriaIcone(cat)
              const total = contagemPorCategoria[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/busca?categoria=${cat.id}`)}
                  className="btn-press"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 6px 12px', minWidth: 0, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, textAlign: 'center' }}
                >
                  <span style={{ width: 48, height: 48, borderRadius: 16, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icone size={25} color={color} strokeWidth={2} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25, color: colors.text, wordBreak: 'break-word' }}>{cat.nome}</span>
                  {total > 0 && <span style={{ fontSize: 11, color: colors.textSub }}>{total} {total === 1 ? 'profissional' : 'profissionais'}</span>}
                </button>
              )
            })}
          </div>
        </section>

        {/* Profissionais */}
        <section style={{ marginBottom: 52 }}>
          <Titulo acao="Ver todos" onAcao={() => navigate('/busca')}>{userLoc ? 'Próximos de você' : 'Profissionais'}</Titulo>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {loading
              ? [1, 2, 3, 4].map(i => <CardSkeleton key={i} modo="lista" />)
              : proximos.length === 0
              ? (
                <div className="md:col-span-2" style={{ textAlign: 'center', padding: '44px 16px', background: '#fff', borderRadius: 24 }}>
                  <UserSearch size={44} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 15, color: colors.textSub, fontWeight: 600, margin: '0 0 16px' }}>Nenhum profissional encontrado.</p>
                  <button onClick={() => navigate('/pedidos/novo')} className="btn-press" style={{ padding: '12px 22px', borderRadius: 999, fontSize: 14, fontWeight: 800, background: colors.secondary, color: colors.text, border: 'none' }}>Pedir orçamento</button>
                </div>
              )
              : proximos.map(p => <CardPrestador key={p.id} prestador={p} layout="vertical" distancia={p.distanciaReal} />)}
          </div>
          <BarraComparacao style={{ marginTop: 20 }} />
        </section>

        {/* Como funciona */}
        <section style={{ marginBottom: 52 }}>
          <Titulo>Como funciona</Titulo>
          <ol className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, listStyle: 'none', margin: 0, padding: 0 }}>
            {PASSOS.map(({ icone: Icone, titulo, texto }, i) => (
              <li key={titulo} style={{ position: 'relative', background: '#fff', borderRadius: 24, padding: '22px 22px 24px', border: `1px solid ${colors.border}` }}>
                <span style={{ position: 'absolute', top: 14, right: 20, fontSize: 44, fontWeight: 800, lineHeight: 1, color: '#E8F6EC' }}>{i + 1}</span>
                <span style={{ width: 46, height: 46, borderRadius: 15, background: VERDE_ESCURO, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icone size={22} color={colors.secondary} />
                </span>
                <strong style={{ display: 'block', fontSize: 17, color: colors.text, marginBottom: 6 }}>{titulo}</strong>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: colors.textSub }}>{texto}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pedir orçamento */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', background: '#fff', borderRadius: 28, padding: '28px 28px', border: `1px solid ${colors.border}`, boxShadow: shadow.card }}>
            <div style={{ flex: '1 1 260px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: VERDE_MEDIO, marginBottom: 8 }}><ClipboardList size={15} /> Não achou o que procura?</span>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: colors.text, margin: '0 0 6px' }}>Descreva o serviço e receba propostas.</p>
              <p style={{ fontSize: 14, color: colors.textSub, margin: 0 }}>Profissionais próximos podem responder ao seu pedido.</p>
            </div>
            <button onClick={() => navigate('/pedidos/novo')} className="btn-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 999, fontSize: 15, fontWeight: 800, background: colors.secondary, color: colors.text, border: 'none', boxShadow: shadow.btn }}>
              Pedir orçamento <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* Convite ao profissional */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', background: VERDE_ESCURO, borderRadius: 28, padding: '28px 28px' }}>
            <div style={{ flex: '1 1 260px' }}>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', margin: '0 0 6px' }}>Você é profissional?</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', margin: 0 }}>Apareça para clientes da sua região e responda a pedidos de orçamento.</p>
            </div>
            <button onClick={() => navigate(usuario ? '/painel' : '/cadastro-pro')} className="btn-press" style={{ padding: '14px 24px', borderRadius: 999, fontSize: 15, fontWeight: 800, background: '#fff', color: VERDE_ESCURO, border: 'none' }}>
              Oferecer meus serviços
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

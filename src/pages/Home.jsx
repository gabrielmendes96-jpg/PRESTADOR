import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand, MapPin, ArrowRight, Users, Star, Flame, UserSearch, ChevronRight } from 'lucide-react'
import { usePrestadores, useCategorias } from '../lib/hooks'
import { calcularDistancia, recuperarLocalizacao, pegarLocalizacao, salvarLocalizacao } from '../lib/gps'
import { useAuth } from '../lib/AuthContext'
import { colors, radius, shadow, spacing, type as typeScale } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import CardPrestador from '../components/CardPrestador'
import CardSkeleton from '../components/CardSkeleton'
import BarraComparacao from '../components/BarraComparacao'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SearchBar from '../components/ui/SearchBar'

function SectionHeader({ title, onVerTodas }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ ...typeScale.subtitle, color: colors.text, margin: 0 }}>{title}</h2>
      {onVerTodas && (
        <button
          onClick={onVerTodas}
          className="btn-press"
          style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Ver todas <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const [busca, setBusca] = useState('')
  const [userLoc, setUserLoc] = useState(() => recuperarLocalizacao())
  const [locStatus, setLocStatus] = useState(userLoc ? 'ok' : 'idle')
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { prestadores, loading } = usePrestadores()
  const { categorias } = useCategorias()

  const prestadoresComDist = useMemo(() => prestadores.map(p => ({
    ...p,
    distanciaReal: userLoc && p.latitude && p.longitude
      ? calcularDistancia(userLoc.lat, userLoc.lng, p.latitude, p.longitude)
      : null
  })).sort((a, b) => {
    if (a.distanciaReal && b.distanciaReal) return a.distanciaReal - b.distanciaReal
    return (b.avaliacao || 0) - (a.avaliacao || 0)
  }), [prestadores, userLoc])

  const proximos = prestadoresComDist.slice(0, 6)

  const emAlta = useMemo(() => {
    const idsProximos = new Set(proximos.map(p => p.id))
    return [...prestadores]
      .filter(p => !idsProximos.has(p.id))
      .sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0))
      .slice(0, 5)
  }, [prestadores, proximos])

  const contagemPorCategoria = useMemo(() => prestadores.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  }, {}), [prestadores])

  // Prévia compacta: prioriza categorias com profissionais ativos, completa com as demais por ordem
  const categoriasPreview = useMemo(() => {
    return [...categorias]
      .sort((a, b) => (contagemPorCategoria[b.id] || 0) - (contagemPorCategoria[a.id] || 0))
      .slice(0, 12)
  }, [categorias, contagemPorCategoria])

  const handleBusca = (e) => {
    e.preventDefault()
    navigate(`/busca${busca.trim() ? `?q=${encodeURIComponent(busca)}` : ''}`)
  }

  const pedirLocalizacao = async () => {
    setLocStatus('pedindo')
    try {
      const loc = await pegarLocalizacao()
      salvarLocalizacao(loc.lat, loc.lng)
      setUserLoc(loc)
      setLocStatus('ok')
    } catch { setLocStatus('negado') }
  }

  const nomeUsuario = usuario?.user_metadata?.nome?.split(' ')[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header com saudação */}
      <div style={{ background: '#fff', padding: '40px 20px 20px', borderBottom: `1px solid ${colors.bg}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <p style={{ fontSize: 14, color: colors.textSub, fontWeight: 500, margin: 0 }}>
            {saudacao}{nomeUsuario ? `, ${nomeUsuario}` : ''}
          </p>
          <Hand size={15} color={colors.secondary} strokeWidth={2} />
        </div>

        <h1 style={{ ...typeScale.subtitle, fontSize: 22, color: colors.text, marginBottom: 16 }}>
          O que você precisa hoje?
        </h1>

        <SearchBar value={busca} onChange={e => setBusca(e.target.value)} onSubmit={handleBusca} />

        <div style={{ marginTop: 12 }}>
          {locStatus === 'idle' && (
            <button onClick={pedirLocalizacao} className="btn-press" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <MapPin size={16} color={colors.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.primary }}>Usar minha localização</span>
            </button>
          )}
          {locStatus === 'ok' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color={colors.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.primary }}>Localização ativa</span>
            </div>
          )}
          {locStatus === 'pedindo' && (
            <span style={{ fontSize: 13, color: colors.textSub }}>Obtendo localização...</span>
          )}
          {locStatus === 'negado' && (
            <span style={{ fontSize: 13, color: colors.error }}>Localização negada. Ative nas configurações.</span>
          )}
        </div>
      </div>

      <div style={{ padding: `${spacing.xl}px 16px 0` }}>

        {/* Categorias */}
        <section style={{ marginBottom: spacing.section }}>
          <SectionHeader title="Categorias" onVerTodas={() => navigate('/busca')} />
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {categoriasPreview.map(cat => {
              const { icon: Icon, bg, color } = getCategoriaIcone(cat)
              const count = contagemPorCategoria[cat.id] || 0
              return (
                <Card
                  key={cat.id}
                  as="button"
                  interactive
                  onClick={() => navigate(`/busca?categoria=${cat.id}`)}
                  padding={16}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, minWidth: 96, textAlign: 'center' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap' }}>{cat.nome}</span>
                  {count > 0 && (
                    <span style={{ fontSize: 10, color: colors.textSub, fontWeight: 500 }}>{count} profissionais</span>
                  )}
                </Card>
              )
            })}
          </div>
        </section>

        {/* Prestadores próximos */}
        <section style={{ marginBottom: spacing.section }}>
          <SectionHeader title={userLoc ? 'Próximos de você' : 'Profissionais'} onVerTodas={() => navigate('/busca')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.card }}>
            {loading
              ? [1, 2, 3].map(i => <CardSkeleton key={i} modo="lista" />)
              : proximos.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <UserSearch size={44} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 15, color: '#9CA3AF', fontWeight: 500 }}>Nenhum profissional encontrado.</p>
                </div>
              )
              : proximos.map(p => (
                <CardPrestador key={p.id} prestador={p} layout="vertical" distancia={p.distanciaReal} />
              ))
            }
          </div>
          <BarraComparacao style={{ marginTop: spacing.card }} />
        </section>

        {/* Serviços em alta */}
        {emAlta.length > 0 && (
          <section style={{ marginBottom: spacing.section }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <Flame size={18} color={colors.secondary} />
              <h2 style={{ ...typeScale.subtitle, color: colors.text, margin: 0 }}>Serviços em alta</h2>
            </div>
            <div style={{ display: 'flex', gap: spacing.card, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {emAlta.map(p => (
                <div key={p.id} style={{ minWidth: 260, flexShrink: 0 }}>
                  <CardPrestador prestador={p} layout="vertical" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hero: Publicar pedido + stats */}
        <section style={{ marginBottom: spacing.xl }}>
          <div
            className="btn-press"
            onClick={() => navigate('/pedidos/novo')}
            style={{
              background: 'linear-gradient(135deg, #169B4C, #23B65A)',
              borderRadius: radius.hero,
              padding: '28px 24px',
              boxShadow: shadow.hero,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Publicar um pedido</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Receba propostas de profissionais próximos</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRight size={22} color="#fff" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Users size={18} color="#fff" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>18.000+</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Profissionais</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Star size={18} fill="#fff" color="#fff" strokeWidth={0} style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>4.9</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Avaliação média</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <MapPin size={18} color="#fff" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>320</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Cidades</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrestadores } from '../lib/hooks'
import { calcularDistancia, formatarDistancia, recuperarLocalizacao, pegarLocalizacao, salvarLocalizacao } from '../lib/gps'
import { useAuth } from '../lib/AuthContext'

const categorias = [
  { id: 'eletricista', icone: 'ti-bolt', nome: 'Elétrica', bg: '#FFFBEB', cor: '#D97706' },
  { id: 'encanador', icone: 'ti-droplet', nome: 'Hidráulica', bg: '#EFF6FF', cor: '#2563EB' },
  { id: 'pintor', icone: 'ti-paint', nome: 'Pintura', bg: '#FDF4FF', cor: '#9333EA' },
  { id: 'pedreiro', icone: 'ti-building', nome: 'Construção', bg: '#FFF7ED', cor: '#EA580C' },
  { id: 'marceneiro', icone: 'ti-tools', nome: 'Marcenaria', bg: '#F0FDF4', cor: '#16A34A' },
  { id: 'diarista', icone: 'ti-sparkles', nome: 'Limpeza', bg: '#F0F9FF', cor: '#0284C7' },
  { id: 'mecanico', icone: 'ti-car', nome: 'Automotivo', bg: '#FEF2F2', cor: '#DC2626' },
  { id: 'cabeleireiro', icone: 'ti-scissors', nome: 'Beleza', bg: '#FFF0F6', cor: '#DB2777' },
]

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 22, padding: 18, border: '1px solid #E4E7E4', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '30%' }} />
      </div>
    </div>
  )
}

function CardPrestador({ p, navigate }) {
  const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
  const dist = p.distanciaReal ? formatarDistancia(p.distanciaReal) : null

  return (
    <div onClick={() => navigate(`/profissional/${p.id}`)}
      className="card-lift fade-in btn-press"
      style={{
        background: '#fff', borderRadius: 22, padding: '16px 18px',
        border: '1px solid #E4E7E4', boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
        display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
      }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {p.foto_perfil ? (
          <img src={p.foto_perfil} alt={p.nome} style={{ width: 58, height: 58, borderRadius: 14, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 58, height: 58, borderRadius: 14, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#16A34A' }}>
            {iniciais}
          </div>
        )}
        {p.plano === 'premium' && (
          <span style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#F6C64D', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#713F12' }}>✓</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</p>
          {p.disponivel && (
            <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>Disponível</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, textTransform: 'capitalize' }}>
          {p.categoria}{dist ? ` · ${dist}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {p.avaliacao > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <i className="ti ti-star-filled" style={{ fontSize: 12, color: '#F6C64D' }} aria-hidden="true"></i>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>{p.avaliacao}</span>
              {p.totalAvaliacoes > 0 && <span style={{ fontSize: 11, color: '#9CA3AF' }}>({p.totalAvaliacoes})</span>}
            </div>
          )}
          {p.disponivel && (
            <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <i className="ti ti-check" style={{ fontSize: 11 }} aria-hidden="true"></i>
              Verificado
            </span>
          )}
        </div>
      </div>

      <i className="ti ti-chevron-right" style={{ fontSize: 18, color: '#D1D5DB', flexShrink: 0 }} aria-hidden="true"></i>
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

  const prestadoresComDist = useMemo(() => prestadores.map(p => ({
    ...p,
    distanciaReal: userLoc && p.latitude && p.longitude
      ? calcularDistancia(userLoc.lat, userLoc.lng, p.latitude, p.longitude)
      : null
  })).sort((a, b) => {
    if (a.distanciaReal && b.distanciaReal) return a.distanciaReal - b.distanciaReal
    return (b.avaliacao || 0) - (a.avaliacao || 0)
  }), [prestadores, userLoc])

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
    <div style={{ background: '#F3F6F2', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header com saudação */}
      <div style={{ background: '#fff', padding: '56px 20px 24px', borderBottom: '1px solid #F3F6F2' }}>
        
        {nomeUsuario ? (
          <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>
            {saudacao}, {nomeUsuario} 👋
          </p>
        ) : (
          <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>
            {saudacao} 👋
          </p>
        )}

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F2937', marginBottom: 20, lineHeight: 1.25 }}>
          O que você precisa hoje?
        </h1>

        {/* Barra de busca */}
        <form onSubmit={handleBusca}>
          <div style={{
            background: '#fff', height: 56, borderRadius: 20,
            border: '1.5px solid #E4E7E4',
            boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 8, gap: 8,
          }}>
            <i className="ti ti-search" style={{ fontSize: 20, color: '#9CA3AF', flexShrink: 0 }} aria-hidden="true"></i>
            <input type="search" placeholder="Buscar profissional ou serviço"
              value={busca} onChange={e => setBusca(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 15,
                color: '#1F2937', background: 'transparent',
              }} />
            <button type="submit" className="btn-press" style={{
              background: '#16A34A', color: '#fff', border: 'none',
              borderRadius: 14, padding: '10px 18px', fontSize: 14, fontWeight: 700,
              flexShrink: 0,
            }}>
              Buscar
            </button>
          </div>
        </form>

        {/* Localização */}
        <div style={{ marginTop: 12 }}>
          {locStatus === 'idle' && (
            <button onClick={pedirLocalizacao} className="btn-press" style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}>
              <i className="ti ti-map-pin" style={{ fontSize: 16, color: '#16A34A' }} aria-hidden="true"></i>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>Usar minha localização</span>
            </button>
          )}
          {locStatus === 'ok' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-map-pin" style={{ fontSize: 15, color: '#16A34A' }} aria-hidden="true"></i>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>Localização ativa</span>
            </div>
          )}
          {locStatus === 'pedindo' && (
            <span style={{ fontSize: 13, color: '#6B7280' }}>Obtendo localização...</span>
          )}
          {locStatus === 'negado' && (
            <span style={{ fontSize: 13, color: '#EF4444' }}>Localização negada. Ative nas configurações.</span>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 16px 0' }}>

        {/* Categorias */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>Categorias</h2>
            <button onClick={() => navigate('/busca')} className="btn-press"
              style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todas →
            </button>
          </div>

          {/* Scroll horizontal */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => navigate(`/busca?categoria=${cat.id}`)}
                className="btn-press card-lift"
                style={{
                  background: '#fff', border: '1px solid #E4E7E4',
                  borderRadius: 20, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  cursor: 'pointer', flexShrink: 0, minWidth: 90,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${cat.icone}`} style={{ fontSize: 22, color: cat.cor }} aria-hidden="true"></i>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{cat.nome}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Prestadores próximos */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>
              {userLoc ? 'Próximos de você' : 'Profissionais'}
            </h2>
            <button onClick={() => navigate('/busca')} className="btn-press"
              style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todos →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading
              ? [1,2,3].map(i => <SkeletonCard key={i} />)
              : prestadoresComDist.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <i className="ti ti-user-search" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', marginBottom: 12 }} aria-hidden="true"></i>
                  <p style={{ fontSize: 15, color: '#9CA3AF', fontWeight: 500 }}>Nenhum profissional encontrado.</p>
                </div>
              )
              : prestadoresComDist.slice(0, 6).map(p => <CardPrestador key={p.id} p={p} navigate={navigate} />)
            }
          </div>
        </section>

        {/* CTA Publicar Pedido */}
        <section style={{ marginBottom: 24 }}>
          <div className="btn-press card-lift" onClick={() => navigate('/pedidos/novo')}
            style={{
              background: 'linear-gradient(135deg, #169B4C, #23B65A)',
              borderRadius: 32, padding: '24px 22px',
              boxShadow: '0 18px 40px rgba(22,155,76,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                Publicar um pedido
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Receba propostas de profissionais próximos
              </p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-arrow-right" style={{ fontSize: 22, color: '#fff' }} aria-hidden="true"></i>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { valor: '18.000+', label: 'Profissionais', icone: 'ti-users' },
              { valor: '4.9 ★', label: 'Avaliação média', icone: 'ti-star' },
              { valor: '320', label: 'Cidades', icone: 'ti-map-pin' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#fff', borderRadius: 20, padding: '16px 12px',
                border: '1px solid #E4E7E4', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}>
                <i className={`ti ${s.icone}`} style={{ fontSize: 20, color: '#16A34A', display: 'block', marginBottom: 6 }} aria-hidden="true"></i>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1F2937', marginBottom: 2 }}>{s.valor}</p>
                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

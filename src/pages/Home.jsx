import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrestadores } from '../lib/hooks'
import ReputacaoBadge from '../components/ReputacaoBadge'
import CardSkeleton from '../components/CardSkeleton'
import { calcularDistancia, formatarDistancia, recuperarLocalizacao, pegarLocalizacao, salvarLocalizacao } from '../lib/gps'
import { TOPICOS, CATEGORIAS_POR_TOPICO } from '../lib/dados'
import { useAuth } from '../lib/AuthContext'

const topicosDestaque = [
  { id: 'eletricista', icone: 'ti-bolt', nome: 'Elétrica', topico: 'eletrica' },
  { id: 'encanador', icone: 'ti-droplet', nome: 'Hidráulica', topico: 'hidraulica' },
  { id: 'pintor', icone: 'ti-paint', nome: 'Pintura', topico: 'pintura' },
  { id: 'diarista', icone: 'ti-home-2', nome: 'Limpeza', topico: 'limpeza' },
  { id: 'mecanico', icone: 'ti-tool', nome: 'Automotivo', topico: 'automotivo' },
  { id: 'personal_trainer', icone: 'ti-heart', nome: 'Saúde', topico: 'saude' },
  { id: 'cabeleireiro', icone: 'ti-scissors', nome: 'Beleza', topico: 'beleza' },
  { id: 'tecnico_informatica', icone: 'ti-device-laptop', nome: 'TI', topico: 'tecnologia' },
  { id: 'cozinheiro', icone: 'ti-chef-hat', nome: 'Culinária', topico: 'alimentacao' },
  { id: 'motorista', icone: 'ti-car', nome: 'Transporte', topico: 'transporte' },
]

function CardPrestador({ p, navigate }) {
  const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
  return (
    <div onClick={() => navigate(`/profissional/${p.id}`)}
      className="card-hover btn-press cursor-pointer"
      style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
      {/* Foto */}
      <div style={{ height: 120, background: '#F0FDF4', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.disponivel && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#fff', borderRadius: 20, padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            border: '1px solid #DCFCE7', fontSize: 11, fontWeight: 600, color: '#15803D',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
            Atende hoje
          </div>
        )}
        {p.foto_perfil ? (
          <img src={p.foto_perfil} alt={p.nome}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {iniciais}
          </div>
        )}
        {p.plano && p.plano !== 'basico' && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#FACC15', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#713F12' }}>
            {p.plano === 'premium' ? '★ Premium' : '✓ Pro'}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 2, lineHeight: 1.3 }}>{p.nome}</p>
        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 8, textTransform: 'capitalize' }}>
          {p.categoria} · {p.cidade}
          {p.distanciaReal && ` · ${formatarDistancia(p.distanciaReal)}`}
        </p>
        <ReputacaoBadge nota={p.avaliacao} totalAvaliacoes={p.totalAvaliacoes} size="small" />
      </div>
    </div>
  )
}

function CardPrestadorHorizontal({ p, navigate }) {
  const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
  return (
    <div onClick={() => navigate(`/profissional/${p.id}`)}
      className="card-hover btn-press cursor-pointer flex items-center gap-3"
      style={{
        background: '#fff', borderRadius: 20, padding: '12px 16px',
        border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {p.foto_perfil ? (
          <img src={p.foto_perfil} alt={p.nome}
            style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F0FDF4' }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {iniciais}
          </div>
        )}
        {p.disponivel && (
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#16A34A', border: '2px solid #fff', display: 'block' }}></span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 1 }}>{p.nome}</p>
        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'capitalize' }}>
          {p.categoria} · {p.cidade}
          {p.distanciaReal && ` · ${formatarDistancia(p.distanciaReal)}`}
        </p>
        <ReputacaoBadge nota={p.avaliacao} totalAvaliacoes={p.totalAvaliacoes} size="small" />
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize: 18, color: '#D1D5DB', flexShrink: 0 }} aria-hidden="true"></i>
    </div>
  )
}

export default function Home() {
  const [busca, setBusca] = useState('')
  const [userLoc, setUserLoc] = useState(() => recuperarLocalizacao())
  const [locStatus, setLocStatus] = useState(userLoc ? 'ok' : 'idle')
  const [topicosAbertos, setTopicosAbertos] = useState(false)
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

  const destaques = prestadoresComDist.filter(p => (p.avaliacao || 0) >= 4.5).slice(0, 8)
  const proximos = userLoc ? prestadoresComDist.filter(p => p.distanciaReal && p.distanciaReal <= 30).slice(0, 6) : prestadoresComDist.slice(0, 6)

  const handleBusca = (e) => {
    e.preventDefault()
    if (busca.trim()) navigate(`/busca?q=${busca}`)
  }

  const pedirLocalizacao = async () => {
    setLocStatus('pedindo')
    try {
      const loc = await pegarLocalizacao()
      salvarLocalizacao(loc.lat, loc.lng)
      setUserLoc(loc)
      setLocStatus('ok')
    } catch {
      setLocStatus('negado')
    }
  }

  const nomeUsuario = usuario?.user_metadata?.nome?.split(' ')[0] || null

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Saudação + Busca */}
      <div style={{ background: '#fff', padding: '20px 16px 24px', borderBottom: '1px solid #F3F4F6' }}>
        
        {nomeUsuario && (
          <p style={{ fontSize: 15, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>
            Olá, {nomeUsuario} 👋
          </p>
        )}
        <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 16, lineHeight: 1.2 }}>
          O que você precisa hoje?
        </p>

        {/* Barra de busca */}
        <form onSubmit={handleBusca} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <i className="ti ti-search" style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, color: '#9CA3AF',
            }} aria-hidden="true"></i>
            <input type="search" placeholder="Buscar profissional..."
              value={busca} onChange={e => setBusca(e.target.value)}
              style={{
                width: '100%', height: 50, borderRadius: 16,
                border: '1.5px solid #E5E7EB', background: '#F9FAFB',
                paddingLeft: 42, paddingRight: 16, fontSize: 15,
                color: '#111827', outline: 'none', transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#16A34A'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <button type="submit" className="btn-press" style={{
            height: 50, borderRadius: 16, background: '#16A34A', color: '#fff',
            padding: '0 20px', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>
            Buscar
          </button>
        </form>

        {/* Localização */}
        {locStatus === 'idle' && (
          <button onClick={pedirLocalizacao} className="btn-press"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F0FDF4', border: '1.5px solid #DCFCE7',
              borderRadius: 12, padding: '8px 14px', cursor: 'pointer', width: '100%',
            }}>
            <i className="ti ti-map-pin" style={{ fontSize: 16, color: '#16A34A' }} aria-hidden="true"></i>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>Usar minha localização</span>
          </button>
        )}
        {locStatus === 'ok' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
            <i className="ti ti-map-pin" style={{ fontSize: 15, color: '#16A34A' }} aria-hidden="true"></i>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>Localização ativa — mostrando profissionais próximos</span>
          </div>
        )}
        {locStatus === 'pedindo' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
            <i className="ti ti-loader" style={{ fontSize: 15, color: '#6B7280' }} aria-hidden="true"></i>
            <span style={{ fontSize: 13, color: '#6B7280' }}>Obtendo localização...</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* Categorias */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Categorias</p>
            <button onClick={() => setTopicosAbertos(!topicosAbertos)}
              style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}>
              {topicosAbertos ? 'Ver menos' : 'Ver todas'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {(topicosAbertos ? TOPICOS.slice(0, 20) : topicosDestaque).map(t => (
              <button key={t.id || t.id} onClick={() => navigate(`/busca?topico=${t.topico || t.id}`)}
                className="btn-press card-hover"
                style={{
                  background: '#fff', border: '1.5px solid #E5E7EB',
                  borderRadius: 16, padding: '12px 4px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <i className={`ti ${t.icone || 'ti-tool'}`}
                  style={{ fontSize: 22, color: '#16A34A' }} aria-hidden="true"></i>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>
                  {t.nome}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Prestadores próximos */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {userLoc ? 'Próximos de você' : 'Profissionais'}
            </p>
            <button onClick={() => navigate('/busca')}
              style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todos
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[1,2,3,4].map(i => <CardSkeleton key={i} modo="grande" />)}
            </div>
          ) : proximos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px 0', fontSize: 14 }}>
              Nenhum profissional encontrado.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {proximos.map(p => <CardPrestador key={p.id} p={p} navigate={navigate} />)}
            </div>
          )}
        </div>

        {/* Destaques */}
        {destaques.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>⭐ Mais bem avaliados</p>
              <button onClick={() => navigate('/busca')}
                style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todos
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {destaques.slice(0, 5).map(p => <CardPrestadorHorizontal key={p.id} p={p} navigate={navigate} />)}
            </div>
          </div>
        )}

        {/* CTA Publicar Pedido */}
        <div className="btn-press" onClick={() => navigate('/pedidos/novo')}
          style={{
            background: '#16A34A', borderRadius: 20, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(22,163,74,0.25)',
            marginBottom: 8,
          }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Postar um pedido</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Receba propostas de profissionais próximos</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-arrow-right" style={{ fontSize: 22, color: '#fff' }} aria-hidden="true"></i>
          </div>
        </div>

      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

const cores = [
  'bg-blue-100 text-blue-800',
  'bg-teal-100 text-teal-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
]

function iniciaisDe(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function corDe(nome = '') {
  const soma = nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return cores[soma % cores.length]
}

const badgeDisponivel = { background: '#E3F6E9', color: '#0F6E3D' }
const badgePlano = { background: '#FFF4D6', color: '#8A5A00' }

export default function CardPrestador({ prestador: p, horizontal = false }) {
  const navigate = useNavigate()
  const iniciais = iniciaisDe(p.nome)
  const cor = corDe(p.nome)

  if (horizontal) return (
    <div
      onClick={() => navigate(`/profissional/${p.id}`)}
      className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ border: '0.5px solid #EDE3CE' }}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${cor}`}>
        {iniciais}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
          {p.disponivel && <span className="text-xs px-2 py-0.5 rounded-full" style={badgeDisponivel}>Disponível</span>}
          {p.plano !== 'basico' && <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={badgePlano}>{p.plano}</span>}
        </div>
        <p className="text-xs capitalize mb-1" style={{ color: '#7C9485' }}>{p.categoria} · {p.cidade}, {p.estado}</p>
        <div className="flex items-center gap-3">
          <span style={{ color: '#FFC857' }} className="text-sm">{'★'.repeat(Math.round(p.avaliacao))}</span>
          <span className="text-xs" style={{ color: '#7C9485' }}>{p.avaliacao} · {p.totalAvaliacoes} avaliações</span>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {(p.hashtags || []).filter(Boolean).slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>#{tag}</span>
          ))}
          {(p.servicos || []).slice(0, 2).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FAF6EE', color: '#5C7A66' }}>{s}</span>
          ))}
        </div>
      </div>
      <i className="ti ti-chevron-right flex-shrink-0" style={{ fontSize: '18px', color: '#C9BFA8' }} aria-hidden="true"></i>
    </div>
  )

  return (
    <div
      onClick={() => navigate(`/profissional/${p.id}`)}
      className="bg-white rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ border: '0.5px solid #EDE3CE' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${cor}`}>
          {iniciais}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
          <p className="text-xs capitalize" style={{ color: '#7C9485' }}>{p.categoria} · {p.cidade}, {p.estado}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: '#FFC857' }} className="text-sm">{'★'.repeat(Math.round(p.avaliacao))}</span>
        <span className="text-xs" style={{ color: '#7C9485' }}>{p.avaliacao} ({p.totalAvaliacoes})</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {p.disponivel && <span className="text-xs px-2 py-0.5 rounded-full" style={badgeDisponivel}>Disponível</span>}
        {p.plano !== 'basico' && <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={badgePlano}>{p.plano}</span>}
      </div>
    </div>
  )
}


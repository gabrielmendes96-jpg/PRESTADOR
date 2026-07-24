import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReputacaoBadge from '../components/ReputacaoBadge'

const categoriasMap = {
  'eletricista': { nome: 'Eletricista', emoji: '⚡', desc: 'Instalação elétrica, manutenção, quadro de luz, tomadas e interruptores' },
  'pedreiro': { nome: 'Pedreiro', emoji: '🧱', desc: 'Alvenaria, construção civil, reformas e reparos em geral' },
  'encanador': { nome: 'Encanador', emoji: '🚿', desc: 'Conserto de vazamentos, instalação hidráulica, desentupimento' },
  'pintor': { nome: 'Pintor', emoji: '🎨', desc: 'Pintura residencial e comercial, textura, massa corrida' },
  'marceneiro': { nome: 'Marceneiro', emoji: '🪚', desc: 'Móveis planejados, armários, marcenaria em geral' },
  'mecanico': { nome: 'Mecânico', emoji: '🔧', desc: 'Manutenção preventiva e corretiva de veículos' },
  'jardineiro': { nome: 'Jardineiro', emoji: '🌿', desc: 'Jardinagem, paisagismo, poda de árvores e grama' },
  'diarista': { nome: 'Diarista', emoji: '🧹', desc: 'Limpeza residencial, faxina, organização doméstica' },
  'serralheiro': { nome: 'Serralheiro', emoji: '🔩', desc: 'Grades, portões, serralheria, estruturas metálicas' },
  'vidraceiro': { nome: 'Vidraceiro', emoji: '🪟', desc: 'Vidros temperados, espelhos, box de banheiro, janelas' },
}

const cidadesSP = ['Araraquara', 'São Carlos', 'Ribeirão Preto', 'Campinas', 'São Paulo', 'Bauru', 'Franca', 'Limeira']

export default function SEOCategoria() {
  const { categoria } = useParams()
  const navigate = useNavigate()
  const [prestadores, setPrestadores] = useState([])
  const [carregando, setCarregando] = useState(true)

  const catConfig = categoriasMap[categoria] || { nome: categoria, emoji: '🔧', desc: 'Serviços profissionais' }

  useEffect(() => {
    carregarPrestadores()
    document.title = `${catConfig.nome} | Prestador — Encontre Profissionais Avaliados`

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = `Encontre ${catConfig.nome.toLowerCase()}s com avaliações reais de clientes. Veja fotos dos serviços, compare profissionais e contrate com segurança pelo Prestador.`
  }, [categoria])

  const carregarPrestadores = async () => {
    setCarregando(true)
    const { data } = await supabase
      .from('prestadores')
      .select('*')
      .ilike('categoria_id', `%${categoria}%`)
      .eq('plano_status', 'ativo')
      .order('avaliacao_media', { ascending: false })
      .limit(20)
    setPrestadores(data || [])
    setCarregando(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: '#7C9485' }}>
        <Link to="/" style={{ color: '#1FA855' }}>Início</Link>
        <span>›</span>
        <span>{catConfig.nome}</span>
      </nav>

      <div className="bg-white rounded-2xl p-6 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontSize: 44 }}>{catConfig.emoji}</span>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>{catConfig.nome}</h1>
            <p className="text-sm" style={{ color: '#7C9485' }}>{catConfig.desc}</p>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: '#5F6F65' }}>
          Encontre os melhores {catConfig.nome.toLowerCase()}s do Brasil com avaliações verificadas, fotos dos serviços e atendimento por chat direto.
        </p>
        <button onClick={() => navigate(`/busca?categoria=${categoria}`)}
          className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
          style={{ background: '#1FA855' }}>
          Buscar {catConfig.nome.toLowerCase()} perto de mim
        </button>
      </div>

      {/* Por cidade */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>
          {catConfig.emoji} {catConfig.nome} por cidade
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {cidadesSP.map(c => (
            <Link key={c}
              to={`/s/${categoria}/${c.toLowerCase().replace(/ /g, '-')}`}
              className="flex items-center gap-2 p-3 rounded-xl hover:opacity-80 transition-opacity"
              style={{ background: '#F0F2F0', color: '#1F2D24' }}>
              <i className="ti ti-map-pin" style={{ fontSize: 14, color: '#1FA855' }} aria-hidden="true"></i>
              <span className="text-sm">{catConfig.nome} em {c}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Profissionais */}
      <h2 className="text-base font-semibold mb-3" style={{ color: '#1F2D24' }}>
        {catConfig.nome}s em destaque
      </h2>

      {carregando ? (
        <p className="text-sm text-center py-8" style={{ color: '#C9BFA8' }}>Carregando...</p>
      ) : prestadores.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center" style={{ border: '0.5px solid #DDE3DD' }}>
          <p className="text-sm" style={{ color: '#7C9485' }}>Nenhum profissional cadastrado ainda nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {prestadores.map(p => {
            const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
            return (
              <div key={p.id} onClick={() => navigate(`/profissional/${p.id}`)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                  style={{ background: '#1FA855' }}>{iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5" style={{ color: '#1F2D24' }}>{p.nome}</p>
                  <p className="text-xs mb-1" style={{ color: '#7C9485' }}>{p.cidade}, {p.estado}</p>
                  <ReputacaoBadge nota={p.avaliacao_media} totalAvaliacoes={p.total_avaliacoes} size="small" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

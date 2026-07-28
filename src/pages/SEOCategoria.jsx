import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ReputacaoBadge from '../components/ReputacaoBadge'
import { colors } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const categoriasMap = {
  'eletricista': { nome: 'Eletricista', desc: 'Instalação elétrica, manutenção, quadro de luz, tomadas e interruptores' },
  'pedreiro': { nome: 'Pedreiro', desc: 'Alvenaria, construção civil, reformas e reparos em geral' },
  'encanador': { nome: 'Encanador', desc: 'Conserto de vazamentos, instalação hidráulica, desentupimento' },
  'pintor': { nome: 'Pintor', desc: 'Pintura residencial e comercial, textura, massa corrida' },
  'marceneiro': { nome: 'Marceneiro', desc: 'Móveis planejados, armários, marcenaria em geral' },
  'mecanico': { nome: 'Mecânico', desc: 'Manutenção preventiva e corretiva de veículos' },
  'jardineiro': { nome: 'Jardineiro', desc: 'Jardinagem, paisagismo, poda de árvores e grama' },
  'diarista': { nome: 'Diarista', desc: 'Limpeza residencial, faxina, organização doméstica' },
  'serralheiro': { nome: 'Serralheiro', desc: 'Grades, portões, serralheria, estruturas metálicas' },
  'vidraceiro': { nome: 'Vidraceiro', desc: 'Vidros temperados, espelhos, box de banheiro, janelas' },
}

const cidadesSP = ['Araraquara', 'São Carlos', 'Ribeirão Preto', 'Campinas', 'São Paulo', 'Bauru', 'Franca', 'Limeira']

export default function SEOCategoria() {
  const { categoria } = useParams()
  const navigate = useNavigate()
  const [prestadores, setPrestadores] = useState([])
  const [carregando, setCarregando] = useState(true)

  const catConfig = categoriasMap[categoria] || { nome: categoria, desc: 'Serviços profissionais' }
  const { icon: CatIcon, bg: catBg, color: catColor } = getCategoriaIcone(categoria)

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
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: colors.textSub }}>
        <Link to="/" style={{ color: colors.primary }}>Início</Link>
        <span>›</span>
        <span>{catConfig.nome}</span>
      </nav>

      <Card padding={24} style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: catBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CatIcon size={26} color={catColor} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: colors.text }}>{catConfig.nome}</h1>
            <p className="text-sm" style={{ color: colors.textSub }}>{catConfig.desc}</p>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: colors.textSub }}>
          Encontre os melhores {catConfig.nome.toLowerCase()}s do Brasil com avaliações verificadas, fotos dos serviços e atendimento por chat direto.
        </p>
        <Button fullWidth onClick={() => navigate(`/busca?categoria=${categoria}`)}>
          Buscar {catConfig.nome.toLowerCase()} perto de mim
        </Button>
      </Card>

      {/* Por cidade */}
      <Card padding={20} style={{ marginBottom: 20 }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: colors.text }}>
          {catConfig.nome} por cidade
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {cidadesSP.map(c => (
            <Link key={c}
              to={`/s/${categoria}/${c.toLowerCase().replace(/ /g, '-')}`}
              className="flex items-center gap-2 p-3 rounded-xl hover:opacity-80 transition-opacity"
              style={{ background: colors.bg, color: colors.text }}>
              <MapPin size={14} color={colors.primary} />
              <span className="text-sm">{catConfig.nome} em {c}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Profissionais */}
      <h2 className="text-base font-semibold mb-3" style={{ color: colors.text }}>
        {catConfig.nome}s em destaque
      </h2>

      {carregando ? (
        <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Carregando...</p>
      ) : prestadores.length === 0 ? (
        <Card padding={24} style={{ textAlign: 'center' }}>
          <p className="text-sm" style={{ color: colors.textSub }}>Nenhum profissional cadastrado ainda nesta categoria.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {prestadores.map(p => {
            const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
            return (
              <Card key={p.id} interactive padding={16} onClick={() => navigate(`/profissional/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                  style={{ background: colors.primary }}>{iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5" style={{ color: colors.text }}>{p.nome}</p>
                  <p className="text-xs mb-1" style={{ color: colors.textSub }}>{p.cidade}, {p.estado}</p>
                  <ReputacaoBadge nota={p.avaliacao_media} totalAvaliacoes={p.total_avaliacoes} size="small" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReputacaoBadge from '../components/ReputacaoBadge'

// Mapeamento de slugs para nomes legíveis
const categoriasMap = {
  'eletricista': { nome: 'Eletricista', emoji: '⚡', desc: 'Instalação elétrica, manutenção, quadro de luz' },
  'pedreiro': { nome: 'Pedreiro', emoji: '🧱', desc: 'Alvenaria, construção, reformas em geral' },
  'encanador': { nome: 'Encanador', emoji: '🚿', desc: 'Conserto de vazamentos, instalação hidráulica' },
  'pintor': { nome: 'Pintor', emoji: '🎨', desc: 'Pintura residencial e comercial' },
  'marceneiro': { nome: 'Marceneiro', emoji: '🪚', desc: 'Móveis planejados, marcenaria em geral' },
  'mecanico': { nome: 'Mecânico', emoji: '🔧', desc: 'Manutenção e reparo de veículos' },
  'jardineiro': { nome: 'Jardineiro', emoji: '🌿', desc: 'Jardinagem, paisagismo, poda' },
  'diarista': { nome: 'Diarista', emoji: '🧹', desc: 'Limpeza residencial e comercial' },
  'serralheiro': { nome: 'Serralheiro', emoji: '🔩', desc: 'Grades, portões, serralheria em geral' },
  'vidraceiro': { nome: 'Vidraceiro', emoji: '🪟', desc: 'Vidros, janelas, box de banheiro' },
  'arquiteto': { nome: 'Arquiteto', emoji: '📐', desc: 'Projetos arquitetônicos e interiores' },
  'azulejista': { nome: 'Azulejista', emoji: '🪣', desc: 'Assentamento de pisos e azulejos' },
  'dedetizador': { nome: 'Dedetizador', emoji: '🐛', desc: 'Controle de pragas e insetos' },
  'informatica': { nome: 'Técnico em Informática', emoji: '💻', desc: 'Manutenção de computadores e redes' },
}

const perguntasFrequentes = (categoria, cidade) => [
  {
    q: `Quanto custa um ${categoria} em ${cidade}?`,
    a: `O preço de um ${categoria} em ${cidade} varia conforme o serviço. No Prestador você pode ver o perfil de cada profissional, ler avaliações de clientes reais e solicitar orçamento diretamente pelo chat antes de contratar.`
  },
  {
    q: `Como encontrar um bom ${categoria} em ${cidade}?`,
    a: `No Prestador você encontra ${categoria}s em ${cidade} com avaliações verificadas de clientes reais, fotos dos serviços realizados e histórico de trabalhos. Compare profissionais, leia as avaliações e entre em contato diretamente pelo app.`
  },
  {
    q: `Como contratar um ${categoria} pelo Prestador?`,
    a: `É simples: acesse o Prestador, busque por "${categoria}" em ${cidade}, veja os perfis com fotos e avaliações, e clique em "Conversar" para entrar em contato diretamente com o profissional pelo chat.`
  },
]

export default function SEOCidadeCategoria() {
  const { cidade, categoria } = useParams()
  const navigate = useNavigate()
  const [prestadores, setPrestadores] = useState([])
  const [carregando, setCarregando] = useState(true)

  const cidadeFormatada = cidade?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const catConfig = categoriasMap[categoria] || { nome: categoria, emoji: '🔧', desc: 'Serviços profissionais' }

  useEffect(() => {
    carregarPrestadores()
  }, [cidade, categoria])

  // SEO dinâmico — atualiza o título e meta da página
  useEffect(() => {
    if (cidadeFormatada && catConfig.nome) {
      document.title = `${catConfig.nome} em ${cidadeFormatada} | Prestador — Profissionais Avaliados`

      // Meta description
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'description'
        document.head.appendChild(meta)
      }
      meta.content = `Encontre ${catConfig.nome.toLowerCase()} em ${cidadeFormatada} com avaliações reais de clientes. Veja fotos dos serviços, compare profissionais e contrate com segurança pelo Prestador.`
    }
  }, [cidadeFormatada, catConfig])

  const carregarPrestadores = async () => {
    setCarregando(true)
    const cidadeNormal = cidade?.replace(/-/g, ' ')

    const { data } = await supabase
      .from('prestadores')
      .select('*')
      .ilike('cidade', `%${cidadeNormal}%`)
      .ilike('categoria_id', `%${categoria}%`)
      .eq('plano_status', 'ativo')
      .order('avaliacao_media', { ascending: false })

    setPrestadores(data || [])
    setCarregando(false)
  }

  const faqs = perguntasFrequentes(catConfig.nome.toLowerCase(), cidadeFormatada)

  return (
    <div className="max-w-2xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: '#7C9485' }}>
        <Link to="/" style={{ color: '#1FA855' }}>Início</Link>
        <span>›</span>
        <Link to={`/s/${categoria}`} style={{ color: '#1FA855' }}>{catConfig.nome}</Link>
        <span>›</span>
        <span>{cidadeFormatada}</span>
      </nav>

      {/* Hero da página SEO */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontSize: 40 }}>{catConfig.emoji}</span>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>
              {catConfig.nome} em {cidadeFormatada}
            </h1>
            <p className="text-sm" style={{ color: '#7C9485' }}>{catConfig.desc}</p>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: '#5F6F65' }}>
          Encontre os melhores {catConfig.nome.toLowerCase()}s em {cidadeFormatada} com avaliações verificadas de clientes reais.
          Compare profissionais, veja fotos dos serviços e contrate com segurança.
        </p>

        <div className="flex gap-3">
          <button onClick={() => navigate(`/busca?categoria=${categoria}&cidade=${cidadeFormatada}`)}
            className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}>
            Ver todos os profissionais
          </button>
          <button onClick={() => navigate('/pedidos/novo')}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl hover:opacity-90"
            style={{ border: '0.5px solid #1FA855', color: '#1FA855' }}>
            Pedir orçamento
          </button>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl p-3 text-center" style={{ border: '0.5px solid #DDE3DD' }}>
          <p className="text-xl font-semibold" style={{ color: '#1FA855' }}>{prestadores.length}</p>
          <p className="text-xs" style={{ color: '#7C9485' }}>profissionais</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center" style={{ border: '0.5px solid #DDE3DD' }}>
          <p className="text-xl font-semibold" style={{ color: '#1FA855' }}>
            {prestadores.filter(p => (p.avaliacao_media || 0) >= 4.5).length}
          </p>
          <p className="text-xs" style={{ color: '#7C9485' }}>com nota ≥ 4.5</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center" style={{ border: '0.5px solid #DDE3DD' }}>
          <p className="text-xl font-semibold" style={{ color: '#1FA855' }}>
            {prestadores.reduce((acc, p) => acc + (p.total_avaliacoes || 0), 0)}
          </p>
          <p className="text-xs" style={{ color: '#7C9485' }}>avaliações</p>
        </div>
      </div>

      {/* Lista de prestadores */}
      <h2 className="text-base font-semibold mb-3" style={{ color: '#1F2D24' }}>
        {catConfig.nome}s disponíveis em {cidadeFormatada}
      </h2>

      {carregando ? (
        <p className="text-sm text-center py-8" style={{ color: '#C9BFA8' }}>Carregando profissionais...</p>
      ) : prestadores.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
          <div className="text-4xl mb-3">{catConfig.emoji}</div>
          <p className="text-sm font-medium mb-1" style={{ color: '#1F2D24' }}>
            Ainda sem {catConfig.nome.toLowerCase()}s cadastrados em {cidadeFormatada}
          </p>
          <p className="text-xs mb-4" style={{ color: '#7C9485' }}>
            Seja o primeiro a se cadastrar ou poste um pedido para receber propostas!
          </p>
          <button onClick={() => navigate('/pedidos/novo')}
            className="px-5 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}>
            Postar pedido de serviço
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {prestadores.map(p => {
            const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
            return (
              <div key={p.id} onClick={() => navigate(`/profissional/${p.id}`)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium text-white flex-shrink-0"
                  style={{ background: '#1FA855' }}>{iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5" style={{ color: '#1F2D24' }}>{p.nome}</p>
                  <p className="text-xs mb-1.5 capitalize" style={{ color: '#7C9485' }}>{p.cidade}, {p.estado}</p>
                  <ReputacaoBadge nota={p.avaliacao_media} totalAvaliacoes={p.total_avaliacoes} size="small" />
                </div>
                {p.plano_id && p.plano_id !== 'basico' && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                    {p.plano_id === 'premium' ? '⭐ Premium' : '✓ Prof.'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* FAQ — essencial para SEO */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#1F2D24' }}>
          Perguntas frequentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="pb-4" style={{ borderBottom: i < faqs.length - 1 ? '0.5px solid #EDE3CE' : 'none' }}>
              <p className="text-sm font-medium mb-1.5" style={{ color: '#1F2D24' }}>{faq.q}</p>
              <p className="text-sm" style={{ color: '#5F6F65', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links para outras cidades/categorias */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#7C9485' }}>
          OUTRAS CATEGORIAS EM {cidadeFormatada?.toUpperCase()}
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoriasMap)
            .filter(([slug]) => slug !== categoria)
            .slice(0, 8)
            .map(([slug, cat]) => (
              <Link key={slug}
                to={`/s/${slug}/${cidade}`}
                className="text-xs px-3 py-1.5 rounded-full hover:opacity-80"
                style={{ background: '#F0F2F0', color: '#5F6F65', border: '0.5px solid #DDE3DD' }}>
                {cat.emoji} {cat.nome}
              </Link>
            ))}
        </div>
      </div>

    </div>
  )
}

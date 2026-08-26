import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Crown, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ReputacaoBadge from '../components/ReputacaoBadge'
import { colors } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import { SEO_CATEGORIAS, SITE_URL } from '../lib/seoConfig'
import { useSEO } from '../lib/useSEO'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

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
  const catConfig = SEO_CATEGORIAS[categoria] || { nome: categoria, desc: 'Serviços profissionais' }
  const { icon: CatIcon, bg: catBg, color: catColor } = getCategoriaIcone(categoria)
  const faqs = perguntasFrequentes(catConfig.nome.toLowerCase(), cidadeFormatada)

  useEffect(() => {
    carregarPrestadores()
  }, [cidade, categoria])

  useSEO({
    title: `${catConfig.nome} em ${cidadeFormatada} | Prestador — Profissionais Avaliados`,
    description: `Encontre ${catConfig.nome.toLowerCase()} em ${cidadeFormatada} com avaliações reais de clientes. Veja fotos dos serviços, compare profissionais e contrate com segurança pelo Prestador.`,
    path: `/s/${categoria}/${cidade}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: catConfig.nome, item: `${SITE_URL}/s/${categoria}` },
            { '@type': 'ListItem', position: 3, name: cidadeFormatada, item: `${SITE_URL}/s/${categoria}/${cidade}` },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        },
      ],
    },
  })

  const carregarPrestadores = async () => {
    setCarregando(true)
    const cidadeNormal = cidade?.replace(/-/g, ' ')

    const { data } = await supabase
      .from('prestadores_completo')
      .select('*')
      .ilike('cidade', `%${cidadeNormal}%`)
      .ilike('categoria_id', `%${categoria}%`)
      .eq('plano_status', 'ativo')
      .order('avaliacao_media', { ascending: false })

    setPrestadores(data || [])
    setCarregando(false)
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: colors.textSub }}>
        <Link to="/" style={{ color: colors.primary }}>Início</Link>
        <span>›</span>
        <Link to={`/s/${categoria}`} style={{ color: colors.primary }}>{catConfig.nome}</Link>
        <span>›</span>
        <span>{cidadeFormatada}</span>
      </nav>

      {/* Hero da página SEO */}
      <Card padding={24} style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: catBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CatIcon size={24} color={catColor} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: colors.text }}>
              {catConfig.nome} em {cidadeFormatada}
            </h1>
            <p className="text-sm" style={{ color: colors.textSub }}>{catConfig.desc}</p>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: colors.textSub }}>
          Encontre os melhores {catConfig.nome.toLowerCase()}s em {cidadeFormatada} com avaliações verificadas de clientes reais.
          Compare profissionais, veja fotos dos serviços e contrate com segurança.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button fullWidth onClick={() => navigate(`/busca?categoria=${categoria}&cidade=${cidadeFormatada}`)}>
            Ver todos os profissionais
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/pedidos/novo')}>
            Pedir orçamento
          </Button>
        </div>
      </Card>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card padding={12} style={{ textAlign: 'center' }}>
          <p className="text-xl font-semibold" style={{ color: colors.primary }}>{prestadores.length}</p>
          <p className="text-xs" style={{ color: colors.textSub }}>profissionais</p>
        </Card>
        <Card padding={12} style={{ textAlign: 'center' }}>
          <p className="text-xl font-semibold" style={{ color: colors.primary }}>
            {prestadores.filter(p => (p.avaliacao_media || 0) >= 4.5).length}
          </p>
          <p className="text-xs" style={{ color: colors.textSub }}>com nota ≥ 4.5</p>
        </Card>
        <Card padding={12} style={{ textAlign: 'center' }}>
          <p className="text-xl font-semibold" style={{ color: colors.primary }}>
            {prestadores.reduce((acc, p) => acc + (p.total_avaliacoes || 0), 0)}
          </p>
          <p className="text-xs" style={{ color: colors.textSub }}>avaliações</p>
        </Card>
      </div>

      {/* Lista de prestadores */}
      <h2 className="text-base font-semibold mb-3" style={{ color: colors.text }}>
        {catConfig.nome}s disponíveis em {cidadeFormatada}
      </h2>

      {carregando ? (
        <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Carregando profissionais...</p>
      ) : prestadores.length === 0 ? (
        <Card padding={24} style={{ textAlign: 'center', marginBottom: 20 }}>
          <CatIcon size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>
            Ainda sem {catConfig.nome.toLowerCase()}s cadastrados em {cidadeFormatada}
          </p>
          <p className="text-xs mb-4" style={{ color: colors.textSub }}>
            Seja o primeiro a se cadastrar ou poste um pedido para receber propostas!
          </p>
          <Button onClick={() => navigate('/pedidos/novo')}>Postar pedido de serviço</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {prestadores.map(p => {
            const iniciais = p.nome?.split(' ').map(w => w[0]).slice(0,2).join('') || 'P'
            return (
              <Card key={p.id} interactive padding={16} onClick={() => navigate(`/profissional/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium text-white flex-shrink-0"
                  style={{ background: colors.primary }}>{iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5" style={{ color: colors.text }}>{p.nome}</p>
                  <p className="text-xs mb-1.5 capitalize" style={{ color: colors.textSub }}>{p.cidade}, {p.estado}</p>
                  <ReputacaoBadge nota={p.avaliacao_media} totalAvaliacoes={p.total_avaliacoes} size="small" />
                </div>
                {p.plano_id && p.plano_id !== 'basico' && (
                  <Badge tone="plan" icon={p.plano_id === 'premium' ? <Crown size={10} /> : <Check size={10} strokeWidth={3} />} style={{ flexShrink: 0 }}>
                    {p.plano_id === 'premium' ? 'Premium' : 'Prof.'}
                  </Badge>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* FAQ — essencial para SEO */}
      <Card padding={20} style={{ marginBottom: 20 }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: colors.text }}>
          Perguntas frequentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="pb-4" style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <p className="text-sm font-medium mb-1.5" style={{ color: colors.text }}>{faq.q}</p>
              <p className="text-sm" style={{ color: colors.textSub, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Links para outras cidades/categorias */}
      <Card padding={20}>
        <h2 className="text-sm font-medium mb-3" style={{ color: colors.textSub }}>
          OUTRAS CATEGORIAS EM {cidadeFormatada?.toUpperCase()}
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SEO_CATEGORIAS)
            .filter(([slug]) => slug !== categoria)
            .slice(0, 8)
            .map(([slug, cat]) => {
              const { icon: Icon } = getCategoriaIcone(slug)
              return (
                <Link key={slug}
                  to={`/s/${slug}/${cidade}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full hover:opacity-80"
                  style={{ background: colors.bg, color: colors.textSub, border: `1px solid ${colors.border}` }}>
                  <Icon size={12} /> {cat.nome}
                </Link>
              )
            })}
        </div>
      </Card>

    </div>
  )
}

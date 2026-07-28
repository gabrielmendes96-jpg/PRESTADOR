import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Home as HomeIcon, HardHat, MessageCircle, Camera, ShieldCheck,
  Trophy, Star, Users, ChevronDown, Phone, ArrowRight,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useCategorias } from '../lib/hooks'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import { colors, radius, shadow, spacing, type as typeScale } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SearchBar from '../components/ui/SearchBar'

const passosPrestador = [
  { icon: HardHat, titulo: 'Crie seu perfil', desc: 'Cadastre-se gratuitamente, adicione fotos dos seus trabalhos e descreva seus serviços.' },
  { icon: Search, titulo: 'Seja encontrado', desc: 'Clientes da sua cidade buscam profissionais pelo app e encontram seu perfil com avaliações reais.' },
  { icon: MessageCircle, titulo: 'Converse direto', desc: 'O cliente entra em contato pelo chat do app — sem intermediários, sem complicação.' },
  { icon: Star, titulo: 'Acumule avaliações', desc: 'Cada serviço concluído pode gerar uma avaliação com foto, aumentando sua credibilidade.' },
  { icon: Trophy, titulo: 'Evolua de nível', desc: 'Quanto mais avaliações e melhor sua nota, mais você sobe: Bronze → Prata → Ouro → Embaixador.' },
]

const passosCliente = [
  { icon: Search, titulo: 'Busque profissionais', desc: 'Digite o serviço que você precisa ou navegue pelas categorias. Veja profissionais perto de você.' },
  { icon: Camera, titulo: 'Compare com fotos reais', desc: 'Cada profissional tem fotos dos trabalhos realizados e avaliações verificadas de clientes reais.' },
  { icon: MessageCircle, titulo: 'Converse antes de contratar', desc: 'Entre em contato pelo chat, tire dúvidas, negocie valores — tudo dentro do app.' },
  { icon: ShieldCheck, titulo: 'Contrate com segurança', desc: 'Escolha o profissional ideal e acompanhe o serviço. Depois avalie com fotos do resultado.' },
]

const perguntas = [
  { q: 'O Prestador é gratuito para clientes?', r: 'Sim! Clientes podem buscar e conversar com profissionais gratuitamente. Apenas a postagem de pedidos de serviço tem um pequeno custo (R$9 por pedido).' },
  { q: 'Como funciona para os prestadores?', r: 'Prestadores pagam uma mensalidade a partir de R$49/mês para aparecer na plataforma. Os primeiros 30 dias são gratuitos para novos cadastros.' },
  { q: 'As avaliações são reais?', r: 'Sim! Só pode avaliar quem teve uma conversa real ou contratou o profissional pelo app. Isso garante que todas as avaliações são de clientes reais.' },
  { q: 'O app está disponível em quais cidades?', r: 'Estamos começando por Araraquara e cidades da região. Em breve expandindo para todo o Brasil.' },
  { q: 'Como o profissional aparece em destaque?', r: 'Prestadores com nota ≥ 4.5 e avaliações verificadas entram automaticamente na aba Destaques. Também é possível impulsionar o perfil a partir de R$20.' },
]

const planos = [
  { nome: 'Básico', preco: 'R$49/mês' },
  { nome: 'Profissional', preco: 'R$99/mês', destaque: true },
  { nome: 'Premium', preco: 'R$199/mês' },
]

function PassoLista({ passos, tint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {passos.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tint.bg }}>
            <p.icon size={18} color={tint.color} strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>{p.titulo}</p>
            <p style={{ fontSize: 14, color: colors.textSub, lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function FaqItem({ pergunta, aberto, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${colors.border}`, padding: '16px 0' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{pergunta.q}</span>
        <ChevronDown size={18} color={colors.textSub} style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: aberto ? 'rotate(180deg)' : 'none' }} />
      </button>
      {aberto && (
        <p className="fade-in" style={{ fontSize: 14, color: colors.textSub, lineHeight: 1.6, marginTop: 10 }}>{pergunta.r}</p>
      )}
    </div>
  )
}

export default function ComoFunciona() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [faqAberta, setFaqAberta] = useState(0)
  const { categorias } = useCategorias()

  const handleBusca = (e) => {
    e.preventDefault()
    navigate(`/busca${busca.trim() ? `?q=${encodeURIComponent(busca)}` : ''}`)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero dividido */}
      <div className="flex flex-col sm:flex-row" style={{ alignItems: 'center', gap: 40, padding: '24px 4px 48px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 16 }}>
            Encontre o profissional <span style={{ color: colors.primary }}>certo</span>. Na hora certa.
          </h1>
          <p style={{ fontSize: 16, color: colors.textSub, lineHeight: 1.6, marginBottom: 24, maxWidth: 460 }}>
            Conectamos você a profissionais avaliados e qualificados perto de você — com fotos reais e conversa direta pelo app.
          </p>
          <div style={{ marginBottom: 16, maxWidth: 460 }}>
            <SearchBar value={busca} onChange={e => setBusca(e.target.value)} onSubmit={handleBusca} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => navigate('/busca')}>
              Buscar profissionais
            </Button>
            <Button variant="secondary" onClick={() => navigate('/cadastro-pro')}>
              Sou prestador de serviço
            </Button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1', borderRadius: radius.hero,
            background: 'linear-gradient(135deg, #169B4C, #23B65A)', boxShadow: shadow.hero,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Logo iconOnly size={96} />

            <div style={{ position: 'absolute', top: 20, left: -16, background: '#fff', borderRadius: 16, padding: '10px 14px', boxShadow: shadow.card, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color={colors.primary} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: 0 }}>18.000+</p>
                <p style={{ fontSize: 10, color: colors.textSub, margin: 0 }}>Profissionais</p>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 24, right: -16, background: '#fff', borderRadius: 16, padding: '10px 14px', boxShadow: shadow.card, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={16} fill={colors.secondary} color={colors.secondary} strokeWidth={0} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: 0 }}>4.9</p>
                <p style={{ fontSize: 10, color: colors.textSub, margin: 0 }}>Avaliação média</p>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: -14, left: 24, background: '#fff', borderRadius: 16, padding: '10px 14px', boxShadow: shadow.card, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color={colors.primary} />
              <p style={{ fontSize: 12, fontWeight: 700, color: colors.text, margin: 0 }}>100% seguro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias populares */}
      {categorias.length > 0 && (
        <section style={{ marginBottom: spacing.section }}>
          <h2 style={{ ...typeScale.subtitle, color: colors.text, marginBottom: 16, textAlign: 'center' }}>Categorias populares</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categorias.slice(0, 8).map(cat => {
              const { icon: Icon, bg, color } = getCategoriaIcone(cat)
              return (
                <Card key={cat.id} as="button" interactive padding={16} onClick={() => navigate(`/busca?categoria=${cat.id}`)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap' }}>{cat.nome}</span>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Para clientes */}
        <Card padding={28} style={{ marginBottom: spacing.card }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 24 }}>
            <HomeIcon size={20} color={colors.primary} /> Para quem precisa de serviço
          </h2>
          <PassoLista passos={passosCliente} tint={{ bg: '#DCFCE7', color: colors.primaryHover }} />
          <Button fullWidth style={{ marginTop: 24 }} onClick={() => navigate('/busca')}>
            Buscar profissionais agora
          </Button>
        </Card>

        {/* Para prestadores */}
        <Card padding={28} style={{ marginBottom: spacing.card }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 24 }}>
            <HardHat size={20} color="#92610A" /> Para prestadores de serviço
          </h2>
          <PassoLista passos={passosPrestador} tint={{ bg: '#FEF3C7', color: '#92610A' }} />

          {/* Planos resumo */}
          <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: colors.bg }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: colors.primaryHover, marginBottom: 12 }}>PLANOS PARA PRESTADORES</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {planos.map(p => (
                <div key={p.nome} style={{
                  textAlign: 'center', padding: 12, borderRadius: 14, background: '#fff',
                  border: p.destaque ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.textSub, margin: 0 }}>{p.nome}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '4px 0 0' }}>{p.preco}</p>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" fullWidth style={{ marginTop: 16 }} onClick={() => navigate('/planos')}>
            Ver todos os planos
          </Button>
        </Card>

        {/* FAQ */}
        <Card padding={28} style={{ marginBottom: spacing.card }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Perguntas frequentes</h2>
          <div>
            {perguntas.map((p, i) => (
              <FaqItem key={i} pergunta={p} aberto={faqAberta === i} onToggle={() => setFaqAberta(faqAberta === i ? -1 : i)} />
            ))}
          </div>
        </Card>

        {/* CTA final */}
        <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 16 }}>
            Ainda tem dúvidas? Entre em contato pelo WhatsApp.
          </p>
          <a
            href="https://wa.me/5516999999999?text=Olá, tenho dúvidas sobre o Prestador App"
            target="_blank" rel="noreferrer"
            className="btn-press"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
              background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 700,
              borderRadius: radius.btn, textDecoration: 'none',
            }}
          >
            <Phone size={17} /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

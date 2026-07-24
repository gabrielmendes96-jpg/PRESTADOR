import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const passosPrestador = [
  { emoji: '📝', titulo: 'Crie seu perfil', desc: 'Cadastre-se gratuitamente, adicione fotos dos seus trabalhos e descreva seus serviços.' },
  { emoji: '📱', titulo: 'Seja encontrado', desc: 'Clientes da sua cidade buscam profissionais pelo app e encontram seu perfil com avaliações reais.' },
  { emoji: '💬', titulo: 'Converse direto', desc: 'O cliente entra em contato pelo chat do app — sem intermediários, sem complicação.' },
  { emoji: '⭐', titulo: 'Acumule avaliações', desc: 'Cada serviço concluído pode gerar uma avaliação com foto, aumentando sua credibilidade.' },
  { emoji: '🏆', titulo: 'Evolua de nível', desc: 'Quanto mais avaliações e melhor sua nota, mais você sobe: Bronze → Prata → Ouro → Embaixador.' },
]

const passosCliente = [
  { emoji: '🔍', titulo: 'Busque profissionais', desc: 'Digite o serviço que você precisa ou navegue pelas categorias. Veja profissionais perto de você.' },
  { emoji: '📸', titulo: 'Compare com fotos reais', desc: 'Cada profissional tem fotos dos trabalhos realizados e avaliações verificadas de clientes reais.' },
  { emoji: '💬', titulo: 'Converse antes de contratar', desc: 'Entre em contato pelo chat, tire dúvidas, negocie valores — tudo dentro do app.' },
  { emoji: '✅', titulo: 'Contrate com segurança', desc: 'Escolha o profissional ideal e acompanhe o serviço. Depois avalie com fotos do resultado.' },
]

const perguntas = [
  { q: 'O Prestador é gratuito para clientes?', r: 'Sim! Clientes podem buscar e conversar com profissionais gratuitamente. Apenas a postagem de pedidos de serviço tem um pequeno custo (R$9 por pedido).' },
  { q: 'Como funciona para os prestadores?', r: 'Prestadores pagam uma mensalidade a partir de R$49/mês para aparecer na plataforma. Os primeiros 30 dias são gratuitos para novos cadastros.' },
  { q: 'As avaliações são reais?', r: 'Sim! Só pode avaliar quem teve uma conversa real ou contratou o profissional pelo app. Isso garante que todas as avaliações são de clientes reais.' },
  { q: 'O app está disponível em quais cidades?', r: 'Estamos começando por Araraquara e cidades da região. Em breve expandindo para todo o Brasil.' },
  { q: 'Como o profissional aparece em destaque?', r: 'Prestadores com nota ≥ 4.5 e avaliações verificadas entram automaticamente na aba Destaques. Também é possível impulsionar o perfil a partir de R$20.' },
]

export default function ComoFunciona() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo size={48} />
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
          Como o Prestador funciona?
        </h1>
        <p className="text-sm" style={{ color: '#7C9485' }}>
          A plataforma que conecta clientes a profissionais de serviço com avaliações reais e fotos dos trabalhos.
        </p>
      </div>

      {/* Para clientes */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: '#1F2D24' }}>
          <span className="text-xl">🏠</span> Para quem precisa de serviço
        </h2>
        <div className="space-y-4">
          {passosCliente.map((p, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: '#E3F6E9' }}>{p.emoji}</div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#1F2D24' }}>{p.titulo}</p>
                <p className="text-sm" style={{ color: '#7C9485', lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/busca')}
          className="w-full mt-5 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
          style={{ background: '#1FA855' }}>
          Buscar profissionais agora
        </button>
      </div>

      {/* Para prestadores */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: '#1F2D24' }}>
          <span className="text-xl">👷</span> Para prestadores de serviço
        </h2>
        <div className="space-y-4">
          {passosPrestador.map((p, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: '#FFF4D6' }}>{p.emoji}</div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#1F2D24' }}>{p.titulo}</p>
                <p className="text-sm" style={{ color: '#7C9485', lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Planos resumo */}
        <div className="mt-5 p-4 rounded-xl" style={{ background: '#F0FAF4' }}>
          <p className="text-xs font-medium mb-3" style={{ color: '#0F6E3D' }}>Planos para prestadores</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { nome: 'Básico', preco: 'R$49/mês', cor: '#7C9485' },
              { nome: 'Profissional', preco: 'R$99/mês', cor: '#1FA855', destaque: true },
              { nome: 'Premium', preco: 'R$199/mês', cor: '#8A5A00' },
            ].map(p => (
              <div key={p.nome} className="text-center p-3 rounded-xl bg-white"
                style={{ border: p.destaque ? '2px solid #1FA855' : '0.5px solid #DDE3DD' }}>
                <p className="text-xs font-medium" style={{ color: p.cor }}>{p.nome}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#1F2D24' }}>{p.preco}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/planos')}
          className="w-full mt-4 py-3 text-sm font-medium rounded-xl hover:opacity-90"
          style={{ border: '1px solid #1FA855', color: '#1FA855' }}>
          Ver todos os planos
        </button>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <h2 className="text-base font-semibold mb-5" style={{ color: '#1F2D24' }}>Perguntas frequentes</h2>
        <div className="space-y-4">
          {perguntas.map((p, i) => (
            <div key={i} className="pb-4" style={{ borderBottom: i < perguntas.length - 1 ? '0.5px solid #EDE3CE' : 'none' }}>
              <p className="text-sm font-medium mb-1.5" style={{ color: '#1F2D24' }}>{p.q}</p>
              <p className="text-sm" style={{ color: '#5F6F65', lineHeight: 1.6 }}>{p.r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center py-6">
        <p className="text-sm mb-4" style={{ color: '#7C9485' }}>
          Ainda tem dúvidas? Entre em contato pelo WhatsApp.
        </p>
        <a href="https://wa.me/5516999999999?text=Olá, tenho dúvidas sobre o Prestador App"
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
          style={{ background: '#25D366' }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} aria-hidden="true"></i>
          Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand, Camera, PenLine, Tag, PartyPopper, Lightbulb, ArrowRight, ArrowLeft, Rocket } from 'lucide-react'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const passos = [
  {
    icon: Hand,
    titulo: 'Bem-vindo ao Prestador!',
    desc: 'A plataforma que conecta você a mais clientes na sua região. Vamos configurar seu perfil em 3 passos simples.',
  },
  {
    icon: Camera,
    titulo: 'Adicione fotos dos seus trabalhos',
    desc: 'Perfis com fotos recebem 3x mais contatos. Vá em Portfólio no seu painel e adicione pelo menos 5 fotos dos seus serviços.',
    dica: 'Fotos do "antes e depois" são as que mais convencem clientes.',
  },
  {
    icon: PenLine,
    titulo: 'Escreva uma boa bio',
    desc: 'Conte sua experiência, especialidades e o que te diferencia. Use o Assistente de IA no painel para criar a bio perfeita.',
    dica: 'Mencione seus anos de experiência e as cidades que você atende.',
  },
  {
    icon: Tag,
    titulo: 'Adicione suas hashtags',
    desc: 'As hashtags ajudam clientes a te encontrar na busca. Exemplos: pintura, reboco, reforma banheiro, instalação elétrica.',
    dica: 'Use termos específicos que seus clientes buscam, não termos técnicos.',
  },
  {
    icon: PartyPopper,
    titulo: 'Tudo pronto!',
    desc: 'Seu perfil está configurado. Agora é hora de começar a receber clientes. Compartilhe seu perfil no WhatsApp para os primeiros contatos!',
  },
]

export default function Onboarding() {
  const [passo, setPasso] = useState(0)
  const navigate = useNavigate()
  const atual = passos[passo]
  const ultimo = passo === passos.length - 1

  const proximo = () => {
    if (ultimo) {
      localStorage.setItem('onboarding_completo', 'true')
      navigate('/painel')
    } else {
      setPasso(passo + 1)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Logo size={40} />
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {passos.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, transition: 'background 0.25s ease', background: i <= passo ? colors.primary : colors.border }} />
          ))}
        </div>

        <Card padding={24}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <atual.icon size={32} color={colors.primary} strokeWidth={1.8} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 10 }}>
              {atual.titulo}
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: colors.textSub, margin: 0 }}>{atual.desc}</p>
          </div>

          {atual.dica && (
            <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 14, marginBottom: 20, background: '#FFFBEB' }}>
              <Lightbulb size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#92610A', margin: 0, lineHeight: 1.5 }}>{atual.dica}</p>
            </div>
          )}

          <Button fullWidth icon={ultimo ? <Rocket size={16} /> : <ArrowRight size={16} />} iconPosition="right" onClick={proximo}>
            {ultimo ? 'Ir para o meu painel' : 'Próximo'}
          </Button>

          {passo > 0 && (
            <Button variant="text" fullWidth icon={<ArrowLeft size={14} />} style={{ marginTop: 12, justifyContent: 'center' }} onClick={() => setPasso(passo - 1)}>
              Voltar
            </Button>
          )}

          {!ultimo && (
            <button
              onClick={() => { localStorage.setItem('onboarding_completo', 'true'); navigate('/painel') }}
              style={{ width: '100%', marginTop: 4, padding: '8px 0', fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Pular e configurar depois
            </button>
          )}
        </Card>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          {passo + 1} de {passos.length}
        </p>
      </div>
    </div>
  )
}

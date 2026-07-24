import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const passos = [
  {
    emoji: '👋',
    titulo: 'Bem-vindo ao Prestador!',
    desc: 'A plataforma que conecta você a mais clientes na sua região. Vamos configurar seu perfil em 3 passos simples.',
    cor: '#1FA855',
  },
  {
    emoji: '📸',
    titulo: 'Adicione fotos dos seus trabalhos',
    desc: 'Perfis com fotos recebem 3x mais contatos. Vá em Portfólio no seu painel e adicione pelo menos 5 fotos dos seus serviços.',
    cor: '#185FA5',
    dica: '💡 Dica: fotos do "antes e depois" são as que mais convencem clientes.',
  },
  {
    emoji: '✍️',
    titulo: 'Escreva uma boa bio',
    desc: 'Conte sua experiência, especialidades e o que te diferencia. Use o Assistente de IA no painel para criar a bio perfeita.',
    cor: '#8A5A00',
    dica: '💡 Dica: mencione seus anos de experiência e as cidades que você atende.',
  },
  {
    emoji: '🏷️',
    titulo: 'Adicione suas hashtags',
    desc: 'As hashtags ajudam clientes a te encontrar na busca. Exemplos: pintura, reboco, reforma banheiro, instalação elétrica.',
    cor: '#0F6E3D',
    dica: '💡 Dica: use termos específicos que seus clientes buscam, não termos técnicos.',
  },
  {
    emoji: '🎉',
    titulo: 'Tudo pronto!',
    desc: 'Seu perfil está configurado. Agora é hora de começar a receber clientes. Compartilhe seu perfil no WhatsApp para os primeiros contatos!',
    cor: '#1FA855',
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F0F2F0' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={40} />
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {passos.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: i <= passo ? atual.cor : '#DDE3DD' }} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
          <div className="text-center mb-6">
            <div style={{ fontSize: 64 }}>{atual.emoji}</div>
            <h1 className="text-xl font-semibold mt-4 mb-3" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
              {atual.titulo}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>{atual.desc}</p>
          </div>

          {atual.dica && (
            <div className="p-3 rounded-xl mb-5" style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
              <p className="text-xs" style={{ color: '#0F6E3D' }}>{atual.dica}</p>
            </div>
          )}

          <button onClick={proximo}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: atual.cor }}>
            {ultimo ? '🚀 Ir para o meu painel' : 'Próximo →'}
          </button>

          {passo > 0 && (
            <button onClick={() => setPasso(passo - 1)}
              className="w-full mt-2 py-2 text-sm rounded-xl hover:opacity-70"
              style={{ color: '#7C9485' }}>
              ← Voltar
            </button>
          )}

          {!ultimo && (
            <button onClick={() => { localStorage.setItem('onboarding_completo', 'true'); navigate('/painel') }}
              className="w-full mt-1 py-2 text-xs hover:underline"
              style={{ color: '#C9BFA8' }}>
              Pular e configurar depois
            </button>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#C9BFA8' }}>
          {passo + 1} de {passos.length}
        </p>
      </div>
    </div>
  )
}

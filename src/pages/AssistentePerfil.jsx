import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, Check, X, Bot, PenLine, Tag, Camera, ChevronRight, ArrowLeft, Sparkles,
  Sun, Ruler, Search, Sparkle, Smartphone, CheckCheck, Wrench,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function NotaCompletude({ prestador }) {
  const itens = [
    { label: 'Nome completo', ok: !!prestador.nome?.trim(), peso: 10 },
    { label: 'Foto de perfil / portfólio', ok: prestador.totalFotos > 0, peso: 25 },
    { label: 'Descrição / bio', ok: prestador.descricao?.length > 50, peso: 20 },
    { label: 'WhatsApp', ok: !!prestador.whatsapp?.trim(), peso: 10 },
    { label: 'Cidade e estado', ok: !!prestador.cidade && !!prestador.estado, peso: 10 },
    { label: 'Categoria definida', ok: !!prestador.categoria_id, peso: 10 },
    { label: 'Hashtags de serviços', ok: prestador.totalHashtags > 0, peso: 10 },
    { label: 'Pelo menos 1 avaliação', ok: (prestador.totalAvaliacoes || 0) > 0, peso: 5 },
  ]

  const nota = itens.reduce((acc, i) => acc + (i.ok ? i.peso : 0), 0)
  const cor = nota >= 80 ? '#16A34A' : nota >= 50 ? '#F6C64D' : '#B91C1C'
  const label = nota >= 80 ? 'Ótimo!' : nota >= 50 ? 'Bom, mas pode melhorar' : 'Precisa de atenção'

  return (
    <Card padding={20} style={{ marginBottom: 16 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
        <BarChart3 size={16} color={colors.primary} /> Completude do seu perfil
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 80, height: 80 }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E4E7E4" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={cor} strokeWidth="3"
              strokeDasharray={`${nota} ${100 - nota}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold" style={{ color: cor }}>{nota}%</span>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold" style={{ color: cor }}>{label}</p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {nota < 100 ? `Complete seu perfil para atrair mais clientes!` : 'Seu perfil está completo!'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {itens.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: item.ok ? '#DCFCE7' : '#FEF2F2' }}>
              {item.ok
                ? <Check size={11} strokeWidth={3} color="#14853D" />
                : <X size={11} strokeWidth={3} color="#B91C1C" />}
            </div>
            <span className="text-sm" style={{ color: item.ok ? '#6B7280' : '#1F2937', fontWeight: item.ok ? 400 : 500 }}>
              {item.label}
            </span>
            {!item.ok && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92610A' }}>
                +{item.peso} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function AssistenteIA({ prestador }) {
  const [etapa, setEtapa] = useState('menu') // menu | bio | hashtags | fotos | resultado
  const [respostas, setRespostas] = useState({})
  const [gerando, setGerando] = useState(false)
  const [resultado, setResultado] = useState('')
  const [copiado, setCopiado] = useState(false)

  const perguntasBio = [
    { id: 'anos', label: 'Há quantos anos você trabalha nessa área?', placeholder: 'Ex: 10 anos' },
    { id: 'especialidade', label: 'Qual é o seu principal serviço ou especialidade?', placeholder: 'Ex: Instalação elétrica residencial e comercial' },
    { id: 'diferenciais', label: 'O que te diferencia dos outros profissionais?', placeholder: 'Ex: Pontualidade, garantia de 1 ano, materiais de qualidade' },
    { id: 'regiao', label: 'Em quais cidades ou bairros você atende?', placeholder: 'Ex: Araraquara e cidades vizinhas num raio de 50km' },
  ]

  const gerarBio = async () => {
    setGerando(true)
    try {
      const prompt = `Você é um assistente que ajuda prestadores de serviço a criar uma bio profissional atraente para um app de marketplace de serviços chamado Prestador.

O prestador forneceu as seguintes informações:
- Profissão: ${prestador.categoria_id || 'não informada'}
- Anos de experiência: ${respostas.anos || 'não informado'}
- Especialidade: ${respostas.especialidade || 'não informada'}
- Diferenciais: ${respostas.diferenciais || 'não informado'}
- Região de atendimento: ${respostas.regiao || 'não informada'}

Escreva uma bio profissional em português brasileiro com:
- Linguagem simples e direta
- Entre 3 e 5 frases
- Tom de confiança e profissionalismo
- Mencione a experiência, especialidade e diferenciais
- NÃO use emojis excessivos
- NÃO use linguagem muito formal
Retorne APENAS o texto da bio, sem explicações.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setResultado(data.content[0].text)
      setEtapa('resultado')
    } catch (e) {
      setResultado('Não foi possível gerar a bio. Tente novamente.')
      setEtapa('resultado')
    }
    setGerando(false)
  }

  const gerarHashtags = async () => {
    setGerando(true)
    try {
      const prompt = `Você é um assistente que ajuda prestadores de serviço a escolher as melhores hashtags para seu perfil num marketplace de serviços.

Profissão: ${prestador.categoria_id || 'não informada'}
Especialidade: ${respostas.especialidadeHash || prestador.descricao || 'não informada'}
Cidade: ${prestador.cidade || 'não informada'}

Gere uma lista de 10 hashtags relevantes em português brasileiro para esse profissional.
Regras:
- Sem o símbolo #
- Palavras simples, sem espaços (use underline se necessário)
- Relacionadas ao serviço, localização e diferenciais
- Retorne APENAS as hashtags, uma por linha, sem numeração nem explicação`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setResultado(data.content[0].text)
      setEtapa('resultado')
    } catch (e) {
      setResultado('Não foi possível gerar hashtags. Tente novamente.')
      setEtapa('resultado')
    }
    setGerando(false)
  }

  const copiar = () => {
    navigator.clipboard.writeText(resultado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card padding={20}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#DCFCE7' }}>
          <Bot size={20} color={colors.primary} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Assistente de Perfil</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>Powered by IA — te ajudo a montar o melhor perfil</p>
        </div>
      </div>

      {/* MENU */}
      {etapa === 'menu' && (
        <div className="space-y-3">
          <button onClick={() => setEtapa('bio')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#F0FDF4', border: '0.5px solid #16A34A' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PenLine size={19} color="#14853D" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#14853D' }}>Criar minha bio com IA</p>
              <p className="text-xs" style={{ color: '#14853D' }}>Responda 4 perguntas simples e a IA escreve por você</p>
            </div>
            <ChevronRight className="ml-auto" size={18} color="#16A34A" />
          </button>

          <button onClick={() => setEtapa('hashtags')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#F0FDF4', border: '0.5px solid #16A34A' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={19} color="#14853D" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#14853D' }}>Sugerir hashtags</p>
              <p className="text-xs" style={{ color: '#14853D' }}>A IA sugere as melhores tags para te encontrarem</p>
            </div>
            <ChevronRight className="ml-auto" size={18} color="#16A34A" />
          </button>

          <button onClick={() => setEtapa('fotos')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#FEF3C7', border: '0.5px solid #F6C64D' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Camera size={19} color="#92610A" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#92610A' }}>Dicas de fotos</p>
              <p className="text-xs" style={{ color: '#92610A' }}>Como tirar as melhores fotos dos seus serviços</p>
            </div>
            <i className="ti ti-chevron-right ml-auto" style={{ color: '#F6C64D', fontSize: 18 }} aria-hidden="true"></i>
          </button>
        </div>
      )}

      {/* BIO */}
      {etapa === 'bio' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#6B7280' }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Responda as perguntas abaixo — a IA vai criar sua bio:</p>
          <div className="space-y-3 mb-5">
            {perguntasBio.map(p => (
              <div key={p.id}>
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>{p.label}</label>
                <input type="text" value={respostas[p.id] || ''}
                  onChange={e => setRespostas({ ...respostas, [p.id]: e.target.value })}
                  placeholder={p.placeholder}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #E4E7E4', background: '#F3F6F2' }} />
              </div>
            ))}
          </div>
          <Button fullWidth disabled={gerando} icon={gerando ? <Bot size={16} /> : <Sparkles size={16} />} onClick={gerarBio}>
            {gerando ? 'Gerando sua bio...' : 'Gerar bio com IA'}
          </Button>
        </div>
      )}

      {/* HASHTAGS */}
      {etapa === 'hashtags' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#6B7280' }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <p className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>Qual é o seu principal serviço?</p>
          <input type="text"
            value={respostas.especialidadeHash || ''}
            onChange={e => setRespostas({ ...respostas, especialidadeHash: e.target.value })}
            placeholder="Ex: Instalação e manutenção elétrica residencial"
            className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none mb-4"
            style={{ border: '0.5px solid #E4E7E4', background: '#F3F6F2' }} />
          <Button fullWidth disabled={gerando} icon={gerando ? <Bot size={16} /> : <Sparkles size={16} />} onClick={gerarHashtags}>
            {gerando ? 'Gerando hashtags...' : 'Sugerir hashtags com IA'}
          </Button>
        </div>
      )}

      {/* FOTOS */}
      {etapa === 'fotos' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#6B7280' }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
            <Camera size={16} color={colors.primary} /> Dicas para fotos que convertem
          </p>
          <div className="space-y-3">
            {[
              { icon: Sun, titulo: 'Use boa iluminação', desc: 'Tire fotos durante o dia, perto de janelas ou do lado de fora. Ambientes bem iluminados passam mais profissionalismo.' },
              { icon: Ruler, titulo: 'Mostre o antes e depois', desc: 'A foto mais poderosa é a comparação. Tire uma foto antes de começar e outra ao terminar o serviço.' },
              { icon: Search, titulo: 'Detalhe o acabamento', desc: 'Aproxime a câmera para mostrar a qualidade do acabamento — pintura, fiação, encanamento bem feito.' },
              { icon: Sparkle, titulo: 'Local limpo e organizado', desc: 'Sempre fotografe após limpar o ambiente. Bagunça na foto afasta clientes mesmo que o serviço seja ótimo.' },
              { icon: Smartphone, titulo: 'Segure o celular na horizontal', desc: 'Fotos horizontais ficam melhor no app e mostram mais do ambiente.' },
              { icon: CheckCheck, titulo: 'Mínimo 5 fotos no portfólio', desc: 'Perfis com 5+ fotos recebem 3x mais contatos do que perfis sem foto.' },
            ].map(d => (
              <div key={d.titulo} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F3F6F2' }}>
                <d.icon size={18} color={colors.textSub} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{d.titulo}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADO */}
      {etapa === 'resultado' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#6B7280' }}>
            <ArrowLeft size={14} /> Gerar outro
          </button>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
            <Sparkles size={15} color={colors.primary} /> Resultado gerado pela IA:
          </p>
          <div className="p-4 rounded-xl mb-4" style={{ background: '#F0FDF4', border: '0.5px solid #16A34A' }}>
            <p className="text-sm" style={{ color: '#1F2937', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{resultado}</p>
          </div>
          <button onClick={copiar}
            className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            style={copiado
              ? { background: '#DCFCE7', color: '#14853D', border: '1px solid #16A34A' }
              : { background: '#16A34A', color: '#fff' }}>
            {copiado && <Check size={15} strokeWidth={3} />} {copiado ? 'Copiado! Cole no seu perfil' : 'Copiar e usar no perfil'}
          </button>
        </div>
      )}
    </Card>
  )
}

export default function AssistentePerfil() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [prestador, setPrestador] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarPrestador()
  }, [usuario])

  const carregarPrestador = async () => {
    const { data: p } = await supabase
      .from('prestadores')
      .select('*')
      .eq('user_id', usuario.id)
      .single()

    if (p) {
      const { count: totalFotos } = await supabase
        .from('portfolio_prestador')
        .select('*', { count: 'exact', head: true })
        .eq('prestador_id', p.id)

      const { count: totalHashtags } = await supabase
        .from('servicos_prestador')
        .select('*', { count: 'exact', head: true })
        .eq('prestador_id', p.id)

      setPrestador({ ...p, totalFotos: totalFotos || 0, totalHashtags: totalHashtags || 0 })
    }
    setCarregando(false)
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#9CA3AF' }}>Carregando...</p>
    </div>
  )

  if (!prestador) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <Wrench size={44} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
      <p className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>Você ainda não tem perfil de prestador</p>
      <Button onClick={() => navigate('/cadastro-pro')}>Criar meu perfil</Button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
        <Bot size={19} color={colors.primary} /> Assistente de Perfil
      </h1>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
        Veja como está seu perfil e deixe a IA te ajudar a melhorá-lo
      </p>
      <NotaCompletude prestador={prestador} />
      <AssistenteIA prestador={prestador} />
    </div>
  )
}

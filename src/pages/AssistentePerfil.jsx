import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

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
  const cor = nota >= 80 ? '#1FA855' : nota >= 50 ? '#FFC857' : '#A32D2D'
  const label = nota >= 80 ? 'Ótimo!' : nota >= 50 ? 'Bom, mas pode melhorar' : 'Precisa de atenção'

  return (
    <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
      <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>📊 Completude do seu perfil</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 80, height: 80 }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EDE3CE" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={cor} strokeWidth="3"
              strokeDasharray={`${nota} ${100 - nota}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold" style={{ color: cor }}>{nota}%</span>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold" style={{ color: cor }}>{label}</p>
          <p className="text-xs mt-1" style={{ color: '#7C9485' }}>
            {nota < 100 ? `Complete seu perfil para atrair mais clientes!` : 'Seu perfil está completo! 🎉'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {itens.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: item.ok ? '#E3F6E9' : '#FCEBEB' }}>
              <span style={{ fontSize: 11, color: item.ok ? '#0F6E3D' : '#A32D2D' }}>
                {item.ok ? '✓' : '✗'}
              </span>
            </div>
            <span className="text-sm" style={{ color: item.ok ? '#5F6F65' : '#1F2D24', fontWeight: item.ok ? 400 : 500 }}>
              {item.label}
            </span>
            {!item.ok && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                +{item.peso} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
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
    <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #DDE3DD' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E3F6E9' }}>
          <span style={{ fontSize: 20 }}>🤖</span>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>Assistente de Perfil</p>
          <p className="text-xs" style={{ color: '#7C9485' }}>Powered by IA — te ajudo a montar o melhor perfil</p>
        </div>
      </div>

      {/* MENU */}
      {etapa === 'menu' && (
        <div className="space-y-3">
          <button onClick={() => setEtapa('bio')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
            <span className="text-2xl">✍️</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>Criar minha bio com IA</p>
              <p className="text-xs" style={{ color: '#3A7A5C' }}>Responda 4 perguntas simples e a IA escreve por você</p>
            </div>
            <i className="ti ti-chevron-right ml-auto" style={{ color: '#1FA855', fontSize: 18 }} aria-hidden="true"></i>
          </button>

          <button onClick={() => setEtapa('hashtags')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
            <span className="text-2xl">🏷️</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>Sugerir hashtags</p>
              <p className="text-xs" style={{ color: '#3A7A5C' }}>A IA sugere as melhores tags para te encontrarem</p>
            </div>
            <i className="ti ti-chevron-right ml-auto" style={{ color: '#1FA855', fontSize: 18 }} aria-hidden="true"></i>
          </button>

          <button onClick={() => setEtapa('fotos')}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-left hover:opacity-90 transition-opacity"
            style={{ background: '#FFF4D6', border: '0.5px solid #FFC857' }}>
            <span className="text-2xl">📸</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#8A5A00' }}>Dicas de fotos</p>
              <p className="text-xs" style={{ color: '#9A6B10' }}>Como tirar as melhores fotos dos seus serviços</p>
            </div>
            <i className="ti ti-chevron-right ml-auto" style={{ color: '#FFC857', fontSize: 18 }} aria-hidden="true"></i>
          </button>
        </div>
      )}

      {/* BIO */}
      {etapa === 'bio' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#7C9485' }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Voltar
          </button>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>Responda as perguntas abaixo — a IA vai criar sua bio:</p>
          <div className="space-y-3 mb-5">
            {perguntasBio.map(p => (
              <div key={p.id}>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>{p.label}</label>
                <input type="text" value={respostas[p.id] || ''}
                  onChange={e => setRespostas({ ...respostas, [p.id]: e.target.value })}
                  placeholder={p.placeholder}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #DDE3DD', background: '#F8F9F8' }} />
              </div>
            ))}
          </div>
          <button onClick={gerarBio} disabled={gerando}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1FA855' }}>
            {gerando ? '🤖 Gerando sua bio...' : '✨ Gerar bio com IA'}
          </button>
        </div>
      )}

      {/* HASHTAGS */}
      {etapa === 'hashtags' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#7C9485' }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Voltar
          </button>
          <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>Qual é o seu principal serviço?</p>
          <input type="text"
            value={respostas.especialidadeHash || ''}
            onChange={e => setRespostas({ ...respostas, especialidadeHash: e.target.value })}
            placeholder="Ex: Instalação e manutenção elétrica residencial"
            className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none mb-4"
            style={{ border: '0.5px solid #DDE3DD', background: '#F8F9F8' }} />
          <button onClick={gerarHashtags} disabled={gerando}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1FA855' }}>
            {gerando ? '🤖 Gerando hashtags...' : '✨ Sugerir hashtags com IA'}
          </button>
        </div>
      )}

      {/* FOTOS */}
      {etapa === 'fotos' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#7C9485' }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Voltar
          </button>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>📸 Dicas para fotos que convertem</p>
          <div className="space-y-3">
            {[
              { emoji: '☀️', titulo: 'Use boa iluminação', desc: 'Tire fotos durante o dia, perto de janelas ou do lado de fora. Ambientes bem iluminados passam mais profissionalismo.' },
              { emoji: '📐', titulo: 'Mostre o antes e depois', desc: 'A foto mais poderosa é a comparação. Tire uma foto antes de começar e outra ao terminar o serviço.' },
              { emoji: '🔍', titulo: 'Detalhe o acabamento', desc: 'Aproxime a câmera para mostrar a qualidade do acabamento — pintura, fiação, encanamento bem feito.' },
              { emoji: '🧹', titulo: 'Local limpo e organizado', desc: 'Sempre fotografe após limpar o ambiente. Bagunça na foto afasta clientes mesmo que o serviço seja ótimo.' },
              { emoji: '📱', titulo: 'Segure o celular na horizontal', desc: 'Fotos horizontais ficam melhor no app e mostram mais do ambiente.' },
              { emoji: '✅', titulo: 'Mínimo 5 fotos no portfólio', desc: 'Perfis com 5+ fotos recebem 3x mais contatos do que perfis sem foto.' },
            ].map(d => (
              <div key={d.titulo} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8F9F8' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{d.emoji}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{d.titulo}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7C9485' }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADO */}
      {etapa === 'resultado' && (
        <div>
          <button onClick={() => setEtapa('menu')} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#7C9485' }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Gerar outro
          </button>
          <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>✨ Resultado gerado pela IA:</p>
          <div className="p-4 rounded-xl mb-4" style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
            <p className="text-sm" style={{ color: '#1F2D24', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{resultado}</p>
          </div>
          <button onClick={copiar}
            className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 transition-colors"
            style={copiado
              ? { background: '#E3F6E9', color: '#0F6E3D', border: '1px solid #1FA855' }
              : { background: '#1FA855', color: '#fff' }}>
            {copiado ? '✓ Copiado! Cole no seu perfil' : 'Copiar e usar no perfil'}
          </button>
        </div>
      )}
    </div>
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
      <p className="text-sm" style={{ color: '#C9BFA8' }}>Carregando...</p>
    </div>
  )

  if (!prestador) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="text-5xl mb-4">🔧</div>
      <p className="text-sm font-medium mb-2" style={{ color: '#1F2D24' }}>Você ainda não tem perfil de prestador</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="px-6 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
        style={{ background: '#1FA855' }}>
        Criar meu perfil
      </button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>🤖 Assistente de Perfil</h1>
      <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
        Veja como está seu perfil e deixe a IA te ajudar a melhorá-lo
      </p>
      <NotaCompletude prestador={prestador} />
      <AssistenteIA prestador={prestador} />
    </div>
  )
}

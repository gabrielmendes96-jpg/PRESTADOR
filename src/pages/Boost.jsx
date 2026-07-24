import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const planos = [
  {
    id: '7dias',
    nome: '7 dias',
    valor: 20,
    desc: 'Ideal para testar',
    beneficios: ['Topo da busca na sua categoria', 'Banner na home por 7 dias', 'Badge "Em destaque" no perfil'],
  },
  {
    id: '15dias',
    nome: '15 dias',
    valor: 39,
    desc: 'Mais popular',
    destaque: true,
    beneficios: ['Topo da busca na sua categoria', 'Banner na home por 15 dias', 'Badge "Em destaque" no perfil', 'Aparece em categorias relacionadas'],
  },
  {
    id: '30dias',
    nome: '30 dias',
    valor: 59,
    desc: 'Melhor custo-benefício',
    beneficios: ['Topo da busca na sua categoria', 'Banner na home por 30 dias', 'Badge "Em destaque" no perfil', 'Aparece em categorias relacionadas', 'Prioridade máxima nos resultados'],
  },
]

export default function Boost() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [prestador, setPrestador] = useState(null)
  const [boostAtivo, setBoostAtivo] = useState(null)
  const [planoSelecionado, setPlanoSelecionado] = useState('15dias')
  const [carregando, setCarregando] = useState(true)
  const [contratando, setContratando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarDados()
  }, [usuario])

  const carregarDados = async () => {
    const { data: p } = await supabase
      .from('prestadores')
      .select('*')
      .eq('user_id', usuario.id)
      .single()

    if (p) {
      setPrestador(p)
      const { data: boost } = await supabase
        .from('boosts')
        .select('*')
        .eq('prestador_id', p.id)
        .eq('status', 'ativo')
        .gt('expira_em', new Date().toISOString())
        .single()
      setBoostAtivo(boost || null)
    }
    setCarregando(false)
  }

  const contratar = async () => {
    if (!prestador) return
    setContratando(true)

    const plano = planos.find(p => p.id === planoSelecionado)
    const dias = parseInt(planoSelecionado)
    const inicio = new Date()
    const expira = new Date(inicio.getTime() + dias * 24 * 60 * 60 * 1000)

    await supabase.from('boosts').insert({
      prestador_id: prestador.id,
      plano: planoSelecionado,
      valor: plano.valor,
      status: 'ativo',
      inicio_em: inicio.toISOString(),
      expira_em: expira.toISOString(),
      aparece_home: true,
      aparece_busca: true,
    })

    setContratando(false)
    setSucesso(true)
    carregarDados()
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#C9BFA8' }}>Carregando...</p>
    </div>
  )

  if (!prestador) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <p className="text-sm" style={{ color: '#7C9485' }}>Você precisa ter um perfil de prestador para impulsionar.</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="mt-4 px-6 py-3 text-white text-sm font-medium rounded-xl"
        style={{ background: '#1FA855' }}>Criar perfil</button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>🚀 Impulsionar perfil</h1>
      <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Apareça no topo das buscas e na home para mais clientes te encontrarem</p>

      {/* Boost ativo */}
      {boostAtivo && (
        <div className="p-4 rounded-2xl mb-5" style={{ background: '#E3F6E9', border: '1px solid #1FA855' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>Boost ativo!</p>
              <p className="text-xs" style={{ color: '#3A7A5C' }}>
                Expira em {new Date(boostAtivo.expira_em).toLocaleDateString('pt-BR')} ·{' '}
                {Math.ceil((new Date(boostAtivo.expira_em) - new Date()) / (1000 * 60 * 60 * 24))} dias restantes
              </p>
            </div>
          </div>
        </div>
      )}

      {sucesso && (
        <div className="p-4 rounded-2xl mb-5 text-center" style={{ background: '#E3F6E9' }}>
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>Boost ativado com sucesso!</p>
          <p className="text-xs mt-1" style={{ color: '#3A7A5C' }}>Seu perfil já está aparecendo em destaque.</p>
        </div>
      )}

      {/* Como funciona */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>Como o boost funciona</p>
        <div className="space-y-3">
          {[
            { emoji: '🔝', titulo: 'Topo das buscas', desc: 'Seu perfil aparece antes de todos na busca da sua categoria' },
            { emoji: '🏠', titulo: 'Banner na home', desc: 'Aparece no carrossel de destaque que todos os clientes veem ao entrar no app' },
            { emoji: '⭐', titulo: 'Badge de destaque', desc: 'Um badge especial no seu card mostra que você está impulsionado' },
          ].map(i => (
            <div key={i.titulo} className="flex items-start gap-3">
              <span style={{ fontSize: 20, flexShrink: 0 }}>{i.emoji}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{i.titulo}</p>
                <p className="text-xs" style={{ color: '#7C9485' }}>{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planos */}
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#7C9485' }}>Escolha o período</p>
      <div className="space-y-3 mb-5">
        {planos.map(p => (
          <label key={p.id}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors"
            style={planoSelecionado === p.id
              ? { border: '2px solid #1FA855', background: '#F0FAF4' }
              : { border: '0.5px solid #DDE3DD', background: '#fff' }
            }>
            <input type="radio" name="plano" value={p.id}
              checked={planoSelecionado === p.id}
              onChange={() => setPlanoSelecionado(p.id)}
              className="hidden" />
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: planoSelecionado === p.id ? '#1FA855' : '#DDE3DD' }}>
              {planoSelecionado === p.id && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1FA855' }}></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
                {p.destaque && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                    Mais popular
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#7C9485' }}>{p.desc}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.beneficios.map(b => (
                  <span key={b} className="text-xs" style={{ color: '#0F6E3D' }}>✓ {b}</span>
                ))}
              </div>
            </div>
            <p className="text-lg font-semibold flex-shrink-0" style={{ color: '#1FA855' }}>R${p.valor}</p>
          </label>
        ))}
      </div>

      <button onClick={contratar} disabled={contratando}
        className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
        style={{ background: '#1FA855' }}>
        {contratando ? 'Ativando...' : `🚀 Impulsionar por R$${planos.find(p => p.id === planoSelecionado)?.valor}`}
      </button>

      <p className="text-xs text-center mt-3" style={{ color: '#C9BFA8' }}>
        ⚠️ Pagamento via Pix integrado em breve. Por ora o boost é ativado diretamente.
      </p>
    </div>
  )
}

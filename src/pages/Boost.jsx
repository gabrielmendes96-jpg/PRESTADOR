import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, TrendingUp, Home, Star, Check, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Button from '../components/ui/Button'

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

  const contratar = () => {
    if (!prestador) return
    // O boost só é ativado depois que o Asaas confirma o pagamento
    // (ver webhook-asaas.js) — aqui só redireciona para a cobrança real.
    navigate(`/pagamento?tipo=boost&item=${planoSelecionado}`)
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#9CA3AF' }}>Carregando...</p>
    </div>
  )

  if (!prestador) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <p className="text-sm" style={{ color: '#6B7280' }}>Você precisa ter um perfil de prestador para impulsionar.</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="mt-4 px-6 py-3 text-white text-sm font-medium rounded-xl"
        style={{ background: '#16A34A' }}>Criar perfil</button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
        <Rocket size={19} color={colors.primary} /> Impulsionar perfil
      </h1>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Apareça no topo das buscas e na home para mais clientes te encontrarem</p>

      {/* Boost ativo */}
      {boostAtivo && (
        <div className="p-4 rounded-2xl mb-5" style={{ background: '#DCFCE7', border: '1px solid #16A34A' }}>
          <div className="flex items-center gap-3">
            <Rocket size={26} color={colors.primaryHover} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#14853D' }}>Boost ativo!</p>
              <p className="text-xs" style={{ color: '#14853D' }}>
                Expira em {new Date(boostAtivo.expira_em).toLocaleDateString('pt-BR')} ·{' '}
                {Math.ceil((new Date(boostAtivo.expira_em) - new Date()) / (1000 * 60 * 60 * 24))} dias restantes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Como funciona */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #E4E7E4' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Como o boost funciona</p>
        <div className="space-y-3">
          {[
            { icon: TrendingUp, titulo: 'Topo das buscas', desc: 'Seu perfil aparece antes de todos na busca da sua categoria' },
            { icon: Home, titulo: 'Banner na home', desc: 'Aparece no carrossel de destaque que todos os clientes veem ao entrar no app' },
            { icon: Star, titulo: 'Badge de destaque', desc: 'Um badge especial no seu card mostra que você está impulsionado' },
          ].map(i => (
            <div key={i.titulo} className="flex items-start gap-3">
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i.icon size={16} color={colors.primary} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{i.titulo}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planos */}
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>Escolha o período</p>
      <div className="space-y-3 mb-5">
        {planos.map(p => (
          <label key={p.id}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors"
            style={planoSelecionado === p.id
              ? { border: '2px solid #16A34A', background: '#F0FDF4' }
              : { border: '0.5px solid #E4E7E4', background: '#fff' }
            }>
            <input type="radio" name="plano" value={p.id}
              checked={planoSelecionado === p.id}
              onChange={() => setPlanoSelecionado(p.id)}
              className="hidden" />
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: planoSelecionado === p.id ? '#16A34A' : '#E4E7E4' }}>
              {planoSelecionado === p.id && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#16A34A' }}></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{p.nome}</p>
                {p.destaque && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92610A' }}>
                    Mais popular
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#6B7280' }}>{p.desc}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.beneficios.map(b => (
                  <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#14853D' }}>
                    <Check size={11} strokeWidth={3} /> {b}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-lg font-semibold flex-shrink-0" style={{ color: '#16A34A' }}>R${p.valor}</p>
          </label>
        ))}
      </div>

      <Button fullWidth icon={<Rocket size={16} />} onClick={contratar}>
        {`Impulsionar por R$${planos.find(p => p.id === planoSelecionado)?.valor}`}
      </Button>

      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, textAlign: 'center', marginTop: 12, color: '#9CA3AF' }}>
        <Info size={13} /> Você será redirecionado para o pagamento via Pix ou cartão.
      </p>
    </div>
  )
}

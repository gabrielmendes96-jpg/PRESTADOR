import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Medal, Crown, Trophy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const niveis = [
  {
    id: 'bronze', nome: 'Bronze', icon: Medal,
    cor: '#B45309', bg: '#FEF3C7',
    requisitos: { avaliacoes: 1, notaMin: 3.0, mesesAtivo: 0 },
    beneficios: ['Perfil visível na plataforma', 'Pode receber avaliações', 'Acesso ao chat'],
  },
  {
    id: 'prata', nome: 'Prata', icon: Medal,
    cor: '#64748B', bg: '#F1F5F9',
    requisitos: { avaliacoes: 10, notaMin: 4.0, mesesAtivo: 1 },
    beneficios: ['Tudo do Bronze', 'Badge Prata no perfil', 'Aparece antes dos Bronze nas buscas'],
  },
  {
    id: 'ouro', nome: 'Ouro', icon: Medal,
    cor: '#92610A', bg: '#FEF3C7',
    requisitos: { avaliacoes: 30, notaMin: 4.5, mesesAtivo: 3 },
    beneficios: ['Tudo do Prata', 'Badge Ouro no perfil', 'Destaque na aba Destaques', '10% desconto nos planos'],
  },
  {
    id: 'embaixador', nome: 'Embaixador', icon: Crown,
    cor: colors.primaryHover, bg: '#DCFCE7',
    requisitos: { avaliacoes: 100, notaMin: 4.8, mesesAtivo: 12 },
    beneficios: ['Tudo do Ouro', 'Badge Embaixador exclusivo', 'Prioridade máxima nas buscas', 'Suporte prioritário', '1 mês grátis a cada 6 meses'],
  },
]

function getNivelAtual(avaliacoes, nota, mesesAtivo) {
  let nivelAtual = niveis[0]
  for (const n of niveis) {
    if (avaliacoes >= n.requisitos.avaliacoes &&
        nota >= n.requisitos.notaMin &&
        mesesAtivo >= n.requisitos.mesesAtivo) {
      nivelAtual = n
    }
  }
  return nivelAtual
}

export default function Niveis() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [prestador, setPrestador] = useState(null)
  const [stats, setStats] = useState({ avaliacoes: 0, nota: 0, mesesAtivo: 0 })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarDados()
  }, [usuario])

  const carregarDados = async () => {
    const { data: p } = await supabase.from('prestadores').select('*').eq('user_id', usuario.id).single()
    if (!p) { setCarregando(false); return }
    setPrestador(p)

    const { count: totalAvaliacoes } = await supabase
      .from('avaliacoes').select('*', { count: 'exact', head: true }).eq('prestador_id', p.id)

    const { data: avals } = await supabase
      .from('avaliacoes').select('nota').eq('prestador_id', p.id)

    const nota = avals?.length
      ? avals.reduce((acc, a) => acc + a.nota, 0) / avals.length
      : 0

    const mesesAtivo = p.criado_em
      ? Math.floor((new Date() - new Date(p.criado_em)) / (1000 * 60 * 60 * 24 * 30))
      : 0

    setStats({ avaliacoes: totalAvaliacoes || 0, nota: parseFloat(nota.toFixed(1)), mesesAtivo })
    setCarregando(false)
  }

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#9CA3AF' }}>Carregando...</p>
  if (!prestador) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6B7280' }}>Você precisa ter um perfil de prestador.</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="mt-4 px-6 py-3 text-white text-sm font-medium rounded-xl"
        style={{ background: '#16A34A' }}>Criar perfil</button>
    </div>
  )

  const nivelAtual = getNivelAtual(stats.avaliacoes, stats.nota, stats.mesesAtivo)
  const nivelAtualIdx = niveis.findIndex(n => n.id === nivelAtual.id)
  const proximoNivel = niveis[nivelAtualIdx + 1]

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
        <Trophy size={20} color={colors.primary} /> Programa de Níveis
      </h1>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Evolua e ganhe benefícios exclusivos na plataforma</p>

      {/* Nível atual */}
      <div className="p-5 rounded-2xl mb-5 text-center"
        style={{ background: nivelAtual.bg, border: `2px solid ${nivelAtual.cor}` }}>
        <nivelAtual.icon size={48} color={nivelAtual.cor} strokeWidth={1.5} style={{ margin: '0 auto' }} />
        <p className="text-xl font-semibold mt-2" style={{ color: nivelAtual.cor }}>Nível {nivelAtual.nome}</p>
        <p className="text-sm mt-1" style={{ color: nivelAtual.cor, opacity: 0.8 }}>Seu nível atual na plataforma</p>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: nivelAtual.cor }}>{stats.avaliacoes}</p>
            <p className="text-xs" style={{ color: nivelAtual.cor, opacity: 0.7 }}>avaliações</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: nivelAtual.cor }}>{stats.nota || '—'}</p>
            <p className="text-xs" style={{ color: nivelAtual.cor, opacity: 0.7 }}>nota média</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: nivelAtual.cor }}>{stats.mesesAtivo}</p>
            <p className="text-xs" style={{ color: nivelAtual.cor, opacity: 0.7 }}>meses ativo</p>
          </div>
        </div>
      </div>

      {/* Próximo nível */}
      {proximoNivel && (
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
            Para alcançar o nível <proximoNivel.icon size={15} color={proximoNivel.cor} /> {proximoNivel.nome}:
          </p>
          <div className="space-y-3">
            {[
              { label: 'Avaliações', atual: stats.avaliacoes, meta: proximoNivel.requisitos.avaliacoes },
              { label: 'Nota mínima', atual: stats.nota, meta: proximoNivel.requisitos.notaMin },
              { label: 'Meses ativo', atual: stats.mesesAtivo, meta: proximoNivel.requisitos.mesesAtivo },
            ].map(req => {
              const pct = Math.min((req.atual / req.meta) * 100, 100)
              const ok = req.atual >= req.meta
              return (
                <div key={req.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: '#6B7280' }}>{req.label}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: ok ? colors.primaryHover : colors.text }}>
                      {ok && <Check size={12} strokeWidth={3} />}{req.atual} / {req.meta}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#E4E7E4' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: ok ? '#16A34A' : proximoNivel.cor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Todos os níveis */}
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>Todos os níveis</p>
      <div className="space-y-3">
        {niveis.map((n, i) => {
          const atingido = i <= nivelAtualIdx
          return (
            <div key={n.id} className="bg-white rounded-2xl p-4" style={{ border: `0.5px solid ${atingido ? n.cor : '#E4E7E4'}`, opacity: atingido ? 1 : 0.6 }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon size={20} color={n.cor} strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: n.cor }}>Nível {n.nome}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {n.requisitos.avaliacoes}+ aval. · nota ≥ {n.requisitos.notaMin} · {n.requisitos.mesesAtivo}+ meses
                  </p>
                </div>
                {atingido && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: n.bg, color: n.cor }}>
                    <Check size={11} strokeWidth={3} /> Conquistado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {n.beneficios.map(b => (
                  <span key={b} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F3F6F2', color: '#6B7280' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

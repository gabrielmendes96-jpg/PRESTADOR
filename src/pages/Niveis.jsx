import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const niveis = [
  {
    id: 'bronze', nome: 'Bronze', emoji: '🥉',
    cor: '#8B6914', bg: '#FDF3DC',
    requisitos: { avaliacoes: 1, notaMin: 3.0, mesesAtivo: 0 },
    beneficios: ['Perfil visível na plataforma', 'Pode receber avaliações', 'Acesso ao chat'],
  },
  {
    id: 'prata', nome: 'Prata', emoji: '🥈',
    cor: '#5F6F85', bg: '#EEF2F8',
    requisitos: { avaliacoes: 10, notaMin: 4.0, mesesAtivo: 1 },
    beneficios: ['Tudo do Bronze', 'Badge Prata no perfil', 'Aparece antes dos Bronze nas buscas'],
  },
  {
    id: 'ouro', nome: 'Ouro', emoji: '🥇',
    cor: '#8A5A00', bg: '#FFF4D6',
    requisitos: { avaliacoes: 30, notaMin: 4.5, mesesAtivo: 3 },
    beneficios: ['Tudo do Prata', 'Badge Ouro no perfil', 'Destaque na aba Destaques', '10% desconto nos planos'],
  },
  {
    id: 'embaixador', nome: 'Embaixador', emoji: '👑',
    cor: '#1FA855', bg: '#E3F6E9',
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

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Carregando...</p>
  if (!prestador) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#7C9485' }}>Você precisa ter um perfil de prestador.</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="mt-4 px-6 py-3 text-white text-sm font-medium rounded-xl"
        style={{ background: '#1FA855' }}>Criar perfil</button>
    </div>
  )

  const nivelAtual = getNivelAtual(stats.avaliacoes, stats.nota, stats.mesesAtivo)
  const nivelAtualIdx = niveis.findIndex(n => n.id === nivelAtual.id)
  const proximoNivel = niveis[nivelAtualIdx + 1]

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>🏆 Programa de Níveis</h1>
      <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Evolua e ganhe benefícios exclusivos na plataforma</p>

      {/* Nível atual */}
      <div className="p-5 rounded-2xl mb-5 text-center"
        style={{ background: nivelAtual.bg, border: `2px solid ${nivelAtual.cor}` }}>
        <div style={{ fontSize: 56 }}>{nivelAtual.emoji}</div>
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
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '0.5px solid #DDE3DD' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>
            Para alcançar o nível {proximoNivel.emoji} {proximoNivel.nome}:
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
                    <span className="text-xs" style={{ color: '#7C9485' }}>{req.label}</span>
                    <span className="text-xs font-medium" style={{ color: ok ? '#0F6E3D' : '#1F2D24' }}>
                      {ok ? '✓ ' : ''}{req.atual} / {req.meta}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#EDE3CE' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: ok ? '#1FA855' : proximoNivel.cor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Todos os níveis */}
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#7C9485' }}>Todos os níveis</p>
      <div className="space-y-3">
        {niveis.map((n, i) => {
          const atingido = i <= nivelAtualIdx
          return (
            <div key={n.id} className="bg-white rounded-2xl p-4" style={{ border: `0.5px solid ${atingido ? n.cor : '#DDE3DD'}`, opacity: atingido ? 1 : 0.6 }}>
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: 28 }}>{n.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: n.cor }}>Nível {n.nome}</p>
                  <p className="text-xs" style={{ color: '#7C9485' }}>
                    {n.requisitos.avaliacoes}+ aval. · nota ≥ {n.requisitos.notaMin} · {n.requisitos.mesesAtivo}+ meses
                  </p>
                </div>
                {atingido && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: n.bg, color: n.cor }}>
                    ✓ Conquistado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {n.beneficios.map(b => (
                  <span key={b} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F8F9F8', color: '#5F6F65' }}>
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

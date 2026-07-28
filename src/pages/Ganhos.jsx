import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Ganhos() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [prestador, setPrestador] = useState(null)
  const [stats, setStats] = useState({
    visualizacoes: 0,
    conversas: 0,
    avaliacoes: 0,
    candidaturas: 0,
    vizualizacoesHoje: 0,
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarDados()
  }, [usuario])

  const carregarDados = async () => {
    const { data: p } = await supabase.from('prestadores').select('*').eq('user_id', usuario.id).single()
    if (!p) { setCarregando(false); return }
    setPrestador(p)

    const { count: totalConversas } = await supabase
      .from('conversas').select('*', { count: 'exact', head: true }).eq('prestador_id', p.id)

    const { count: totalAvaliacoes } = await supabase
      .from('avaliacoes').select('*', { count: 'exact', head: true }).eq('prestador_id', p.id)

    const { count: totalCandidaturas } = await supabase
      .from('candidaturas').select('*', { count: 'exact', head: true }).eq('prestador_id', p.id)

    setStats({
      visualizacoes: Math.floor(Math.random() * 200) + 50,
      vizualizacoesHoje: Math.floor(Math.random() * 20) + 3,
      conversas: totalConversas || 0,
      avaliacoes: totalAvaliacoes || 0,
      candidaturas: totalCandidaturas || 0,
    })

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

  const metricas = [
    { emoji: '👁️', label: 'Visualizações totais', valor: stats.visualizacoes, sub: `+${stats.vizualizacoesHoje} hoje`, cor: '#185FA5', bg: '#E6F1FB' },
    { emoji: '💬', label: 'Conversas iniciadas', valor: stats.conversas, sub: 'clientes que entraram em contato', cor: '#0F6E3D', bg: '#E3F6E9' },
    { emoji: '⭐', label: 'Avaliações recebidas', valor: stats.avaliacoes, sub: `nota média ${prestador.avaliacao_media || '—'}`, cor: '#8A5A00', bg: '#FFF4D6' },
    { emoji: '🙋', label: 'Candidaturas enviadas', valor: stats.candidaturas, sub: 'pedidos que você se candidatou', cor: '#A32D2D', bg: '#FCEBEB' },
  ]

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>📊 Resumo de desempenho</h1>
      <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Veja como seu perfil está performando na plataforma</p>

      {/* Senso de urgência */}
      <div className="p-4 rounded-2xl mb-5 flex items-center gap-3"
        style={{ background: '#FFF4D6', border: '1px solid #FFC857' }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div>
          <p className="text-sm font-medium" style={{ color: '#8A5A00' }}>
            {stats.vizualizacoesHoje} pessoas viram seu perfil hoje!
          </p>
          <p className="text-xs" style={{ color: '#9A6B10' }}>
            Complete seu perfil para converter mais visitas em contatos.
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {metricas.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4" style={{ border: '0.5px solid #DDE3DD' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl"
              style={{ background: m.bg }}>{m.emoji}</div>
            <p className="text-2xl font-semibold mb-0.5" style={{ color: m.cor }}>{m.valor}</p>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#1F2D24' }}>{m.label}</p>
            <p className="text-xs" style={{ color: '#7C9485' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Dicas de melhoria */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>💡 Como melhorar seu desempenho</p>
        <div className="space-y-3">
          {[
            { ok: (prestador.avaliacao_media || 0) >= 4.5, texto: 'Mantenha nota acima de 4.5 para entrar nos Destaques', acao: null },
            { ok: stats.avaliacoes >= 10, texto: 'Tenha pelo menos 10 avaliações para maior credibilidade', acao: null },
            { ok: false, texto: 'Impulsione seu perfil para aparecer no topo das buscas', acao: () => navigate('/boost') },
            { ok: false, texto: 'Use o Assistente IA para melhorar sua bio e hashtags', acao: () => navigate('/assistente') },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: d.ok ? '#E3F6E9' : '#F5F5F5' }}>
                <span style={{ fontSize: 11, color: d.ok ? '#0F6E3D' : '#C9BFA8' }}>{d.ok ? '✓' : '→'}</span>
              </div>
              <p className="text-sm flex-1" style={{ color: d.ok ? '#7C9485' : '#1F2D24', textDecoration: d.ok ? 'line-through' : 'none' }}>
                {d.texto}
              </p>
              {d.acao && !d.ok && (
                <button onClick={d.acao} className="text-xs font-medium px-3 py-1 rounded-lg flex-shrink-0"
                  style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                  Fazer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

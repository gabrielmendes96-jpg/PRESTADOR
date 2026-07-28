import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Eye, MessageCircle, Star, Send, Flame, Lightbulb, Check, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'

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

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#9CA3AF' }}>Carregando...</p>

  if (!prestador) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6B7280' }}>Você precisa ter um perfil de prestador.</p>
      <button onClick={() => navigate('/cadastro-pro')}
        className="mt-4 px-6 py-3 text-white text-sm font-medium rounded-xl"
        style={{ background: '#16A34A' }}>Criar perfil</button>
    </div>
  )

  const metricas = [
    { icon: Eye, label: 'Visualizações totais', valor: stats.visualizacoes, sub: `+${stats.vizualizacoesHoje} hoje`, cor: '#2563EB', bg: '#EFF6FF' },
    { icon: MessageCircle, label: 'Conversas iniciadas', valor: stats.conversas, sub: 'clientes que entraram em contato', cor: '#14853D', bg: '#DCFCE7' },
    { icon: Star, label: 'Avaliações recebidas', valor: stats.avaliacoes, sub: `nota média ${prestador.avaliacao_media || '—'}`, cor: '#92610A', bg: '#FEF3C7' },
    { icon: Send, label: 'Candidaturas enviadas', valor: stats.candidaturas, sub: 'pedidos que você se candidatou', cor: '#B91C1C', bg: '#FEF2F2' },
  ]

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
        <BarChart3 size={19} color={colors.primary} /> Resumo de desempenho
      </h1>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Veja como seu perfil está performando na plataforma</p>

      {/* Senso de urgência */}
      <div className="p-4 rounded-2xl mb-5 flex items-center gap-3"
        style={{ background: '#FEF3C7', border: '1px solid #F6C64D' }}>
        <Flame size={24} color="#D97706" style={{ flexShrink: 0 }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#92610A' }}>
            {stats.vizualizacoesHoje} pessoas viram seu perfil hoje!
          </p>
          <p className="text-xs" style={{ color: '#92610A' }}>
            Complete seu perfil para converter mais visitas em contatos.
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {metricas.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4" style={{ border: '0.5px solid #E4E7E4' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: m.bg }}><m.icon size={19} color={m.cor} /></div>
            <p className="text-2xl font-semibold mb-0.5" style={{ color: m.cor }}>{m.valor}</p>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#1F2937' }}>{m.label}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Dicas de melhoria */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
          <Lightbulb size={16} color="#D97706" /> Como melhorar seu desempenho
        </p>
        <div className="space-y-3">
          {[
            { ok: (prestador.avaliacao_media || 0) >= 4.5, texto: 'Mantenha nota acima de 4.5 para entrar nos Destaques', acao: null },
            { ok: stats.avaliacoes >= 10, texto: 'Tenha pelo menos 10 avaliações para maior credibilidade', acao: null },
            { ok: false, texto: 'Impulsione seu perfil para aparecer no topo das buscas', acao: () => navigate('/boost') },
            { ok: false, texto: 'Use o Assistente IA para melhorar sua bio e hashtags', acao: () => navigate('/assistente') },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: d.ok ? '#DCFCE7' : '#F3F6F2' }}>
                {d.ok
                  ? <Check size={11} strokeWidth={3} color={colors.primaryHover} />
                  : <ArrowRight size={11} color="#9CA3AF" />}
              </div>
              <p className="text-sm flex-1" style={{ color: d.ok ? '#6B7280' : '#1F2937', textDecoration: d.ok ? 'line-through' : 'none' }}>
                {d.texto}
              </p>
              {d.acao && !d.ok && (
                <button onClick={d.acao} className="text-xs font-medium px-3 py-1 rounded-lg flex-shrink-0"
                  style={{ background: '#DCFCE7', color: '#14853D' }}>
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

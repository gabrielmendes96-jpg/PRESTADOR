import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const ADMIN_EMAIL = 'gabrielmendes96@gmail.com'

export default function Admin() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [prestadores, setPrestadores] = useState([])
  const [zonasPendentes, setZonasPendentes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [authCarregando, setAuthCarregando] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthCarregando(false)
      if (!usuario) { navigate('/login'); return }
      if (usuario.email !== ADMIN_EMAIL) { navigate('/'); return }
      carregarDados()
    }, 500)
    return () => clearTimeout(timer)
  }, [usuario])

  if (authCarregando) return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Verificando acesso...</p>

  const carregarDados = async () => {
    setCarregando(true)

    const [
      { count: totalPrestadores },
      { count: totalClientes },
      { count: totalPedidos },
      { count: totalConversas },
      { count: totalAvaliacoes },
      { data: prests },
      { data: zonas },
      { data: peds },
      { data: avals },
    ] = await Promise.all([
      supabase.from('prestadores').select('*', { count: 'exact', head: true }),
      supabase.from('conversas').select('*', { count: 'exact', head: true }),
      supabase.from('pedidos_servico').select('*', { count: 'exact', head: true }),
      supabase.from('conversas').select('*', { count: 'exact', head: true }),
      supabase.from('avaliacoes').select('*', { count: 'exact', head: true }),
      supabase.from('prestadores').select('*').order('criado_em', { ascending: false }),
      supabase.from('zonas_quentes').select('*').eq('status', 'pendente'),
      supabase.from('pedidos_servico').select('*, categorias(nome, emoji)').order('criado_em', { ascending: false }),
      supabase.from('avaliacoes').select('*, prestadores(nome)').order('criado_em', { ascending: false }),
    ])

    setStats({ totalPrestadores, totalClientes, totalPedidos, totalConversas, totalAvaliacoes })
    setPrestadores(prests || [])
    setZonasPendentes(zonas || [])
    setPedidos(peds || [])
    setAvaliacoes(avals || [])
    setCarregando(false)
  }

  const aprovarZona = async (id) => {
    await supabase.from('zonas_quentes').update({ status: 'ativo' }).eq('id', id)
    setZonasPendentes(prev => prev.filter(z => z.id !== id))
  }

  const rejeitarZona = async (id) => {
    await supabase.from('zonas_quentes').update({ status: 'encerrado' }).eq('id', id)
    setZonasPendentes(prev => prev.filter(z => z.id !== id))
  }

  const ativarPrestador = async (id) => {
    await supabase.from('prestadores').update({ plano_status: 'ativo' }).eq('id', id)
    carregarDados()
  }

  const menuAbas = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'prestadores', label: '👷 Prestadores' },
    { id: 'pedidos', label: '📋 Pedidos' },
    { id: 'avaliacoes', label: '⭐ Avaliações' },
    { id: 'zonas', label: '🔥 Zonas pendentes' },
  ]

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Carregando painel admin...</p>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>⚙️ Painel Admin</h1>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
          {usuario.email}
        </span>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {menuAbas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
            style={aba === a.id
              ? { background: '#1FA855', color: '#fff' }
              : { background: '#fff', color: '#7C9485', border: '0.5px solid #DDE3DD' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {aba === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Prestadores', valor: stats.totalPrestadores, emoji: '👷', cor: '#1FA855' },
              { label: 'Pedidos', valor: stats.totalPedidos, emoji: '📋', cor: '#185FA5' },
              { label: 'Conversas', valor: stats.totalConversas, emoji: '💬', cor: '#8A5A00' },
              { label: 'Avaliações', valor: stats.totalAvaliacoes, emoji: '⭐', cor: '#FFC857' },
              { label: 'Zonas pendentes', valor: zonasPendentes.length, emoji: '🔥', cor: '#A32D2D' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <div style={{ fontSize: 28 }}>{s.emoji}</div>
                <p className="text-2xl font-semibold mt-1" style={{ color: s.cor }}>{s.valor || 0}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7C9485' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #DDE3DD' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>🛠️ Ferramentas admin</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ver todos os prestadores', acao: () => setAba('prestadores') },
                { label: 'Aprovar zonas quentes', acao: () => setAba('zonas') },
                { label: 'Ver pedidos abertos', acao: () => navigate('/pedidos') },
                { label: 'Ver conversas', acao: () => navigate('/mensagens') },
              ].map(a => (
                <button key={a.label} onClick={a.acao}
                  className="p-3 text-sm rounded-xl text-left hover:opacity-80"
                  style={{ background: '#F0F2F0', color: '#1F2D24' }}>
                  {a.label} →
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '0.5px solid #DDE3DD' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#7C9485' }}>AÇÕES DO SISTEMA</p>
              <button onClick={async () => {
                const r = await fetch('/api/geocodificar', { method: 'POST' })
                const d = await r.json()
                alert(`Geocodificação: ${d.sucesso} sucesso, ${d.falha} falhas`)
              }}
                className="w-full py-2.5 text-sm rounded-xl hover:opacity-80 text-left px-4"
                style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                📍 Geocodificar prestadores sem coordenadas
              </button>
              <button onClick={async () => {
                const r = await fetch('/api/verificar-inadimplencia', {
                  method: 'POST',
                  headers: { 'x-cron-token': 'prestador-webhook-2026' }
                })
                const d = await r.json()
                alert(`Inadimplência: ${d.suspensos} suspensos, ${d.reativados} reativados`)
              }}
                className="w-full py-2.5 text-sm rounded-xl hover:opacity-80 text-left px-4"
                style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                ⚠️ Verificar assinaturas vencidas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESTADORES */}
      {aba === 'prestadores' && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#7C9485' }}>
            {stats.totalPrestadores} prestadores cadastrados
          </p>
          <div className="flex flex-col gap-3">
            {prestadores.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                  style={{ background: '#1FA855' }}>
                  {p.nome?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
                  <p className="text-xs capitalize" style={{ color: '#7C9485' }}>
                    {p.categoria_id} · {p.cidade}, {p.estado} · {p.plano_id}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#C9BFA8' }}>
                    {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs px-2 py-0.5 rounded-full text-center"
                    style={p.plano_status === 'ativo'
                      ? { background: '#E3F6E9', color: '#0F6E3D' }
                      : { background: '#FFF4D6', color: '#8A5A00' }}>
                    {p.plano_status || 'inativo'}
                  </span>
                  {p.plano_status !== 'ativo' && (
                    <button onClick={() => ativarPrestador(p.id)}
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#1FA855' }}>
                      Ativar
                    </button>
                  )}
                  <button onClick={() => navigate(`/profissional/${p.id}`)}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#F0F2F0', color: '#7C9485' }}>
                    Ver perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PEDIDOS */}
      {aba === 'pedidos' && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#7C9485' }}>{pedidos.length} pedidos cadastrados</p>
          <div className="flex flex-col gap-3">
            {pedidos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <span style={{ fontSize: 28 }}>{p.categorias?.emoji || '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1F2D24' }}>{p.titulo}</p>
                  <p className="text-xs" style={{ color: '#7C9485' }}>
                    {p.cidade}, {p.estado} · {p.cliente_nome}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#C9BFA8' }}>
                    {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={p.status === 'aberto'
                    ? { background: '#E3F6E9', color: '#0F6E3D' }
                    : { background: '#F0F2F0', color: '#7C9485' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVALIAÇÕES */}
      {aba === 'avaliacoes' && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#7C9485' }}>{avaliacoes.length} avaliações cadastradas</p>
          <div className="flex flex-col gap-3">
            {avaliacoes.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4"
                style={{ border: '0.5px solid #DDE3DD' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{a.autor_nome}</p>
                    <p className="text-xs" style={{ color: '#7C9485' }}>para {a.prestadores?.nome}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span style={{ color: '#FFC857', fontSize: 13 }}>{'★'.repeat(a.nota)}</span>
                    <span className="text-xs font-medium" style={{ color: '#1F2D24' }}>{a.nota}</span>
                  </div>
                </div>
                {a.comentario && (
                  <p className="text-xs" style={{ color: '#5F6F65' }}>{a.comentario}</p>
                )}
                <p className="text-xs mt-2" style={{ color: '#C9BFA8' }}>
                  {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZONAS PENDENTES */}
      {aba === 'zonas' && (
        <div>
          {zonasPendentes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '0.5px solid #DDE3DD' }}>
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm" style={{ color: '#7C9485' }}>Nenhuma zona pendente de aprovação!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {zonasPendentes.map(z => (
                <div key={z.id} className="bg-white rounded-2xl p-5"
                  style={{ border: '0.5px solid #FFC857' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{z.nome}</p>
                      <p className="text-xs capitalize" style={{ color: '#7C9485' }}>
                        {z.tipo} · {z.cidade}, {z.estado}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                      Pendente
                    </span>
                  </div>
                  {z.descricao && <p className="text-xs mb-3" style={{ color: '#5F6F65' }}>{z.descricao}</p>}
                  {z.endereco && <p className="text-xs mb-3" style={{ color: '#7C9485' }}>📍 {z.endereco}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => rejeitarZona(z.id)}
                      className="flex-1 py-2 text-sm rounded-xl"
                      style={{ border: '0.5px solid #DDE3DD', color: '#7C9485' }}>
                      Rejeitar
                    </button>
                    <button onClick={() => aprovarZona(z.id)}
                      className="flex-1 py-2 text-white text-sm font-medium rounded-xl"
                      style={{ background: '#1FA855' }}>
                      ✓ Aprovar e publicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, HardHat, ClipboardList, Star, Flame, Wrench, Settings,
  MapPin, TriangleAlert, CheckCircle2, Check, MessageCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Avatar from '../components/ui/Avatar'

const ADMIN_EMAIL = 'gabrielmendes96@gmail.com'

export default function Admin() {
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [prestadores, setPrestadores] = useState([])
  const [zonasPendentes, setZonasPendentes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (authCarregando) return
    if (!usuario) { navigate('/login'); return }
    if (usuario.email !== ADMIN_EMAIL) { navigate('/'); return }
    carregarDados()
  }, [usuario, authCarregando])

  if (authCarregando) return <p className="text-center py-16 text-sm" style={{ color: '#9CA3AF' }}>Verificando acesso...</p>

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prestadores', label: 'Prestadores', icon: HardHat },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star },
    { id: 'zonas', label: 'Zonas pendentes', icon: Flame },
  ]

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#9CA3AF' }}>Carregando painel admin...</p>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text }}>
          <Settings size={19} color={colors.primary} /> Painel Admin
        </h1>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#DCFCE7', color: '#14853D' }}>
          {usuario.email}
        </span>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {menuAbas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
            style={aba === a.id
              ? { background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }
              : { background: '#fff', color: '#6B7280', border: '0.5px solid #E4E7E4', display: 'flex', alignItems: 'center', gap: 6 }}>
            <a.icon size={15} /> {a.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {aba === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Prestadores', valor: stats.totalPrestadores, icon: HardHat, cor: '#16A34A' },
              { label: 'Pedidos', valor: stats.totalPedidos, icon: ClipboardList, cor: '#2563EB' },
              { label: 'Conversas', valor: stats.totalConversas, icon: MessageCircle, cor: '#92610A' },
              { label: 'Avaliações', valor: stats.totalAvaliacoes, icon: Star, cor: '#D97706' },
              { label: 'Zonas pendentes', valor: zonasPendentes.length, icon: Flame, cor: '#B91C1C' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
                style={{ border: '0.5px solid #E4E7E4' }}>
                <s.icon size={24} color={s.cor} style={{ margin: '0 auto 4px' }} />
                <p className="text-2xl font-semibold mt-1" style={{ color: s.cor }}>{s.valor || 0}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
              <Wrench size={15} color={colors.primary} /> Ferramentas admin
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ver todos os prestadores', acao: () => setAba('prestadores') },
                { label: 'Aprovar zonas quentes', acao: () => setAba('zonas') },
                { label: 'Ver pedidos abertos', acao: () => navigate('/pedidos') },
                { label: 'Ver conversas', acao: () => navigate('/mensagens') },
              ].map(a => (
                <button key={a.label} onClick={a.acao}
                  className="p-3 text-sm rounded-xl text-left hover:opacity-80"
                  style={{ background: '#F3F6F2', color: '#1F2937' }}>
                  {a.label} →
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '0.5px solid #E4E7E4' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>AÇÕES DO SISTEMA</p>
              <button onClick={async () => {
                const r = await fetch('/api/geocodificar', { method: 'POST' })
                const d = await r.json()
                alert(`Geocodificação: ${d.sucesso} sucesso, ${d.falha} falhas`)
              }}
                className="w-full py-2.5 text-sm rounded-xl hover:opacity-80 text-left px-4 flex items-center gap-2"
                style={{ background: '#DCFCE7', color: '#14853D' }}>
                <MapPin size={15} /> Geocodificar prestadores sem coordenadas
              </button>
              <button onClick={async () => {
                const r = await fetch('/api/verificar-inadimplencia', {
                  method: 'POST',
                  headers: { 'x-cron-token': 'prestador-webhook-2026' }
                })
                const d = await r.json()
                alert(`Inadimplência: ${d.suspensos} suspensos, ${d.reativados} reativados`)
              }}
                className="w-full py-2.5 text-sm rounded-xl hover:opacity-80 text-left px-4 flex items-center gap-2"
                style={{ background: '#FEF3C7', color: '#92610A' }}>
                <TriangleAlert size={15} /> Verificar assinaturas vencidas
              </button>
              <button onClick={async () => {
                const r = await fetch('/api/verificar-tempo-resposta', {
                  method: 'POST',
                  headers: { 'x-cron-token': 'prestador-webhook-2026' }
                })
                const d = await r.json()
                alert(`Tempo de resposta: ${d.verificadas} verificadas, ${d.penalizados} penalizados`)
              }}
                className="w-full py-2.5 text-sm rounded-xl hover:opacity-80 text-left px-4 flex items-center gap-2"
                style={{ background: '#E0E7FF', color: '#3730A3' }}>
                <MessageCircle size={15} /> Verificar tempo de resposta dos prestadores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESTADORES */}
      {aba === 'prestadores' && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            {stats.totalPrestadores} prestadores cadastrados
          </p>
          <div className="flex flex-col gap-3">
            {prestadores.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                style={{ border: '0.5px solid #E4E7E4' }}>
                <Avatar nome={p.nome} foto={p.foto_perfil} size={40} style={{ fontSize: 14 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{p.nome}</p>
                  <p className="text-xs capitalize" style={{ color: '#6B7280' }}>
                    {p.categoria_id} · {p.cidade}, {p.estado} · {p.plano_id}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs px-2 py-0.5 rounded-full text-center"
                    style={p.plano_status === 'ativo'
                      ? { background: '#DCFCE7', color: '#14853D' }
                      : { background: '#FEF3C7', color: '#92610A' }}>
                    {p.plano_status || 'inativo'}
                  </span>
                  {p.plano_status !== 'ativo' && (
                    <button onClick={() => ativarPrestador(p.id)}
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#16A34A' }}>
                      Ativar
                    </button>
                  )}
                  <button onClick={() => navigate(`/profissional/${p.id}`)}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#F3F6F2', color: '#6B7280' }}>
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
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{pedidos.length} pedidos cadastrados</p>
          <div className="flex flex-col gap-3">
            {pedidos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                style={{ border: '0.5px solid #E4E7E4' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench size={18} color="#14853D" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1F2937' }}>{p.titulo}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {p.cidade}, {p.estado} · {p.cliente_nome}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={p.status === 'aberto'
                    ? { background: '#DCFCE7', color: '#14853D' }
                    : { background: '#F3F6F2', color: '#6B7280' }}>
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
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{avaliacoes.length} avaliações cadastradas</p>
          <div className="flex flex-col gap-3">
            {avaliacoes.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4"
                style={{ border: '0.5px solid #E4E7E4' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{a.autor_nome}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>para {a.prestadores?.nome}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="#F6C64D" color="#F6C64D" strokeWidth={0} />
                    <span className="text-xs font-medium" style={{ color: '#1F2937' }}>{a.nota}</span>
                  </div>
                </div>
                {a.comentario && (
                  <p className="text-xs" style={{ color: '#6B7280' }}>{a.comentario}</p>
                )}
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
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
            <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '0.5px solid #E4E7E4' }}>
              <CheckCircle2 size={40} color={colors.primary} style={{ margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Nenhuma zona pendente de aprovação!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {zonasPendentes.map(z => (
                <div key={z.id} className="bg-white rounded-2xl p-5"
                  style={{ border: '0.5px solid #F6C64D' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{z.nome}</p>
                      <p className="text-xs capitalize" style={{ color: '#6B7280' }}>
                        {z.tipo} · {z.cidade}, {z.estado}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92610A' }}>
                      Pendente
                    </span>
                  </div>
                  {z.descricao && <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{z.descricao}</p>}
                  {z.endereco && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginBottom: 12, color: '#6B7280' }}>
                      <MapPin size={12} /> {z.endereco}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => rejeitarZona(z.id)}
                      className="flex-1 py-2 text-sm rounded-xl"
                      style={{ border: '0.5px solid #E4E7E4', color: '#6B7280' }}>
                      Rejeitar
                    </button>
                    <button onClick={() => aprovarZona(z.id)}
                      className="flex-1 py-2 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                      style={{ background: '#16A34A' }}>
                      <Check size={14} strokeWidth={3} /> Aprovar e publicar
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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, MessageCircle, Send, Star, CreditCard, ClipboardList, Flame } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import { buscarNaoLidas, marcarLida, registrarPush } from '../lib/notificacoes'

export default function CentralNotificacoes() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [notificacoes, setNotificacoes] = useState([])
  const [pushAtivo, setPushAtivo] = useState(false)

  useEffect(() => {
    if (!usuario) return
    carregarNotificacoes()
    verificarPush()

    // Realtime — nova notificação
    const channel = supabase.channel('notificacoes_user')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notificacoes',
        filter: `user_id=eq.${usuario.id}`
      }, (payload) => {
        setNotificacoes(prev => [payload.new, ...prev])
        // Mostrar notificação nativa se app aberto
        if (Notification.permission === 'granted') {
          new Notification(payload.new.titulo, {
            body: payload.new.corpo,
            icon: '/icons/icon-192.png',
          })
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [usuario])

  const carregarNotificacoes = async () => {
    const data = await buscarNaoLidas(usuario.id)
    setNotificacoes(data)
  }

  const verificarPush = () => {
    setPushAtivo(Notification.permission === 'granted')
  }

  const ativarPush = async () => {
    const sub = await registrarPush(usuario.id)
    if (sub) setPushAtivo(true)
  }

  const clicarNotificacao = async (n) => {
    await marcarLida(n.id)
    setNotificacoes(prev => prev.filter(x => x.id !== n.id))
    setAberto(false)
    if (n.url) navigate(n.url)
  }

  const marcarTodasLidas = async () => {
    for (const n of notificacoes) await marcarLida(n.id)
    setNotificacoes([])
  }

  const iconeTipo = (tipo) => {
    const icons = {
      mensagem: MessageCircle, candidatura: Send,
      avaliacao: Star, pagamento: CreditCard,
      pedido: ClipboardList, zona: Flame, default: Bell,
    }
    return icons[tipo] || icons.default
  }

  const tempoRelativo = (data) => {
    const diff = Date.now() - new Date(data).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  if (!usuario) return null

  return (
    <div className="relative">
      <button onClick={() => setAberto(!aberto)}
        className="relative flex items-center w-9 h-9 rounded-lg justify-center hover:opacity-80"
        style={{ color: '#6B7280' }}>
        <Bell size={20} />
        {notificacoes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-medium"
            style={{ background: colors.secondary, color: '#92610A', fontSize: 10 }}>
            {notificacoes.length > 9 ? '9+' : notificacoes.length}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl z-50 overflow-hidden"
            style={{ border: `0.5px solid ${colors.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>

            <div className="flex items-center justify-between p-4" style={{ borderBottom: `0.5px solid ${colors.border}` }}>
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                Notificações {notificacoes.length > 0 && `(${notificacoes.length})`}
              </p>
              {notificacoes.length > 0 && (
                <button onClick={marcarTodasLidas} className="text-xs hover:underline" style={{ color: colors.primary }}>
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {!pushAtivo && (
              <div className="p-3 m-3 rounded-xl" style={{ background: '#F0FDF4', border: `0.5px solid ${colors.primary}` }}>
                <p className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: colors.primaryHover }}>
                  <Bell size={13} /> Ative as notificações
                </p>
                <p className="text-xs mb-2" style={{ color: colors.textSub }}>Receba avisos de novas mensagens e pedidos mesmo com o app fechado.</p>
                <button onClick={ativarPush}
                  className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                  style={{ background: colors.primary }}>
                  Ativar notificações
                </button>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="text-center py-10">
                  <BellOff size={28} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: colors.textSub }}>Nenhuma notificação</p>
                </div>
              ) : (
                notificacoes.map(n => {
                  const Icon = iconeTipo(n.tipo)
                  return (
                    <button key={n.id} onClick={() => clicarNotificacao(n)}
                      className="w-full flex items-start gap-3 p-4 hover:opacity-80 text-left"
                      style={{ borderBottom: `0.5px solid ${colors.bg}` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#DCFCE7' }}>
                        <Icon size={16} color={colors.primaryHover} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: colors.text }}>{n.titulo}</p>
                        <p className="text-xs mt-0.5" style={{ color: colors.textSub }}>{n.corpo}</p>
                      </div>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#9CA3AF' }}>
                        {tempoRelativo(n.criado_em)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

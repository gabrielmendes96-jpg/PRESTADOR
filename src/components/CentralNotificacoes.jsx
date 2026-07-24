import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
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
      mensagem: 'ti-message', candidatura: 'ti-hand-finger',
      avaliacao: 'ti-star', pagamento: 'ti-credit-card',
      pedido: 'ti-clipboard-list', zona: 'ti-flame', default: 'ti-bell'
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
        className="relative hidden sm:flex items-center w-9 h-9 rounded-lg justify-center hover:opacity-80"
        style={{ color: 'rgba(255,255,255,0.9)' }}>
        <i className="ti ti-bell" style={{ fontSize: 22 }} aria-hidden="true"></i>
        {notificacoes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-medium"
            style={{ background: '#FFC857', color: '#5C4400', fontSize: 10 }}>
            {notificacoes.length > 9 ? '9+' : notificacoes.length}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl z-50 overflow-hidden"
            style={{ border: '0.5px solid #DDE3DD', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>

            <div className="flex items-center justify-between p-4" style={{ borderBottom: '0.5px solid #DDE3DD' }}>
              <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>
                Notificações {notificacoes.length > 0 && `(${notificacoes.length})`}
              </p>
              {notificacoes.length > 0 && (
                <button onClick={marcarTodasLidas} className="text-xs hover:underline" style={{ color: '#1FA855' }}>
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {!pushAtivo && (
              <div className="p-3 m-3 rounded-xl" style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#0F6E3D' }}>🔔 Ative as notificações</p>
                <p className="text-xs mb-2" style={{ color: '#3A7A5C' }}>Receba avisos de novas mensagens e pedidos mesmo com o app fechado.</p>
                <button onClick={ativarPush}
                  className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                  style={{ background: '#1FA855' }}>
                  Ativar notificações
                </button>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="text-center py-10">
                  <i className="ti ti-bell-off" style={{ fontSize: 32, color: '#C9BFA8', display: 'block', marginBottom: 8 }} aria-hidden="true"></i>
                  <p className="text-sm" style={{ color: '#C9BFA8' }}>Nenhuma notificação</p>
                </div>
              ) : (
                notificacoes.map(n => (
                  <button key={n.id} onClick={() => clicarNotificacao(n)}
                    className="w-full flex items-start gap-3 p-4 hover:opacity-80 text-left"
                    style={{ borderBottom: '0.5px solid #F0F2F0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#E3F6E9' }}>
                      <i className={`ti ${iconeTipo(n.tipo)}`} style={{ fontSize: 16, color: '#0F6E3D' }} aria-hidden="true"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{n.titulo}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#7C9485' }}>{n.corpo}</p>
                    </div>
                    <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#C9BFA8' }}>
                      {tempoRelativo(n.criado_em)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

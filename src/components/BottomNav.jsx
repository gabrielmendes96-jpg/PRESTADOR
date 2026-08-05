import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, ClipboardList, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useMensagensNaoLidas } from '../lib/hooks'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuth()
  const naoLidas = useMensagensNaoLidas(usuario)

  const itens = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/busca', icon: Search, label: 'Buscar' },
    { path: '/pedidos', icon: ClipboardList, label: 'Pedidos' },
    { path: '/mensagens', icon: MessageCircle, label: 'Chat', badge: naoLidas },
    { path: usuario ? '/perfil-cliente' : '/login', icon: User, label: usuario ? 'Perfil' : 'Entrar' },
  ]

  const ativo = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <nav className="sm:hidden" style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, width: 'calc(100% - 40px)', maxWidth: 360,
    }}>
      <div style={{
        background: '#fff', borderRadius: 28,
        boxShadow: '0 18px 45px rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '10px 8px',
      }}>
        {itens.map(item => {
          const isAtivo = ativo(item.path)
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="btn-press"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 14px', borderRadius: 18, border: 'none',
                background: isAtivo ? '#F0FDF4' : 'none', cursor: 'pointer',
                minWidth: 52,
              }}>
              <div style={{ position: 'relative' }}>
                <item.icon
                  size={22}
                  strokeWidth={2}
                  color={isAtivo ? '#16A34A' : '#9CA3AF'}
                  style={{ transition: 'all 0.25s ease', display: 'block' }}
                />
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    width: 15, height: 15, borderRadius: '50%',
                    background: '#16A34A', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff',
                  }}>{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isAtivo ? 700 : 500,
                color: isAtivo ? '#16A34A' : '#9CA3AF',
              }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

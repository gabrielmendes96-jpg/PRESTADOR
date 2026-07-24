import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuth()
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    if (!usuario) return
    const buscarNaoLidas = async () => {
      const { data: prest } = await supabase.from('prestadores').select('id').eq('user_id', usuario.id).single()
      if (prest) {
        const { data } = await supabase.from('conversas').select('nao_lidas_prestador').eq('prestador_id', prest.id)
        setNaoLidas((data || []).reduce((acc, c) => acc + (c.nao_lidas_prestador || 0), 0))
      } else {
        const { data } = await supabase.from('conversas').select('nao_lidas_cliente').eq('cliente_user_id', usuario.id)
        setNaoLidas((data || []).reduce((acc, c) => acc + (c.nao_lidas_cliente || 0), 0))
      }
    }
    buscarNaoLidas()
    const channel = supabase.channel('bottom_nav')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, buscarNaoLidas)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [usuario])

  const itens = [
    { path: '/', icon: 'ti-home', label: 'Início' },
    { path: '/busca', icon: 'ti-search', label: 'Buscar' },
    { path: '/pedidos', icon: 'ti-clipboard-list', label: 'Pedidos' },
    { path: '/mensagens', icon: 'ti-message', label: 'Mensagens', badge: naoLidas },
    { path: usuario ? '/perfil-cliente' : '/login', icon: 'ti-user', label: usuario ? 'Perfil' : 'Entrar' },
  ]

  const ativo = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#fff', borderTop: '1px solid #F3F4F6',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }} className="sm:hidden">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 8px' }}>
        {itens.map(item => {
          const isAtivo = ativo(item.path)
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 12px', borderRadius: 14, border: 'none', background: 'none',
                cursor: 'pointer', minWidth: 56, position: 'relative',
                background: isAtivo ? '#F0FDF4' : 'none',
                transition: 'background 0.2s ease',
              }}>
              <div style={{ position: 'relative' }}>
                <i className={`ti ${item.icon}`} style={{
                  fontSize: 22,
                  color: isAtivo ? '#16A34A' : '#9CA3AF',
                  transition: 'color 0.2s ease, transform 0.2s ease',
                  transform: isAtivo ? 'scale(1.1)' : 'scale(1)',
                  display: 'block',
                }} aria-hidden="true"></i>
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#16A34A', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff',
                  }}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isAtivo ? 700 : 500,
                color: isAtivo ? '#16A34A' : '#9CA3AF',
                transition: 'color 0.2s ease',
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

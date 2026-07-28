import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/nova-senha')
      } else if (session) {
        navigate('/')
      } else {
        navigate('/login')
      }
    })
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={32} color={colors.primary} className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: colors.textSub }}>Finalizando...</p>
      </div>
    </div>
  )
}

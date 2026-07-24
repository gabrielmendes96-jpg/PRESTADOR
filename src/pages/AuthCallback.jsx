import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF6EE' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-sm" style={{ color: '#7C9485' }}>Finalizando...</p>
      </div>
    </div>
  )
}

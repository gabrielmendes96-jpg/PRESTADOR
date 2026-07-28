import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const entrarComEmail = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.')
      return
    }
    navigate('/')
  }

  const entrarComGoogle = async () => {
    setErro('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErro('Não foi possível entrar com Google. Tente novamente.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/"><Logo size={40} /></Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
            Entre na sua conta para continuar
          </p>

          {/* Google */}
          <button
            onClick={entrarComGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl mb-4 hover:opacity-90 transition-opacity"
            style={{ border: '0.5px solid #EDE3CE', background: '#fff', color: '#1F2D24', fontSize: '14px', fontWeight: 500 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-4">
            <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid #EDE3CE' }} />
            <span style={{ fontSize: '12px', color: '#C9BFA8' }}>ou</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid #EDE3CE' }} />
          </div>

          {/* Formulário */}
          <form onSubmit={entrarComEmail}>
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm" style={{ color: '#5F6F65' }}>Senha</label>
                <Link to="/esqueci-senha" className="text-xs hover:underline" style={{ color: '#1FA855' }}>
                  Esqueci a senha
                </Link>
              </div>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
              />
            </div>

            {erro && (
              <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#A32D2D', background: '#FCEBEB' }}>
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ background: '#1FA855' }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Cadastro */}
        <p className="text-center text-sm mt-4" style={{ color: '#7C9485' }}>
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium hover:underline" style={{ color: '#1FA855' }}>
            Cadastre-se grátis
          </Link>
        </p>

      </div>
    </div>
  )
}

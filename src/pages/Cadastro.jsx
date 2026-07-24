import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Cadastro() {
  const [etapa, setEtapa] = useState(1)
  const [tipo, setTipo] = useState('') // 'cliente' ou 'prestador'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const navigate = useNavigate()

  const [aceitouTermos, setAceitouTermos] = useState(false)

  const entrarComGoogle = async () => {
    setErro('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErro('Não foi possível entrar com Google.')
  }

  const cadastrar = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os termos de uso para continuar.')
      return
    }

    setCarregando(true)
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, tipo },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (!error && authData.user) {
      await supabase.from('termos_aceitos').insert({
        user_id: authData.user.id,
        versao: '1.0',
      })
    }
    setCarregando(false)

    if (error) {
      setErro('Não foi possível criar a conta. Tente outro e-mail.')
      return
    }

    setSucesso(true)
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Verifique seu e-mail</h1>
          <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}
          >
            Voltar para o início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
            Criar conta
          </h1>
          <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
            É grátis para clientes
          </p>

          {/* Etapa 1 — Tipo de conta */}
          {etapa === 1 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>Você é:</p>
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={() => setTipo('cliente')}
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors text-left"
                  style={tipo === 'cliente'
                    ? { border: '2px solid #1FA855', background: '#F4FAF6' }
                    : { border: '0.5px solid #EDE3CE', background: '#fff' }
                  }
                >
                  <span className="text-2xl">🏠</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>Cliente</p>
                    <p className="text-xs" style={{ color: '#7C9485' }}>Quero contratar profissionais</p>
                  </div>
                </button>
                <button
                  onClick={() => setTipo('prestador')}
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors text-left"
                  style={tipo === 'prestador'
                    ? { border: '2px solid #1FA855', background: '#F4FAF6' }
                    : { border: '0.5px solid #EDE3CE', background: '#fff' }
                  }
                >
                  <span className="text-2xl">🔧</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>Prestador de serviço</p>
                    <p className="text-xs" style={{ color: '#7C9485' }}>Quero oferecer meus serviços</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => { if (!tipo) { setErro('Escolha um tipo de conta.'); return; } setErro(''); setEtapa(2) }}
                className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
                style={{ background: '#1FA855' }}
              >
                Continuar
              </button>
              {erro && <p className="text-xs mt-2 text-center" style={{ color: '#A32D2D' }}>{erro}</p>}
            </div>
          )}

          {/* Etapa 2 — Dados */}
          {etapa === 2 && (
            <div>
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
                Cadastrar com Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid #EDE3CE' }} />
                <span style={{ fontSize: '12px', color: '#C9BFA8' }}>ou</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid #EDE3CE' }} />
              </div>

              <form onSubmit={cadastrar}>
                <div className="mb-3">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                    style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                  />
                </div>
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
                <div className="mb-3">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                    style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
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

                <label className="flex items-start gap-2 mb-4 cursor-pointer">
                  <input type="checkbox" checked={aceitouTermos}
                    onChange={e => setAceitouTermos(e.target.checked)}
                    style={{ accentColor: '#1FA855', marginTop: 2, flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#7C9485' }}>
                    Li e aceito os{' '}
                    <a href="/termos" target="_blank" style={{ color: '#1FA855', textDecoration: 'underline' }}>
                      Termos de Uso e Política de Privacidade
                    </a>
                    {' '}do Prestador (LGPD)
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEtapa(1)}
                    className="flex-1 py-2.5 text-sm rounded-xl hover:opacity-80"
                    style={{ border: '0.5px solid #EDE3CE', color: '#1F2D24', background: '#fff' }}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={carregando}
                    className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
                    style={{ background: '#1FA855' }}
                  >
                    {carregando ? 'Criando...' : 'Criar conta'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#7C9485' }}>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#1FA855' }}>
            Entrar
          </Link>
        </p>

      </div>
    </div>
  )
}

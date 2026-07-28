import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Wrench, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, background: colors.bg, outline: 'none', color: colors.text,
}

function GoogleButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="btn-press"
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '11px 0', borderRadius: 14, marginBottom: 16,
        border: `1px solid ${colors.border}`, background: '#fff', color: colors.text, fontSize: 14, fontWeight: 600,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {children}
    </button>
  )
}

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Mail size={32} color={colors.primary} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Verifique seu e-mail</h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 24 }}>
            Enviamos um link de confirmação para <strong style={{ color: colors.text }}>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>Voltar para o início</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <Card padding={24}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Criar conta</h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 24 }}>É grátis para clientes</p>

          {/* Etapa 1 — Tipo de conta */}
          {etapa === 1 && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>Você é:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <button
                  onClick={() => setTipo('cliente')}
                  className="btn-press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                    ...(tipo === 'cliente' ? { border: `2px solid ${colors.primary}`, background: '#F0FDF4' } : { border: `1px solid ${colors.border}`, background: '#fff' }),
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Home size={19} color={colors.primaryHover} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>Cliente</p>
                    <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>Quero contratar profissionais</p>
                  </div>
                </button>
                <button
                  onClick={() => setTipo('prestador')}
                  className="btn-press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                    ...(tipo === 'prestador' ? { border: `2px solid ${colors.primary}`, background: '#F0FDF4' } : { border: `1px solid ${colors.border}`, background: '#fff' }),
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wrench size={19} color="#92610A" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>Prestador de serviço</p>
                    <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>Quero oferecer meus serviços</p>
                  </div>
                </button>
              </div>

              <Button
                fullWidth
                onClick={() => { if (!tipo) { setErro('Escolha um tipo de conta.'); return } setErro(''); setEtapa(2) }}
              >
                Continuar
              </Button>
              {erro && <p style={{ fontSize: 12, marginTop: 10, textAlign: 'center', color: '#B91C1C' }}>{erro}</p>}
            </div>
          )}

          {/* Etapa 2 — Dados */}
          {etapa === 2 && (
            <div>
              <GoogleButton onClick={entrarComGoogle}>Cadastrar com Google</GoogleButton>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${colors.border}` }} />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>ou</span>
                <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${colors.border}` }} />
              </div>

              <form onSubmit={cadastrar}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Nome completo</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Senha</label>
                  <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Confirmar senha</label>
                  <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" required style={inputStyle} />
                </div>

                {erro && (
                  <p style={{ fontSize: 12, marginBottom: 12, padding: '8px 12px', borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>
                    {erro}
                  </p>
                )}

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                  <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: colors.textSub }}>
                    Li e aceito os{' '}
                    <a href="/termos" target="_blank" rel="noreferrer" style={{ color: colors.primary, textDecoration: 'underline' }}>
                      Termos de Uso e Política de Privacidade
                    </a>
                    {' '}do Prestador (LGPD)
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button type="button" variant="secondary" fullWidth onClick={() => setEtapa(1)}>Voltar</Button>
                  <Button type="submit" fullWidth disabled={carregando}>
                    {carregando ? 'Criando...' : 'Criar conta'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>

        <p style={{ textAlign: 'center', fontSize: 14, color: colors.textSub, marginTop: 20 }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: colors.primary, textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>

      </div>
    </div>
  )
}

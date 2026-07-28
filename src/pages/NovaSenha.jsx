import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, background: colors.bg, outline: 'none', color: colors.text,
}

export default function NovaSenha() {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // O Supabase processa o token de recuperação da URL de forma assíncrona.
    // Escutamos o evento e só redirecionamos para o login se, após um tempo,
    // nenhuma sessão de recuperação tiver sido estabelecida.
    let cancelado = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') cancelado = true
    })

    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelado && !session) navigate('/login')
    }, 2000)

    return () => {
      cancelado = true
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [navigate])

  const salvar = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)

    if (error) {
      setErro('Não foi possível atualizar a senha. Tente novamente.')
      return
    }

    setSucesso(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <Card padding={24}>
          {sucesso ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} color={colors.primary} strokeWidth={1.8} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Senha atualizada!</h1>
              <p style={{ fontSize: 14, color: colors.textSub }}>Redirecionando para o início...</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Criar nova senha</h1>
              <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>Digite sua nova senha abaixo.</p>

              <form onSubmit={salvar}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Nova senha</label>
                  <input
                    type="password" value={senha} onChange={e => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres" required style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Confirmar nova senha</label>
                  <input
                    type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    placeholder="Repita a senha" required style={inputStyle}
                  />
                </div>

                {erro && (
                  <p style={{ fontSize: 12, marginBottom: 12, padding: '8px 12px', borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>
                    {erro}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={carregando}>
                  {carregando ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

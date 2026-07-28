import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, background: colors.bg, outline: 'none', color: colors.text,
}

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    setCarregando(false)

    if (error) {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
      return
    }

    setEnviado(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <Card padding={24}>
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <MailCheck size={32} color={colors.primary} strokeWidth={1.8} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>E-mail enviado!</h1>
              <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 16 }}>
                Enviamos um link para <strong style={{ color: colors.text }}>{email}</strong>. Clique no link para criar uma nova senha.
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                Não recebeu? Verifique a caixa de spam ou tente novamente.
              </p>
              <button
                onClick={() => setEnviado(false)}
                style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Esqueceu a senha?</h1>
              <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>
                Digite seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form onSubmit={enviar}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>E-mail</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" required style={inputStyle}
                  />
                </div>

                {erro && (
                  <p style={{ fontSize: 12, marginBottom: 12, padding: '8px 12px', borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>
                    {erro}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={carregando}>
                  {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
            </>
          )}
        </Card>

        <p style={{ textAlign: 'center', fontSize: 14, color: colors.textSub, marginTop: 20 }}>
          Lembrou a senha?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: colors.primary, textDecoration: 'none' }}>
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}

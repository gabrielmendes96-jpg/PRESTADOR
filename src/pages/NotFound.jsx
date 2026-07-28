import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={48} />
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: colors.primary, marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Página não encontrada</h1>
        <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 28 }}>
          A página que você está procurando não existe ou foi removida.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
          <Button onClick={() => navigate('/')}>Ir para o início</Button>
        </div>
      </div>
    </div>
  )
}

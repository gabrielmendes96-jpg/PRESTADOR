import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Gift, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import Logo from '../components/Logo'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Convite() {
  const [searchParams] = useSearchParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const ref = searchParams.get('ref')

  useEffect(() => {
    // Se já está logado, processa o convite e vai para o início
    if (usuario && ref) {
      navigate(`/?ref=${ref}`)
    }
  }, [usuario, ref])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.bg }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={48} />
        </div>

        <Card padding={24}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Gift size={28} color={colors.primary} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Você foi convidado!</h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>
            Cadastre-se agora e ganhe <strong style={{ color: colors.primary }}>3 pedidos grátis</strong> para contratar profissionais na plataforma Prestador.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {['Profissionais avaliados por clientes reais', 'Fotos e vídeos dos trabalhos realizados', 'Chat direto com o profissional', 'Avaliações com 7 critérios detalhados'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textAlign: 'left', color: colors.textSub }}>
                <Check size={15} strokeWidth={3} color={colors.primary} style={{ flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>

          <Button fullWidth onClick={() => navigate(`/cadastro?ref=${ref}`)} style={{ marginBottom: 12 }}>
            Criar conta grátis e ganhar créditos
          </Button>

          <Link to="/login" style={{ fontSize: 14, color: colors.textSub, textDecoration: 'none' }}>
            Já tenho conta
          </Link>
        </Card>

        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          Código de convite: <strong style={{ color: colors.textSub }}>{ref}</strong>
        </p>
      </div>
    </div>
  )
}

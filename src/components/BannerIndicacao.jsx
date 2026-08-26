import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useCodigoIndicacao } from '../lib/hooks'
import { colors } from '../lib/design'
import Button from './ui/Button'

// Divulga o programa de indicação (meses grátis de verdade) dentro do
// painel do prestador — antes só quem entrava direto em /indicacao
// sabia que isso existia.
export default function BannerIndicacao() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { codigo } = useCodigoIndicacao(usuario)
  const [copiado, setCopiado] = useState(false)

  if (!codigo) return null

  const link = `${window.location.origin}/convite?ref=${codigo.codigo}`

  const copiarLink = () => {
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-4 flex-wrap"
      style={{ background: '#F0FDF4', border: `1px solid ${colors.primary}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Gift size={19} color={colors.primaryHover} strokeWidth={1.8} />
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>
          Indique outro prestador e ganhe meses grátis
        </p>
        <p style={{ fontSize: 12.5, color: colors.textSub, margin: '2px 0 0' }}>
          Cada 5 indicados que assinam um plano libera um mês grátis pra você.
        </p>
      </div>

      <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
        <button
          onClick={copiarLink}
          className="btn-press"
          style={{
            fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10,
            border: `1px solid ${colors.primary}`, background: copiado ? '#DCFCE7' : '#fff',
            color: colors.primaryHover, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {copiado && <Check size={13} strokeWidth={3} />} {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
        <Button variant="secondary" onClick={() => navigate('/indicacao')} icon={<ArrowRight size={14} />}>
          Ver detalhes
        </Button>
      </div>
    </div>
  )
}

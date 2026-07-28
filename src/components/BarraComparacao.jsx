import { useNavigate, useLocation } from 'react-router-dom'
import { Scale, X } from 'lucide-react'
import { useComparacao } from '../lib/ComparacaoContext'
import { colors, shadow } from '../lib/design'
import Button from './ui/Button'
import IconButton from './ui/IconButton'

export default function BarraComparacao() {
  const { selecionados, limparComparacao } = useComparacao()
  const navigate = useNavigate()
  const location = useLocation()

  if (selecionados.length === 0 || location.pathname === '/comparar') return null

  const podeComparar = selecionados.length >= 2

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed', bottom: 92, left: '50%', transform: 'translateX(-50%)',
        zIndex: 90, width: 'calc(100% - 32px)', maxWidth: 380,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, boxShadow: shadow.nav,
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Scale size={17} color={colors.primaryHover} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: 0 }}>
            {selecionados.length} selecionado{selecionados.length !== 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: 11, color: colors.textSub, margin: 0 }}>
            {podeComparar ? 'Pronto para comparar' : 'Selecione mais 1 para comparar'}
          </p>
        </div>
        <IconButton icon={<X size={15} />} tone="ghost" size={32} onClick={limparComparacao} aria-label="Limpar seleção" />
        <Button size="sm" disabled={!podeComparar} onClick={() => navigate(`/comparar?ids=${selecionados.join(',')}`)}>
          Comparar
        </Button>
      </div>
    </div>
  )
}

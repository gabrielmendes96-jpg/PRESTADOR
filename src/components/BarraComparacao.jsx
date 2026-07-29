import { useNavigate } from 'react-router-dom'
import { Scale, X } from 'lucide-react'
import { useComparacao } from '../lib/ComparacaoContext'
import { colors } from '../lib/design'
import Card from './ui/Card'
import Button from './ui/Button'
import IconButton from './ui/IconButton'

// Aviso comum (não fixo) que cada página de descoberta decide onde encaixar.
export default function BarraComparacao({ style }) {
  const { selecionados, limparComparacao } = useComparacao()
  const navigate = useNavigate()

  if (selecionados.length === 0) return null

  const podeComparar = selecionados.length >= 2

  return (
    <Card padding={12} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
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
      <Button size="sm" disabled={!podeComparar} onClick={() => navigate('/comparar')}>
        Comparar
      </Button>
    </Card>
  )
}

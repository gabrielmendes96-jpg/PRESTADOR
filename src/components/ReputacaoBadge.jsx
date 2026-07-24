export function reputacaoConfig(nota, totalAvaliacoes) {
  if (!totalAvaliacoes || totalAvaliacoes === 0) return {
    cor: '#8A9E8F', bg: '#F0F4F0', label: 'Novo', dot: '#C9BFA8'
  }
  if (nota >= 4.5) return {
    cor: '#0A6E3D', bg: '#E8F5EE', label: 'Excelente', dot: '#1FA855'
  }
  if (nota >= 3.5) return {
    cor: '#7A4F00', bg: '#FEF6E4', label: 'Bom', dot: '#FFC857'
  }
  return {
    cor: '#8B2020', bg: '#FDF0F0', label: 'Atenção', dot: '#E24B4A'
  }
}

export default function ReputacaoBadge({ nota, totalAvaliacoes, size = 'normal' }) {
  const config = reputacaoConfig(nota, totalAvaliacoes)
  const isSmall = size === 'small'

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full"
      style={{
        background: config.bg,
        padding: isSmall ? '2px 8px' : '3px 10px',
      }}>
      <span style={{
        width: isSmall ? 6 : 7,
        height: isSmall ? 6 : 7,
        borderRadius: '50%',
        background: config.dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: isSmall ? 11 : 12,
        fontWeight: 600,
        color: config.cor,
        letterSpacing: '0.1px',
      }}>
        {config.label}
      </span>
      {!isSmall && totalAvaliacoes > 0 && (
        <span style={{ fontSize: 11, color: config.cor, opacity: 0.65 }}>
          {nota} ({totalAvaliacoes})
        </span>
      )}
    </div>
  )
}

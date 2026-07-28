const tones = {
  verified: { background: '#F1F5F9', color: '#475569' },
  plan: { background: '#FEF3C7', color: '#92610A' },
  available: { background: '#DCFCE7', color: '#15803D' },
  success: { background: '#DCFCE7', color: '#14853D' },
  neutral: { background: '#F3F6F2', color: '#6B7280' },
}

export default function Badge({ tone = 'neutral', icon, children, style }) {
  const toneStyle = tones[tone] || tones.neutral

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 20,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...toneStyle,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  )
}

export default function Logo({ size = 36, onDark = false, iconOnly = false }) {
  const textColor = onDark ? '#fff' : '#1F2937'
  const s = size
  
  const icon = (
    <svg width={s * 0.8} height={s} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pin de localização */}
      <path d="M16 0C9.373 0 4 5.373 4 12c0 8.4 12 24 12 24S28 20.4 28 12C28 5.373 22.627 0 16 0z" fill="#16A34A"/>
      {/* Letra P recortada em branco */}
      <path d="M11.5 6.8h5.4c3 0 5.1 2 5.1 4.7s-2.1 4.7-5.1 4.7h-2.7v3.4h-2.7V6.8z" fill="#fff"/>
      <path d="M14.2 9.2h2.4c1.3 0 2.1.8 2.1 2s-.8 2-2.1 2h-2.4V9.2z" fill="#16A34A"/>
      {/* Bolinha amarela de destaque */}
      <circle cx="21.5" cy="7.5" r="2.6" fill="#F6C64D"/>
    </svg>
  )

  if (iconOnly) return icon

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: s * 0.5,
        color: textColor,
        letterSpacing: '-0.5px',
      }}>Prestador</span>
    </div>
  )
}

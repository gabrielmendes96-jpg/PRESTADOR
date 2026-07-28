export default function Logo({ size = 36, onDark = false, iconOnly = false }) {
  const textColor = onDark ? '#fff' : '#1F2937'
  const s = size
  
  const icon = (
    <svg width={s * 0.8} height={s} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pin de localização */}
      <path d="M16 0C9.373 0 4 5.373 4 12c0 8.4 12 24 12 24S28 20.4 28 12C28 5.373 22.627 0 16 0z" fill="#16A34A"/>
      {/* Círculo branco interno */}
      <circle cx="16" cy="12" r="7" fill="white"/>
      {/* Letra P */}
      <path d="M13 8.5h4a2.5 2.5 0 0 1 0 5h-4V8.5z" fill="#16A34A" stroke="none"/>
      <rect x="13" y="8.5" width="2.5" height="7" fill="#16A34A"/>
      {/* Bolinha amarela */}
      <circle cx="20.5" cy="9" r="2.5" fill="#F6C64D"/>
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

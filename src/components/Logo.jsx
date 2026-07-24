export default function Logo({ size = 32, onDark = false }) {
  const cor = onDark ? '#fff' : '#16A34A'
  const corPin = onDark ? '#FACC15' : '#FACC15'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Ícone P + Pin */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill={onDark ? 'rgba(255,255,255,0.15)' : '#16A34A'}/>
        <path d="M14 8h8a6 6 0 0 1 0 12h-4v4l-2 8" stroke={onDark ? '#fff' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="14" r="3" fill={corPin}/>
      </svg>
      {/* Nome */}
      <span style={{
        fontFamily: "'Plus Jakarta Sans', 'Quicksand', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.55,
        color: onDark ? '#fff' : '#1F2937',
        letterSpacing: '-0.5px',
      }}>Prestador</span>
    </div>
  )
}

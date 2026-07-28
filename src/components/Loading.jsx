export default function Loading({ texto = 'Carregando...', fullscreen = false }) {
  if (fullscreen) return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(240,242,240,0.9)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-3 animate-spin"
          style={{ borderColor: '#1FA855', borderTopColor: 'transparent' }}></div>
        <p className="text-sm" style={{ color: '#7C9485' }}>{texto}</p>
      </div>
    </div>
  )

  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent mx-auto mb-3 animate-spin"
          style={{ borderColor: '#1FA855', borderTopColor: 'transparent' }}></div>
        <p className="text-sm" style={{ color: '#7C9485' }}>{texto}</p>
      </div>
    </div>
  )
}

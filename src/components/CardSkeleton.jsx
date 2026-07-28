export default function CardSkeleton({ modo = 'grande' }) {
  if (modo === 'lista') return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-3 animate-pulse"
      style={{ border: '0.5px solid #DDE3DD' }}>
      <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: '#E8EAE8' }}></div>
      <div className="flex-1">
        <div className="h-3 rounded mb-2" style={{ background: '#E8EAE8', width: '60%' }}></div>
        <div className="h-2.5 rounded" style={{ background: '#E8EAE8', width: '40%' }}></div>
      </div>
    </div>
  )

  if (modo === 'pequeno') return (
    <div className="bg-white rounded-xl p-3 flex flex-col items-center gap-2 animate-pulse"
      style={{ border: '0.5px solid #DDE3DD' }}>
      <div className="w-10 h-10 rounded-full" style={{ background: '#E8EAE8' }}></div>
      <div className="h-2.5 rounded w-full" style={{ background: '#E8EAE8' }}></div>
      <div className="h-2 rounded" style={{ background: '#E8EAE8', width: '70%' }}></div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse"
      style={{ border: '0.5px solid #DDE3DD' }}>
      <div className="h-24" style={{ background: '#E8EAE8' }}></div>
      <div className="p-3">
        <div className="h-3 rounded mb-2" style={{ background: '#E8EAE8', width: '70%' }}></div>
        <div className="h-2.5 rounded mb-3" style={{ background: '#E8EAE8', width: '50%' }}></div>
        <div className="h-5 rounded" style={{ background: '#E8EAE8', width: '80%' }}></div>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'

export default function GaleriaFotos({ fotos, disponivel }) {
  const [idx, setIdx] = useState(0)

  const next = useCallback(() => {
    setIdx(i => (i + 1) % fotos.length)
  }, [fotos.length])

  const prev = useCallback(() => {
    setIdx(i => (i - 1 + fotos.length) % fotos.length)
  }, [fotos.length])

  // Navegação pelo teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  if (!fotos || fotos.length === 0) return (
    <div className="w-full h-80 rounded-2xl mb-4 flex items-center justify-center" style={{ background: '#F4FAF6' }}>
      <p className="text-sm" style={{ color: '#C9BFA8' }}>Sem fotos cadastradas</p>
    </div>
  )

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-4 group" style={{ background: '#1F2D24' }}>
      <img
        src={fotos[idx]}
        alt={`Foto do trabalho ${idx + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Progress dots */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex gap-1">
        {fotos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i === idx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)' }}
            aria-label={`Ir para foto ${i + 1}`}
          />
        ))}
      </div>

      {/* Seta esquerda */}
      {fotos.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
          aria-label="Foto anterior"
        >
          <i className="ti ti-chevron-left" style={{ fontSize: '20px' }} aria-hidden="true"></i>
        </button>
      )}

      {/* Seta direita */}
      {fotos.length > 1 && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
          aria-label="Próxima foto"
        >
          <i className="ti ti-chevron-right" style={{ fontSize: '20px' }} aria-hidden="true"></i>
        </button>
      )}

      {/* Contador de fotos */}
      {fotos.length > 1 && (
        <div
          className="absolute bottom-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
        >
          {idx + 1} / {fotos.length}
        </div>
      )}

      {/* Badge disponível */}
      {disponivel && (
        <span
          className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#E3F6E9', color: '#0F6E3D' }}
        >
          ✓ Disponível
        </span>
      )}
    </div>
  )
}

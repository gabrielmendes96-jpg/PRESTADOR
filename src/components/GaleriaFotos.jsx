import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight as ChevronRightIcon, Check, Image } from 'lucide-react'
import { colors } from '../lib/design'

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
    <div className="w-full h-80 rounded-2xl mb-4 flex flex-col items-center justify-center gap-2" style={{ background: colors.bg }}>
      <Image size={32} color="#D1D5DB" />
      <p className="text-sm" style={{ color: colors.textSub }}>Sem fotos cadastradas</p>
    </div>
  )

  const atual = fotos[idx]
  const url = typeof atual === 'string' ? atual : atual.url
  const ehVideo = typeof atual === 'object' && atual.tipo === 'video'

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-4 group" style={{ background: '#111827' }}>
      {ehVideo ? (
        <video
          key={url}
          src={url}
          controls
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={url}
          alt={`Foto do trabalho ${idx + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      )}

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
          <ChevronLeft size={20} />
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
          <ChevronRightIcon size={20} />
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
          className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#DCFCE7', color: '#15803D' }}
        >
          <Check size={12} strokeWidth={3} /> Disponível
        </span>
      )}
    </div>
  )
}

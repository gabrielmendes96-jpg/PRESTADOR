import { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, X, Check } from 'lucide-react'
import { colors, radius } from '../lib/design'
import Button from './ui/Button'

const VIEWPORT = 280
const OUTPUT = 600

// Editor simples de foto: pan (arrastar) + zoom, recorta em quadrado e exporta um Blob JPEG.
export default function FotoPerfilEditor({ src, onCancel, onConfirm }) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const imgRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }, [src])

  const baseScale = naturalSize ? Math.max(VIEWPORT / naturalSize.w, VIEWPORT / naturalSize.h) : 1
  const displayScale = baseScale * zoom
  const displayedW = naturalSize ? naturalSize.w * displayScale : 0
  const displayedH = naturalSize ? naturalSize.h * displayScale : 0

  const clamp = useCallback((o, dw, dh) => {
    const maxX = Math.max(0, (dw - VIEWPORT) / 2)
    const maxY = Math.max(0, (dh - VIEWPORT) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) }
  }, [])

  useEffect(() => {
    if (!naturalSize) return
    setOffset(o => clamp(o, displayedW, displayedH))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, naturalSize])

  const iniciarArraste = (clientX, clientY) => {
    dragRef.current = { startX: clientX, startY: clientY, origem: offset }
  }
  const moverArraste = (clientX, clientY) => {
    if (!dragRef.current) return
    const dx = clientX - dragRef.current.startX
    const dy = clientY - dragRef.current.startY
    setOffset(clamp({ x: dragRef.current.origem.x + dx, y: dragRef.current.origem.y + dy }, displayedW, displayedH))
  }
  const pararArraste = () => { dragRef.current = null }

  const confirmar = () => {
    setSalvando(true)
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    const k = OUTPUT / VIEWPORT
    const drawW = displayedW * k
    const drawH = displayedH * k
    const drawX = (VIEWPORT / 2 + offset.x - displayedW / 2) * k
    const drawY = (VIEWPORT / 2 + offset.y - displayedH / 2) * k
    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH)
    canvas.toBlob(blob => {
      setSalvando(false)
      onConfirm(blob)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,32,0.65)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: radius.card, padding: 24, width: 340, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Ajustar foto</h3>
          <button onClick={onCancel} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSub, display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            position: 'relative', width: VIEWPORT, height: VIEWPORT, margin: '0 auto 20px',
            borderRadius: '50%', overflow: 'hidden', background: colors.bg, cursor: dragRef.current ? 'grabbing' : 'grab',
            boxShadow: `0 0 0 4000px rgba(15,23,32,0.45)`, touchAction: 'none',
          }}
          onMouseDown={(e) => iniciarArraste(e.clientX, e.clientY)}
          onMouseMove={(e) => moverArraste(e.clientX, e.clientY)}
          onMouseUp={pararArraste}
          onMouseLeave={pararArraste}
          onTouchStart={(e) => iniciarArraste(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => moverArraste(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={pararArraste}
        >
          {naturalSize && (
            <img
              ref={imgRef}
              src={src}
              alt="Pré-visualização"
              draggable={false}
              style={{
                position: 'absolute',
                left: VIEWPORT / 2 + offset.x - displayedW / 2,
                top: VIEWPORT / 2 + offset.y - displayedH / 2,
                width: displayedW,
                height: displayedH,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <ZoomIn size={16} color={colors.textSub} />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: colors.primary }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
          <Button fullWidth icon={<Check size={16} />} onClick={confirmar} disabled={salvando || !naturalSize}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

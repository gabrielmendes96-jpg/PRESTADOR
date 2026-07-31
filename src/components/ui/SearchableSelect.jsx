import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { colors, radius } from '../../lib/design'

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Combobox pesquisável: digita e filtra a lista, em vez de rolar um <select>
// gigante. options = [{ value, label }].
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Digite para buscar...',
  emptyMessage = 'Nenhum resultado encontrado',
  disabled = false,
  loading = false,
}) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [destaque, setDestaque] = useState(0)
  const inputRef = useRef(null)

  const selecionado = options.find(o => o.value === value)
  const filtradas = busca
    ? options.filter(o => normalizar(o.label).includes(normalizar(busca)))
    : options

  const abrir = () => {
    if (disabled) return
    setBusca('')
    setDestaque(0)
    setAberto(true)
  }

  const escolher = (opt) => {
    onChange(opt.value)
    setBusca('')
    setAberto(false)
  }

  const handleKeyDown = (e) => {
    if (!aberto) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setDestaque(d => Math.min(d + 1, filtradas.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setDestaque(d => Math.max(d - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); if (filtradas[destaque]) escolher(filtradas[destaque]) }
    if (e.key === 'Escape') { setAberto(false) }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={aberto ? busca : (selecionado?.label || '')}
          onChange={e => { setBusca(e.target.value); setDestaque(0); if (!aberto) setAberto(true) }}
          onFocus={abrir}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Carregando...' : placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{
            width: '100%', padding: '10px 36px 10px 14px', fontSize: 14, borderRadius: 12,
            border: `1px solid ${colors.border}`, outline: 'none', color: colors.text, fontFamily: 'inherit',
            background: disabled ? colors.bg : '#fff', cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <ChevronDown size={16} color={colors.textSub} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>

      {aberto && !disabled && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setAberto(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 31,
            maxHeight: 240, overflowY: 'auto', background: '#fff', borderRadius: radius.card,
            border: `1px solid ${colors.border}`, boxShadow: '0 12px 30px rgba(0,0,0,0.12)', padding: 6,
          }}>
            {loading ? (
              <p style={{ padding: 12, fontSize: 13, color: colors.textSub, margin: 0 }}>Carregando...</p>
            ) : filtradas.length === 0 ? (
              <p style={{ padding: 12, fontSize: 13, color: colors.textSub, margin: 0 }}>{emptyMessage}</p>
            ) : (
              filtradas.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); escolher(opt) }}
                  onMouseEnter={() => setDestaque(i)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                    border: 'none', cursor: 'pointer', fontSize: 14,
                    background: i === destaque ? colors.bg : 'transparent',
                    color: opt.value === value ? colors.primaryHover : colors.text,
                    fontWeight: opt.value === value ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

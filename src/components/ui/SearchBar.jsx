import { Search } from 'lucide-react'
import { colors } from '../../lib/design'
import Button from './Button'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar profissional ou serviço',
  onSubmit,
  showButton = true,
  actionLabel = 'Buscar',
  autoFocus = false,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(e)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 64,
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E4E4E4',
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
        padding: '0 8px 0 20px',
      }}
    >
      <Search size={20} strokeWidth={2} color={colors.textSub} style={{ flexShrink: 0 }} />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 16,
          color: colors.text,
          height: '100%',
        }}
      />
      {showButton && (
        <Button type="submit" size="sm" style={{ height: 48 }}>
          {actionLabel}
        </Button>
      )}
    </form>
  )
}

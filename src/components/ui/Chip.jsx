import { colors, transition } from '../../lib/design'

export default function Chip({ active = false, onClick, icon, count, children, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-press"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        padding: '9px 16px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        border: '1px solid transparent',
        transition,
        transform: active ? 'scale(1.03)' : 'scale(1)',
        background: active ? colors.primary : '#F3F6F2',
        color: active ? '#FFFFFF' : colors.textSub,
        ...style,
      }}
    >
      {icon}
      {children}
      {typeof count === 'number' && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 999,
            background: active ? 'rgba(255,255,255,0.25)' : '#E4E7E4',
            color: active ? '#FFFFFF' : colors.textSub,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

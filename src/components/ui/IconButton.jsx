import { colors, transition } from '../../lib/design'

const tones = {
  default: { background: '#FFFFFF', color: colors.text, border: `1px solid ${colors.border}` },
  primary: { background: colors.primary, color: '#FFFFFF', border: '1px solid transparent' },
  ghost: { background: '#F3F6F2', color: colors.textSub, border: '1px solid transparent' },
}

export default function IconButton({
  icon,
  onClick,
  size = 44,
  tone = 'default',
  'aria-label': ariaLabel,
  style,
  ...rest
}) {
  const toneStyle = tones[tone] || tones.default

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="btn-press"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 14,
        flexShrink: 0,
        transition,
        ...toneStyle,
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  )
}

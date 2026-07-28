import { colors, radius, shadow, type as typeScale } from '../../lib/design'

const variants = {
  primary: {
    background: colors.secondary,
    color: '#263238',
    border: '1px solid transparent',
  },
  secondary: {
    background: '#FFFFFF',
    color: colors.text,
    border: `1.5px solid ${colors.border}`,
  },
  dark: {
    background: colors.primaryHover,
    color: '#FFFFFF',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: colors.primaryHover,
    border: `1.5px solid #D1E7D5`,
  },
  text: {
    background: 'transparent',
    color: colors.primary,
    border: '1px solid transparent',
    padding: 0,
  },
}

const sizes = {
  md: { height: 52, padding: '0 22px', fontSize: typeScale.button.fontSize },
  sm: { height: 40, padding: '0 16px', fontSize: 14 },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  style,
  onClick,
  ...rest
}) {
  const variantStyle = variants[variant] || variants.primary
  const sizeStyle = variant === 'text' ? {} : sizes[size] || sizes.md

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn-press ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        borderRadius: variant === 'text' ? 0 : radius.btn,
        fontWeight: typeScale.button.fontWeight,
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.55 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        boxShadow: variant === 'primary' ? undefined : 'none',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.boxShadow = shadow.btn
        if (variant === 'dark') e.currentTarget.style.background = colors.primary
        if (variant === 'outline') e.currentTarget.style.background = '#F2F9F4'
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.boxShadow = 'none'
        if (variant === 'dark') e.currentTarget.style.background = colors.primaryHover
        if (variant === 'outline') e.currentTarget.style.background = 'transparent'
      }}
      {...rest}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  )
}

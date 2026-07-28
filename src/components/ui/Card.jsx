import { colors, radius, shadow, transition } from '../../lib/design'

export default function Card({
  children,
  as: Tag = 'div',
  interactive = false,
  padding = 20,
  className = '',
  style,
  onClick,
  ...rest
}) {
  return (
    <Tag
      onClick={onClick}
      className={`${interactive ? 'card-lift btn-press' : ''} ${className}`}
      style={{
        background: colors.card,
        borderRadius: radius.card,
        border: `1px solid ${colors.border}`,
        boxShadow: shadow.card,
        padding,
        transition,
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

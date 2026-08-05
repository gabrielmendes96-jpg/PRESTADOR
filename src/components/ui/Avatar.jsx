import { colors } from '../../lib/design'

function iniciaisDe(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Avatar({ nome, foto, size = 40, style }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }}
      />
    )
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.34, fontWeight: 700, background: '#DCFCE7', color: colors.primaryHover,
        ...style,
      }}
    >
      {iniciaisDe(nome)}
    </div>
  )
}

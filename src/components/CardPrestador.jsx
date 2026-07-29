import { useNavigate } from 'react-router-dom'
import { Star, Check, ChevronRight, Scale } from 'lucide-react'
import { formatarDistancia } from '../lib/gps'
import { colors } from '../lib/design'
import { planoInfo } from '../lib/planoInfo'
import { useComparacao, MAX_COMPARACAO } from '../lib/ComparacaoContext'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import IconButton from './ui/IconButton'

function BotaoComparar({ id, size }) {
  const { estaComparando, toggleComparar, selecionados } = useComparacao()
  const ativo = estaComparando(id)
  const desabilitado = !ativo && selecionados.length >= MAX_COMPARACAO

  return (
    <IconButton
      icon={<Scale size={15} />}
      size={size}
      tone={ativo ? 'primary' : 'ghost'}
      aria-label={ativo ? 'Remover da comparação' : 'Adicionar à comparação'}
      title={desabilitado ? `Você já selecionou ${MAX_COMPARACAO} para comparar` : undefined}
      disabled={desabilitado}
      onClick={(e) => { e.stopPropagation(); toggleComparar(id) }}
      style={{ flexShrink: 0, opacity: desabilitado ? 0.4 : 1, cursor: desabilitado ? 'not-allowed' : 'pointer' }}
    />
  )
}

function iniciaisDe(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P'
}

function Avatar({ prestador: p, size }) {
  const iniciais = iniciaisDe(p.nome)
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {p.foto_perfil ? (
        <img
          src={p.foto_perfil}
          alt={p.nome}
          style={{ width: size, height: size, borderRadius: 14, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: size, height: size, borderRadius: 14, background: '#DCFCE7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.34, fontWeight: 800, color: colors.primary,
          }}
        >
          {iniciais}
        </div>
      )}
      {p.plano === 'premium' && (
        <span
          style={{
            position: 'absolute', bottom: -4, right: -4, width: 18, height: 18,
            borderRadius: '50%', background: colors.secondary, border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check size={11} strokeWidth={3} color="#713F12" />
        </span>
      )}
    </div>
  )
}

function Rating({ prestador: p }) {
  if (!(p.avaliacao > 0)) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Star size={13} fill={colors.secondary} color={colors.secondary} strokeWidth={0} />
      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{p.avaliacao}</span>
      {p.totalAvaliacoes > 0 && (
        <span style={{ fontSize: 11, color: colors.textSub }}>({p.totalAvaliacoes})</span>
      )}
    </div>
  )
}

export default function CardPrestador({ prestador: p, layout = 'vertical', distancia, onClick }) {
  const navigate = useNavigate()
  const dist = distancia ? formatarDistancia(distancia) : null
  const plano = planoInfo[p.plano]
  const handleClick = onClick || (() => navigate(`/profissional/${p.id}`))

  const meta = [p.categoria, p.cidade, dist].filter(Boolean).join(' · ')
  // "A partir de R$X" plugaria aqui quando existir uma coluna de preço em prestadores_completo

  if (layout === 'horizontal') {
    return (
      <Card interactive onClick={handleClick} padding={16} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar prestador={p} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ flex: 1, fontWeight: 700, fontSize: 15, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{p.nome}</p>
            {p.disponivel && <Badge tone="available" style={{ flexShrink: 0 }}>Disponível</Badge>}
          </div>
          <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 6, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rating prestador={p} />
            {plano && <Badge tone="verified" icon={<plano.icon size={10} strokeWidth={3} />}>{plano.label}</Badge>}
          </div>
        </div>
        <BotaoComparar id={p.id} size={34} />
        <ChevronRight size={18} color="#D1D5DB" style={{ flexShrink: 0 }} />
      </Card>
    )
  }

  return (
    <Card interactive onClick={handleClick} padding={16} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar prestador={p} size={58} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</p>
            {p.disponivel && <Badge tone="available" style={{ flexShrink: 0 }}>Disponível</Badge>}
          </div>
          <p style={{ fontSize: 12, color: colors.textSub, marginBottom: 6, textTransform: 'capitalize' }}>{meta}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rating prestador={p} />
            {plano && (
              <Badge tone="verified" icon={<plano.icon size={10} strokeWidth={3} />}>{plano.label}</Badge>
            )}
          </div>
        </div>
        <BotaoComparar id={p.id} size={34} />
      </div>
      <div style={{ paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={(e) => { e.stopPropagation(); handleClick() }}
        >
          Solicitar orçamento
        </Button>
      </div>
    </Card>
  )
}

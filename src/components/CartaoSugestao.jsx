import { useNavigate } from 'react-router-dom'
import { Star, MapPin, Award } from 'lucide-react'
import { colors, radius } from '../lib/design'
import Button from './ui/Button'

// Cartão de profissional sugerido, com os motivos da sugestão em português.
export default function CartaoSugestao({ prestador, destaque = false }) {
  const navigate = useNavigate()
  const { oportunidade } = prestador
  const nota = Number(prestador.avaliacao) || 0
  const iniciais = String(prestador.nome || '?').trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase()

  return (
    <div style={{ background: '#fff', borderRadius: radius.card, padding: 18, border: destaque ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, position: 'relative' }}>
      {destaque && (
        <span style={{ position: 'absolute', top: -11, left: 16, display: 'inline-flex', alignItems: 'center', gap: 5, background: colors.primary, color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 12px', borderRadius: 999 }}>
          <Award size={13} /> Melhor opção
        </span>
      )}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {prestador.foto_perfil ? (
          <img src={prestador.foto_perfil} alt="" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#DCFCE7', color: colors.primaryHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{iniciais}</div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prestador.nome}</p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: colors.textSub, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span>{prestador.categoriaNome}</span>
            {prestador.cidade && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{prestador.cidade}{prestador.estado ? `, ${prestador.estado}` : ''}</span>}
            {nota > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Star size={12} fill={colors.secondary} color={colors.secondary} />{nota.toFixed(1).replace('.', ',')}</span>}
          </p>
        </div>
      </div>

      {oportunidade.motivos.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {oportunidade.motivos.map(m => (
            <li key={m} style={{ fontSize: 12, fontWeight: 600, color: colors.primaryHover, background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: 999 }}>{m}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 14 }}>
        <Button fullWidth variant={destaque ? 'dark' : 'secondary'} onClick={() => navigate(`/profissional/${prestador.id}`)}>
          Ver perfil e pedir orçamento
        </Button>
      </div>
    </div>
  )
}

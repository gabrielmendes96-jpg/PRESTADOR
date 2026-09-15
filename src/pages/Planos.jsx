import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ShieldCheck, Star } from 'lucide-react'
import { usePlanos } from '../lib/hooks'
import { colors, spacing, type as typeScale } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const stats = [
  { num: '12.000+', txt: 'Profissionais cadastrados' },
  { num: '85.000+', txt: 'Clientes ativos' },
  { num: '4.8', txt: 'Avaliação média na plataforma', icon: Star },
]

const CICLOS = [
  { id: 'mensal', label: 'Mensal', meses: 1 },
  { id: 'semestral', label: 'Semestral', meses: 6, economia: '15%' },
  { id: 'anual', label: 'Anual', meses: 12, economia: '20%' },
]

export default function Planos() {
  const { planos, loading } = usePlanos()
  const navigate = useNavigate()
  const [ciclo, setCiclo] = useState('mensal')
  const cicloAtual = CICLOS.find(c => c.id === ciclo)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
        <h1 style={{ ...typeScale.subtitle, fontSize: 26, color: colors.text, marginBottom: 8 }}>Planos para profissionais</h1>
        <p style={{ fontSize: 15, color: colors.textSub, marginBottom: 20 }}>Apareça para milhares de clientes em todo o Brasil</p>

        <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999, background: colors.bg, border: `1px solid ${colors.border}` }}>
          {CICLOS.map(c => (
            <button
              key={c.id}
              onClick={() => setCiclo(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999,
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: ciclo === c.id ? colors.primary : 'transparent',
                color: ciclo === c.id ? '#fff' : colors.textSub,
                transition: 'background 0.15s',
              }}
            >
              {c.label}
              {c.economia && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                  background: ciclo === c.id ? 'rgba(255,255,255,0.25)' : '#DCFCE7',
                  color: ciclo === c.id ? '#fff' : colors.primaryHover,
                }}>
                  -{c.economia}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: 14, color: colors.textSub, marginBottom: spacing.xl }}>Carregando planos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: spacing.card, marginBottom: spacing.xl }}>
          {planos.map(p => {
            const precoCiclo = { mensal: p.preco_mensal ?? p.preco, semestral: p.preco_semestral, anual: p.preco_anual }[ciclo]
            const precoEquivalenteMes = precoCiclo != null ? (precoCiclo / cicloAtual.meses) : null

            return (
              <Card
                key={p.id}
                padding={24}
                style={p.destaque ? { border: `2px solid ${colors.primary}` } : {}}
              >
                {p.destaque && (
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <Badge tone="success">Mais popular</Badge>
                  </div>
                )}
                <p style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>{p.nome}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{p.descricao}</p>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: colors.text }}>
                    R${precoEquivalenteMes != null ? precoEquivalenteMes.toFixed(2).replace('.', ',') : '—'}
                  </span>
                  <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mês</span>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                  {ciclo === 'mensal'
                    ? 'cobrado mensalmente'
                    : precoCiclo != null
                      ? `R$${precoCiclo.toFixed(2).replace('.', ',')} a cada ${cicloAtual.meses} meses`
                      : 'indisponível no momento'}
                </p>
                <hr style={{ border: 0, borderTop: `1px solid ${colors.border}`, marginBottom: 16 }} />
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, padding: 0, listStyle: 'none' }}>
                  {p.recursos.map(r => (
                    <li key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: colors.textSub }}>
                      <Check size={16} color={colors.primary} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                      {r}
                    </li>
                  ))}
                </ul>
                <Button
                  fullWidth
                  variant={p.destaque ? 'primary' : 'secondary'}
                  disabled={precoCiclo == null}
                  onClick={() => navigate(`/pagamento?tipo=mensalidade&item=${p.id}&ciclo=${ciclo}`)}
                >
                  Assinar plano {p.nome}
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      <Card padding={24} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: spacing.xl }}>
        <ShieldCheck size={28} color={colors.primary} style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: colors.text, margin: 0 }}>Garantia de 30 dias</p>
          <p style={{ fontSize: 14, color: colors.textSub, margin: 0 }}>Cancele quando quiser, sem multa. Aceitamos Pix, boleto e cartão de crédito.</p>
        </div>
      </Card>

      <div className="grid grid-cols-3" style={{ gap: spacing.card, textAlign: 'center' }}>
        {stats.map(s => (
          <Card key={s.txt} padding={16}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
              {s.num}
              {s.icon && <s.icon size={16} fill={colors.secondary} color={colors.secondary} strokeWidth={0} />}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{s.txt}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

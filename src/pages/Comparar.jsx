import { Scale, Star, Check, X, MessageCircle, Users, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePrestadoresPorIds } from '../lib/hooks'
import { useComparacao } from '../lib/ComparacaoContext'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import IconButton from '../components/ui/IconButton'

const CRITERIOS = { pontualidade: 'Pontualidade', qualidade: 'Qualidade', preco: 'Preço justo', limpeza: 'Limpeza' }

function Iniciais(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P'
}

export default function Comparar() {
  const navigate = useNavigate()
  const { selecionados, removerComparacao, limparComparacao } = useComparacao()

  const { prestadores, loading } = usePrestadoresPorIds(selecionados)

  const remover = (id) => removerComparacao(id)

  const maxAvaliacoes = Math.max(0, ...prestadores.map(p => p.totalAvaliacoes || 0))
  const maxNota = Math.max(0, ...prestadores.map(p => p.avaliacao || 0))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: spacing.xl }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
            <Scale size={19} color={colors.primary} /> Comparar profissionais
          </h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginTop: 4 }}>
            Veja lado a lado quem tem mais avaliações e o melhor perfil para o seu serviço.
          </p>
        </div>
        {prestadores.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => { limparComparacao(); navigate('/busca') }}>
            Limpar tudo
          </Button>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: colors.textSub }}>Carregando...</p>
      ) : prestadores.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <Scale size={44} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Nenhum profissional selecionado</p>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>
            Vá até a busca e toque no ícone de balança nos cards para adicionar profissionais aqui.
          </p>
          <Button onClick={() => navigate('/busca')}>Buscar profissionais</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', gap: spacing.card, overflowX: 'auto', paddingBottom: 8 }}>
          {prestadores.map(p => {
            const verificado = p.plano && p.plano !== 'basico'
            const ehMaisAvaliado = maxAvaliacoes > 0 && (p.totalAvaliacoes || 0) === maxAvaliacoes
            const ehMelhorNota = maxNota > 0 && (p.avaliacao || 0) === maxNota

            return (
              <Card key={p.id} padding={20} style={{ minWidth: 280, maxWidth: 280, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <IconButton icon={<X size={14} />} tone="ghost" size={28} onClick={() => remover(p.id)} aria-label="Remover da comparação" />
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {p.foto_perfil ? (
                      <img src={p.foto_perfil} alt={p.nome} style={{ width: 72, height: 72, borderRadius: 20, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: colors.primary, margin: '0 auto' }}>
                        {Iniciais(p.nome)}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginTop: 10, marginBottom: 2 }}>{p.nome}</p>
                  <p style={{ fontSize: 12, color: colors.textSub, textTransform: 'capitalize', margin: 0 }}>{p.categoria} · {p.cidade}</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
                  {p.disponivel && <Badge tone="available">Disponível</Badge>}
                  {verificado && <Badge tone="verified" icon={<Check size={10} strokeWidth={3} />}>Verificado</Badge>}
                  {ehMaisAvaliado && <Badge tone="plan" icon={<Users size={10} />}>Mais avaliado</Badge>}
                  {ehMelhorNota && !ehMaisAvaliado && <Badge tone="plan" icon={<TrendingUp size={10} />}>Melhor nota</Badge>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, padding: 12, borderRadius: 14, background: colors.bg }}>
                  <Star size={16} fill={colors.secondary} color={colors.secondary} strokeWidth={0} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{p.avaliacao > 0 ? p.avaliacao : '—'}</span>
                  <span style={{ fontSize: 12, color: colors.textSub }}>({p.totalAvaliacoes || 0} avaliações)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {Object.entries(CRITERIOS).map(([key, label]) => {
                    const val = p.avaliacaoDetalhada?.[key] || 0
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 11, color: colors.textSub }}>{label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{val ? val.toFixed(1) : '—'}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 999, background: '#F1F5F9' }}>
                          <div style={{ height: 5, borderRadius: 999, width: `${(val / 5) * 100}%`, background: colors.secondary }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {p.descricao && (
                  <p style={{
                    fontSize: 12, color: colors.textSub, marginBottom: 16, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {p.descricao}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button size="sm" fullWidth onClick={() => navigate(`/profissional/${p.id}`)}>Ver perfil</Button>
                  <Button size="sm" variant="secondary" fullWidth icon={<MessageCircle size={14} />} onClick={() => navigate(`/profissional/${p.id}`)}>
                    Chat
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

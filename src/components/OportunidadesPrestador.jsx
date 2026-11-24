import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MapPin, Clock, ArrowRight, Lock, Lightbulb, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { rankearPedidos, avaliarPerfil } from '../lib/oportunidades'
import { colors, radius } from '../lib/design'
import Button from './ui/Button'

function haQuantoTempo(iso) {
  const h = (Date.now() - new Date(iso)) / 3600000
  if (h < 1) return 'agora há pouco'
  if (h < 24) return `há ${Math.floor(h)} h`
  const d = Math.floor(h / 24)
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
}

const rotuloCombinacao = (pontos) => (pontos >= 75 ? 'Ótima combinação' : pontos >= 55 ? 'Boa combinação' : 'Combina com você')

// Aba "Oportunidades" do painel do prestador: pedidos abertos que mais combinam com ele e dicas para o perfil render mais.
export default function OportunidadesPrestador({ prestador }) {
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const [pedidos, servicos, candidaturas, fotos] = await Promise.all([
        supabase.from('pedidos_servico')
          .select('id, titulo, categoria_id, servico_id, cidade, estado, criado_em, orcamento_min, orcamento_max, prazo, categorias(nome), servicos_catalogo(nome)')
          .eq('status', 'aberto').eq('pago', true).neq('cliente_user_id', prestador.user_id)
          .order('criado_em', { ascending: false }).limit(100),
        supabase.from('prestador_servicos').select('servico_id').eq('prestador_id', prestador.id),
        supabase.from('candidaturas').select('pedido_id').eq('prestador_id', prestador.id),
        supabase.from('portfolio_prestador').select('id', { count: 'exact', head: true }).eq('prestador_id', prestador.id),
      ])
      if (cancelado) return
      const servicosIds = new Set((servicos.data || []).map(s => s.servico_id))
      const jaRespondeu = new Set((candidaturas.data || []).map(c => c.pedido_id))
      setDados({
        oportunidades: rankearPedidos(pedidos.data || [], prestador, servicosIds, jaRespondeu, 10),
        perfil: avaliarPerfil({ prestador, totalServicosMarcados: servicosIds.size, totalFotos: fotos.count || 0 }),
        totalAbertos: (pedidos.data || []).length,
      })
    })()
    return () => { cancelado = true }
  }, [prestador.id])

  if (!dados) return <p style={{ fontSize: 14, color: colors.textSub, padding: '24px 0' }}>Procurando oportunidades para você...</p>

  const { oportunidades, perfil } = dados
  const podeResponder = prestador.plano_id === 'premium'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Perfil completo + dicas */}
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: radius.card, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <strong style={{ fontSize: 16, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb size={18} color={colors.secondary} /> Seu perfil está {perfil.percentual}% completo</strong>
        </div>
        <div style={{ height: 10, background: '#E8F6EC', borderRadius: 99, overflow: 'hidden' }} role="progressbar" aria-valuenow={perfil.percentual} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${perfil.percentual}%`, height: '100%', background: colors.primary, borderRadius: 99, transition: 'width .4s ease' }} />
        </div>
        {perfil.dicas.length === 0 ? (
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: colors.primaryHover, margin: '12px 0 0', fontWeight: 600 }}><CheckCircle2 size={16} /> Tudo certo! Seu perfil está pronto para receber clientes.</p>
        ) : (
          <ul style={{ margin: '12px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.55, color: colors.text, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {perfil.dicas.slice(0, 3).map(d => <li key={d}>{d}</li>)}
          </ul>
        )}
      </div>

      {/* Pedidos que combinam */}
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, color: colors.text, margin: '0 0 4px' }}>
          <Sparkles size={20} color={colors.primary} /> Pedidos que combinam com você
        </h2>
        <p style={{ fontSize: 13, color: colors.textSub, margin: '0 0 14px' }}>Ordenados pelo quanto combinam com a sua profissão, os serviços que você faz, a sua cidade e a data do pedido.</p>

        {!podeResponder && oportunidades.length > 0 && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '12px 16px', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#92610A', display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={15} /> Você pode ver os pedidos, mas responder é um recurso do plano Premium.</span>
            <Button size="sm" variant="secondary" onClick={() => navigate('/planos')}>Ver planos</Button>
          </div>
        )}

        {oportunidades.length === 0 ? (
          <div style={{ textAlign: 'center', background: '#fff', border: `1px dashed ${colors.border}`, borderRadius: radius.card, padding: '32px 20px' }}>
            <Sparkles size={34} color="#D1D5DB" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>Nenhum pedido combinando agora</p>
            <p style={{ fontSize: 13, color: colors.textSub, margin: 0, lineHeight: 1.5 }}>Quanto mais serviços você marcar, mais pedidos aparecem aqui. Volte mais tarde: os pedidos novos entram o tempo todo.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {oportunidades.map(p => (
              <div key={p.id} style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: radius.card, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text }}>{p.titulo}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textSub, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span>{p.categorias?.nome}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{p.cidade}{p.estado ? `, ${p.estado}` : ''}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{haQuantoTempo(p.criado_em)}</span>
                    </p>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 800, color: colors.primaryHover, background: '#DCFCE7', padding: '4px 10px', borderRadius: 999 }}>{rotuloCombinacao(p.oportunidade.pontos)}</span>
                </div>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.oportunidade.motivos.map(m => (
                    <li key={m} style={{ fontSize: 12, fontWeight: 600, color: colors.primaryHover, background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: 999 }}>{m}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 14 }}>
                  <Button size="sm" variant="dark" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => navigate(`/pedidos/${p.id}`)}>Ver pedido</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

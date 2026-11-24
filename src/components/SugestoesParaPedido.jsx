import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { buscarPrestadores } from '../lib/hooks'
import { rankearPrestadores } from '../lib/oportunidades'
import { colors, spacing } from '../lib/design'
import CartaoSugestao from './CartaoSugestao'

// Mostra ao dono de um pedido aberto os profissionais que melhor combinam com ele, enquanto ele espera propostas.
export default function SugestoesParaPedido({ pedido }) {
  const [sugestoes, setSugestoes] = useState(null)

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const resultado = await buscarPrestadores({ categoria: pedido.categoria_id, limite: 30 })
      if (cancelado || !resultado) return
      let idsComServico = new Set()
      if (pedido.servico_id) {
        const { data } = await supabase.from('prestador_servicos').select('prestador_id').eq('servico_id', pedido.servico_id)
        idsComServico = new Set((data || []).map(r => r.prestador_id))
      }
      setSugestoes(rankearPrestadores(resultado.prestadores, { cidade: pedido.cidade, estado: pedido.estado, idsComServico }, 3))
    })()
    return () => { cancelado = true }
  }, [pedido.id, pedido.categoria_id, pedido.servico_id, pedido.cidade, pedido.estado])

  if (sugestoes === null) return null

  return (
    <section style={{ marginBottom: spacing.card }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: colors.text, margin: '0 0 4px' }}>
        <Sparkles size={18} color={colors.primary} /> Profissionais que combinam com o seu pedido
      </h2>
      {sugestoes.length === 0 ? (
        <p style={{ fontSize: 14, color: colors.textSub, margin: '6px 0 0', lineHeight: 1.5 }}>
          Ainda não temos profissionais dessa categoria cadastrados. O seu pedido continua aberto para quando alguém chegar.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 13, color: colors.textSub, margin: '0 0 14px' }}>Escolhidos pelas avaliações, disponibilidade e distância. Chame quem preferir, sem esperar.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {sugestoes.map((p, i) => <CartaoSugestao key={p.id} prestador={p} destaque={i === 0} />)}
          </div>
        </>
      )}
    </section>
  )
}

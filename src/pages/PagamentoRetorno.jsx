import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { colors } from '../lib/design'
import Button from '../components/ui/Button'

const DESTINO_SUCESSO = { mensalidade: '/painel', boost: '/boost', creditos: '/pedidos' }
const DESTINO_RETRY = { mensalidade: '/planos', boost: '/boost', creditos: '/pedidos/novo' }

const FRASE_LIBERACAO = {
  mensalidade: 'seu plano é liberado automaticamente',
  boost: 'seu boost é liberado automaticamente',
  creditos: 'seus créditos são liberados automaticamente',
}

// Página pra onde a Asaas redireciona depois do Checkout hospedado —
// não ativa nada aqui, a ativação de verdade acontece via webhook
// (ver api/webhook-asaas.js) quando o pagamento é confirmado.
export default function PagamentoRetorno() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const status = params.get('status') // 'sucesso' | 'cancelado' | 'expirado'
  const tipo = params.get('tipo') || 'mensalidade'
  const fraseLiberacao = FRASE_LIBERACAO[tipo] || 'seu pedido é liberado automaticamente'

  if (status === 'sucesso') {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={32} color={colors.primary} strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Pagamento em processamento</h2>
        <p className="text-sm mb-6" style={{ color: colors.textSub }}>
          Assim que a Asaas confirmar o pagamento, {fraseLiberacao} — geralmente leva só alguns instantes.
        </p>
        <Button fullWidth onClick={() => navigate(DESTINO_SUCESSO[tipo] || '/')}>
          Continuar
        </Button>
      </div>
    )
  }

  if (status === 'expirado') {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Clock size={32} color="#D97706" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>O link expirou</h2>
        <p className="text-sm mb-6" style={{ color: colors.textSub }}>
          Não tem problema — nada foi cobrado. Tente de novo quando quiser.
        </p>
        <Button fullWidth onClick={() => navigate(DESTINO_RETRY[tipo] || '/')}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <XCircle size={32} color={colors.textSub} strokeWidth={1.8} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Pagamento cancelado</h2>
      <p className="text-sm mb-6" style={{ color: colors.textSub }}>
        Nada foi cobrado. Se quiser, você pode tentar novamente.
      </p>
      <Button fullWidth onClick={() => navigate(DESTINO_RETRY[tipo] || '/')}>
        Voltar
      </Button>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import IconButton from '../components/ui/IconButton'

export default function Termos() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <IconButton icon={<ArrowLeft size={18} />} tone="ghost" size={38} onClick={() => navigate(-1)} aria-label="Voltar" />
        <h1 className="text-xl font-semibold" style={{ color: colors.text }}>Termos de Uso e Privacidade</h1>
      </div>

      <Card padding={24} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p className="text-xs mb-4" style={{ color: colors.textSub }}>Versão 1.0 — Julho de 2026</p>

          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>1. Sobre o Prestador</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            O Prestador é uma plataforma digital que conecta clientes a prestadores de serviços. Atuamos como intermediários e não somos responsáveis pela qualidade, pontualidade ou resultado dos serviços prestados entre as partes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>2. Cadastro e responsabilidades</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            Ao se cadastrar, você declara que as informações fornecidas são verdadeiras. Prestadores são responsáveis pela veracidade de seus dados, qualificações e portfólio. É proibido criar perfis falsos, usar dados de terceiros ou divulgar informações enganosas.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>3. Coleta e uso de dados (LGPD)</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            Coletamos nome, e-mail, telefone, localização e dados de uso para operar a plataforma, melhorar nossos serviços e enviar comunicações relevantes. Seus dados nunca serão vendidos a terceiros. Você pode solicitar a exclusão da sua conta e dados a qualquer momento pelo e-mail contato@prestador.app.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>4. Pagamentos</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            Os pagamentos são processados pela Asaas Pagamentos S.A. O Prestador não armazena dados de cartão de crédito. Mensalidades são cobradas antecipadamente e não são reembolsáveis após o período de 7 dias corridos do pagamento.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>5. Avaliações</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            As avaliações devem ser honestas e baseadas em experiências reais. É proibido criar avaliações falsas, solicitar ou oferecer benefícios em troca de avaliações positivas. O Prestador pode remover avaliações que violem estas regras.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>6. Cancelamento</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            Você pode cancelar sua conta a qualquer momento. O cancelamento não gera reembolso de períodos já pagos. O Prestador pode suspender ou encerrar contas que violem estes termos.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: colors.text }}>7. Contato</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>
            Dúvidas sobre privacidade ou estes termos: contato@prestador.app
          </p>
        </div>
      </Card>
    </div>
  )
}

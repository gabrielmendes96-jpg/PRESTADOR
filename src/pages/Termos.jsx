import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Termos() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:opacity-70" style={{ color: '#7C9485' }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 20 }} aria-hidden="true"></i>
        </button>
        <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>Termos de Uso e Privacidade</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '0.5px solid #DDE3DD' }}>
        <div>
          <p className="text-xs mb-4" style={{ color: '#7C9485' }}>Versão 1.0 — Julho de 2026</p>

          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>1. Sobre o Prestador</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            O Prestador é uma plataforma digital que conecta clientes a prestadores de serviços. Atuamos como intermediários e não somos responsáveis pela qualidade, pontualidade ou resultado dos serviços prestados entre as partes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>2. Cadastro e responsabilidades</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            Ao se cadastrar, você declara que as informações fornecidas são verdadeiras. Prestadores são responsáveis pela veracidade de seus dados, qualificações e portfólio. É proibido criar perfis falsos, usar dados de terceiros ou divulgar informações enganosas.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>3. Coleta e uso de dados (LGPD)</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            Coletamos nome, e-mail, telefone, localização e dados de uso para operar a plataforma, melhorar nossos serviços e enviar comunicações relevantes. Seus dados nunca serão vendidos a terceiros. Você pode solicitar a exclusão da sua conta e dados a qualquer momento pelo e-mail contato@prestador.app.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>4. Pagamentos</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            Os pagamentos são processados pela Asaas Pagamentos S.A. O Prestador não armazena dados de cartão de crédito. Mensalidades são cobradas antecipadamente e não são reembolsáveis após o período de 7 dias corridos do pagamento.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>5. Avaliações</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            As avaliações devem ser honestas e baseadas em experiências reais. É proibido criar avaliações falsas, solicitar ou oferecer benefícios em troca de avaliações positivas. O Prestador pode remover avaliações que violem estas regras.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>6. Cancelamento</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            Você pode cancelar sua conta a qualquer momento. O cancelamento não gera reembolso de períodos já pagos. O Prestador pode suspender ou encerrar contas que violem estes termos.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1F2D24' }}>7. Contato</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#5F6F65' }}>
            Dúvidas sobre privacidade ou estes termos: contato@prestador.app
          </p>
        </div>
      </div>
    </div>
  )
}

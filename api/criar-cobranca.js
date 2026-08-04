// api/criar-cobranca.js
// Cria um Checkout hospedado no Asaas (Pix ou cartão) — o número do
// cartão nunca toca este servidor, quem coleta é a própria página da
// Asaas. Ver supabase.../docs.asaas.com/reference/create-new-checkout.

import { checkRateLimit, getClientIp } from './rate-limit.js'
import { verificarUsuario } from './_verificarUsuario.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip, 5, 60000)) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' })
  }

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })
  const userId = usuarioAutenticado.id

  const { tipo, descricao, extra, nomeCliente, emailCliente, cpfCliente } = req.body

  if (!tipo || !extra) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  // Preço vem sempre do servidor, nunca do valor enviado pelo cliente —
  // do contrário qualquer requisição poderia forjar um valor menor.
  const PRECOS_PLANO = { basico: 49, profissional: 99, premium: 199 }
  const PRECOS_CREDITOS = { 1: 9, 5: 35, 10: 59, 20: 99 }
  const PRECOS_BOOST = { '7dias': 20, '15dias': 39, '30dias': 59 }

  const TABELAS_PRECO = { mensalidade: PRECOS_PLANO, creditos: PRECOS_CREDITOS, boost: PRECOS_BOOST }
  const tabela = TABELAS_PRECO[tipo]
  const valor = tabela?.[extra]
  if (!valor) {
    return res.status(400).json({ error: 'Item inválido' })
  }

  const ASAAS_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'

  const ASAAS_KEY = process.env.ASAAS_SANDBOX === 'true'
    ? process.env.ASAAS_KEY_SANDBOX
    : process.env.ASAAS_KEY_PROD

  const origem = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : '')

  try {
    const dadosCheckout = {
      billingTypes: ['CREDIT_CARD', 'PIX'],
      chargeTypes: ['DETACHED'],
      minutesToExpire: 1440,
      externalReference: `${tipo}:${userId}:${extra}`,
      callback: {
        successUrl: `${origem}/pagamento/retorno?status=sucesso&tipo=${tipo}`,
        cancelUrl: `${origem}/pagamento/retorno?status=cancelado&tipo=${tipo}`,
        expiredUrl: `${origem}/pagamento/retorno?status=expirado&tipo=${tipo}`,
      },
      items: [
        { name: descricao || 'Prestador App', quantity: 1, value: valor },
      ],
      customerData: {
        name: nomeCliente || 'Cliente Prestador',
        email: emailCliente,
        cpfCnpj: cpfCliente,
      },
    }

    const resCheckout = await fetch(`${ASAAS_URL}/checkouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body: JSON.stringify(dadosCheckout)
    })

    const checkout = await resCheckout.json()

    if (checkout.errors) {
      console.error('Erro ao criar checkout:', checkout.errors)
      return res.status(400).json({ error: checkout.errors[0]?.description || 'Erro ao criar cobrança' })
    }

    return res.status(200).json({
      link: checkout.link,
      checkoutId: checkout.id,
    })

  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' })
  }
}

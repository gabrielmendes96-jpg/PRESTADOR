// api/criar-cobranca-servico.js
// Cria um Checkout hospedado no Asaas (Pix ou boleto) pro cliente pagar
// um serviço já combinado com o prestador. O dinheiro fica "retido" na
// conta da plataforma até a liberação (ver api/_liberarPagamentoServico.js)
// — por isso, ao contrário de api/criar-cobranca.js, não usa split.
// Sem cartão nesta rodada: parcelado libera o dinheiro pra nossa conta
// aos poucos, o que não combina com repassar o valor cheio de uma vez.

import { checkRateLimit, getClientIp } from './rate-limit.js'
import { verificarUsuario } from './_verificarUsuario.js'

function formatarTelefoneAsaas(telefone) {
  const digitos = (telefone || '').replace(/\D/g, '')
  if (digitos.length === 11 && digitos[2] === '9') {
    return digitos.slice(0, 2) + digitos.slice(3)
  }
  return digitos
}

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

  const {
    pedidoId, nomeCliente, emailCliente, cpfCliente,
    telefoneCliente, cepCliente, enderecoCliente, numeroCliente, bairroCliente, complementoCliente,
  } = req.body

  if (!pedidoId) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  // O preço vem sempre do pedido já combinado no servidor — nunca do
  // corpo da requisição, do contrário qualquer um poderia forjar um
  // valor menor.
  const { data: pedido } = await supabase
    .from('pedidos_servico')
    .select('id, cliente_user_id, valor_acordado, status, status_pagamento, titulo')
    .eq('id', pedidoId)
    .single()

  if (!pedido || pedido.cliente_user_id !== usuarioAutenticado.id) {
    return res.status(404).json({ error: 'Pedido não encontrado' })
  }
  if (pedido.status !== 'em_andamento') {
    return res.status(400).json({ error: 'Este pedido ainda não tem um prestador confirmado' })
  }
  if (!pedido.valor_acordado) {
    return res.status(400).json({ error: 'Valor do serviço ainda não foi combinado' })
  }
  if (pedido.status_pagamento) {
    return res.status(400).json({ error: 'Este pedido já foi pago' })
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
      // O Checkout da Asaas só aceita CREDIT_CARD ou PIX (BOLETO não é
      // suportado neste produto) — sem cartão aqui mesmo, pela decisão
      // de não ter parcelamento ainda.
      billingTypes: ['PIX'],
      chargeTypes: ['DETACHED'],
      minutesToExpire: 1440,
      externalReference: `servico:${pedido.cliente_user_id}:${pedidoId}`,
      callback: {
        successUrl: `${origem}/pagamento/retorno?status=sucesso&tipo=servico`,
        cancelUrl: `${origem}/pagamento/retorno?status=cancelado&tipo=servico`,
        expiredUrl: `${origem}/pagamento/retorno?status=expirado&tipo=servico`,
      },
      // O campo name do Checkout aceita no máximo 30 caracteres.
      items: [
        { name: (pedido.titulo || 'Serviço').slice(0, 30), quantity: 1, value: pedido.valor_acordado },
      ],
      customerData: {
        name: nomeCliente || 'Cliente Prestador',
        email: emailCliente,
        cpfCnpj: cpfCliente,
        phone: formatarTelefoneAsaas(telefoneCliente),
        postalCode: cepCliente,
        address: enderecoCliente,
        addressNumber: numeroCliente,
        province: bairroCliente,
        complement: complementoCliente || undefined,
      },
    }

    const resCheckout = await fetch(`${ASAAS_URL}/checkouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body: JSON.stringify(dadosCheckout)
    })

    const checkout = await resCheckout.json()

    if (checkout.errors) {
      console.error('Erro ao criar checkout de serviço:', checkout.errors)
      return res.status(400).json({ error: checkout.errors[0]?.description || 'Erro ao criar cobrança' })
    }

    return res.status(200).json({
      link: checkout.link,
      checkoutId: checkout.id,
    })

  } catch (error) {
    console.error('Erro ao criar checkout de serviço:', error)
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' })
  }
}

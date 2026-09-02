// api/criar-cobranca.js
// Cria um Checkout hospedado no Asaas (Pix ou cartão) — o número do
// cartão nunca toca este servidor, quem coleta é a própria página da
// Asaas. Ver supabase.../docs.asaas.com/reference/create-new-checkout.

import { checkRateLimit, getClientIp } from './_rateLimit.js'
import { verificarUsuario } from './_verificarUsuario.js'

// O campo "phone" da Asaas espera 10 dígitos (DDD + 8 números), mas
// todo celular brasileiro tem 11 (DDD + 9 + 8 números) — sem isso a
// Asaas recusa a cobrança com "campo phoneNumber é inválido".
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
  if (!(await checkRateLimit(`criar-cobranca:${ip}`, 5, 60))) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' })
  }

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })
  const userId = usuarioAutenticado.id

  const {
    tipo, descricao, extra, pedidoId, nomeCliente, emailCliente, cpfCliente,
    telefoneCliente, cepCliente, enderecoCliente, numeroCliente, bairroCliente, complementoCliente,
  } = req.body

  if (!tipo || (tipo !== 'servico' && !extra) || (tipo === 'servico' && !pedidoId)) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  // Preço vem sempre do servidor, nunca do valor enviado pelo cliente —
  // do contrário qualquer requisição poderia forjar um valor menor.
  const PRECOS_PLANO = { basico: 49, profissional: 99, premium: 199 }
  const PRECOS_CREDITOS = { 1: 9, 5: 35, 10: 59, 20: 99 }
  const PRECOS_BOOST = { '7dias': 20, '15dias': 39, '30dias': 59 }

  let valor, itemNome, billingTypes = ['CREDIT_CARD', 'PIX'], pedido

  if (tipo === 'servico') {
    // Pagamento protegido de um serviço específico — o preço é o valor
    // já combinado com o prestador (pedidos_servico.valor_acordado),
    // nunca um valor fixo de tabela. Sem cartão aqui: parcelado libera
    // o dinheiro pra nossa conta aos poucos, o que não combina com
    // repassar o valor cheio ao prestador logo após o serviço.
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: p } = await supabase
      .from('pedidos_servico')
      .select('id, cliente_user_id, valor_acordado, status, status_pagamento, titulo')
      .eq('id', pedidoId)
      .single()

    if (!p || p.cliente_user_id !== userId) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }
    if (p.status !== 'em_andamento') {
      return res.status(400).json({ error: 'Este pedido ainda não tem um prestador confirmado' })
    }
    if (!p.valor_acordado) {
      return res.status(400).json({ error: 'Valor do serviço ainda não foi combinado' })
    }
    if (p.status_pagamento) {
      return res.status(400).json({ error: 'Este pedido já foi pago' })
    }

    pedido = p
    valor = p.valor_acordado
    // O Checkout da Asaas só aceita CREDIT_CARD ou PIX (BOLETO não é
    // suportado neste produto).
    billingTypes = ['PIX']
    // items[].name tem limite de 30 caracteres no Checkout.
    itemNome = (p.titulo || 'Serviço').slice(0, 30)
  } else {
    const TABELAS_PRECO = { mensalidade: PRECOS_PLANO, creditos: PRECOS_CREDITOS, boost: PRECOS_BOOST }
    const tabela = TABELAS_PRECO[tipo]
    valor = tabela?.[extra]
    if (!valor) {
      return res.status(400).json({ error: 'Item inválido' })
    }
    itemNome = descricao || 'Prestador App'
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
      billingTypes,
      chargeTypes: ['DETACHED'],
      minutesToExpire: 1440,
      externalReference: tipo === 'servico' ? `servico:${pedido.cliente_user_id}:${pedidoId}` : `${tipo}:${userId}:${extra}`,
      callback: {
        successUrl: `${origem}/pagamento/retorno?status=sucesso&tipo=${tipo}`,
        cancelUrl: `${origem}/pagamento/retorno?status=cancelado&tipo=${tipo}`,
        expiredUrl: `${origem}/pagamento/retorno?status=expirado&tipo=${tipo}`,
      },
      items: [
        { name: itemNome, quantity: 1, value: valor },
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

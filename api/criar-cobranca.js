// api/criar-cobranca.js
// Cria uma cobrança no Asaas (Pix ou cartão)

import { checkRateLimit, getClientIp } from './rate-limit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip, 5, 60000)) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' })
  }

  const { tipo, userId, valor, descricao, extra, nomeCliente, emailCliente, cpfCliente, cartao } = req.body

  if (!tipo || !userId || !valor) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  const ASAAS_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'

  const ASAAS_KEY = process.env.ASAAS_SANDBOX === 'true'
    ? process.env.ASAAS_KEY_SANDBOX
    : process.env.ASAAS_KEY_PROD

  try {
    // 1. Criar ou buscar cliente no Asaas
    let customerId = null

    try {
      const buscaCliente = await fetch(`${ASAAS_URL}/customers?email=${emailCliente}`, {
        headers: { access_token: ASAAS_KEY }
      })
      const clientesExistentes = await buscaCliente.json()

      if (clientesExistentes.data && clientesExistentes.data.length > 0) {
        customerId = clientesExistentes.data[0].id
      } else {
        const criarCliente = await fetch(`${ASAAS_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
          body: JSON.stringify({
            name: nomeCliente || 'Cliente Prestador',
            email: emailCliente,
            cpfCnpj: cpfCliente || '00000000191', // CPF válido para sandbox
            externalReference: userId,
          })
        })
        const novoCliente = await criarCliente.json()
        if (novoCliente.errors) {
          console.error('Erro ao criar cliente:', novoCliente.errors)
          return res.status(400).json({ error: 'Erro ao criar cliente no Asaas: ' + novoCliente.errors[0]?.description })
        }
        customerId = novoCliente.id
      }
    } catch (e) {
      console.error('Erro na busca/criação do cliente:', e)
      return res.status(500).json({ error: 'Erro ao conectar com Asaas' })
    }

    // 2. Criar cobrança
    const dadosCobranca = {
      customer: customerId,
      billingType: cartao ? 'CREDIT_CARD' : 'PIX',
      value: valor,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: descricao,
      externalReference: `${tipo}:${userId}:${extra}`,
    }

    // Adicionar dados do cartão se for pagamento com cartão
    if (cartao) {
      dadosCobranca.creditCard = {
        holderName: cartao.nomeCartao,
        number: cartao.numero,
        expiryMonth: cartao.mesExpiracao,
        expiryYear: cartao.anoExpiracao,
        ccv: cartao.cvv,
      }
      dadosCobranca.creditCardHolderInfo = {
        name: cartao.nomeCartao,
        email: emailCliente,
        cpfCnpj: cpfCliente || '00000000000',
        postalCode: cartao.cep || '00000000',
        addressNumber: cartao.numero_endereco || '0',
      }
    }

    const resCobranca = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body: JSON.stringify(dadosCobranca)
    })

    const cobranca = await resCobranca.json()

    if (cobranca.errors) {
      return res.status(400).json({ error: cobranca.errors[0]?.description || 'Erro ao criar cobrança' })
    }

    // 3. Se Pix, buscar QR Code
    let pixQrCode = null
    if (!cartao && cobranca.id) {
      const resPix = await fetch(`${ASAAS_URL}/payments/${cobranca.id}/pixQrCode`, {
        headers: { access_token: ASAAS_KEY }
      })
      const pixData = await resPix.json()
      pixQrCode = {
        payload: pixData.payload,
        encodedImage: pixData.encodedImage,
        expirationDate: pixData.expirationDate,
      }
    }

    return res.status(200).json({
      cobrancaId: cobranca.id,
      status: cobranca.status,
      valor: cobranca.value,
      pixQrCode,
      linkPagamento: cobranca.invoiceUrl,
    })

  } catch (error) {
    console.error('Erro ao criar cobrança:', error)
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' })
  }
}

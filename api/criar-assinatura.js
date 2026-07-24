// api/criar-assinatura.js
// Cria assinatura recorrente mensal no Asaas

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, planoId, valor, nomeCliente, emailCliente, cpfCliente } = req.body

  const ASAAS_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'

  const ASAAS_KEY = process.env.ASAAS_SANDBOX === 'true'
    ? process.env.ASAAS_KEY_SANDBOX
    : process.env.ASAAS_KEY_PROD

  try {
    // 1. Buscar ou criar cliente no Asaas
    let customerId = null
    const buscaCliente = await fetch(`${ASAAS_URL}/customers?email=${emailCliente}`, {
      headers: { access_token: ASAAS_KEY }
    })
    const clientesExistentes = await buscaCliente.json()

    if (clientesExistentes.data?.length > 0) {
      customerId = clientesExistentes.data[0].id
    } else {
      const criarCliente = await fetch(`${ASAAS_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
        body: JSON.stringify({
          name: nomeCliente || 'Prestador',
          email: emailCliente,
          cpfCnpj: cpfCliente || '00000000191',
          externalReference: userId,
        })
      })
      const novoCliente = await criarCliente.json()
      customerId = novoCliente.id
    }

    // 2. Criar assinatura recorrente mensal via Pix
    const hoje = new Date()
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate())

    const resAssinatura = await fetch(`${ASAAS_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: valor,
        nextDueDate: proximoMes.toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Prestador App — Plano ${planoId} (mensal)`,
        externalReference: `mensalidade:${userId}:${planoId}`,
      })
    })

    const assinatura = await resAssinatura.json()

    if (assinatura.errors) {
      return res.status(400).json({ error: assinatura.errors[0]?.description })
    }

    // 3. Salvar assinatura no Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()
    if (prestador) {
      await supabase.from('assinaturas').upsert({
        prestador_id: prestador.id,
        plano_id: planoId,
        status: 'ativo',
        asaas_subscription_id: assinatura.id,
        proxima_cobranca: proximoMes.toISOString().split('T')[0],
        recorrente: true,
        valor,
      })

      await supabase.from('prestadores').update({
        plano_id: planoId,
        plano_status: 'ativo',
      }).eq('user_id', userId)
    }

    // 4. Buscar primeiro Pix da assinatura
    const resCobrancas = await fetch(`${ASAAS_URL}/subscriptions/${assinatura.id}/payments`, {
      headers: { access_token: ASAAS_KEY }
    })
    const cobrancas = await resCobrancas.json()
    const primeiraCobranca = cobrancas.data?.[0]

    let pixQrCode = null
    if (primeiraCobranca?.id) {
      const resPix = await fetch(`${ASAAS_URL}/payments/${primeiraCobranca.id}/pixQrCode`, {
        headers: { access_token: ASAAS_KEY }
      })
      const pixData = await resPix.json()
      pixQrCode = { payload: pixData.payload, encodedImage: pixData.encodedImage }
    }

    return res.status(200).json({
      assinaturaId: assinatura.id,
      status: assinatura.status,
      pixQrCode,
    })

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return res.status(500).json({ error: 'Erro interno ao criar assinatura' })
  }
}

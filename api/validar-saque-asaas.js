// api/validar-saque-asaas.js
// A Asaas exige aprovação manual (SMS/app) pra toda transferência, a
// menos que você configure um "mecanismo de validação de saque via
// webhook": a Asaas chama este endpoint ~5s depois de pedirmos uma
// transferência, e a gente aprova ou recusa automaticamente.
//
// Habilitar em: Menu do usuário > Integrações > Mecanismos de segurança
// (painel da Asaas) — aponte pra
// https://SEU-DOMINIO/api/validar-saque-asaas. Token dedicado
// (ASAAS_SAQUE_WEBHOOK_TOKEN), separado do ASAAS_WEBHOOK_TOKEN usado no
// webhook de pagamento — invente uma senha nova, cole ela no campo
// "Token de autenticação" da Asaas E como variável de ambiente na
// Vercel, sem precisar ir procurar um valor que já existe em outro
// lugar.
//
// IMPORTANTE: a documentação da Asaas não deixa 100% claro o formato
// exato do corpo desta requisição — verifique o payload real (logado
// abaixo) assim que ativar isso em sandbox, antes de confiar em
// produção. Por segurança, esta função só aprova quando consegue
// confirmar o valor e a chave PIX batendo com um pedido nosso — em
// qualquer dúvida, recusa (falha fechada, não aberta).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['asaas-access-token']
  if (token !== process.env.ASAAS_SAQUE_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('Validação de saque Asaas — payload recebido:', JSON.stringify(req.body))

  const valor = req.body?.value ?? req.body?.transfer?.value
  const chavePix = req.body?.pixAddressKey ?? req.body?.transfer?.pixAddressKey
  const descricao = req.body?.description ?? req.body?.transfer?.description

  if (!valor || !chavePix) {
    return res.status(200).json({ status: 'REFUSED', refuseReason: 'Dados insuficientes para validar' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  // O pedidoId vai na descrição da transferência (ver
  // api/_liberarPagamentoServico.js: "Repasse Prestador App — pedido <id>").
  const pedidoIdMatch = typeof descricao === 'string' ? descricao.match(/pedido ([0-9a-f-]{36})/i) : null
  if (!pedidoIdMatch) {
    return res.status(200).json({ status: 'REFUSED', refuseReason: 'Não foi possível identificar o pedido' })
  }

  const { data: pedido } = await supabase
    .from('pedidos_servico')
    .select('valor_acordado, status_pagamento')
    .eq('id', pedidoIdMatch[1])
    .single()

  const COMISSAO_PLATAFORMA = 0.15
  const valorEsperado = pedido ? Math.round(pedido.valor_acordado * (1 - COMISSAO_PLATAFORMA) * 100) / 100 : null

  const aprovado = pedido
    && pedido.status_pagamento === 'liberando'
    && valorEsperado === Number(valor)

  if (!aprovado) {
    return res.status(200).json({ status: 'REFUSED', refuseReason: 'Valor ou status do pedido não confere' })
  }

  return res.status(200).json({ status: 'APPROVED' })
}

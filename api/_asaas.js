// api/_asaas.js
// Acesso à API da Asaas compartilhado entre criar-cobranca, assinatura,
// webhook-asaas e excluir-conta. Arquivo com "_" no começo não conta como
// função serverless (limite de 12 do plano Hobby da Vercel).

export function configAsaas() {
  const sandbox = process.env.ASAAS_SANDBOX === 'true'
  return {
    url: sandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/api/v3',
    key: sandbox ? process.env.ASAAS_KEY_SANDBOX : process.env.ASAAS_KEY_PROD,
  }
}

async function chamar(metodo, caminho, corpo) {
  const { url, key } = configAsaas()
  const res = await fetch(`${url}${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', access_token: key },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

// Cancela uma assinatura recorrente. 404 conta como sucesso (já não existe).
export async function cancelarAssinaturaAsaas(subscriptionId) {
  const r = await chamar('DELETE', `/subscriptions/${subscriptionId}`)
  if (r.ok || r.status === 404) return { ok: true }
  return { ok: false, motivo: r.json.errors?.[0]?.description || `HTTP ${r.status}` }
}

export async function buscarClienteAsaas(customerId) {
  const r = await chamar('GET', `/customers/${customerId}`)
  return r.ok ? r.json : null
}

// Um cliente da Asaas por usuário nosso, identificado por externalReference
// = id do usuário. Todo pagamento (inclusive as renovações automáticas)
// traz o id desse cliente, que é como o webhook descobre de quem é a
// cobrança quando a Asaas não repassa nosso externalReference. O checkout
// recorrente exige telefone e endereço completos no cliente.
export async function obterOuCriarClienteAsaas({ userId, nome, email, cpfCnpj, telefone, cep, endereco, numero, bairro, complemento }) {
  const dados = {
    name: nome, email, cpfCnpj, phone: telefone, postalCode: cep,
    address: endereco, addressNumber: numero, province: bairro,
    complement: complemento || undefined, externalReference: userId,
  }

  const busca = await chamar('GET', `/customers?externalReference=${encodeURIComponent(userId)}`)
  const existente = busca.json.data?.[0]

  const r = existente
    ? await chamar('POST', `/customers/${existente.id}`, dados) // a Asaas atualiza via POST
    : await chamar('POST', '/customers', dados)

  if (!r.ok) return { ok: false, motivo: r.json.errors?.[0]?.description || 'Não foi possível cadastrar seus dados na Asaas' }
  return { ok: true, id: r.json.id }
}

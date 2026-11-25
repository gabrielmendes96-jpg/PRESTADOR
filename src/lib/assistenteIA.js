import { supabase } from './supabase'

// Pede à IA (rota /api/assistente) para entender o que a pessoa escreveu: devolve { busca, categoria_id, resumo } ou null.
// Qualquer falha (IA desligada, sem internet, demora) devolve null e o assistente segue só com as regras locais.
let iaDesligada = false // depois de saber que a IA está desligada, não pergunta de novo nesta visita

export async function interpretarComIA(texto, limiteMs = 7000) {
  if (iaDesligada) return null
  const controle = new AbortController()
  const relogio = setTimeout(() => controle.abort(), limiteMs)
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    const r = await fetch('/api/assistente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ texto }),
      signal: controle.signal,
    })
    if (!r.ok) return null
    const json = await r.json()
    if (json?.motivo === 'ia_desligada') iaDesligada = true
    return json?.ok && json.busca ? json : null
  } catch {
    return null
  } finally {
    clearTimeout(relogio)
  }
}

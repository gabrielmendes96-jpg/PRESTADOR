// api/assistente.js
// Entende, com IA, o que o cliente escreveu ("minha torneira está pingando") e devolve palavras de busca e a categoria.
// Só funciona se existir ANTHROPIC_API_KEY na Vercel; sem ela responde { ok: false } e o app segue só com as regras locais.
// Cada chamada custa dinheiro, por isso há limite por visitante (por minuto e por dia).
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from './_rateLimit.js'
import { validarTexto, interpretarPedido, chaveParecidaComDaAnthropic } from './_assistenteIA.js'

const MODELO = process.env.ASSISTENTE_MODELO || 'claude-opus-5-5'

let cacheCategorias = { em: 0, lista: [] }
async function categoriasDoBanco() {
  if (Date.now() - cacheCategorias.em < 10 * 60 * 1000 && cacheCategorias.lista.length) return cacheCategorias.lista
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const { data } = await supabase.from('categorias').select('id, nome').order('ordem')
  if (data?.length) cacheCategorias = { em: Date.now(), lista: data }
  return cacheCategorias.lista
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!chaveParecidaComDaAnthropic(process.env.ANTHROPIC_API_KEY)) return res.status(200).json({ ok: false, motivo: 'ia_desligada' })

  const texto = validarTexto(req.body?.texto)
  if (!texto) return res.status(400).json({ ok: false, error: 'Escreva de 2 a 300 caracteres.' })

  const ip = getClientIp(req)
  const dentroDoLimite = (await checkRateLimit(`assistente:${ip}`, 6, 60)) && (await checkRateLimit(`assistente-dia:${ip}`, 40, 86400))
  if (!dentroDoLimite) return res.status(429).json({ ok: false, error: 'Muitas perguntas seguidas. Tente de novo em instantes.' })

  try {
    const categorias = await categoriasDoBanco()
    if (!categorias.length) return res.status(200).json({ ok: false, motivo: 'sem_categorias' })
    const cliente = new Anthropic({ timeout: 20000, maxRetries: 1 })
    const saida = await interpretarPedido(cliente, { texto, categorias, modelo: MODELO })
    return res.status(200).json(saida || { ok: false, motivo: 'sem_resposta' })
  } catch (erro) {
    // Falha da IA (cota, rede, modelo): não derruba o app, só avisa que o assistente seguirá sem ela.
    console.error('Assistente IA falhou:', erro instanceof Anthropic.APIError ? `${erro.status} ${erro.message}` : erro)
    return res.status(200).json({ ok: false, motivo: 'ia_indisponivel' })
  }
}

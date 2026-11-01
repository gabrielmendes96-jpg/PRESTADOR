import { supabase } from './supabase'

// Registra no banco (tabela alertas_sistema) quando uma tela quebra, para o admin ver na aba "Alertas".
// Nunca atrapalha o usuário: qualquer falha aqui é ignorada. No máximo 5 por visita e sem repetir o mesmo erro.
const LIMITE_POR_SESSAO = 5
const jaEnviados = new Set()

export function montarAlerta(erro, extra = {}) {
  const mensagem = String(erro?.message || erro || 'Erro desconhecido').slice(0, 480)
  return {
    tipo: 'erro_tela',
    mensagem,
    detalhe: [extra.componentStack, erro?.stack].filter(Boolean).join('\n').slice(0, 1400) || null,
    pagina: String(extra.pagina ?? (typeof location !== 'undefined' ? location.pathname : '')).slice(0, 190) || null,
  }
}

export function registrarErro(erro, extra = {}) {
  try {
    const alerta = montarAlerta(erro, extra)
    const chave = `${alerta.pagina}|${alerta.mensagem}`
    if (jaEnviados.has(chave) || jaEnviados.size >= LIMITE_POR_SESSAO) return
    jaEnviados.add(chave)
    supabase.from('alertas_sistema').insert(alerta).then(() => {}, () => {})
  } catch { /* registrar erro nunca pode causar outro erro */ }
}

// Erros que escapam dos componentes (promessas sem catch e erros de scripts).
export function ouvirErrosGlobais() {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (e) => { if (e.error) registrarErro(e.error) })
  window.addEventListener('unhandledrejection', (e) => registrarErro(e.reason))
}

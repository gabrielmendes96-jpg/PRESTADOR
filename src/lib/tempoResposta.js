// Calcula tempo de resposta em "horas úteis" (8h-22h, horário de
// Brasília) entre duas mensagens — usado pra decidir bônus/penalidade
// de pontos do prestador. Brasil não tem mais horário de verão desde
// 2019, então America/Sao_Paulo é sempre UTC-3, o que simplifica a
// conta: em vez de lidar com timezone de verdade, a gente desloca os
// timestamps em -3h e lê os campos UTC do Date resultante como se
// fossem o horário local de Brasília.
const OFFSET_SP_MS = 3 * 60 * 60 * 1000
const HORA_INICIO = 8
const HORA_FIM = 22
export const LIMITE_HORAS_UTEIS = 2

export function horasUteisEntre(inicioISO, fimISO) {
  const inicio = new Date(inicioISO).getTime() - OFFSET_SP_MS
  const fim = new Date(fimISO).getTime() - OFFSET_SP_MS
  if (fim <= inicio) return 0

  let totalMs = 0
  let cursor = inicio

  for (let i = 0; i < 3650 && cursor < fim; i++) {
    const dia = new Date(cursor)
    const ano = dia.getUTCFullYear()
    const mes = dia.getUTCMonth()
    const numeroDia = dia.getUTCDate()

    const inicioJanela = Date.UTC(ano, mes, numeroDia, HORA_INICIO, 0, 0, 0)
    const fimJanela = Date.UTC(ano, mes, numeroDia, HORA_FIM, 0, 0, 0)

    const sobreposicaoInicio = Math.max(cursor, inicioJanela)
    const sobreposicaoFim = Math.min(fim, fimJanela)
    if (sobreposicaoFim > sobreposicaoInicio) totalMs += sobreposicaoFim - sobreposicaoInicio

    const meiaNoiteSeguinte = Date.UTC(ano, mes, numeroDia + 1, 0, 0, 0, 0)
    cursor = Math.max(cursor + 1, meiaNoiteSeguinte)
  }

  return totalMs / (1000 * 60 * 60)
}

export function estourouPrazo(inicioISO, fimISO) {
  return horasUteisEntre(inicioISO, fimISO) >= LIMITE_HORAS_UTEIS
}

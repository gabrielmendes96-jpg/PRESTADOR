import { describe, it, expect } from 'vitest'
import { horasUteisEntre, estourouPrazo } from './tempoResposta'

// Todos os horários abaixo são em UTC-3 (Brasília) — escritos como
// "...T10:00:00-03:00" pra ficar explícito e não depender do fuso da
// máquina que roda o teste.

describe('horasUteisEntre', () => {
  it('conta direto quando tudo acontece dentro do horário comercial', () => {
    const h = horasUteisEntre('2026-03-10T10:00:00-03:00', '2026-03-10T13:00:00-03:00')
    expect(h).toBe(3)
  })

  it('mensagem de madrugada só começa a contar às 8h', () => {
    const h = horasUteisEntre('2026-03-10T03:00:00-03:00', '2026-03-10T09:00:00-03:00')
    expect(h).toBe(1) // só 8h-9h conta
  })

  it('pausa às 22h e retoma às 8h do dia seguinte', () => {
    const h = horasUteisEntre('2026-03-10T21:30:00-03:00', '2026-03-11T09:20:00-03:00')
    expect(h).toBeCloseTo(0.5 + 4 / 3, 5) // 21h30-22h (0.5h) + 8h-9h20 (1h20min = 4/3h)
  })

  it('fim antes ou igual ao início retorna 0', () => {
    expect(horasUteisEntre('2026-03-10T10:00:00-03:00', '2026-03-10T09:00:00-03:00')).toBe(0)
    expect(horasUteisEntre('2026-03-10T10:00:00-03:00', '2026-03-10T10:00:00-03:00')).toBe(0)
  })

  it('soma corretamente através de um fim de semana inteiro (mesma regra todo dia)', () => {
    const h = horasUteisEntre('2026-03-10T08:00:00-03:00', '2026-03-12T08:00:00-03:00')
    expect(h).toBe(28) // dois dias completos de 14h úteis cada
  })
})

describe('estourouPrazo', () => {
  it('não estourou quando responde em menos de 2h úteis', () => {
    expect(estourouPrazo('2026-03-10T10:00:00-03:00', '2026-03-10T11:30:00-03:00')).toBe(false)
  })

  it('estourou quando passa de 2h úteis', () => {
    expect(estourouPrazo('2026-03-10T10:00:00-03:00', '2026-03-10T12:30:00-03:00')).toBe(true)
  })

  it('não estourou se a resposta de madrugada só usar minutos comerciais', () => {
    // mensagem às 21h, resposta à 1h da manhã — só 21h-22h (1h) útil passou
    expect(estourouPrazo('2026-03-10T21:00:00-03:00', '2026-03-11T01:00:00-03:00')).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { mesmoUsuario, escolherUsuario } from './usuario'

const base = { id: 'u1', email: 'a@b.com', updated_at: '2026-10-01T10:00:00Z', app_metadata: { x: 1 } }

describe('mesmoUsuario', () => {
  it('trata sessão renovada (objeto novo, mesmos dados) como o mesmo usuário', () => {
    expect(mesmoUsuario(base, { ...base })).toBe(true)
  })
  it('detecta outra pessoa', () => {
    expect(mesmoUsuario(base, { ...base, id: 'u2' })).toBe(false)
  })
  it('detecta perfil atualizado (updated_at mudou)', () => {
    expect(mesmoUsuario(base, { ...base, updated_at: '2026-10-02T10:00:00Z' })).toBe(false)
  })
  it('detecta troca de e-mail', () => {
    expect(mesmoUsuario(base, { ...base, email: 'novo@b.com' })).toBe(false)
  })
  it('login e logout contam como mudança', () => {
    expect(mesmoUsuario(null, base)).toBe(false)
    expect(mesmoUsuario(base, null)).toBe(false)
    expect(mesmoUsuario(null, null)).toBe(true)
  })
})

describe('escolherUsuario', () => {
  it('mantém a referência anterior quando nada mudou (evita recarregar telas)', () => {
    const novo = { ...base }
    expect(escolherUsuario(base, novo)).toBe(base)
  })
  it('troca a referência quando o usuário mudou', () => {
    const outro = { ...base, id: 'u2' }
    expect(escolherUsuario(base, outro)).toBe(outro)
  })
})

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// Números e promessas que já estiveram fixos nas telas sem existir de verdade (publicidade enganosa).
// Se alguém quiser mostrar um número no app, ele precisa vir do banco, não de texto fixo.
const PROIBIDO = [
  /18\.000\+/, /12\.000\+/, /85\.000\+/, /\b320\b.{0,40}Cidades/s, /Avaliação média na plataforma/,
  /milhares de clientes/i, /3x mais contatos/i, /100% seguro/i,
]

function arquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return arquivos(p)
    return /\.(jsx?|html)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : []
  })
}

describe('telas do app', () => {
  it('não têm números nem promessas inventadas escritos no código', () => {
    const achados = []
    for (const f of arquivos('src')) {
      const texto = fs.readFileSync(f, 'utf8')
      for (const re of PROIBIDO) if (re.test(texto)) achados.push(`${f}: ${re}`)
    }
    expect(achados).toEqual([])
  })
})

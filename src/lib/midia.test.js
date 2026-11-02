import { describe, it, expect } from 'vitest'
import { tipoDoArquivo, validarArquivo, dimensoesAlvo, extensaoSegura, mensagemAmigavel, ErroDeMidia, LIMITE_VIDEO_MB } from './midia'

const arquivo = (nome, type = '', size = 1000) => ({ name: nome, type, size })

describe('tipoDoArquivo', () => {
  it('usa o tipo informado pelo aparelho', () => {
    expect(tipoDoArquivo(arquivo('a.jpg', 'image/jpeg'))).toBe('foto')
    expect(tipoDoArquivo(arquivo('a.mp4', 'video/mp4'))).toBe('video')
  })
  it('quando o aparelho não informa o tipo, vale a extensão (comum em fotos HEIC no Android)', () => {
    expect(tipoDoArquivo(arquivo('IMG_0001.HEIC'))).toBe('foto')
    expect(tipoDoArquivo(arquivo('IMG_0001.JPG'))).toBe('foto')
    expect(tipoDoArquivo(arquivo('filme.MOV'))).toBe('video')
    expect(tipoDoArquivo(arquivo('video.3gp'))).toBe('video')
  })
  it('recusa o que não é foto nem vídeo', () => {
    expect(tipoDoArquivo(arquivo('contrato.pdf', 'application/pdf'))).toBeNull()
    expect(tipoDoArquivo(arquivo('planilha.xlsx'))).toBeNull()
    expect(tipoDoArquivo(arquivo('semextensao'))).toBeNull()
    expect(tipoDoArquivo(null)).toBeNull()
  })
})

describe('validarArquivo', () => {
  it('aceita foto e vídeo normais', () => {
    expect(validarArquivo(arquivo('a.jpg', 'image/jpeg', 5e6))).toBeNull()
    expect(validarArquivo(arquivo('a.mp4', 'video/mp4', 20e6))).toBeNull()
  })
  it('explica em português quando não é foto nem vídeo', () => {
    const msg = validarArquivo(arquivo('contrato.pdf', 'application/pdf'))
    expect(msg).toMatch(/não é uma foto nem um vídeo/)
    expect(msg).toContain('contrato.pdf')
  })
  it('explica quando o vídeo passa do limite, com o tamanho real', () => {
    const msg = validarArquivo(arquivo('festa.mp4', 'video/mp4', (LIMITE_VIDEO_MB + 30) * 1024 * 1024))
    expect(msg).toMatch(/muito grande/)
    expect(msg).toContain(`${LIMITE_VIDEO_MB + 30} MB`)
    expect(msg).toContain(`${LIMITE_VIDEO_MB} MB`)
  })
  it('recusa vídeo onde só cabe foto', () => {
    expect(validarArquivo(arquivo('a.mp4', 'video/mp4'), { permitirVideo: false })).toMatch(/só dá para enviar fotos/)
  })
  it('recusa arquivo vazio', () => {
    expect(validarArquivo(arquivo('a.jpg', 'image/jpeg', 0))).toMatch(/vazio/)
    expect(validarArquivo(null)).toMatch(/vazio/)
  })
})

describe('dimensoesAlvo', () => {
  it('diminui foto grande mantendo a proporção', () => {
    expect(dimensoesAlvo(4000, 3000, 1600)).toEqual({ largura: 1600, altura: 1200, reduzir: true })
    expect(dimensoesAlvo(3000, 4000, 1600)).toEqual({ largura: 1200, altura: 1600, reduzir: true })
  })
  it('nunca aumenta foto pequena', () => {
    expect(dimensoesAlvo(800, 600, 1600)).toEqual({ largura: 800, altura: 600, reduzir: false })
    expect(dimensoesAlvo(1600, 1600, 1600).reduzir).toBe(false)
  })
  it('aceita medida zerada sem quebrar', () => {
    expect(dimensoesAlvo(0, 0).reduzir).toBe(false)
  })
})

describe('extensaoSegura', () => {
  it('foto vira jpg, exceto png/webp que já estavam leves e foram mantidos', () => {
    expect(extensaoSegura(arquivo('IMG.HEIC'), 'foto')).toBe('jpg')
    expect(extensaoSegura(arquivo('a.png', 'image/png'), 'foto')).toBe('png')
    expect(extensaoSegura(arquivo('a.webp', 'image/webp'), 'foto')).toBe('webp')
    expect(extensaoSegura({ type: 'image/jpeg' }, 'foto')).toBe('jpg')
  })
  it('vídeo mantém extensão conhecida; o resto vira mp4', () => {
    expect(extensaoSegura(arquivo('a.MOV'), 'video')).toBe('mov')
    expect(extensaoSegura(arquivo('a.exe'), 'video')).toBe('mp4')
    expect(extensaoSegura(arquivo('../../etc'), 'video')).toBe('mp4')
  })
})

describe('mensagemAmigavel', () => {
  it('internet falhou', () => {
    expect(mensagemAmigavel(new Error('Failed to fetch'))).toMatch(/internet/)
    expect(mensagemAmigavel({ message: 'NetworkError when attempting to fetch resource.' })).toMatch(/internet/)
  })
  it('arquivo grande demais para o servidor', () => {
    expect(mensagemAmigavel({ message: 'The object exceeded the maximum allowed size' })).toMatch(/maior do que o permitido/)
  })
  it('sessão expirada', () => {
    expect(mensagemAmigavel({ message: 'new row violates row-level security policy' })).toMatch(/sessão/)
    expect(mensagemAmigavel({ message: 'JWT expired' })).toMatch(/sessão/)
  })
  it('erro desconhecido nunca mostra texto técnico', () => {
    const msg = mensagemAmigavel({ message: 'duplicate key value violates unique constraint "x_pkey"' })
    expect(msg).toBe('Não foi possível enviar agora. Espere um instante e tente de novo.')
    expect(msg).not.toMatch(/key|constraint/)
  })
  it('erro que já tem mensagem pronta é repassado como está', () => {
    expect(mensagemAmigavel(new ErroDeMidia('Escolha outra foto.'))).toBe('Escolha outra foto.')
  })
})

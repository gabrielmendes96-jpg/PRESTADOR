import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import SeletorDeFotos from './SeletorDeFotos'
import AjudaEnvioFotos from './AjudaEnvioFotos'

const render = (el) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>)

describe('SeletorDeFotos', () => {
  it('mostra o botão da galeria e o atalho de ajuda, em português simples', () => {
    const html = render(<SeletorDeFotos onArquivos={() => {}} />)
    expect(html).toMatch(/Escolher (da galeria|foto do computador)/)
    expect(html).toContain('Como enviar fotos? Preciso de ajuda')
  })
  it('durante o envio mostra o andamento e trava os botões', () => {
    const html = render(<SeletorDeFotos onArquivos={() => {}} enviando progresso="2 de 5" />)
    expect(html).toContain('Enviando 2 de 5')
    expect(html).toContain('disabled')
  })
  it('com erro, mostra o aviso e já abre a ajuda com o caminho para o suporte', () => {
    const html = render(<SeletorDeFotos onArquivos={() => {}} erro="Sua internet falhou." tentativas={1} />)
    expect(html).toContain('Não deu certo desta vez')
    expect(html).toContain('Sua internet falhou.')
  })
})

describe('AjudaEnvioFotos', () => {
  it('só oferece falar com o suporte em destaque depois de 2 erros seguidos', () => {
    const aberta = (tentativas) => render(<AjudaEnvioFotos erro="x" tentativas={tentativas} />)
    expect(aberta(1)).toContain('Não conseguiu? A gente ajuda.')
    expect(aberta(2)).toContain('Tentou mais de uma vez')
    expect(aberta(2)).toContain('/suporte?categoria=outro')
  })
  it('não promete vídeo onde só cabe foto', () => {
    expect(render(<AjudaEnvioFotos erro="x" aceitaVideo={false} />)).not.toMatch(/Vídeos: até/)
  })
})

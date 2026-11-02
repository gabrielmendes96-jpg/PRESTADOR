import { useState, useCallback } from 'react'
import { mensagemAmigavel } from './midia'

// Guarda o último erro de envio (já em português simples) e quantas vezes seguidas a pessoa errou.
// Com 2 falhas seguidas o painel de ajuda passa a oferecer "Falar com o suporte".
export function useErroDeEnvio() {
  const [erro, setErro] = useState('')
  const [tentativas, setTentativas] = useState(0)

  const falhou = useCallback((e) => {
    setErro(mensagemAmigavel(e))
    setTentativas(n => n + 1)
  }, [])
  const limpar = useCallback(() => setErro(''), [])
  const deuCerto = useCallback(() => { setErro(''); setTentativas(0) }, [])

  return { erro, tentativas, falhou, limpar, deuCerto }
}

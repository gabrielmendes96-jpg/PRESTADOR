import { createContext, useContext, useState, useEffect } from 'react'
import { toggleSelecionado } from './comparacaoLogica'

const ComparacaoContext = createContext(null)
const STORAGE_KEY = 'prestador_comparacao'
export const MAX_COMPARACAO = 3

export function ComparacaoProvider({ children }) {
  const [selecionados, setSelecionados] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selecionados))
    } catch {
      // localStorage indisponível — segue sem persistir
    }
  }, [selecionados])

  const toggleComparar = (id) => {
    setSelecionados(prev => toggleSelecionado(prev, id, MAX_COMPARACAO))
  }

  const removerComparacao = (id) => setSelecionados(prev => prev.filter(p => p !== id))
  const limparComparacao = () => setSelecionados([])
  const estaComparando = (id) => selecionados.includes(id)

  return (
    <ComparacaoContext.Provider value={{ selecionados, toggleComparar, removerComparacao, limparComparacao, estaComparando }}>
      {children}
    </ComparacaoContext.Provider>
  )
}

export function useComparacao() {
  const ctx = useContext(ComparacaoContext)
  if (!ctx) throw new Error('useComparacao precisa estar dentro de <ComparacaoProvider>')
  return ctx
}

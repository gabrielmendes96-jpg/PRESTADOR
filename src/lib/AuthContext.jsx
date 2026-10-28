import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { escolherUsuario } from './usuario'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(prev => escolherUsuario(prev, session?.user ?? null))
      setCarregando(false)
    })

    // Renovação de token e volta de aba reemitem a sessão: só troca o usuário se ele realmente mudou.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(prev => escolherUsuario(prev, session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [])

  const sair = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

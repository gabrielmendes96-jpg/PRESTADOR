import { createClient } from '@supabase/supabase-js'

// As credenciais ficam em variáveis de ambiente (arquivo .env)
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
// Veja o arquivo .env.example para o formato correto.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase não configurado: crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

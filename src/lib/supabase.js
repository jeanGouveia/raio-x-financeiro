// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis do Supabase não configuradas. Verifique o arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função auxiliar para verificar se o usuário está autenticado (futuro)
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default supabase
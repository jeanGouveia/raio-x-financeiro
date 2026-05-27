// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Graceful degradation: se não tiver Supabase configurado, usa cliente mock
let supabase

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase não configurado. Tips virão dos fallbacks locais.')
  // Mock client para não quebrar quando não há .env
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            gte: () => ({
              contains: () => ({
                order: () => ({
                  limit: async () => ({ data: [], error: null })
                })
              }),
              order: () => ({
                limit: async () => ({ data: [], error: null })
              })
            })
          })
        })
      }),
      insert: async () => ({ data: null, error: null }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null } })
    }
  }
}

export { supabase }
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
export default supabase

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase não configurado no servidor. Endpoint /api/articles não funcionará.')
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch articles' })
    }

    return res.status(200).json(data || [])
  } catch (error) {
    console.error('Error fetching articles:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const templatePath = path.resolve(process.cwd(), 'public/admin/index.template.html')
const targetPath = path.resolve(process.cwd(), 'public/admin/index.html')

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configurados. Admin não funcionará.')
  process.exit(0)
}

let html = fs.readFileSync(templatePath, 'utf-8')

html = html.replace(/__SUPABASE_URL__/g, supabaseUrl)
html = html.replace(/__SUPABASE_ANON_KEY__/g, supabaseAnonKey)

fs.writeFileSync(targetPath, html, 'utf-8')

console.log('✅ Admin HTML gerado com Supabase credentials')

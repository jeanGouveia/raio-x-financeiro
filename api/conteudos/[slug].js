import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase não configurado no servidor. Endpoint /api/conteudos/[slug] não funcionará.')
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Fallback sanitization using regex (safe for basic use)
function sanitizeHTML(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:[^;]*script/gi, '')
}

export default async function handler(req, res) {
  // Vercel provides query params in req.query
  const { slug } = req.query

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' })
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured', missing: { url: !!supabaseUrl, key: !!supabaseKey } })
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Article not found' })
    }

    const sanitizedContent = sanitizeHTML(data.content)

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.seo_title || data.title} | Valtun — Tecnologia e IA para Negócios</title>
  <meta name="description" content="${data.seo_description || data.excerpt}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://valtun.com.br/conteudos/${slug}" />
  <meta property="og:title" content="${data.seo_title || data.title}" />
  <meta property="og:description" content="${data.seo_description || data.excerpt}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://valtun.com.br/conteudos/${slug}" />
  <meta property="og:image" content="https://valtun.com.br/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/ascen-landing.css" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${data.title}",
    "description": "${data.excerpt}",
    "author": {
      "@type": "Organization",
      "name": "Valtun"
    },
    "datePublished": "${data.published_at}",
    "dateModified": "${data.updated_at}"
  }
  </script>
</head>
<body>
  <header class="site-header" id="navbar">
    <div class="container header-inner">
      <a href="/" class="site-logo">VAL<span>TUN</span></a>

      <nav class="site-nav">
        <ul class="site-nav-list">
          <li><a href="/conteudos/" class="site-nav-link active">Conteúdos</a></li>
          <li><a href="/#site-profissional" class="site-nav-link">Site profissional</a></li>
          <li><a href="/#servicos" class="site-nav-link">Serviços</a></li>
          <li><a href="/#produtos" class="site-nav-link">Produtos</a></li>
          <li><a href="/#sobre" class="site-nav-link">Sobre</a></li>
          <li><a href="/#contato" class="site-nav-link">Contato</a></li>
        </ul>
      </nav>

      <div class="header-actions">
        <a href="/#contato" class="btn btn-primary">Solicitar orçamento</a>
      </div>
    </div>
  </header>

  <main class="article-page">
    <div class="container">
      <nav class="breadcrumbs mb-8" aria-label="Navegação">
        <a href="/" style="color: var(--muted); text-decoration: none;">← Conteúdos</a>
      </nav>

      <article class="article-content">
        <div class="article-category">${data.category}</div>
        <h1>${data.title}</h1>
        <p class="article-meta-editorial">
          <span class="article-date-editorial">${new Date(data.published_at).toLocaleDateString('pt-BR')}</span>
        </p>
        ${data.excerpt ? `<p class="article-excerpt-editorial" style="font-size: var(--text-lg); color: var(--muted); margin-bottom: var(--space-8);">${data.excerpt}</p>` : ''}
        ${data.cover_image ? `
        <div class="article-cover-image-wrapper">
          <img src="${data.cover_image}" alt="${data.title}" class="article-cover-image" />
        </div>
        ` : ''}
        <div class="article-body">
          ${sanitizedContent}
        </div>
      </article>

      <section class="section section-sm bg-light">
        <div class="container">
          <div class="cta-card text-center">
            <h2 class="mb-4">Quer fortalecer a presença digital da sua empresa?</h2>
            <p class="mb-8">Conheça o site profissional por R$ 490.</p>
            <a href="/#site-profissional" class="btn btn-primary btn-lg">Conhecer site profissional</a>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-inner">
        <div>
          <div class="footer-logo">VAL<span>TUN</span></div>
          <div class="footer-tagline">Soluções digitais para empresas</div>
        </div>

        <div class="footer-links">
          <a href="/conteudos/">Conteúdos</a>
          <a href="/#site-profissional">Site profissional</a>
          <a href="/#servicos">Serviços</a>
          <a href="/#produtos">Produtos</a>
          <a href="/#sobre">Sobre</a>
          <a href="/#contato">Contato</a>
          <a href="/privacidade.html">Política de Privacidade</a>
          <a href="mailto:dpo@valtun.com.br">dpo@valtun.com.br</a>
        </div>
      </div>

      <div class="footer-copy">
        © <span id="current-year"></span> Valtun. Todos os direitos reservados.
      </div>
    </div>
  </footer>

    <script>
      document.getElementById('current-year').textContent = new Date().getFullYear();
    </script>
    <script src="/ascen-landing.js"></script>
  </body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)

  } catch (error) {
    console.error('Error fetching article:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}

import { createClient } from '@supabase/supabase-js'
import DOMPurify from 'dompurify'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase não configurado no servidor. Endpoint /api/conteudos/[slug] não funcionará.')
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

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

    const sanitizedContent = DOMPurify.sanitize(data.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
    })

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
  <header id="navbar">
    <a href="/" class="nav-logo">VAL<span>TUN</span></a>
    <nav class="nav-links">
      <a href="/conteudos/">Conteúdos</a>
      <a href="/#site-express">Site profissional</a>
      <a href="/#servicos">Serviços</a>
      <a href="/#produtos">Produtos</a>
      <a href="/#sobre">Sobre</a>
      <a href="/#contato">Contato</a>
    </nav>
    <a href="/#contato" class="btn-primary">Solicitar orçamento</a>
  </header>

  <main class="article-page">
    <nav class="breadcrumbs" aria-label="Navegação">
      <div class="centered">
        <a href="/">Home</a>
        <span class="separator">/</span>
        <a href="/conteudos/">Conteúdos</a>
        <span class="separator">/</span>
        <span class="current">${data.title}</span>
      </div>
    </nav>

    <article class="article-content">
      <div class="article-category">${data.category}</div>
      <h1>${data.title}</h1>
      <p class="article-meta">
        <span class="article-date">${new Date(data.published_at).toLocaleDateString('pt-BR')}</span>
      </p>
      ${data.cover_image ? `
      <div class="article-cover-image">
        <img src="${data.cover_image}" alt="${data.title}" />
      </div>
      ` : ''}
      <div class="article-body">
        ${sanitizedContent}
      </div>
    </article>

    <section class="article-cta-section">
      <div class="centered">
        <h2 class="section-title">Quer fortalecer a presença digital da sua empresa?</h2>
        <p class="section-sub">Conheça o site profissional por R$ 490.</p>
        <a href="/#site-express" class="btn-primary">Conhecer site profissional</a>
      </div>
    </section>

    <footer>
      <div class="footer-inner">
        <div>
          <div class="footer-logo">VAL<span>TUN</span></div>
          <div class="footer-tagline">Soluções digitais para empresas</div>
        </div>

        <div class="footer-links">
          <a href="/conteudos/">Conteúdos</a>
          <a href="/#site-express">Site profissional</a>
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

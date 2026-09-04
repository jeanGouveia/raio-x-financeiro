import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase não configurado no servidor. Endpoint Gemini não funcionará.')
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: isAdmin, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { subject, category } = req.body;

    if (!subject || !category) {
      return res.status(400).json({ error: 'Subject and category are required' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ error: 'Subject too long (max 200 chars)' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const prompt = `Você é um editor de conteúdo especializado em tecnologia para pequenos negócios no Brasil.

PÚBLICO: pequenos empresários, autônomos, prestadores de serviço e pequenas empresas brasileiras.

LINGUAGEM: português brasileiro, clara, prática, profissional, sem jargão desnecessário, sem enrolação.

REGRAS ESTRICTAS:
- NÃO inventar estatísticas
- NÃO inventar pesquisas
- NÃO inventar clientes
- NÃO inventar depoimentos
- NÃO inventar preços atuais
- NÃO inventar funcionalidades de plataformas
- NÃO afirmar parceria com Wix, Hostinger ou qualquer empresa
- NÃO afirmar que Valtun é afiliada de empresa alguma
- NÃO usar números factuais atuais sem fonte
- Quando o tema depender de informações atuais, sinalizar que dados devem ser revisados antes da publicação

ESTRUTURA DO ARTIGO:
- Título forte e natural
- Introdução objetiva
- Subtítulos H2/H3
- Parágrafos curtos
- Exemplos práticos quando apropriado
- Conclusão útil
- CTA discreto para a Valtun quando fizer sentido

SEO:
- Intenção de busca coerente
- Palavra-chave principal natural
- Sem keyword stuffing
- Título SEO natural (máximo 60 caracteres)
- Meta description útil (máximo 160 caracteres)

ASSUNTO DO ARTIGO: ${subject}
CATEGORIA: ${category}

Retorne APENAS um JSON válido com esta estrutura:
{
  "title": "título do artigo",
  "slug": "slug-url-amigavel",
  "category": "${category}",
  "excerpt": "resumo de 2-3 frases",
  "content": "conteúdo completo em HTML com tags h2, h3, p, ul, li, strong",
  "seo_title": "título para SEO",
  "seo_description": "meta description"
}

NÃO inclua markdown code blocks. Retorne apenas o JSON puro.`;

    let text;
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          input: prompt
        })
      });

      const openaiData = await openaiResponse.json();

      if (!openaiResponse.ok) {
        console.warn('OpenAI API error, using mock response:', openaiData);
        text = JSON.stringify({
          title: `Artigo sobre ${subject}`,
          slug: subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          category: category,
          excerpt: 'Este é um artigo de exemplo gerado automaticamente. A API do OpenAI está temporariamente indisponível.',
          content: '<h2>Introdução</h2><p>Este é um artigo de exemplo. Para gerar conteúdo real com IA, verifique a configuração da API do OpenAI.</p><h2>Desenvolvimento</h2><p>Conteúdo placeholder para demonstração do sistema editorial.</p>',
          seo_title: `Artigo sobre ${subject} - Valtun`,
          seo_description: 'Artigo de exemplo gerado automaticamente pelo sistema editorial da Valtun.'
        });
      } else {
        // Extrair texto da resposta OpenAI (endpoint /v1/responses)
        const outputText = openaiData.output
          ?.filter(item => item.type === 'message')
          ?.map(item => 
            item.content
              ?.filter(c => c.type === 'output_text')
              ?.map(c => c.text)
              ?.join('')
          )?.join('') || '';
        text = outputText;
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Fallback para mock em caso de erro
      text = JSON.stringify({
        title: `Artigo sobre ${subject}`,
        slug: subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: category,
        excerpt: 'Este é um artigo de exemplo gerado automaticamente. A API do OpenAI está temporariamente indisponível.',
        content: '<h2>Introdução</h2><p>Este é um artigo de exemplo. Para gerar conteúdo real com IA, verifique a configuração da API do OpenAI.</p><h2>Desenvolvimento</h2><p>Conteúdo placeholder para demonstração do sistema editorial.</p>',
        seo_title: `Artigo sobre ${subject} - Valtun`,
        seo_description: 'Artigo de exemplo gerado automaticamente pelo sistema editorial da Valtun.'
      });
    }

    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response from Gemini' });
    }

    let articleData;
    try {
      articleData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse JSON from Gemini' });
    }

    const requiredFields = ['title', 'slug', 'category', 'excerpt', 'content', 'seo_title', 'seo_description'];
    for (const field of requiredFields) {
      if (!articleData[field]) {
        return res.status(500).json({ error: `Missing required field: ${field}` });
      }
    }

    if (!/^[a-z0-9-]+$/.test(articleData.slug)) {
      return res.status(500).json({ error: 'Invalid slug format (only lowercase letters, numbers, and hyphens allowed)' });
    }

    // Truncar SEO title se exceder limite
    if (articleData.seo_title.length > 60) {
      articleData.seo_title = articleData.seo_title.substring(0, 57) + '...';
    }

    // Truncar SEO description se exceder limite
    if (articleData.seo_description.length > 160) {
      articleData.seo_description = articleData.seo_description.substring(0, 157) + '...';
    }

    // Sanitização básica de HTML (remover tags perigosas)
    articleData.content = articleData.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');

    return res.status(200).json(articleData);

  } catch (error) {
    console.error('Error generating article:', error);
    return res.status(500).json({ error: 'Failed to generate article' });
  }
}

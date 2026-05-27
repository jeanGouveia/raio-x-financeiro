# ExataFinança — Raio-X Financeiro

Ferramenta web de análise de planilhas financeiras com score, gráficos e insights.

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind CSS 3
- **Análise:** XLSX (parse) + FinancialAnalyzer (score, alertas, projeções)
- **Pagamento:** Hotmart (verificação de compra via API)
- **Dicas IA:** Supabase (tabela `tips`) com fallback local
- **Deploy:** Vercel (multi-page: `/` landing + `/raio-x/` ferramenta)

---

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:5173/raio-x/
```

> **Sem Supabase:** A ferramenta funciona 100% offline — tips caem para fallback local automaticamente.

---

## Deploy na Vercel

### Via Vercel CLI

```bash
npm install -g vercel
vercel deploy --prod
```

### Via GitHub (recomendado)

1. Push para GitHub
2. Conecte o repo na [Vercel Dashboard](https://vercel.com/new)
3. Configure as variáveis de ambiente:

| Variável               | Onde obter                                      |
|------------------------|-------------------------------------------------|
| `VITE_SUPABASE_URL`    | Supabase → Settings → API                       |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API                    |
| `HOTMART_CLIENT_ID`    | Hotmart → Developers → Credenciais              |
| `HOTMART_CLIENT_SECRET`| Hotmart → Developers → Credenciais              |
| `HOTMART_BASIC_AUTH`   | base64(`client_id:client_secret`)               |

4. Clique **Deploy** ✅

### Configurações do build na Vercel

| Campo           | Valor         |
|-----------------|---------------|
| Framework       | Vite          |
| Build Command   | `npm run build` |
| Output Dir      | `dist`        |
| Install Command | `npm install` |

---

## Estrutura de URLs em produção

| URL              | Conteúdo                          |
|------------------|-----------------------------------|
| `/`              | Landing page Ascen (estática)     |
| `/raio-x/`       | Ferramenta React (SPA)            |
| `/raio-x/precos` | Página de preços                  |
| `/privacidade.html` | Política de privacidade        |
| `/api/check-payment` | Serverless — verifica Hotmart |

---

## Tabela Supabase (opcional)

Execute no SQL Editor do Supabase para habilitar dicas personalizadas:

```sql
CREATE TABLE tips (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('free', 'premium')),
  content    TEXT NOT NULL,
  score_min  INT  NOT NULL DEFAULT 0,
  score_max  INT  NOT NULL DEFAULT 100,
  "order"    INT  NOT NULL DEFAULT 0,
  conditions JSONB
);

-- Exemplos de dicas
INSERT INTO tips (type, content, score_min, score_max, "order") VALUES
  ('free', 'Continue monitorando seus gastos mensalmente.',    0, 40, 1),
  ('free', 'Identifique sua maior categoria de gasto.',        0, 40, 2),
  ('free', 'Crie uma reserva de emergência.',                  41, 69, 1),
  ('free', 'Você está no caminho certo! Revise metas.',        70, 100, 1),
  ('premium', 'Automatize transferências para poupança.',      41, 69, 1),
  ('premium', 'Invista o excedente em renda diversificada.',   70, 100, 1);

-- RLS: permitir leitura anônima
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_anon_read" ON tips FOR SELECT TO anon USING (true);
```

---

## Problemas comuns

### `ERR_CONNECTION_REFUSED` no `/raio-x/`
**Causa:** Estava tentando acessar servidor Vite local em produção.  
**Solução:** Fazer o build (`npm run build`) e deployar o `dist/`. O `vercel.json` já está configurado.

### Planilha não é reconhecida
**Causa:** Cabeçalho não encontrado.  
**Solução:** Baixe o modelo em `/Planilha-modelo.xlsx` ou certifique-se que a planilha tem colunas **DATA** e **VALOR**.

### Tips não carregam / erro Supabase
**Causa:** Variáveis de ambiente não configuradas.  
**Comportamento:** Fallback automático para tips locais por faixa de score. Tudo funciona normalmente.

---

## Formato da planilha modelo

| DATA       | DESCRIÇÃO        | CATEGORIA   | TIPO     | VALOR    |
|------------|------------------|-------------|----------|----------|
| 01/05/2025 | Salário          | Salário     | Receita  | 5000.00  |
| 05/05/2025 | Supermercado     | Alimentação | Despesa  | 350.00   |
| 10/05/2025 | Uber             | Transporte  | Despesa  | 45.50    |

- **TIPO:** `Receita` / `Despesa` (ou `Entrada` / `Saída`)
- **VALOR:** positivo para receitas, negativo para despesas — ou use a coluna TIPO


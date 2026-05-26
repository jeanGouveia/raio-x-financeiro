# Valtun / Ascen — Site + Raio-X Financeiro

Monorepo Vite com **várias páginas**:

| URL | Arquivo | Descrição |
|-----|---------|-----------|
| `/` | `index.html` | Landing Ascen (estática) |
| `/raio-x/` | `raio-x/index.html` | Ferramenta Raio-X (React) |
| `/privacidade.html` | `privacidade.html` | Política de privacidade |

## Desenvolvimento

```bash
npm install
npm run dev          # Vite (landing + raio-x + privacidade)
npm run server       # API Hotmart (porta 3001)
npm run dev-full     # Vite + API juntos
```

- Landing: http://localhost:5173/
- Raio-X: http://localhost:5173/raio-x/
- Privacidade: http://localhost:5173/privacidade.html

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_*` (lista VIP) e credenciais Hotmart.

No Supabase, execute `supabase/waitlist.sql`.

## Build e deploy

```bash
npm run build
```

`vercel.json` reescreve rotas `/raio-x/*` para o SPA React.

## Componentes

- `src/components/WaitlistForm.jsx` — formulário VIP (React); a landing usa `public/ascen-landing.js` + `window.VALTUN_SUPABASE` injetado em `index.html`.

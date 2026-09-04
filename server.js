import 'dotenv/config';
import express from 'express';
import checkPaymentHandler from './api/check-payment.js';
import verificarPagamentoHandler from './api/verificar-pagamento.js';
import generateArticleHandler from './api/generate-article.js';
import articlesHandler from './api/articles.js';
import articleSlugHandler from './api/article-by-slug.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware para JSON
app.use(express.json());

// Rotas da API
app.get('/api/check-payment', checkPaymentHandler);
app.get('/api/verificar-pagamento', verificarPagamentoHandler);
app.post('/api/generate-article', generateArticleHandler);
app.get('/api/articles', articlesHandler);
app.get('/api/article/:slug', articleSlugHandler);

// Rota pública do artigo (SSR)
app.get('/conteudos/:slug', articleSlugHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Keep server alive
const keepAlive = setInterval(() => {}, 1000);

process.on('SIGTERM', () => {
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});

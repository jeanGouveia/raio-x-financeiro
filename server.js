import 'dotenv/config';
import express from 'express';
import checkPaymentHandler from './api/check-payment.js';
import verificarPagamentoHandler from './api/verificar-pagamento.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para CORS (permitir requisições do frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Rotas da API
app.get('/api/check-payment', checkPaymentHandler);
app.get('/api/verificar-pagamento', verificarPagamentoHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
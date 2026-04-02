// api/verificar-pagamento.js
export default async function handler(req, res) {
  const { email } = req.query;

  // 1. Aqui você faria a chamada para a Hotmart para pegar o Token de Acesso (OAuth)
  // 2. Com o token, você consulta a API de Vendas filtrando pelo e-mail e ID do Produto
  
  // Simulação de lógica:
  // const status = await consultarHotmart(email); 

  // Por enquanto, vamos retornar um exemplo:
  if (email === "teste@pagou.com") {
    return res.status(200).json({ pago: true });
  }

  return res.status(200).json({ pago: false });
}
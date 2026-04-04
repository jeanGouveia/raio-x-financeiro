// api/check-payment.js
export default async function handler(req, res) {
  const { email } = req.query;
  const productId = "105185205"; // Verifique se este ID está idêntico ao da Hotmart

  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basicAuth = process.env.HOTMART_BASIC_AUTH;

  try {
    // 1. Autenticação
    const authRes = await fetch(`https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basicAuth}` }
    });
    
    const authData = await authRes.json();

    if (!authData.access_token) {
      return res.status(500).json({ 
        error: "Erro de Autenticação", 
        detalhes: authData 
      });
    }

    // 2. Consulta de Vendas
    const url = `https://developers.hotmart.com/payments/api/v1/sales/history?transaction_status=APPROVED&buyer_email=${encodeURIComponent(email)}&product_id=${productId}`;
    
    const salesRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const salesData = await salesRes.json();

    // --- LOG DE DEPURAÇÃO PARA O NAVEGADOR ---
    // Se não encontrar a venda, vamos devolver tudo que a Hotmart disse
    if (!salesData.items || salesData.items.length === 0) {
      return res.status(200).json({ 
        unlocked: false, 
        debug: {
          mensagem: "Nenhuma venda APPROVED encontrada para este e-mail e produto.",
          total_itens_retornados: salesData.page_info?.total_results || 0,
          resposta_da_hotmart: salesData // Aqui veremos se o ID do produto ou e-mail bateu
        }
      });
    }
    
    return res.status(200).json({ unlocked: true });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno", mensagem: error.message });
  }
}
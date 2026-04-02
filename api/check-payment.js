// api/check-payment.js
export default async function handler(req, res) {
  const { email } = req.query;
  const productId = "105185205"; // ID do seu produto

  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basicAuth = process.env.HOTMART_BASIC_AUTH;

  if (!email) {
    return res.status(400).json({ error: "Email não fornecido" });
  }

  try {
    // 1. Pede o Token para a Hotmart
    const authRes = await fetch(`https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basicAuth}` }
    });
    
    const authData = await authRes.json();

    if (!authData.access_token) {
      return res.status(500).json({ error: "Falha na autenticação Hotmart. Verifique as variáveis na Vercel." });
    }

    // 2. Consulta a venda
    const url = `https://developers.hotmart.com/payments/api/v1/sales/history?transaction_status=APPROVED&buyer_email=${encodeURIComponent(email)}&product_id=${productId}`;
    
    const salesRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const salesData = await salesRes.json();

    if (salesData.items && salesData.items.length > 0) {
      return res.status(200).json({ unlocked: true });
    }
    
    return res.status(200).json({ unlocked: false });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
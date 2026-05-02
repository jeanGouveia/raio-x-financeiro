// api/check-payment.js
export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ 
      unlocked: false, 
      error: "E-mail é obrigatório" 
    });
  }

  // ==================== MODO TESTE (para você testar agora) ====================
  const testEmails = [
    "polyanadonascimentopadua@gmail.com",
    "jean@exatafinanca.com"
  ].map(e => e.toLowerCase());

  if (testEmails.includes(email.toLowerCase())) {
    return res.status(200).json({ 
      unlocked: true,
      message: "Acesso liberado via modo teste"
    });
  }

  // ==================== VERIFICAÇÃO REAL HOTMART ====================
  try {
    const clientId = process.env.HOTMART_CLIENT_ID;
    const clientSecret = process.env.HOTMART_CLIENT_SECRET;
    const basicAuth = process.env.HOTMART_BASIC_AUTH;

    if (!clientId || !clientSecret || !basicAuth) {
      console.error("❌ Variáveis de ambiente Hotmart não configuradas");
      return res.status(500).json({ 
        unlocked: false, 
        error: "Configuração Hotmart incompleta no servidor" 
      });
    }

    // Autenticação Hotmart
    const authRes = await fetch(
      `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Basic ${basicAuth}` }
      }
    );

    const authData = await authRes.json();

    if (!authData.access_token) {
      return res.status(500).json({ 
        unlocked: false, 
        error: "Falha na autenticação com Hotmart" 
      });
    }

    // Consulta de vendas
    const productId = "7535788";
    const url = `https://developers.hotmart.com/payments/api/v1/sales/history?transaction_status=APPROVED&buyer_email=${encodeURIComponent(email)}&product_id=${productId}`;

    const salesRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const salesData = await salesRes.json();

    const hasPurchase = salesData.items && salesData.items.length > 0;

    return res.status(200).json({ 
      unlocked: hasPurchase,
      debug: !hasPurchase ? salesData : null 
    });

  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return res.status(500).json({ 
      unlocked: false, 
      error: "Erro interno ao consultar Hotmart" 
    });
  }
}
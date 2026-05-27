import { useState } from "react";

export function usePaymentUnlock() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem("premiumUnlocked") === "true";
    } catch {
      return false;
    }
  });
  const [isUnlocking, setIsUnlocking] = useState(false);

  const checkHotmartPayment = async (email) => {
    if (!email) return;

    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/check-payment?email=${encodeURIComponent(email)}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();

      if (data.unlocked) {
        try { localStorage.setItem("premiumUnlocked", "true"); } catch {}
        setUnlocked(true);
        alert("✅ Acesso liberado com sucesso!");
      } else {
        alert("❌ Pagamento não encontrado. Verifique o e-mail utilizado na compra.");
      }
    } catch (err) {
      console.error("Erro ao verificar pagamento:", err);
      alert("Erro ao verificar pagamento. Tente novamente em alguns instantes.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return {
    unlocked,
    isUnlocking,
    checkHotmartPayment,
  };
}

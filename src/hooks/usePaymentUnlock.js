import { useState } from "react";

export function usePaymentUnlock() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("premiumUnlocked") === "true");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const checkHotmartPayment = async (email) => {
    if (!email) return;

    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/check-payment?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.unlocked) {
        localStorage.setItem("premiumUnlocked", "true");
        setUnlocked(true);
        alert("✅ Acesso liberado com sucesso!");
      } else {
        alert("❌ Pagamento não encontrado. Verifique o e-mail.");
      }
    } catch {
      alert("Erro ao verificar pagamento.");
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

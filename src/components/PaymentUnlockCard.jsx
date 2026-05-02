import { useState } from "react";

export default function PaymentUnlockCard({ onUnlock, loading }) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    await onUnlock(email.trim());
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-6 md:p-8">
      <h3 className="text-2xl font-black text-white text-center">
        Parabens! Seu diagnostico esta pronto.
      </h3>
      <p className="text-slate-400 text-center mt-3">
        Digite o e-mail da compra para desbloquear seu acesso completo por 30 dias.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Digite o e-mail utilizado na compra"
          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-black font-black text-lg px-8 py-4 rounded-xl transition"
        >
          {loading ? "Verificando pagamento..." : "Desbloquear agora"}
        </button>
      </form>
    </div>
  );
}

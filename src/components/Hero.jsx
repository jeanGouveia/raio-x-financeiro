export default function Hero({ scrollToUpload }) {
  return (
    <header className="text-center mb-16 mt-10">
      <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
        Descubra para onde seu dinheiro está indo
        <span className="text-emerald-400 block mt-2">
          (e por que nunca sobra no fim do mês)
        </span>
      </h1>

      <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
        Envie sua planilha e receba em segundos: score financeiro, graficos,
        alertas e plano de acao.
      </p>

      <button
        onClick={scrollToUpload}
        className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg px-8 py-4 rounded-xl transition"
      >
        Fazer meu pré-diagnóstico agora
      </button>
      
    </header>
  );
}

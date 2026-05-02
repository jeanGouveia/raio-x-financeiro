import ScoreHero from "./ScoreHero";
import SummaryMetrics from "./SummaryMetrics";
import Card from "./Card";
import SectionTitle from "./SectionTitle";
import PaymentUnlockCard from "./PaymentUnlockCard";
import { OFFER } from "../config/offer";

export default function FreeResult({
  result,
  animatedScore,
  unlocked,
  onBuyClick,
  onCheckPayment,
  isUnlocking
}) {
  return (
    <div className="space-y-4 ">
      <h1 className="text-5xl text-center font-black text-white">
        Exata <span className="text-emerald-400">Finança</span>
      </h1>
      <p className="text-slate-400 text-center mt-3 text-lg">
        Diagnóstico financeiro inteligente em segundos
      </p>
      {/* Score */}
      <ScoreHero
        score={result?.free?.summary?.score}
        animatedScore={animatedScore}
        diagnosis={result?.free?.mainDiagnosis}
      />

      {/* Métricas */}
      <SummaryMetrics summary={result?.free?.summary} />

      {/* Dicas */}
      <Card>
        <SectionTitle>Dicas iniciais</SectionTitle>
        <div className="space-y-3">
          {result?.free?.freeSuggestions?.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
              <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      {!unlocked && (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={onBuyClick}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xl px-16 py-5 rounded-2xl transition-all w-full md:w-auto text-center"
          >
            {OFFER.ctaPrimary}
          </button>
          <p className="text-emerald-300 text-sm font-semibold text-center">
            Por apenas {OFFER.priceLabel} ( Preço promocional de lançamento )
          </p>
          <PaymentUnlockCard onUnlock={onCheckPayment} isUnlocking={isUnlocking} />
        </div>
      )}
    </div>
  );
}
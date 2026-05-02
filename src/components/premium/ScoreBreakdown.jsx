import Card from "../Card";
import SectionTitle from "../SectionTitle";

const impactColor = {
  positive: "bg-emerald-400",
  neutral: "bg-amber-400",
  negative: "bg-red-400",
};

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown?.factors?.length) return null;

  return (
    <Card>
      <SectionTitle>Como seu score foi calculado</SectionTitle>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-black text-emerald-400">{breakdown.total}</span>
        <span className="text-slate-500 text-sm">/100 pontos</span>
      </div>
      <div className="space-y-4">
        {breakdown.factors.map((factor) => (
          <div key={factor.label} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{factor.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{factor.comment}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${impactColor[factor.impact]}`}
                  style={{ width: `${Math.round((factor.score / factor.max) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono w-10 text-right">
                {factor.score}/{factor.max}
              </span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${impactColor[factor.impact]}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

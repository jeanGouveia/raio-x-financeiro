import Card from "../Card";
import SectionTitle from "../SectionTitle";

export default function PremiumTips({ tips }) {
  if (!tips?.length) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle className="mb-0">Recomendações personalizadas</SectionTitle>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full">
          {tips.length} dicas
        </span>
      </div>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

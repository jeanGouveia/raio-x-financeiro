import SectionTitle from "./SectionTitle";
import ScoreGauge from "./ScoreGauge";
import Card from "./Card";

const getScoreColor = (score) => {
  if (score < 40) return "text-red-500";
  if (score < 70) return "text-amber-500";
  return "text-emerald-500";
};

export default function ScoreHero({ score, animatedScore, diagnosis }) {
  const color = getScoreColor(score);
  const levelLabel = score >= 85 ? "Nível avançado" : score >= 70 ? "Nível intermediário" : "Em desenvolvimento";

  return (
    <Card className="flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <SectionTitle>Seu score financeiro</SectionTitle>
        <div className={`text-8xl font-black leading-none ${color}`}>
          {animatedScore}
          <span className="text-4xl font-light ml-1">%</span>
        </div>
        <p className="mt-4 text-base text-slate-300 leading-relaxed">{diagnosis}</p>
        <span className="inline-block mt-3 border border-emerald-700/60 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full tracking-wide">
          {levelLabel}
        </span>
      </div>
      <div className="shrink-0">
        <ScoreGauge score={score} />
      </div>
    </Card>
  );
}
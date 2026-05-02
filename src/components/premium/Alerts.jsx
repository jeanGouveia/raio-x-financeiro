import Card from "../Card";
import SectionTitle from "../SectionTitle";

const alertStyles = {
  critical: { bg: "bg-red-950/40 border-red-800/50", dot: "bg-red-400" },
  warning: { bg: "bg-amber-950/40 border-amber-800/50", dot: "bg-amber-400" },
  positive: { bg: "bg-emerald-950/40 border-emerald-700/50", dot: "bg-emerald-400" },
  info: { bg: "bg-slate-800/60 border-slate-700/50", dot: "bg-slate-400" },
};

export default function Alerts({ alerts }) {
  if (!alerts?.length) return null;

  return (
    <Card>
      <SectionTitle>Alertas e pontos de atenção</SectionTitle>
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const style = alertStyles[alert.level] ?? alertStyles.info;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 border rounded-xl p-4 ${style.bg}`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${style.dot}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

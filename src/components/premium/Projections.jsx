import Card from "../Card";
import SectionTitle from "../SectionTitle";
import { formatCurrencyNumber } from "../../utils/formatters";

export default function Projections({ projections }) {
  if (!projections) return null;

  const periods = [
    { label: "3 meses", data: projections.months3 },
    { label: "6 meses", data: projections.months6 },
    { label: "12 meses", data: projections.months12 },
    { label: "24 meses", data: projections.months24 },
  ];

  return (
    <Card>
      <SectionTitle>Projeções de acúmulo</SectionTitle>
      <p className="text-xs text-slate-500 mb-4">
        Baseado em R$ {formatCurrencyNumber(projections.monthly)}/mês poupado.
        <span className="text-emerald-500"> "Com rendimento"</span> considera ~12% a.a.
        (renda fixa).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {periods.map(({ label, data }) => (
          <div key={label} className="bg-slate-800/60 rounded-xl p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label}</p>
            <p className="font-mono text-sm font-medium text-white">
              R$ {formatCurrencyNumber(data.simple)}
            </p>
            <p className="text-emerald-400 text-xs mt-1">R$ {formatCurrencyNumber(data.invested)}</p>
            <p className="text-slate-600 text-xs mt-0.5">com rendimento</p>
          </div>
        ))}
      </div>
      {projections.emergencyFundTarget > 0 && (
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-800">
          <div>
            <p className="text-sm text-slate-300">Meta: reserva de emergência (6×)</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {projections.emergencyFundMonths
                ? `Alcançada em ~${projections.emergencyFundMonths} meses no ritmo atual`
                : "Calcule aumentando sua poupança mensal"}
            </p>
          </div>
          <p className="font-mono text-base font-medium text-white">
            R$ {formatCurrencyNumber(projections.emergencyFundTarget)}
          </p>
        </div>
      )}
      {projections.note && (
        <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800 leading-relaxed">
          {projections.note}
        </p>
      )}
    </Card>
  );
}

import Card from "../Card";
import SectionTitle from "../SectionTitle";
import { formatCurrencyNumber } from "../../utils/formatters";

const statusBadge = {
  ótimo: "bg-emerald-900/60 text-emerald-300",
  aceitável: "bg-amber-900/60 text-amber-300",
  alto: "bg-red-900/60 text-red-300",
  normal: "bg-slate-800 text-slate-400",
};

export default function CategoryAnalysis({ categories }) {
  if (!categories?.length) return null;

  return (
    <Card>
      <SectionTitle>Análise por categoria</SectionTitle>
      <div className="divide-y divide-slate-800">
        {categories.map((category) => (
          <div key={category.category} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">{category.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {category.percentOfIncome}% da renda
                </span>
                {category.status && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusBadge[category.status] ?? statusBadge.normal
                    }`}
                  >
                    {category.status}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${category.percent}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-28 text-right">
                {category.percent}% dos gastos
              </span>
            </div>
            {category.benchmarkText && (
              <p className="text-xs text-slate-500">{category.benchmarkText}</p>
            )}
            {category.potentialSaving > 0 && (
              <p className="text-xs text-emerald-500 mt-1">
                Reduzir 20% economiza R$ {formatCurrencyNumber(category.potentialSaving)}/mês
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

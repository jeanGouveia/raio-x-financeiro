import Card from "./Card";

export default function SummaryMetrics({ summary }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { label: "Receita total", value: summary.totalIncome, color: "text-emerald-400", tag: `${summary.incomeSourceCount} fonte(s)` },
        { label: "Despesas", value: summary.totalExpenses, color: "text-rose-400", tag: `${summary.expenseCategoryCount} categoria(s)` },
        { label: "Saldo líquido", value: summary.netBalance, color: "text-white", tag: `${summary.savingsRate}% da receita` },
      ].map(({ label, value, color, tag }) => (
        <Card key={label}>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>R$ {fmt(value)}</p>
          <p className="text-slate-500 text-xs mt-2">{tag}</p>
        </Card>
      ))}
    </div>
  );
}

const fmt = (n) =>
  Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });
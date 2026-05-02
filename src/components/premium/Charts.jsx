import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Card from "../Card";
import SectionTitle from "../SectionTitle";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Charts({ topCategories = [], summary }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <SectionTitle>Distribuição de gastos</SectionTitle>
        <div className="h-72">
          <Pie
            data={{
              labels: topCategories.map((category) => category.category),
              datasets: [
                {
                  data: topCategories.map((category) => category.amount),
                  backgroundColor: ["#10b981", "#22d3ee", "#eab308", "#f43f5e", "#8b5cf6"],
                },
              ],
            }}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </Card>
      <Card>
        <SectionTitle>Receita vs despesa</SectionTitle>
        <div className="h-72">
          <Bar
            data={{
              labels: ["Receita", "Despesas", "Saldo"],
              datasets: [
                {
                  data: [summary.totalIncome, summary.totalExpenses, summary.netBalance],
                  backgroundColor: ["#10b981", "#ef4444", "#6366f1"],
                  borderRadius: 8,
                },
              ],
            }}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </Card>
    </div>
  );
}

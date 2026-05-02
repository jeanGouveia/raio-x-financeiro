import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { parseExcel } from "./services/parser";
import UploadBox from "./components/UploadBox";
import UploadSection from "./components/UploadSection";
import FinancialAnalyzer from "./services/FinancialAnalyzer";
import { Pie, Bar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import { Download, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Hero from "./components/Hero";
import PainPoints from "./components/PainPoints";
import FreeResult from "./components/FreeResult";
import SectionTitle from "./components/SectionTitle";
import Card from "./components/Card";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });



const alertStyles = {
  critical: { bg: "bg-red-950/40 border-red-800/50", dot: "bg-red-400", label: "Crítico" },
  warning: { bg: "bg-amber-950/40 border-amber-800/50", dot: "bg-amber-400", label: "Atenção" },
  positive: { bg: "bg-emerald-950/40 border-emerald-700/50", dot: "bg-emerald-400", label: "Positivo" },
  info: { bg: "bg-slate-800/60 border-slate-700/50", dot: "bg-slate-400", label: "Info" },
};

const statusBadge = {
  ótimo: "bg-emerald-900/60 text-emerald-300",
  aceitável: "bg-amber-900/60 text-amber-300",
  alto: "bg-red-900/60 text-red-300",
  normal: "bg-slate-800 text-slate-400",
};

const impactColor = {
  positive: "bg-emerald-400",
  neutral: "bg-amber-400",
  negative: "bg-red-400",
};

// ─── sub-components ──────────────────────────────────────────────────────────

// function SectionTitle({ children }) {
//   return (
//     <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
//       {children}
//     </p>
//   );
// }

// function Card({ children, className = "" }) {
//   return (
//     <div className={`bg-slate-900 border border-slate-700/60 rounded-2xl p-6 ${className}`}>
//       {children}
//     </div>
//   );
// }

// Gauge SVG animado
// function ScoreGauge({ score }) {
//   const arcLen = 148;
//   const progress = Math.round((score / 100) * arcLen);
//   const color = score >= 70 ? "#1a9e6e" : score >= 40 ? "#f59e0b" : "#ef4444";
//   // arco semicircular: M8,58 A47,47 0 0,1 102,58
//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
//       <svg width="110" height="65" viewBox="0 0 110 65">
//         {/* trilho */}
//         <path
//           d="M8,58 A47,47 0 0,1 102,58"
//           fill="none"
//           stroke="rgba(255,255,255,0.08)"
//           strokeWidth="9"
//           strokeLinecap="round"
//         />
//         {/* progresso */}
//         <path
//           d="M8,58 A47,47 0 0,1 102,58"
//           fill="none"
//           stroke={color}
//           strokeWidth="9"
//           strokeLinecap="round"
//           strokeDasharray={`${progress} ${arcLen}`}
//         />
//         <text
//           x="55" y="52"
//           textAnchor="middle"
//           fontFamily="ui-monospace, monospace"
//           fontSize="15"
//           fontWeight="500"
//           fill={color}
//         >
//           {score}%
//         </text>
//       </svg>
//       <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.7)" }}>Escala 0–100</span>
//     </div>
//   );
// }

// Score hero
// function ScoreHero({ score, animatedScore, diagnosis }) {
//   const color = getScoreColor(score);
//   const levelLabel = score >= 85 ? "Nível avançado" : score >= 70 ? "Nível intermediário" : "Em desenvolvimento";

//   return (
//     <Card className="flex items-center justify-between gap-6">
//       <div className="flex-1 min-w-0">
//         <SectionTitle>Seu score financeiro</SectionTitle>
//         <div className={`text-8xl font-black leading-none ${color}`}>
//           {animatedScore}
//           <span className="text-4xl font-light ml-1">%</span>
//         </div>
//         <p className="mt-4 text-base text-slate-300 leading-relaxed">{diagnosis}</p>
//         <span className="inline-block mt-3 border border-emerald-700/60 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full tracking-wide">
//           {levelLabel}
//         </span>
//       </div>
//       <div className="shrink-0">
//         <ScoreGauge score={score} />
//       </div>
//     </Card>
//   );
// }

// Resumo financeiro
// function SummaryMetrics({ summary }) {
//   return (
//     <div className="grid md:grid-cols-3 gap-4">
//       {[
//         { label: "Receita total", value: summary.totalIncome, color: "text-emerald-400", tag: `${summary.incomeSourceCount} fonte(s)` },
//         { label: "Despesas", value: summary.totalExpenses, color: "text-rose-400", tag: `${summary.expenseCategoryCount} categoria(s)` },
//         { label: "Saldo líquido", value: summary.netBalance, color: "text-white", tag: `${summary.savingsRate}% da receita` },
//       ].map(({ label, value, color, tag }) => (
//         <Card key={label}>
//           <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</p>
//           <p className={`text-3xl font-bold ${color}`}>R$ {fmt(value)}</p>
//           <p className="text-slate-500 text-xs mt-2">{tag}</p>
//         </Card>
//       ))}
//     </div>
//   );
// }

// Score breakdown
function ScoreBreakdown({ breakdown }) {
  if (!breakdown?.factors?.length) return null;
  return (
    <Card>
      <SectionTitle>Como seu score foi calculado</SectionTitle>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-black text-emerald-400">{breakdown.total}</span>
        <span className="text-slate-500 text-sm">/100 pontos</span>
      </div>
      <div className="space-y-4">
        {breakdown.factors.map((f) => (
          <div key={f.label} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{f.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.comment}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${impactColor[f.impact]}`}
                  style={{ width: `${Math.round((f.score / f.max) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono w-10 text-right">
                {f.score}/{f.max}
              </span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${impactColor[f.impact]}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Análise por categoria
function CategoryAnalysis({ categories }) {
  if (!categories?.length) return null;
  return (
    <Card>
      <SectionTitle>Análise por categoria</SectionTitle>
      <div className="divide-y divide-slate-800">
        {categories.map((cat) => (
          <div key={cat.category} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">{cat.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{cat.percentOfIncome}% da renda</span>
                {cat.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[cat.status] ?? statusBadge.normal}`}>
                    {cat.status}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-28 text-right">
                {cat.percent}% dos gastos
              </span>
            </div>
            {cat.benchmarkText && (
              <p className="text-xs text-slate-500">{cat.benchmarkText}</p>
            )}
            {cat.potentialSaving > 0 && (
              <p className="text-xs text-emerald-500 mt-1">
                Reduzir 20% economiza R$ {fmt(cat.potentialSaving)}/mês
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Gráficos (Pie + Bar)
function Charts({ topCategories, summary }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <SectionTitle>Distribuição de gastos</SectionTitle>
        <div className="h-72">
          <Pie
            data={{
              labels: topCategories.map((c) => c.category),
              datasets: [{
                data: topCategories.map((c) => c.amount),
                backgroundColor: ["#10b981", "#22d3ee", "#eab308", "#f43f5e", "#8b5cf6"],
              }],
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
              datasets: [{
                data: [summary.totalIncome, summary.totalExpenses, summary.netBalance],
                backgroundColor: ["#10b981", "#ef4444", "#6366f1"],
                borderRadius: 8,
              }],
            }}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </Card>
    </div>
  );
}

// Projeções
function Projections({ projections }) {
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
        Baseado em R$ {fmt(projections.monthly)}/mês poupado.
        <span className="text-emerald-500"> "Com rendimento"</span> considera ~12% a.a. (renda fixa).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {periods.map(({ label, data }) => (
          <div key={label} className="bg-slate-800/60 rounded-xl p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label}</p>
            <p className="font-mono text-sm font-medium text-white">R$ {fmt(data.simple)}</p>
            <p className="text-emerald-400 text-xs mt-1">R$ {fmt(data.invested)}</p>
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
            R$ {fmt(projections.emergencyFundTarget)}
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

// Alertas
function Alerts({ alerts }) {
  if (!alerts?.length) return null;
  return (
    <Card>
      <SectionTitle>Alertas e pontos de atenção</SectionTitle>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const style = alertStyles[alert.level] ?? alertStyles.info;
          return (
            <div
              key={i}
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

// Dicas premium
function PremiumTips({ tips }) {
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
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// PDF
function PDFButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 size={22} className="animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download size={22} /> Baixar PDF Completo
        </>
      )}
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("premiumUnlocked") === "true");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const premiumRef = useRef(null);
  const uploadRef = useRef(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFile = async (file) => {
    if (!file) return;

    try {
      setLoading(true);

      const parsed = await parseExcel(file);
      const analysis = await FinancialAnalyzer.analyze(parsed.transactions);

      // 👇 separação segura
      const freeData = {
        summary: analysis.summary,
        mainDiagnosis: analysis.mainDiagnosis,
        freeSuggestions: analysis.freeSuggestions,
      };

      const premiumData = {
        scoreBreakdown: analysis.scoreBreakdown,
        categoryAnalysis: analysis.categoryAnalysis,
        projections: analysis.projections,
        alerts: analysis.alerts,
        premiumSuggestions: analysis.premiumSuggestions,
        topCategories: analysis.topCategories,
      };

      setResult({
        free: freeData,
        premium: premiumData, // 👈 importante
      });

      setAnimatedScore(0);

    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao processar a planilha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result?.free) return;
    let current = 0;
    const target = result?.free?.summary?.score || 0;
    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil((target - current) / 15));
      if (current >= target) { current = target; clearInterval(interval); }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [result?.free]);

  const checkHotmartPayment = async () => {
    const email = prompt("Digite o e-mail utilizado na compra:");
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/check-payment?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.unlocked) {
        localStorage.setItem("premiumUnlocked", "true");
        setUnlocked(true);

        

        alert("✅ Acesso liberado com sucesso!");
      } else {
        alert("❌ Pagamento não encontrado. Verifique o e-mail.");
      }
    } catch {
      alert("Erro ao verificar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!result?.premium) return;
    setPdfGenerating(true);
    try {
      const summary = result?.free?.summary;

      const {
        scoreBreakdown,
        categoryAnalysis,
        projections,
        alerts,
        premiumSuggestions,
      } = result.premium;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210, M = 18; // page width, margin
      const CW = W - M * 2;  // content width
      const BG = [15, 23, 42];
      const CARD = [30, 41, 59];
      const GREEN = [16, 185, 129];
      const RED = [239, 68, 68];
      const WHITE = [255, 255, 255];
      const MUTED = [100, 116, 139];
      const TEXT = [203, 213, 225];

      // ── helpers ──────────────────────────────────────────────────────────────
      let y = 0;

      const bg = () => {
        doc.setFillColor(...BG);
        doc.rect(0, 0, W, 297, "F");
      };

      const newPage = () => {
        doc.addPage();
        bg();
        y = M;
      };

      const checkY = (need) => {
        if (y + need > 282) newPage();
      };

      const label = (text, size = 8, color = MUTED, align = "left", x = M) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...color);
        doc.text(text.toUpperCase(), align === "center" ? W / 2 : x, y, { align });
      };

      const body = (text, size = 10, color = TEXT, x = M, maxW = CW) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text), maxW);
        doc.text(lines, x, y);
        return lines.length;
      };

      const bold = (text, size = 11, color = WHITE, x = M) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...color);
        doc.text(String(text), x, y);
      };

      const rule = (opacity = 0.15) => {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.2);
        doc.setGState(new doc.GState({ opacity }));
        doc.line(M, y, W - M, y);
        doc.setGState(new doc.GState({ opacity: 1 }));
      };

      const card = (h, x = M, w = CW, yy = y) => {
        doc.setFillColor(...CARD);
        doc.roundedRect(x, yy, w, h, 3, 3, "F");
      };

      const miniBar = (x, yy, pct, color = GREEN, w = 60, h = 2) => {
        doc.setFillColor(30, 45, 65);
        doc.roundedRect(x, yy, w, h, 1, 1, "F");
        doc.setFillColor(...color);
        doc.roundedRect(x, yy, Math.max(1, w * pct / 100), h, 1, 1, "F");
      };

      const sectionTitle = (text) => {
        checkY(12);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(text.toUpperCase(), M, y);
        y += 7;
        rule(0.12);
        y += 5;
      };

      // ═══════════════════════════════════════════════════════════════════════
      // PÁGINA 1 — CAPA
      // ═══════════════════════════════════════════════════════════════════════
      bg();

      // Cabeçalho
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text("Exata Finança", W / 2, 45, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Relatório financeiro completo", W / 2, 55, { align: "center" });
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`,
        W / 2, 63, { align: "center" }
      );

      // Linha decorativa
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(W / 2 - 20, 68, W / 2 + 20, 68);

      // Score grande
      doc.setFontSize(88);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(`${summary.score}%`, W / 2, 122, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Score financeiro", W / 2, 132, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      const diagLines = doc.splitTextToSize(result.mainDiagnosis || "", CW - 20);
      doc.text(diagLines, W / 2, 145, { align: "center" });

      const levelY = 145 + diagLines.length * 6 + 4;
      const levelText = summary.score >= 85 ? "Nível avançado" : summary.score >= 70 ? "Nível intermediário" : "Em desenvolvimento";
      const levelW = doc.getTextWidth(levelText) + 10;
      doc.setFillColor(10, 61, 41);
      doc.roundedRect(W / 2 - levelW / 2, levelY - 5, levelW, 8, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(...GREEN);
      doc.text(levelText, W / 2, levelY, { align: "center" });

      // 3 cards de métricas na capa
      const mY = levelY + 16;
      const mW = 52, mH = 30, mGap = 4;
      const mStartX = (W - mW * 3 - mGap * 2) / 2;
      [
        { label: "Receita", value: `R$ ${fmt(summary.totalIncome)}`, color: GREEN },
        { label: "Despesas", value: `R$ ${fmt(summary.totalExpenses)}`, color: RED },
        { label: "Saldo", value: `R$ ${fmt(summary.netBalance)}`, color: WHITE },
      ].forEach(({ label: lbl, value, color }, i) => {
        const x = mStartX + i * (mW + mGap);
        doc.setFillColor(...CARD);
        doc.roundedRect(x, mY, mW, mH, 3, 3, "F");
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(lbl, x + mW / 2, mY + 9, { align: "center" });
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...color);
        doc.text(value, x + mW / 2, mY + 21, { align: "center" });
      });

      // Taxa de poupança na capa
      const spY = mY + mH + 12;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Taxa de poupança", M, spY);
      doc.setTextColor(...GREEN);
      doc.setFont("helvetica", "bold");
      doc.text(`${summary.savingsRate}%`, W - M, spY, { align: "right" });
      miniBar(M, spY + 4, summary.savingsRate, GREEN, CW, 3);

      // Rodapé da capa
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Exata Finança  ·  Diagnóstico financeiro inteligente", W / 2, 285, { align: "center" });

      // ═══════════════════════════════════════════════════════════════════════
      // PÁGINA 2 — SCORE BREAKDOWN + ANÁLISE DE CATEGORIAS
      // ═══════════════════════════════════════════════════════════════════════
      newPage();

      // Score breakdown
      sectionTitle("Como seu score foi calculado");

      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(String(scoreBreakdown.total), M, y);
      doc.setFontSize(12);
      doc.setTextColor(...MUTED);
      doc.text("/100 pontos", M + 22, y);
      y += 10;

      scoreBreakdown.factors.forEach((f) => {
        checkY(18);
        const pct = Math.round((f.score / f.max) * 100);
        const barColor = f.impact === "positive" ? GREEN : f.impact === "neutral" ? [245, 158, 11] : RED;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...WHITE);
        doc.text(f.label, M, y);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(`${f.score}/${f.max}`, W - M, y, { align: "right" });

        y += 4;
        miniBar(M, y, pct, barColor, CW * 0.65, 2.5);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(f.comment, M, y + 6);
        y += 13;

        rule(0.08);
        y += 4;
      });

      y += 4;

      // Análise por categoria
      sectionTitle("Análise por categoria");

      if (categoryAnalysis?.length) {
        categoryAnalysis.forEach((cat) => {
          checkY(28);
          const statusColors = {
            "ótimo": [16, 185, 129],
            "aceitável": [245, 158, 11],
            "alto": [239, 68, 68],
          };
          const sColor = statusColors[cat.status] || MUTED;

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...WHITE);
          doc.text(cat.category, M, y);

          // Badge de status
          const badgeText = cat.status || "";
          const badgeW = doc.getTextWidth(badgeText) + 6;
          doc.setFillColor(sColor[0], sColor[1], sColor[2], 0.2);
          doc.setFillColor(20, 40, 35);
          doc.roundedRect(W - M - badgeW, y - 5, badgeW, 7, 2, 2, "F");
          doc.setFontSize(7.5);
          doc.setTextColor(...sColor);
          doc.text(badgeText, W - M - badgeW / 2, y, { align: "center" });

          y += 5;
          miniBar(M, y, cat.percent, sColor, CW, 2.5);

          y += 6;
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...MUTED);
          doc.text(`${cat.percent}% dos gastos  ·  ${cat.percentOfIncome}% da renda`, M, y);

          if (cat.benchmarkText) {
            y += 5;
            doc.setTextColor(...MUTED);
            doc.text(cat.benchmarkText, M, y);
          }
          if (cat.potentialSaving > 0) {
            y += 5;
            doc.setTextColor(...GREEN);
            doc.text(`Reduzir 20% economiza R$ ${fmt(cat.potentialSaving)}/mês`, M, y);
          }

          y += 8;
          rule(0.08);
          y += 5;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PÁGINA 3 — PROJEÇÕES + ALERTAS
      // ═══════════════════════════════════════════════════════════════════════
      newPage();

      sectionTitle("Projeções de acúmulo");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(`Baseado em R$ ${fmt(projections.monthly)}/mês poupado. "Com rendimento" considera ~12% a.a.`, M, y);
      y += 9;

      // Grid de projeções
      const pW = (CW - 9) / 4;
      [
        { period: "3 meses", data: projections.months3 },
        { period: "6 meses", data: projections.months6 },
        { period: "12 meses", data: projections.months12 },
        { period: "24 meses", data: projections.months24 },
      ].forEach(({ period, data }, i) => {
        const px = M + i * (pW + 3);
        card(30, px, pW, y);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(period.toUpperCase(), px + pW / 2, y + 8, { align: "center" });
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...WHITE);
        doc.text(`R$ ${fmt(data.simple)}`, px + pW / 2, y + 17, { align: "center" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREEN);
        doc.text(`R$ ${fmt(data.invested)}`, px + pW / 2, y + 24, { align: "center" });
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.text("com rendimento", px + pW / 2, y + 29, { align: "center" });
      });
      y += 38;

      // Reserva de emergência
      if (projections.emergencyFundTarget) {
        checkY(20);
        card(20, M, CW, y);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...WHITE);
        doc.text("Meta: reserva de emergência (6×)", M + 6, y + 8);
        doc.setFontSize(11);
        doc.setTextColor(...GREEN);
        doc.text(`R$ ${fmt(projections.emergencyFundTarget)}`, W - M - 6, y + 8, { align: "right" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(
          projections.emergencyFundMonths
            ? `Alcançada em ~${projections.emergencyFundMonths} meses no ritmo atual`
            : "Calcule aumentando sua poupança mensal",
          M + 6, y + 15
        );
        y += 27;
      }

      if (projections.note) {
        checkY(12);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        const noteLines = doc.splitTextToSize(projections.note, CW);
        doc.text(noteLines, M, y);
        y += noteLines.length * 5 + 6;
      }

      y += 4;
      sectionTitle("Alertas e pontos de atenção");

      if (alerts?.length) {
        const alertColorMap = {
          critical: RED,
          warning: [245, 158, 11],
          positive: GREEN,
          info: [148, 163, 184],
        };
        alerts.forEach((alert) => {
          checkY(22);
          const ac = alertColorMap[alert.level] || MUTED;
          card(20, M, CW, y);
          // dot
          doc.setFillColor(...ac);
          doc.circle(M + 7, y + 7, 1.8, "F");
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...WHITE);
          doc.text(alert.title, M + 13, y + 8);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...MUTED);
          const msgLines = doc.splitTextToSize(alert.message, CW - 16);
          doc.text(msgLines, M + 13, y + 14);
          y += Math.max(22, 14 + msgLines.length * 4.5) + 4;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PÁGINA 4 — DICAS PREMIUM
      // ═══════════════════════════════════════════════════════════════════════
      if (premiumSuggestions?.length) {
        newPage();
        sectionTitle("Recomendações personalizadas");

        premiumSuggestions.forEach((tip, i) => {
          checkY(20);
          // Número
          doc.setFillColor(10, 61, 41);
          doc.circle(M + 4, y + 1, 4, "F");
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...GREEN);
          doc.text(String(i + 1), M + 4, y + 2.5, { align: "center" });
          // Texto
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...TEXT);
          const tipLines = doc.splitTextToSize(tip, CW - 14);
          doc.text(tipLines, M + 12, y + 2);
          y += tipLines.length * 5.5 + 8;
          rule(0.08);
          y += 5;
        });
      }

      // Rodapé em todas as páginas
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(`Exata Finança  ·  Relatório financeiro`, M, 291);
        doc.text(`${p} / ${totalPages}`, W - M, 291, { align: "right" });
      }

      doc.save("Exata_Financa_Relatorio.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const [showToast, setShowToast] = useState(false);

  const handleBuyClick = () => {
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 9000);

    window.open(
      "https://pay.hotmart.com/Y105310131F?off=jvdmfsq3&bid=1775957680382",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* ───────── LANDING (ANTES DO RESULTADO) ───────── */}
        {!result?.free && (
          <>
            {/* Header */}
            <Hero scrollToUpload={scrollToUpload} />

            {/* Dores */}
            <PainPoints />

            {/* Upload */}
            <UploadSection
              uploadRef={uploadRef}
              onFile={handleFile}
            />
          </>
        )}


        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-6 text-slate-400">Analisando sua planilha...</p>
          </div>
        )}

        {/* ───────── RESULTADO ───────── */}
        {result?.free && !loading && (
          <div className="space-y-4">

            {/* GRATUITO */}
            {/* <ScoreHero
              score={result?.free?.summary?.score}
              animatedScore={animatedScore}
              diagnosis={result?.free?.mainDiagnosis}
            /> */}

            {/* <SummaryMetrics summary={result?.free?.summary} /> */}

            {/* <Card>
              <SectionTitle>Dicas iniciais</SectionTitle>
              <div className="space-y-3">
                {result?.freeSuggestions?.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </Card> */}

            <FreeResult
              result={result}
              animatedScore={animatedScore}
              unlocked={unlocked}
              onBuyClick={handleBuyClick}
              onCheckPayment={checkHotmartPayment}
            />

            {/* CTA pagamento */}
            {/* {result?.free && !unlocked && (
              <div className="flex flex-col items-center gap-4 py-4">
                <button
                  onClick={handleBuyClick}
                  className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xl px-16 py-5 rounded-2xl transition-all w-full md:w-auto text-center"
                >
                  Quero acesso completo por 30 dias!
                </button>

                <button
                  onClick={checkHotmartPayment}
                  className="text-emerald-400 hover:text-emerald-300 underline text-sm font-medium"
                >
                  Já paguei → Desbloquear agora
                </button>
              </div>
            )} */}


            {/* PREMIUM */}
            {unlocked && result?.premium && (
              <div ref={premiumRef} className="space-y-4">
                <ScoreBreakdown breakdown={result?.premium?.scoreBreakdown} />
                <CategoryAnalysis categories={result?.premium?.categoryAnalysis} />
                <Charts
                  topCategories={result?.premium?.topCategories}
                  summary={result?.free?.summary}
                />
                <Projections projections={result?.premium?.projections} />
                <Alerts alerts={result?.premium?.alerts} />
                <PremiumTips tips={result?.premium?.premiumSuggestions} />

                <div data-pdf-ignore="true">
                  <PDFButton onClick={generatePDF} loading={pdfGenerating} />
                </div>
              </div>
            )}

          </div>
        )}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-300 px-6 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
            O pagamento será aberto em uma nova aba
          </div>
        )}
      </div>
    </div>
  );
}
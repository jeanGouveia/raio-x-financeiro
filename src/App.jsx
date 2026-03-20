import { useState, useEffect } from "react";
import { parseExcel } from "./services/parser";
import { analyzeData } from "./services/analyzer";
import UploadBox from "./components/UploadBox";
import { Pie, Bar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


import {
  Download,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  ArrowDownCircle,
  ChevronRight
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("premiumUnlocked") === "true");
  const [animatedScore, setAnimatedScore] = useState(0);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setLoading(true);
      const data = await parseExcel(file);
      const analysis = analyzeData(data);
      setResult(analysis);
      setAnimatedScore(0);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar a planilha. Verifique se as colunas 'valor', 'tipo' e 'categoria' estão presentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result) return;
    let current = 0;
    const target = result.summary.score;
    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil((target - current) / 15));
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [result]);

  const getScoreColor = (score) => {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const unlockPremium = () => {
    // Aqui você integraria com seu link de pagamento (Hotmart/Kiwify)
    // Para o MVP, simulamos o desbloqueio
    localStorage.setItem("premiumUnlocked", "true");
    setUnlocked(true);
  };

  const generatePDF = () => {
    if (!result) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- PÁGINA 1: CAPA ---
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 5, pageHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.text("RAIO-X", 25, 60);
      doc.setTextColor(16, 185, 129);
      doc.text("FINANCEIRO PREMIUM", 25, 75);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.line(25, 85, 100, 85);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório de Consultoria e Projeção de Patrimônio", 25, 100);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 25, 110);

      // --- PÁGINA 2: DIAGNÓSTICO ---
      doc.addPage();
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("1. Resumo Executivo", 20, 30);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 40, 170, 40, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text("Financial Health Score:", 30, 55);
      doc.setFontSize(26);
      doc.setTextColor(16, 185, 129);
      doc.text(`${result.summary.score}%`, 30, 70);
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`Perfil: ${result.profile.name}`, 85, 65);

      // Card de Impacto
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(20, 90, 170, 45, 3, 3, 'F');
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(13);
      doc.text("ALERTA DE CUSTO DE OPORTUNIDADE (10 ANOS)", 30, 105);
      doc.setFontSize(20);
      doc.text(`R$ ${result.projections.loss10Years.toLocaleString("pt-BR")}`, 30, 120);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text("2. Distribuição de Gastos", 20, 155);

      // CHAMADA DA TABELA USANDO A FUNÇÃO IMPORTADA DIRETAMENTE
      autoTable(doc, {
        startY: 165,
        head: [['Categoria', 'Valor Atual', '%', 'Economia Alvo (15%)']],
        body: result.categoryData.map(cat => [
          cat.name,
          `R$ ${cat.value.toLocaleString("pt-BR")}`,
          `${cat.percent}%`,
          `R$ ${(cat.value * 0.15).toLocaleString("pt-BR")}`
        ]),
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 20, right: 20 },
      });

      // --- PÁGINA 3: PLANO DE AÇÃO ---
      doc.addPage();
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("3. Plano Estratégico de 30 Dias", 20, 30);

      let yPos = 50;
      result.actionPlan.forEach((step, i) => {
        doc.setFillColor(16, 185, 129);
        doc.circle(23, yPos - 1, 3, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(step, 30, yPos, { maxWidth: 160 });
        yPos += 15;
      });

      doc.save(`Consultoria_Financeira_Premium.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro técnico ao gerar o PDF. Verifique o console.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <header className="text-center mb-12 animate-in fade-in duration-1000">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Inteligência Financeira 2.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Raio-X <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Financeiro</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Descubra o diagnóstico real da sua liberdade financeira em menos de 1 minuto.
          </p>
        </header>

        {!result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
              <UploadBox onFile={handleFile} />
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500" /> 100% Privado</span>
                <span className="flex items-center gap-1.5"><Zap size={16} className="text-amber-500" /> Análise Instantânea</span>
              </div>
            </div>
            <div className="text-center">
              <a href="/Planilha-modelo.xlsx" download className="text-slate-500 hover:text-emerald-400 transition-colors text-sm underline underline-offset-4 decoration-slate-800">
                Não tem planilha? Baixe nosso modelo estratégico gratuito
              </a>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse font-medium tracking-wide italic">Processando algoritmos financeiros...</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">

            {/* SCORE & IMPACTO */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock size={120} />
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Seu Financial Health Score</p>
                <div className={`text-8xl font-black tracking-tighter mb-6 ${getScoreColor(animatedScore)}`}>
                  {animatedScore}%
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-700/30">
                  <p className="text-white font-bold text-lg flex items-center gap-2">
                    {result.profile.icon} Perfil: {result.profile.name}
                  </p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{result.benchmark}</p>
                </div>
              </div>

              {/* <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                <ArrowDownCircle size={40} className="text-red-500/50 mb-4" />
                <p className="text-red-200/40 text-[10px] font-bold uppercase tracking-widest mb-2">Perda em 10 anos</p>
                <p className="text-red-500 text-3xl font-black mb-2">
                  - R$ {result.projections.loss10Years.toLocaleString('pt-BR')}
                </p>
                <p className="text-slate-500 text-[10px] leading-tight">
                  Valor estimado de desperdício se nada for feito hoje.
                </p>
              </div> */}
            </div>

            {/* DIAGNÓSTICO RÁPIDO */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 shadow-inner">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="text-slate-100 font-bold leading-tight">{result.mainDiagnosis}</h3>
                <p className="text-slate-500 text-sm mt-1">{result.biggestProblem}</p>
              </div>
            </div>

            {/* PAYWALL */}
            {!unlocked && (
              <div className="relative group p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500/50 to-cyan-500/50">
                <div className="relative bg-slate-950 p-10 rounded-3xl text-center">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-emerald-400 opacity-80" />
                  <h2 className="text-3xl font-black text-white mb-4">Desbloqueie sua Estratégia</h2>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Acesse o plano detalhado de 30 dias e o relatório PDF de consultoria completa.
                  </p>

                  <div className="flex flex-col items-center mb-10">
                    <span className="text-slate-500 line-through text-sm mb-1">De R$ 150,00</span>
                    <span className="text-6xl font-black text-white tracking-tighter">R$ 49,90</span>
                    <div className="mt-4 px-4 py-1 bg-emerald-500/10 rounded-full">
                      <p className="text-emerald-400 text-xs font-bold italic">Economia imediata sugerida: R$ {result.projections.savingPotential}/mês</p>
                    </div>
                  </div>

                  <button
                    onClick={unlockPremium}
                    className="w-full md:w-auto px-16 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)]"
                  >
                    ACESSAR CONSULTORIA AGORA
                  </button>
                  <p className="text-[10px] text-slate-600 mt-8 tracking-[0.2em] uppercase">Pagamento único • Acesso Vitalício</p>
                </div>
              </div>
            )}

            {/* CONTEÚDO PREMIUM */}
            {unlocked && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-500" /> Mix de Consumo
                    </h3>
                    <div className="h-64"><Pie data={{
                      labels: result.categoryData.map((c) => c.name),
                      datasets: [{
                        data: result.categoryData.map((c) => c.value),
                        backgroundColor: ["#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#6366f1"],
                        borderWidth: 0
                      }]
                    }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} /></div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                      <ArrowDownCircle size={18} className="text-emerald-500" /> Fluxo Mensal
                    </h3>
                    <div className="h-64"><Bar data={{
                      labels: ["Receita", "Despesa", "Saldo"],
                      datasets: [{
                        data: [result.summary.income, result.summary.expense, result.summary.balance],
                        backgroundColor: ["#10b981", "#ef4444", "#6366f1"],
                        borderRadius: 8
                      }]
                    }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }} /></div>
                  </div>
                </div>

                {/* NOVO: PROJEÇÃO DE FUTURO */}
                <div className="grid md:grid-cols-2 gap-6">

                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
                    <p className="text-emerald-300 text-xs uppercase tracking-widest mb-2">
                      Projeção em 10 anos
                    </p>
                    <p className="text-emerald-400 text-2xl font-black">
                      R$ {result.projections.projectedWealth.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      Considerando investimento mensal do valor economizado.
                    </p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
                    <p className="text-amber-300 text-xs uppercase tracking-widest mb-2">
                      Reserva de emergência
                    </p>
                    <p className="text-amber-400 text-2xl font-black">
                      R$ {result.projections.emergencyReserve.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      Tempo estimado: {result.projections.monthsToReserve} meses
                    </p>
                  </div>

                </div>

                {/* NOVO: EVOLUÇÃO FINANCEIRA */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={18} />
                    Evolução do seu dinheiro (12 meses)
                  </h3>

                  <div className="h-64">
                    <Bar
                      data={{
                        labels: Array.from({ length: 12 }, (_, i) => `Mês ${i + 1}`),
                        datasets: [
                          {
                            label: "Acumulado",
                            data: result.projections.evolution12Months,
                            backgroundColor: "#10b981",
                            borderRadius: 6
                          }
                        ]
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: {
                            ticks: { color: "#94a3b8" },
                            grid: { color: "#1e293b" }
                          },
                          x: {
                            ticks: { color: "#94a3b8" }
                          }
                        }
                      }}
                    />
                  </div>

                  <p className="text-slate-500 text-xs mt-4">
                    Considerando que você invista o valor economizado todo mês.
                  </p>
                </div>

                {/* NOVO: NÍVEL DE RISCO */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={18} />
                    Nível de risco financeiro
                  </h3>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Situação atual</span>
                    <span className={`font-bold text-sm ${result.summary.balance <= 0
                        ? "text-red-500"
                        : result.summary.balance < result.summary.income * 0.1
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}>
                      {result.summary.balance <= 0
                        ? "Alto risco"
                        : result.summary.balance < result.summary.income * 0.1
                          ? "Médio risco"
                          : "Baixo risco"}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${result.summary.balance <= 0
                          ? "bg-red-500 w-full"
                          : result.summary.balance < result.summary.income * 0.1
                            ? "bg-amber-500 w-2/3"
                            : "bg-emerald-500 w-1/3"
                        }`}
                    />
                  </div>

                  <p className="text-slate-500 text-xs mt-3">
                    Baseado na sua capacidade de gerar sobra mensal.
                  </p>
                </div>

                {/* NOVO: OPORTUNIDADES DE ECONOMIA */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Zap className="text-emerald-500" size={18} />
                    Oportunidades rápidas de economia
                  </h3>

                  <div className="space-y-2">
                    {result.categoryData.slice(0, 3).map((cat, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-300">{cat.name}</span>
                        <span className="text-emerald-400 font-bold">
                          R$ {(cat.value * 0.15).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-3xl relative overflow-hidden">
                  <Zap className="absolute -right-10 -top-10 w-40 h-40 text-emerald-500/5 rotate-12" />
                  <h3 className="text-emerald-400 font-black text-2xl mb-8 tracking-tight">Plano Estratégico de Recuperação</h3>
                  <div className="space-y-6">
                    {result.actionPlan.map((step, i) => (
                      <div key={i} className="flex gap-5 items-start group">
                        <span className="bg-emerald-500 text-slate-950 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0 mt-0.5 group-hover:rotate-12 transition-transform">{i + 1}</span>
                        <p className="text-slate-300 leading-relaxed font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generatePDF}
                  className="w-full bg-white text-slate-950 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                >
                  <Download size={24} /> BAIXAR CONSULTORIA EM PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="mt-20 py-8 text-center text-slate-600 text-xs tracking-widest uppercase">
        &copy; 2026 Raio-X Financeiro Premium • Algoritmos de Consultoria
      </footer>
    </div>
  );
}

export default App;
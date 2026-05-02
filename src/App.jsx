import { useEffect, useRef, useState } from "react";
import Hero from "./components/Hero";
import PainPoints from "./components/PainPoints";
import UploadSection from "./components/UploadSection";
import FreeResult from "./components/FreeResult";
import ScoreBreakdown from "./components/premium/ScoreBreakdown";
import CategoryAnalysis from "./components/premium/CategoryAnalysis";
import Charts from "./components/premium/Charts";
import Projections from "./components/premium/Projections";
import Alerts from "./components/premium/Alerts";
import PremiumTips from "./components/premium/PremiumTips";
import PDFButton from "./components/premium/PDFButton";
import { parseExcel } from "./services/parser";
import FinancialAnalyzer from "./services/FinancialAnalyzer";
import { generateFinancialReportPdf } from "./services/generateFinancialReportPdf";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("premiumUnlocked") === "true");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
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

      setResult({
        free: {
          summary: analysis.summary,
          mainDiagnosis: analysis.mainDiagnosis,
          freeSuggestions: analysis.freeSuggestions,
        },
        premium: {
          scoreBreakdown: analysis.scoreBreakdown,
          categoryAnalysis: analysis.categoryAnalysis,
          projections: analysis.projections,
          alerts: analysis.alerts,
          premiumSuggestions: analysis.premiumSuggestions,
          topCategories: analysis.topCategories,
        },
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
    const target = result.free.summary?.score || 0;

    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil((target - current) / 15));
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 30);

    return () => clearInterval(interval);
  }, [result?.free]);

  const checkHotmartPayment = async (email) => {
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

  const handleGeneratePDF = async () => {
    if (!result?.premium) return;

    setPdfGenerating(true);
    try {
      generateFinancialReportPdf(result);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleBuyClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 9000);

    window.open("https://pay.hotmart.com/Y105310131F?off=jvdmfsq3&bid=1775957680382", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {!result?.free && (
          <>
            <Hero scrollToUpload={scrollToUpload} />
            <PainPoints />
            <UploadSection uploadRef={uploadRef} onFile={handleFile} />
          </>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-6 text-slate-400">Analisando sua planilha...</p>
          </div>
        )}

        {result?.free && !loading && (
          <div className="space-y-4">
            <FreeResult
              result={result}
              animatedScore={animatedScore}
              unlocked={unlocked}
              onBuyClick={handleBuyClick}
              onCheckPayment={checkHotmartPayment}
              loading={loading}
            />

            {unlocked && result?.premium && (
              <div ref={premiumRef} className="space-y-4">
                <ScoreBreakdown breakdown={result.premium.scoreBreakdown} />
                <CategoryAnalysis categories={result.premium.categoryAnalysis} />
                <Charts topCategories={result.premium.topCategories} summary={result.free.summary} />
                <Projections projections={result.premium.projections} />
                <Alerts alerts={result.premium.alerts} />
                <PremiumTips tips={result.premium.premiumSuggestions} />
                <div data-pdf-ignore="true">
                  <PDFButton onClick={handleGeneratePDF} loading={pdfGenerating} />
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

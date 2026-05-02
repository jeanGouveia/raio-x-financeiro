import { useRef } from "react";
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
import { useFinancialAnalysis } from "./hooks/useFinancialAnalysis";
import { usePaymentUnlock } from "./hooks/usePaymentUnlock";
import { usePdfExport } from "./hooks/usePdfExport";
import { useCheckout } from "./hooks/useCheckout";
import { OFFER } from "./config/offer";

export default function App() {
  const { isAnalyzing, result, animatedScore, handleFile } = useFinancialAnalysis();
  const { unlocked, isUnlocking, checkHotmartPayment } = usePaymentUnlock();
  const { pdfGenerating, handleGeneratePDF } = usePdfExport();
  const { showToast, handleBuyClick } = useCheckout();
  const uploadRef = useRef(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
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

        {isAnalyzing && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-6 text-slate-400">Analisando sua planilha...</p>
          </div>
        )}

        {result?.free && !isAnalyzing && (
          <div className="space-y-4">
            <FreeResult
              result={result}
              animatedScore={animatedScore}
              unlocked={unlocked}
              onBuyClick={handleBuyClick}
              onCheckPayment={checkHotmartPayment}
              isUnlocking={isUnlocking}
            />

            {unlocked && result?.premium && (
              <div className="space-y-4">
                <ScoreBreakdown breakdown={result.premium.scoreBreakdown} />
                <CategoryAnalysis categories={result.premium.categoryAnalysis} />
                <Charts topCategories={result.premium.topCategories} summary={result.free.summary} />
                <Projections projections={result.premium.projections} />
                <Alerts alerts={result.premium.alerts} />
                <PremiumTips tips={result.premium.premiumSuggestions} />
                <div data-pdf-ignore="true">
                  <PDFButton onClick={() => handleGeneratePDF(result)} loading={pdfGenerating} />
                </div>
              </div>
            )}
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-300 px-6 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
            {OFFER.ctaCheckoutToast}
          </div>
        )}
      </div>
    </div>
  );
}

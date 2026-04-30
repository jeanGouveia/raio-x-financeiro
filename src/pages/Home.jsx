import { useFinancialAnalysis } from "../hooks/useFinancialAnalysis";
import Hero from "../components/Hero";
import UploadSection from "../components/UploadSection";
import FreeResult from "../components/FreeResult";
import PremiumSection from "../components/PremiumSection";
import CTAUnlock from "../components/CTAUnlock";

export default function Home() {
  const {
    loading,
    result,
    unlocked,
    uploadRef,
    handleFile,
    checkPayment,
  } = useFinancialAnalysis();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {!result && <Hero scrollToUpload={() => uploadRef.current?.scrollIntoView()} />}

      <div className="max-w-4xl mx-auto p-6">
        {!result && (
          <UploadSection ref={uploadRef} onFile={handleFile} />
        )}

        {loading && <p className="text-center mt-10">Analisando...</p>}

        {result && !loading && (
          <>
            <FreeResult result={result} />

            {!unlocked && (
              <CTAUnlock onUnlock={checkPayment} />
            )}

            {unlocked && (
              <PremiumSection result={result} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
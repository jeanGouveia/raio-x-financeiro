import { useEffect, useState } from "react";
import { parseExcel } from "../services/parser";
import FinancialAnalyzer from "../services/FinancialAnalyzer";

export function useFinancialAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const handleFile = async (file) => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
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
      setIsAnalyzing(false);
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

  return {
    isAnalyzing,
    result,
    animatedScore,
    handleFile,
  };
}

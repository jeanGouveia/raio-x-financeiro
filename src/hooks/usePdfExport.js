import { useState } from "react";
import { generateFinancialReportPdf } from "../services/generateFinancialReportPdf";

export function usePdfExport() {
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleGeneratePDF = async (result) => {
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

  return {
    pdfGenerating,
    handleGeneratePDF,
  };
}

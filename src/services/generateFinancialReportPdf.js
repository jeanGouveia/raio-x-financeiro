import { jsPDF } from "jspdf";
import { formatCurrencyNumber } from "../utils/formatters";

export function generateFinancialReportPdf(result) {
  if (!result?.premium || !result?.free?.summary) return;

  const summary = result.free.summary;
  const { scoreBreakdown, categoryAnalysis, projections, alerts, premiumSuggestions } = result.premium;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 18;
  const CW = W - M * 2;
  const BG = [15, 23, 42];
  const CARD = [30, 41, 59];
  const GREEN = [16, 185, 129];
  const RED = [239, 68, 68];
  const WHITE = [255, 255, 255];
  const MUTED = [100, 116, 139];
  const TEXT = [203, 213, 225];

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
    doc.roundedRect(x, yy, Math.max(1, (w * pct) / 100), h, 1, 1, "F");
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

  bg();
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
    W / 2,
    63,
    { align: "center" }
  );

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 20, 68, W / 2 + 20, 68);

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
  const diagLines = doc.splitTextToSize(result.free.mainDiagnosis || "", CW - 20);
  doc.text(diagLines, W / 2, 145, { align: "center" });

  const levelY = 145 + diagLines.length * 6 + 4;
  const levelText =
    summary.score >= 85
      ? "Nível avançado"
      : summary.score >= 70
        ? "Nível intermediário"
        : "Em desenvolvimento";
  const levelW = doc.getTextWidth(levelText) + 10;
  doc.setFillColor(10, 61, 41);
  doc.roundedRect(W / 2 - levelW / 2, levelY - 5, levelW, 8, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text(levelText, W / 2, levelY, { align: "center" });

  const mY = levelY + 16;
  const mW = 52;
  const mH = 30;
  const mGap = 4;
  const mStartX = (W - mW * 3 - mGap * 2) / 2;
  [
    { label: "Receita", value: `R$ ${formatCurrencyNumber(summary.totalIncome)}`, color: GREEN },
    { label: "Despesas", value: `R$ ${formatCurrencyNumber(summary.totalExpenses)}`, color: RED },
    { label: "Saldo", value: `R$ ${formatCurrencyNumber(summary.netBalance)}`, color: WHITE },
  ].forEach(({ label, value, color }, index) => {
    const x = mStartX + index * (mW + mGap);
    doc.setFillColor(...CARD);
    doc.roundedRect(x, mY, mW, mH, 3, 3, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, x + mW / 2, mY + 9, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(value, x + mW / 2, mY + 21, { align: "center" });
  });

  const spY = mY + mH + 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Taxa de poupança", M, spY);
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.text(`${summary.savingsRate}%`, W - M, spY, { align: "right" });
  miniBar(M, spY + 4, summary.savingsRate, GREEN, CW, 3);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Exata Finança  ·  Diagnóstico financeiro inteligente", W / 2, 285, { align: "center" });

  newPage();
  sectionTitle("Como seu score foi calculado");

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN);
  doc.text(String(scoreBreakdown.total), M, y);
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text("/100 pontos", M + 22, y);
  y += 10;

  scoreBreakdown.factors.forEach((factor) => {
    checkY(18);
    const pct = Math.round((factor.score / factor.max) * 100);
    const barColor =
      factor.impact === "positive"
        ? GREEN
        : factor.impact === "neutral"
          ? [245, 158, 11]
          : RED;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(factor.label, M, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${factor.score}/${factor.max}`, W - M, y, { align: "right" });

    y += 4;
    miniBar(M, y, pct, barColor, CW * 0.65, 2.5);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(factor.comment, M, y + 6);
    y += 13;

    rule(0.08);
    y += 4;
  });

  y += 4;
  sectionTitle("Análise por categoria");

  if (categoryAnalysis?.length) {
    categoryAnalysis.forEach((category) => {
      checkY(28);
      const statusColors = {
        ótimo: [16, 185, 129],
        aceitável: [245, 158, 11],
        alto: [239, 68, 68],
      };
      const statusColor = statusColors[category.status] || MUTED;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text(category.category, M, y);

      const badgeText = category.status || "";
      const badgeW = doc.getTextWidth(badgeText) + 6;
      doc.setFillColor(20, 40, 35);
      doc.roundedRect(W - M - badgeW, y - 5, badgeW, 7, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(...statusColor);
      doc.text(badgeText, W - M - badgeW / 2, y, { align: "center" });

      y += 5;
      miniBar(M, y, category.percent, statusColor, CW, 2.5);

      y += 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(`${category.percent}% dos gastos  ·  ${category.percentOfIncome}% da renda`, M, y);

      if (category.benchmarkText) {
        y += 5;
        doc.setTextColor(...MUTED);
        doc.text(category.benchmarkText, M, y);
      }

      if (category.potentialSaving > 0) {
        y += 5;
        doc.setTextColor(...GREEN);
        doc.text(
          `Reduzir 20% economiza R$ ${formatCurrencyNumber(category.potentialSaving)}/mês`,
          M,
          y
        );
      }

      y += 8;
      rule(0.08);
      y += 5;
    });
  }

  newPage();
  sectionTitle("Projeções de acúmulo");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    `Baseado em R$ ${formatCurrencyNumber(projections.monthly)}/mês poupado. "Com rendimento" considera ~12% a.a.`,
    M,
    y
  );
  y += 9;

  const projectionWidth = (CW - 9) / 4;
  [
    { period: "3 meses", data: projections.months3 },
    { period: "6 meses", data: projections.months6 },
    { period: "12 meses", data: projections.months12 },
    { period: "24 meses", data: projections.months24 },
  ].forEach(({ period, data }, index) => {
    const px = M + index * (projectionWidth + 3);
    card(30, px, projectionWidth, y);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(period.toUpperCase(), px + projectionWidth / 2, y + 8, { align: "center" });
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(`R$ ${formatCurrencyNumber(data.simple)}`, px + projectionWidth / 2, y + 17, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREEN);
    doc.text(`R$ ${formatCurrencyNumber(data.invested)}`, px + projectionWidth / 2, y + 24, {
      align: "center",
    });
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text("com rendimento", px + projectionWidth / 2, y + 29, { align: "center" });
  });
  y += 38;

  if (projections.emergencyFundTarget) {
    checkY(20);
    card(20, M, CW, y);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("Meta: reserva de emergência (6×)", M + 6, y + 8);
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text(`R$ ${formatCurrencyNumber(projections.emergencyFundTarget)}`, W - M - 6, y + 8, {
      align: "right",
    });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(
      projections.emergencyFundMonths
        ? `Alcançada em ~${projections.emergencyFundMonths} meses no ritmo atual`
        : "Calcule aumentando sua poupança mensal",
      M + 6,
      y + 15
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
      const alertColor = alertColorMap[alert.level] || MUTED;
      card(20, M, CW, y);
      doc.setFillColor(...alertColor);
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

  if (premiumSuggestions?.length) {
    newPage();
    sectionTitle("Recomendações personalizadas");

    premiumSuggestions.forEach((tip, index) => {
      checkY(20);
      doc.setFillColor(10, 61, 41);
      doc.circle(M + 4, y + 1, 4, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(String(index + 1), M + 4, y + 2.5, { align: "center" });
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

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text("Exata Finança  ·  Relatório financeiro", M, 291);
    doc.text(`${page} / ${totalPages}`, W - M, 291, { align: "right" });
  }

  doc.save("Exata_Financa_Relatorio.pdf");
}

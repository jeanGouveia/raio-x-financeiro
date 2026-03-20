export function analyzeData(data) {
  if (!data || data.length === 0) {
    return {
      summary: { income: 0, expense: 0, balance: 0, score: 0 },
      profile: { name: "Não Identificado", icon: "❓", description: "Dados insuficientes." },
      mainDiagnosis: "Não foi possível ler os dados da planilha.",
      biggestProblem: "Verifique se as colunas 'valor', 'tipo' e 'categoria' existem.",
      benchmark: "",
      insights: [],
      actionPlan: [],
      categoryData: [],
      projections: {
        loss10Years: 0,
        savingPotential: 0,
        projectedWealth: 0,
        monthlyInvestment: 0,
        yearlyWaste: 0,
        emergencyReserve: 0,
        monthsToReserve: 0,
        evolution12Months: []
      }
    };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};

  const getValue = (item) => {
    let raw = item.valor || 0;
    if (typeof raw === "string") {
      raw = raw.replace(/\./g, "").replace(",", ".");
    }
    return Math.abs(Number(raw)) || 0;
  };

  const getType = (item) => {
    const type = (item.tipo || "").toLowerCase();
    if (type.includes("receita")) return "receita";
    return "despesa";
  };

  const getCategory = (item) => item.categoria || "Outros";

  data.forEach((item) => {
    const value = getValue(item);
    const type = getType(item);
    const category = getCategory(item);

    if (type === "receita") {
      totalIncome += value;
    } else {
      totalExpense += value;
      categoryMap[category] = (categoryMap[category] || 0) + value;
    }
  });

  const balance = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 1.2;

  // SCORE
  let score = 100;
  if (expenseRatio > 1) score = Math.max(5, 40 - (expenseRatio - 1) * 100);
  else if (expenseRatio > 0.9) score = 50;
  else score = Math.round(100 - (expenseRatio * 60));

  // PROFILE
  let profile = {
    name: "Equilibrado",
    icon: "⚖️",
    description: "Você mantém as contas no azul, mas pode melhorar."
  };

  if (expenseRatio > 1) {
    profile = { name: "Endividado", icon: "🚨", description: "Gasta mais do que ganha." };
  } else if (expenseRatio > 0.9) {
    profile = { name: "No Limite", icon: "⚠️", description: "Sem margem de segurança." };
  } else if (expenseRatio < 0.5) {
    profile = { name: "Investidor", icon: "💰", description: "Ótima capacidade de investir." };
  }

  const categoriesSorted = Object.entries(categoryMap).sort(([, a], [, b]) => b - a);

  const biggestCategory = categoriesSorted[0]?.[0] || "N/A";
  const biggestValue = categoriesSorted[0]?.[1] || 0;
  const biggestPercent = totalExpense > 0 ? (biggestValue / totalExpense) * 100 : 0;

  // =========================
  // 🔥 NOVO BLOCO ESTRATÉGICO
  // =========================

  const savingPotential = totalExpense * 0.15;

  // Projeção 10 anos (realista)
  const months = 120;
  const monthlyRate = 0.008;

  const projectedWealth =
    savingPotential *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  // 💰 Dinheiro "perdido" por ano
  const yearlyWaste = savingPotential * 12;

  // 🎯 Reserva de emergência (6 meses de custo)
  const emergencyReserve = totalExpense * 6;

  // ⏱ Tempo para atingir reserva
  const monthsToReserve =
    savingPotential > 0
      ? Math.ceil(emergencyReserve / savingPotential)
      : 0;

  // 📈 Evolução em 12 meses
  const evolution12Months = [];
  let accumulated = 0;

  for (let i = 1; i <= 12; i++) {
    accumulated += savingPotential;
    evolution12Months.push(Math.round(accumulated));
  }

  // ⚠️ Alerta de risco
  let riskAlert = "";
  if (balance <= 0) {
    riskAlert =
      "Se continuar assim, qualquer imprevisto pode gerar dívida rapidamente.";
  } else if (expenseRatio > 0.85) {
    riskAlert =
      "Sua margem está muito apertada. Pequenos erros podem comprometer seu orçamento.";
  }

  // =========================
  // DIAGNÓSTICO
  // =========================

  const mainDiagnosis =
    expenseRatio > 1
      ? `Déficit mensal de R$ ${Math.abs(balance).toLocaleString("pt-BR")}`
      : `Superávit de R$ ${balance.toLocaleString("pt-BR")}`;

  const biggestProblem =
    biggestPercent > 40
      ? `Alto impacto em ${biggestCategory} (${biggestPercent.toFixed(0)}% dos gastos)`
      : `Gastos distribuídos sem estratégia clara`;

  const insights = categoriesSorted.slice(0, 5).map(([cat, val]) => {
    const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
    return `${cat}: ${pct}% dos gastos`;
  });

  // 🎯 Plano inteligente
  let categoryAction = `Reduzir gastos em ${biggestCategory}`;

  if (biggestCategory.toLowerCase().includes("transporte")) {
    categoryAction = `Reduzir uso de transporte por app pode economizar até R$ ${Math.round(biggestValue * 0.15)}/mês`;
  } else if (biggestCategory.toLowerCase().includes("aliment")) {
    categoryAction = `Pequenos ajustes na alimentação podem economizar R$ ${Math.round(biggestValue * 0.15)}/mês`;
  }

  const actionPlan = [
    `Guardar R$ ${Math.round(totalIncome * 0.1)} assim que receber`,
    categoryAction,
    `Você pode acumular R$ ${Math.round(yearlyWaste)} por ano`,
    `Construir reserva de R$ ${Math.round(emergencyReserve)} em ${monthsToReserve} meses`,
    "Criar controle semanal de gastos"
  ];

  return {
    summary: {
      income: Math.round(totalIncome),
      expense: Math.round(totalExpense),
      balance: Math.round(balance),
      score
    },
    profile,
    mainDiagnosis,
    biggestProblem: riskAlert || biggestProblem,
    benchmark: `Perfil: ${profile.name}`,
    insights,
    actionPlan,
    projections: {
      savingPotential: Math.round(savingPotential),
      projectedWealth: Math.round(projectedWealth),
      loss10Years: Math.round(projectedWealth), // compatibilidade
      monthlyInvestment: Math.round(savingPotential),
      yearlyWaste: Math.round(yearlyWaste),
      emergencyReserve: Math.round(emergencyReserve),
      monthsToReserve,
      evolution12Months
    },
    categoryData: categoriesSorted.map(([name, value]) => ({
      name,
      value: Math.round(value),
      percent:
        totalExpense > 0
          ? ((value / totalExpense) * 100).toFixed(1)
          : "0.0"
    }))
  };
}
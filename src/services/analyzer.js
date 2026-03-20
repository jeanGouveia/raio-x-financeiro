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
        projectedWealth: 0
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

  // 🔥 NOVA LÓGICA (REALISTA)
  const savingPotential = totalExpense * 0.15;

  const months = 120;
  const monthlyRate = 0.008; // 0.8% ao mês (realista)

  const projectedWealth =
    savingPotential *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  // DIAGNÓSTICO
  const mainDiagnosis =
    expenseRatio > 1
      ? `Déficit mensal de R$ ${Math.abs(balance).toLocaleString("pt-BR")}`
      : `Superávit de R$ ${balance.toLocaleString("pt-BR")}`;

  const biggestProblem =
    biggestPercent > 40
      ? `Seu maior gasto é com com ${biggestCategory}`
      : `Gastos distribuídos sem controle claro`;

  const insights = categoriesSorted.slice(0, 5).map(([cat, val]) => {
    const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
    return `${cat}: ${pct}% dos gastos`;
  });

  const actionPlan = [
    "Guardar 10% da renda assim que receber",
    `Reduzir gastos em ${biggestCategory}`,
    "Criar controle semanal de gastos",
    "Eliminar despesas desnecessárias",
    "Começar reserva de emergência"
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
    biggestProblem,
    benchmark: `Perfil: ${profile.name}`,
    insights,
    actionPlan,
    projections: {
      savingPotential: Math.round(savingPotential),
      projectedWealth: Math.round(projectedWealth),
      loss10Years: Math.round(projectedWealth) // mantém compatibilidade com tela antiga
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
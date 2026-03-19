/**
 * ANALYZER PROFISSIONAL - VERSÃO PREMIUM 2.0
 * Focado em Diagnóstico Comportamental e Projeção de Riqueza
 */

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
      projections: { loss10Years: 0, savingPotential: 0 }
    };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};

  // 1. Processamento Base
  const getValue = (item) => {
    let raw = item.valor || item.value || item.amount || item.total || 0;
    if (typeof raw === "string") {
      raw = raw.replace(/\./g, "").replace(",", ".");
    }
    return Math.abs(Number(raw)) || 0;
  };

  const getType = (item) => {
    const type = (item.tipo || item.type || "").toLowerCase().trim();
    if (type.includes("receita") || type.includes("entrada") || type.includes("crédito") || type.includes("salário")) return "receita";
    return "despesa"; 
  };

  const getCategory = (item) => (item.categoria || item.category || "Outros").trim();

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
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 1.2; // Default 120% se não tiver receita
  
  // 2. Cálculo do Score Premium (Logística não-linear)
  let score = 100;
  if (expenseRatio > 1) score = Math.max(5, 40 - (expenseRatio - 1) * 100);
  else if (expenseRatio > 0.9) score = 50;
  else score = Math.round(100 - (expenseRatio * 60));

  // 3. Definição de Arquétipo (Inteligência de Perfil)
  let profile = {
    name: "Equilibrado",
    icon: "⚖️",
    description: "Você mantém as contas no azul, mas pode estar estagnado."
  };

  if (expenseRatio > 1) {
    profile = { name: "Sobrevivente Alavancado", icon: "🚨", description: "Você está usando crédito para manter o padrão de vida." };
  } else if (expenseRatio > 0.9) {
    profile = { name: "Viver no Limite", icon: "⚠️", description: "Qualquer imprevisto pode desestabilizar sua saúde financeira." };
  } else if (expenseRatio < 0.5 && totalIncome > 0) {
    profile = { name: "Investidor Potencial", icon: "💰", description: "Excelente margem de manobra para construção de patrimônio." };
  }

  // 4. Detecção de "Gastos Invisíveis" (Categorias pequenas que somam muito)
  const categoriesSorted = Object.entries(categoryMap).sort(([, a], [, b]) => b - a);
  const biggestCategory = categoriesSorted[0]?.[0] || "N/A";
  const biggestValue = categoriesSorted[0]?.[1] || 0;
  const biggestPercent = totalExpense > 0 ? (biggestValue / totalExpense) * 100 : 0;

  // 5. Projeção de Perda (Ouro para Vendas)
  // Cálculo: Se economizar 15% das despesas e investir a 1% ao mês por 10 anos
  const savingPotential = totalExpense * 0.15;
  const months = 120;
  const monthlyRate = 0.01; 
  const loss10Years = savingPotential * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  // 6. Diagnóstico e Plano de Ação Personalizado
  const mainDiagnosis = expenseRatio > 1 
    ? `Déficit mensal de R$ ${Math.abs(balance).toLocaleString('pt-BR')}. Você está financiando seu consumo.`
    : `Superávit de R$ ${balance.toLocaleString('pt-BR')}. Você tem ${Math.round((1 - expenseRatio) * 100)}% de margem livre.`;

  const biggestProblem = biggestPercent > 40 
    ? `Hiper-concentração em ${biggestCategory}. Esta categoria consome quase metade do seu orçamento.`
    : `Vazamento espalhado: Seus gastos estão diluídos, indicando falta de priorização clara.`;

  const insights = categoriesSorted.slice(0, 5).map(([cat, val]) => {
    const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
    return `Análise de ${cat}: Representa ${pct}% do seu estilo de vida. Uma redução de 15% aqui liberaria R$ ${(val * 0.15).toFixed(2)} mensais.`;
  });

  const actionPlan = [
    `Urgente: Blindar R$ ${Math.round(totalIncome * 0.1)} (10%) logo no recebimento.`,
    `Cortar 15% da categoria ${biggestCategory} através de substituição de marcas ou serviços.`,
    `Regra 50/30/20: Destinar R$ ${Math.round(totalIncome * 0.5)} para fixos e R$ ${Math.round(totalIncome * 0.2)} para investimentos.`,
    `Estabelecer 'Teto de Gastos' semanal para lazer de R$ ${Math.round((totalIncome * 0.2) / 4)}.`,
    `Revisar faturas de cartão em busca de assinaturas esquecidas (estimativa de 5% de economia).`
  ];

  return {
    summary: {
      income: Math.round(totalIncome),
      expense: Math.round(totalExpense),
      balance: Math.round(balance),
      score,
    },
    profile,
    mainDiagnosis,
    biggestProblem,
    benchmark: `Seu perfil é ${profile.name} ${profile.icon}. ${profile.description}`,
    insights,
    actionPlan,
    projections: {
      savingPotential: Math.round(savingPotential),
      loss10Years: Math.round(loss10Years)
    },
    categoryData: categoriesSorted.map(([name, value]) => ({
      name,
      value: Math.round(value),
      percent: totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : "0.0",
    })),
  };
}
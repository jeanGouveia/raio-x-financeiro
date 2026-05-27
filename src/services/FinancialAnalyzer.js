// src/services/FinancialAnalyzer.js
import { supabase } from '../lib/supabase';

export default class FinancialAnalyzer {
  static async analyze(transactions) {
    if (!transactions || transactions.length === 0) {
      return this.getEmptyResult();
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};
    const incomeCategories = {};

    transactions.forEach(t => {
      const valor = Math.abs(parseFloat(t.valor) || 0);
      const tipo = String(t.tipo || "").toLowerCase().trim();
      const cat = String(t.categoria || "Outros").trim();

      const isIncome =
        tipo.includes("receita") ||
        tipo.includes("entrada") ||
        tipo.includes("income") ||
        cat.toLowerCase().includes("salário") ||
        cat.toLowerCase().includes("salario") ||
        cat.toLowerCase().includes("freelance") ||
        cat.toLowerCase().includes("renda");

      if (isIncome) {
        totalIncome += valor;
        incomeCategories[cat] = (incomeCategories[cat] || 0) + valor;
      } else {
        totalExpenses += valor;
        categoryMap[cat] = (categoryMap[cat] || 0) + valor;
      }
    });

    // Se não detectou nenhuma receita, tenta pelo valor positivo/negativo
    if (totalIncome === 0 && totalExpenses > 0) {
      // Reset e tenta pela polaridade do valor
      Object.keys(categoryMap).forEach(k => delete categoryMap[k]);
      Object.keys(incomeCategories).forEach(k => delete incomeCategories[k]);
      totalIncome = 0; totalExpenses = 0;

      transactions.forEach(t => {
        const rawValor = parseFloat(t.valor) || 0;
        const cat = String(t.categoria || "Outros").trim();
        if (rawValor > 0) {
          totalIncome += rawValor;
          incomeCategories[cat] = (incomeCategories[cat] || 0) + rawValor;
        } else if (rawValor < 0) {
          totalExpenses += Math.abs(rawValor);
          categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(rawValor);
        }
      });
    }

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        percentOfIncome: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
      }));

    const topIncomeSources = Object.entries(incomeCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        percent: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
      }));

    const scoreBreakdown = this.calcScoreBreakdown(savingsRate, expenseRatio, topCategories, totalIncome);
    const score = scoreBreakdown.total;

    const freeTips = await this.fetchTips(score, 'free');
    const premiumTips = await this.fetchTips(score, 'premium');

    return {
      summary: {
        totalIncome: Math.round(totalIncome),
        totalExpenses: Math.round(totalExpenses),
        netBalance: Math.round(netBalance),
        savingsRate: Math.round(savingsRate),
        score,
        expenseRatio: Math.round(expenseRatio),
        incomeSourceCount: Object.keys(incomeCategories).length,
        expenseCategoryCount: Object.keys(categoryMap).length,
      },
      topCategories,
      topIncomeSources,
      mainDiagnosis: this.getMainDiagnosis(score, savingsRate, expenseRatio),
      freeSuggestions: freeTips,
      scoreBreakdown,
      categoryAnalysis: this.buildCategoryAnalysis(topCategories, totalIncome, totalExpenses),
      projections: this.buildProjections(netBalance, totalIncome, savingsRate),
      alerts: this.buildAlerts(savingsRate, expenseRatio, topCategories, totalIncome),
      premiumInsights: this.generatePremiumInsights(totalIncome, totalExpenses, topCategories, savingsRate),
      premiumSuggestions: premiumTips,
    };
  }

  static calcScoreBreakdown(savingsRate, expenseRatio, topCategories, totalIncome) {
    const factors = [];

    let savingsScore = 0, savingsComment = '';
    if (savingsRate >= 30) { savingsScore = 40; savingsComment = 'Excelente — acima de 30%'; }
    else if (savingsRate >= 20) { savingsScore = 33; savingsComment = 'Boa — entre 20% e 30%'; }
    else if (savingsRate >= 10) { savingsScore = 22; savingsComment = 'Regular — entre 10% e 20%'; }
    else if (savingsRate >= 0) { savingsScore = 10; savingsComment = 'Baixa — menos de 10%'; }
    else { savingsScore = 0; savingsComment = 'Negativa — gastando mais do que ganha'; }
    factors.push({ label: 'Taxa de poupança', score: savingsScore, max: 40, comment: savingsComment, impact: savingsScore >= 30 ? 'positive' : savingsScore >= 20 ? 'neutral' : 'negative' });

    factors.push({ label: 'Diversificação de renda', score: 6, max: 20, comment: 'Renda identificada no histórico', impact: 'neutral' });

    const biggest = topCategories[0];
    let controlScore = 0, controlComment = '';
    if (!biggest) { controlScore = 25; controlComment = 'Sem despesas registradas'; }
    else if (biggest.percentOfIncome <= 15) { controlScore = 25; controlComment = `Maior gasto (${biggest.category}) é só ${biggest.percentOfIncome}% da renda`; }
    else if (biggest.percentOfIncome <= 25) { controlScore = 18; controlComment = `${biggest.category} representa ${biggest.percentOfIncome}% da renda`; }
    else if (biggest.percentOfIncome <= 40) { controlScore = 10; controlComment = `${biggest.category} está alto: ${biggest.percentOfIncome}% da renda`; }
    else { controlScore = 3; controlComment = `${biggest.category} consome ${biggest.percentOfIncome}% da renda`; }
    factors.push({ label: 'Concentração de gastos', score: controlScore, max: 25, comment: controlComment, impact: controlScore >= 20 ? 'positive' : controlScore >= 12 ? 'neutral' : 'negative' });

    let balanceScore = 0, balanceComment = '';
    if (expenseRatio <= 40) { balanceScore = 15; balanceComment = 'Gastos muito controlados'; }
    else if (expenseRatio <= 60) { balanceScore = 12; balanceComment = 'Boa relação receita/despesa'; }
    else if (expenseRatio <= 75) { balanceScore = 7; balanceComment = 'Margem de melhoria disponível'; }
    else if (expenseRatio <= 90) { balanceScore = 3; balanceComment = 'Orçamento pressionado'; }
    else { balanceScore = 0; balanceComment = 'Orçamento no limite'; }
    factors.push({ label: 'Equilíbrio orçamentário', score: balanceScore, max: 15, comment: balanceComment, impact: balanceScore >= 10 ? 'positive' : balanceScore >= 5 ? 'neutral' : 'negative' });

    const total = Math.min(100, factors.reduce((s, f) => s + f.score, 0));
    return { total, factors };
  }

  static buildCategoryAnalysis(topCategories, totalIncome, totalExpenses) {
    const benchmarks = {
      'Alimentação':  { ideal: 15, max: 25 },
      'Transporte':   { ideal: 10, max: 20 },
      'Lazer':        { ideal: 5,  max: 10 },
      'Saúde':        { ideal: 5,  max: 10 },
      'Moradia':      { ideal: 25, max: 35 },
      'Educação':     { ideal: 5,  max: 10 },
    };

    return topCategories.map(cat => {
      const bench = benchmarks[cat.category];
      let status = 'normal', benchmarkText = null;
      if (bench) {
        if (cat.percentOfIncome > bench.max) {
          status = 'alto';
          benchmarkText = `Ideal: até ${bench.max}% da renda. Você está em ${cat.percentOfIncome}%.`;
        } else if (cat.percentOfIncome <= bench.ideal) {
          status = 'ótimo';
          benchmarkText = `Dentro do ideal (${bench.ideal}% da renda).`;
        } else {
          status = 'aceitável';
          benchmarkText = `Aceitável, mas pode otimizar (ideal: ${bench.ideal}%).`;
        }
      }
      const potentialSaving = Math.round(cat.amount * 0.2);
      return {
        ...cat, status, benchmarkText, potentialSaving,
        savingOpportunity: `Reduzir 20% economiza R$\u00a0${potentialSaving}/mês`,
      };
    });
  }

  static buildProjections(netBalance, totalIncome, savingsRate) {
    const monthly = netBalance;
    const compound = (monthly, rate, months) => {
      let acc = 0;
      for (let i = 0; i < months; i++) acc = (acc + monthly) * (1 + rate);
      return Math.round(acc);
    };
    return {
      monthly,
      months3:  { simple: Math.round(monthly * 3),  invested: compound(monthly, 0.01, 3) },
      months6:  { simple: Math.round(monthly * 6),  invested: compound(monthly, 0.01, 6) },
      months12: { simple: Math.round(monthly * 12), invested: compound(monthly, 0.01, 12) },
      months24: { simple: Math.round(monthly * 24), invested: compound(monthly, 0.01, 24) },
      emergencyFundMonths: monthly > 0 ? Math.ceil((totalIncome * 6) / monthly) : null,
      emergencyFundTarget: Math.round(totalIncome * 6),
      note: savingsRate >= 20
        ? 'Com sua taxa de poupança atual, você consegue montar uma reserva de emergência em poucos meses.'
        : 'Aumentar a poupança em 5% acelera significativamente o acúmulo de patrimônio.',
    };
  }

  static buildAlerts(savingsRate, expenseRatio, topCategories, totalIncome) {
    const alerts = [];
    if (savingsRate < 0) {
      alerts.push({ level: 'critical', title: 'Gastos maiores que a receita', message: 'Você está no vermelho. Reduza despesas imediatamente para evitar endividamento.' });
    } else if (savingsRate < 10) {
      alerts.push({ level: 'warning', title: 'Taxa de poupança muito baixa', message: 'Menos de 10% economizado. Pequenos cortes já fazem diferença — tente chegar a 15%.' });
    }
    if (expenseRatio > 80) {
      alerts.push({ level: 'warning', title: 'Orçamento apertado', message: `${Math.round(expenseRatio)}% da sua renda vai para despesas. Restam poucos R$ para imprevistos.` });
    }
    const biggest = topCategories[0];
    if (biggest && biggest.percentOfIncome > 35) {
      alerts.push({ level: 'warning', title: `"${biggest.category}" está pesado`, message: `Essa categoria sozinha consome ${biggest.percentOfIncome}% da sua renda. Uma boa revisão aqui tem grande impacto.` });
    }
    if (savingsRate >= 25) {
      alerts.push({ level: 'positive', title: 'Taxa de poupança excelente', message: `Você está poupando ${Math.round(savingsRate)}% da renda. Continue e considere diversificar em investimentos.` });
    }
    return alerts;
  }

  static generatePremiumInsights(totalIncome, totalExpenses, topCategories, savingsRate) {
    const biggest = topCategories[0] || { category: 'Outros', percent: 0, amount: 0 };
    return {
      biggestExpense: biggest.category,
      biggestPercent: biggest.percent,
      estimatedMonthlyLoss: Math.round(totalExpenses * 0.25),
      opportunityText: `Se você reduzir em 30% a categoria "${biggest.category}", pode economizar cerca de R$\u00a0${Math.round((biggest.amount || 0) * 0.3)} por mês.`,
    };
  }

  static async fetchTips(score, type) {
    // Fallbacks locais por score — usados quando Supabase não está configurado
    const LOCAL_TIPS = {
      free: {
        high:   ['Você está no caminho certo! Considere diversificar seus investimentos.', 'Mantenha o controle mensal e revise suas metas trimestralmente.'],
        medium: ['Identifique sua maior categoria de gasto e tente reduzir 10% nela.', 'Crie uma reserva de emergência com 3 a 6 meses de despesas.', 'Acompanhe seus gastos semanalmente para não perder o controle.'],
        low:    ['Prioridade: cortar despesas não essenciais imediatamente.', 'Considere renegociar dívidas e contratos fixos.', 'Liste todos os gastos por 30 dias — o que não é medido não é gerenciado.'],
      },
      premium: {
        high:   ['Invista o excedente em renda variável com diversificação setorial.', 'Considere previdência privada para benefícios fiscais de longo prazo.'],
        medium: ['Automatize uma transferência mensal para poupança/investimento no dia do pagamento.', 'Revise assinaturas e serviços recorrentes — média de R$ 200/mês desperdiçados.'],
        low:    ['Monte um plano de quitação de dívidas pelo método avalanche (maior juros primeiro).', 'Busque uma segunda fonte de renda: freelance, aluguel, venda de itens não usados.'],
      },
    };

    try {
      let query = supabase
        .from('tips')
        .select('content')
        .eq('type', type)
        .lte('score_min', score)
        .gte('score_max', score);

      const { data, error } = await query.order('"order"', { ascending: true }).limit(5);
      if (error) throw error;
      if (data && data.length > 0) return data.map(item => item.content);
    } catch {
      // Supabase indisponível — usa fallback
    }

    const bucket = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
    return LOCAL_TIPS[type]?.[bucket] ?? [];
  }

  static getMainDiagnosis(score, savingsRate, expenseRatio) {
    if (score >= 85) return 'Excelente controle financeiro. Você está no caminho certo para construir patrimônio.';
    if (score >= 70) return 'Boa situação, mas ainda há espaço para melhorar a poupança.';
    if (score >= 55) return 'Situação regular. O principal desafio é reduzir o peso das despesas.';
    return 'Situação crítica. Suas despesas estão consumindo quase toda a sua receita.';
  }

  static getEmptyResult() {
    return {
      summary: { totalIncome: 0, totalExpenses: 0, netBalance: 0, savingsRate: 0, score: 0, expenseRatio: 0, incomeSourceCount: 0, expenseCategoryCount: 0 },
      topCategories: [], topIncomeSources: [],
      mainDiagnosis: 'Nenhum dado suficiente para análise.',
      freeSuggestions: ['Continue monitorando seus gastos mensalmente.'],
      scoreBreakdown: { total: 0, factors: [] },
      categoryAnalysis: [], projections: {}, alerts: [],
      premiumInsights: {}, premiumSuggestions: [],
    };
  }
}

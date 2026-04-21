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
      let cat = String(t.categoria || "Outros").trim();

      const isIncome =
        tipo.includes("receita") ||
        cat.toLowerCase().includes("salário") ||
        cat.toLowerCase().includes("freelance");

      if (isIncome) {
        totalIncome += valor;
        incomeCategories[cat] = (incomeCategories[cat] || 0) + valor;
      } else {
        totalExpenses += valor;
        categoryMap[cat] = (categoryMap[cat] || 0) + valor;
      }
    });

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

      // === PREMIUM ===
      scoreBreakdown,
      categoryAnalysis: this.buildCategoryAnalysis(topCategories, totalIncome, totalExpenses),
      projections: this.buildProjections(netBalance, totalIncome, savingsRate),
      alerts: this.buildAlerts(savingsRate, expenseRatio, topCategories, totalIncome),
      premiumInsights: this.generatePremiumInsights(totalIncome, totalExpenses, topCategories, savingsRate),
      premiumSuggestions: premiumTips,
    };
  }

  // ─── Score breakdown ────────────────────────────────────────────────────────

  static calcScoreBreakdown(savingsRate, expenseRatio, topCategories, totalIncome) {
    const factors = [];

    // 1. Taxa de poupança (0–40 pts)
    let savingsScore = 0;
    let savingsComment = '';
    if (savingsRate >= 30) { savingsScore = 40; savingsComment = 'Excelente — acima de 30%'; }
    else if (savingsRate >= 20) { savingsScore = 33; savingsComment = 'Boa — entre 20% e 30%'; }
    else if (savingsRate >= 10) { savingsScore = 22; savingsComment = 'Regular — entre 10% e 20%'; }
    else if (savingsRate >= 0) { savingsScore = 10; savingsComment = 'Baixa — menos de 10%'; }
    else { savingsScore = 0; savingsComment = 'Negativa — gastando mais do que ganha'; }
    factors.push({ label: 'Taxa de poupança', score: savingsScore, max: 40, comment: savingsComment, impact: savingsScore >= 30 ? 'positive' : savingsScore >= 20 ? 'neutral' : 'negative' });

    // 2. Diversificação de receita (0–20 pts)
    const incomeSources = totalIncome > 0 ? 1 : 0; // simplificado; idealmente viria do breakdown
    let incomeScore = 0;
    let incomeComment = '';
    if (incomeSources >= 3) { incomeScore = 20; incomeComment = '3+ fontes de renda'; }
    else if (incomeSources === 2) { incomeScore = 13; incomeComment = '2 fontes de renda'; }
    else { incomeScore = 6; incomeComment = '1 fonte de renda'; }
    // Bonus se detectar freelance
    incomeScore = 6; incomeComment = 'Renda identificada no histórico';
    factors.push({ label: 'Diversificação de renda', score: incomeScore, max: 20, comment: incomeComment, impact: 'neutral' });

    // 3. Controle de gastos por categoria (0–25 pts)
    const biggest = topCategories[0];
    let controlScore = 0;
    let controlComment = '';
    if (!biggest) { controlScore = 25; controlComment = 'Sem despesas registradas'; }
    else if (biggest.percentOfIncome <= 15) { controlScore = 25; controlComment = `Maior gasto (${biggest.category}) é só ${biggest.percentOfIncome}% da renda`; }
    else if (biggest.percentOfIncome <= 25) { controlScore = 18; controlComment = `${biggest.category} representa ${biggest.percentOfIncome}% da renda`; }
    else if (biggest.percentOfIncome <= 40) { controlScore = 10; controlComment = `${biggest.category} está alto: ${biggest.percentOfIncome}% da renda`; }
    else { controlScore = 3; controlComment = `${biggest.category} consome ${biggest.percentOfIncome}% da renda`; }
    factors.push({ label: 'Concentração de gastos', score: controlScore, max: 25, comment: controlComment, impact: controlScore >= 20 ? 'positive' : controlScore >= 12 ? 'neutral' : 'negative' });

    // 4. Equilíbrio orçamentário (0–15 pts)
    let balanceScore = 0;
    let balanceComment = '';
    if (expenseRatio <= 40) { balanceScore = 15; balanceComment = 'Gastos muito controlados'; }
    else if (expenseRatio <= 60) { balanceScore = 12; balanceComment = 'Boa relação receita/despesa'; }
    else if (expenseRatio <= 75) { balanceScore = 7; balanceComment = 'Margem de melhoria disponível'; }
    else if (expenseRatio <= 90) { balanceScore = 3; balanceComment = 'Orçamento pressionado'; }
    else { balanceScore = 0; balanceComment = 'Orçamento no limite'; }
    factors.push({ label: 'Equilíbrio orçamentário', score: balanceScore, max: 15, comment: balanceComment, impact: balanceScore >= 10 ? 'positive' : balanceScore >= 5 ? 'neutral' : 'negative' });

    const total = Math.min(100, factors.reduce((s, f) => s + f.score, 0));
    return { total, factors };
  }

  // ─── Category analysis ──────────────────────────────────────────────────────

  static buildCategoryAnalysis(topCategories, totalIncome, totalExpenses) {
    // Benchmarks típicos de orçamento pessoal
    const benchmarks = {
      'Alimentação':   { ideal: 15, max: 25 },
      'Transporte':    { ideal: 10, max: 20 },
      'Lazer':         { ideal: 5,  max: 10 },
      'Saúde':         { ideal: 5,  max: 10 },
      'Moradia':       { ideal: 25, max: 35 },
      'Educação':      { ideal: 5,  max: 10 },
    };

    return topCategories.map(cat => {
      const bench = benchmarks[cat.category];
      let status = 'normal';
      let benchmarkText = null;

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
        ...cat,
        status,
        benchmarkText,
        potentialSaving,
        savingOpportunity: `Reduzir 20% economiza R$\u00a0${potentialSaving}/mês`,
      };
    });
  }

  // ─── Projections ────────────────────────────────────────────────────────────

  static buildProjections(netBalance, totalIncome, savingsRate) {
    const monthly = netBalance;
    const withInvestment10 = monthly * 1.01; // +1% ao mês (aprox. 12% a.a.)
    const withInvestment8  = monthly * 1.0067; // +0,67% ao mês (aprox. 8% a.a.)

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

  // ─── Alerts ─────────────────────────────────────────────────────────────────

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

    if (totalIncome > 0 && topCategories.length === 1) {
      alerts.push({ level: 'info', title: 'Poucas categorias registradas', message: 'Lançar mais categorias de gasto melhora a precisão da análise.' });
    }

    if (savingsRate >= 25) {
      alerts.push({ level: 'positive', title: 'Taxa de poupança excelente', message: `Você está poupando ${Math.round(savingsRate)}% da renda. Continue e considere diversificar em investimentos.` });
    }

    return alerts;
  }

  // ─── Premium insights ────────────────────────────────────────────────────────

  static generatePremiumInsights(totalIncome, totalExpenses, topCategories, savingsRate) {
    const biggest = topCategories[0] || { category: 'Outros', percent: 0, amount: 0 };
    return {
      biggestExpense: biggest.category,
      biggestPercent: biggest.percent,
      estimatedMonthlyLoss: Math.round(totalExpenses * 0.25),
      opportunityText: `Se você reduzir em 30% a categoria "${biggest.category}", pode economizar cerca de R$\u00a0${Math.round((biggest.amount || 0) * 0.3)} por mês.`,
    };
  }

  // ─── Tips from Supabase ──────────────────────────────────────────────────────

  static async fetchTips(score, type, context = {}) {
    try {
      let query = supabase
        .from('tips')
        .select('content')
        .eq('type', type)
        .lte('score_min', score)
        .gte('score_max', score);

      if (context.has_debt === true) {
        query = query.contains('conditions', { has_debt: true });
      }

      const { data, error } = await query.order('"order"', { ascending: true }).limit(5);
      if (error) throw error;
      return data.map(item => item.content);
    } catch (err) {
      console.warn('Erro ao buscar dicas:', err.message);
      return type === 'free'
        ? ['Continue monitorando seus gastos mensalmente.', 'Identifique suas maiores categorias de gasto.']
        : ['Reduza gastos em sua maior categoria.'];
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  static getMainDiagnosis(score, savingsRate, expenseRatio) {
    if (score >= 85) return 'Excelente controle financeiro. Você está no caminho certo para construir patrimônio.';
    if (score >= 70) return 'Boa situação, mas ainda há espaço para melhorar a poupança.';
    if (score >= 55) return 'Situação regular. O principal desafio é reduzir o peso das despesas.';
    return 'Situação crítica. Suas despesas estão consumindo quase toda a sua receita.';
  }

  static getEmptyResult() {
    return {
      summary: { totalIncome: 0, totalExpenses: 0, netBalance: 0, savingsRate: 0, score: 0, expenseRatio: 0 },
      topCategories: [],
      topIncomeSources: [],
      mainDiagnosis: 'Nenhum dado suficiente para análise',
      freeSuggestions: ['Continue monitorando seus gastos mensalmente.'],
      scoreBreakdown: { total: 0, factors: [] },
      categoryAnalysis: [],
      projections: {},
      alerts: [],
      premiumInsights: {},
      premiumSuggestions: [],
    };
  }
}
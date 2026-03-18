export function analyzeData(data) {
    if (!data || data.length === 0) {
        return {
            alerts: ["Não conseguimos ler sua planilha."],
            suggestions: ["Use colunas: valor, tipo, categoria"],
            summary: {},
            mainDiagnosis: "",
            biggestProblem: "",
            insights: [],
            projection: {},
            actionPlan: [],
            benchmark: ""
        };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let mainDiagnosis = "";
    const categoryMap = {};

    const getValue = (item) =>
        Number(item.valor || item.value || item.amount || 0);

    const getType = (item) =>
        (item.tipo || item.type || "").toLowerCase();

    const getCategory = (item) =>
        item.categoria || item.category || "Outros";

    data.forEach((item) => {
        const value = getValue(item);
        const type = getType(item);
        const category = getCategory(item);

        if (type.includes("receita")) {
            totalIncome += value;
        } else {
            totalExpense += value;
            categoryMap[category] = (categoryMap[category] || 0) + value;
        }
    });

    const score =
        totalIncome === 0
            ? 0
            : Math.max(0, Math.min(100, 100 - (totalExpense / totalIncome) * 100));

    // 🧠 benchmark (simulação estratégica)
    let benchmark = "";
    if (score < 40) {
        benchmark = "Você está pior que a maioria das pessoas em controle financeiro.";
    } else if (score < 70) {
        benchmark = "Você está na média, mas ainda abaixo do ideal.";
    } else {
        benchmark = "Você está melhor que grande parte das pessoas.";
    }

    if (totalExpense > totalIncome) {
        mainDiagnosis =
            "Você está gastando mais do que ganha. Isso tende a gerar dívidas rapidamente.";
    } else if (score < 40) {
        mainDiagnosis =
            "Seu controle financeiro é fraco. Você precisa agir antes que perca o controle.";
    } else if (score < 70) {
        mainDiagnosis =
            "Sua vida financeira está instável. Pequenos ajustes podem melhorar bastante.";
    } else {
        mainDiagnosis =
            "Você tem um bom controle financeiro, mas ainda pode otimizar.";
    }

    const alerts = [];
    const insights = [];

    Object.entries(categoryMap).forEach(([cat, val]) => {
        const percent = (val / totalExpense) * 100;

        if (percent > 40) {
            alerts.push(`Gasto muito alto em ${cat} (${percent.toFixed(1)}%)`);
        }

        const saving = val * 0.2;

        insights.push(
            `Você gasta R$ ${val.toFixed(2)} com ${cat}. Reduzindo 20%, libera R$ ${saving.toFixed(2)}/mês.`
        );
    });

    const balance = totalIncome - totalExpense;

    const projection = {
        scenario:
            balance < 0
                ? `Você pode acumular R$ ${(balance * 12).toFixed(2)} de prejuízo em 12 meses.`
                : `Você pode acumular R$ ${(balance * 12).toFixed(2)} em 12 meses.`
    };

    const summary = {
        income: totalIncome,
        expense: totalExpense,
        balance: balance,
        score: score,
    };

    let biggestProblem =
        totalExpense > totalIncome
            ? "Você está no vermelho"
            : "Seu maior gasto está concentrado em poucas categorias";

    const actionPlan = [
        "Defina um limite semanal de gastos",
        "Reduza seus 2 maiores custos",
        "Evite gastos não essenciais por 7 dias"
    ];

    return {
        alerts,
        summary,
        mainDiagnosis,
        biggestProblem,
        insights,
        projection,
        actionPlan,
        benchmark
    };
}
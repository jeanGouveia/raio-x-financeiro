// src/services/parser.js
import * as XLSX from "xlsx";
import FinancialAnalyzer from "./FinancialAnalyzer";

export async function parseExcel(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: true,
      raw: true
    });

    // === MELHORIA: Busca mais inteligente do cabeçalho ===
    let headerIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const rowStr = row.map(cell => String(cell || "").toLowerCase().trim()).join(" ");

      // Procura por combinações comuns de cabeçalho
      if (
        (rowStr.includes("data") || rowStr.includes("dia")) &&
        (rowStr.includes("descrição") || rowStr.includes("descricao") || rowStr.includes("description")) &&
        (rowStr.includes("categoria") || rowStr.includes("category")) &&
        (rowStr.includes("tipo") || rowStr.includes("type")) &&
        (rowStr.includes("valor") || rowStr.includes("value"))
      ) {
        headerIndex = i;
        break;
      }

      // Alternativa mais flexível: procura por "data" + "valor"
      if (rowStr.includes("data") && rowStr.includes("valor")) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error(
        "Não foi possível encontrar o cabeçalho da tabela.\n\n" +
        "Sua planilha deve ter uma linha com as colunas:\n" +
        "DATA | DESCRIÇÃO | CATEGORIA | TIPO | VALOR\n\n" +
        "Use o modelo oficial ou ajuste o cabeçalho."
      );
    }

    const tableRows = rows.slice(headerIndex);
    const headers = tableRows[0].map(h => 
      String(h || "").trim().toLowerCase().replace(/\s+/g, "")
    );

    // Mapeia colunas de forma mais tolerante
    const col = {
      data: headers.findIndex(h => /data|dia|date/.test(h)),
      descricao: headers.findIndex(h => /descri|description/.test(h)),
      categoria: headers.findIndex(h => /categoria|category|cat/.test(h)),
      tipo: headers.findIndex(h => /tipo|type|mov/.test(h)),
      valor: headers.findIndex(h => /valor|value|montante|amount/.test(h)),
    };

    if (col.valor === -1) {
      throw new Error("Coluna 'VALOR' não encontrada.");
    }

    // Converte para transações
    const transactions = tableRows.slice(1)
      .filter(row => row && row.length > col.valor && row[col.valor] != null)
      .map(row => ({
        data: row[col.data] || "",
        descricao: row[col.descricao] || "",
        categoria: row[col.categoria] || "Outros",
        tipo: row[col.tipo] || "",
        valor: parseFloat(
          String(row[col.valor])
            .replace(/R\$|\s/g, "")
            .replace(",", ".")
        ) || 0
      }))
      .filter(t => !isNaN(t.valor) && t.valor !== 0);

    if (transactions.length === 0) {
      throw new Error("Nenhuma transação válida foi encontrada na planilha.");
    }

    // Análise
    const analysis = FinancialAnalyzer.analyze(transactions);

    return {
      transactions,
      analysis,
      summary: analysis.summary
    };

  } catch (err) {
    console.error("Erro no parser:", err);
    throw err;
  }
}
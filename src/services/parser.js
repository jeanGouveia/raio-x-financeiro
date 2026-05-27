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
      blankrows: false,
      raw: true,
    });

    if (!rows || rows.length < 2) {
      throw new Error("A planilha está vazia ou tem menos de 2 linhas.");
    }

    // Busca inteligente do cabeçalho
    let headerIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      const rowStr = row.map(c => String(c ?? "").toLowerCase().trim()).join(" ");

      if (
        (rowStr.includes("data") || rowStr.includes("dia") || rowStr.includes("date")) &&
        (rowStr.includes("valor") || rowStr.includes("value") || rowStr.includes("montante") || rowStr.includes("amount"))
      ) {
        headerIndex = i;
        break;
      }
    }

    // Fallback: primeira linha não-vazia com pelo menos 3 células
    if (headerIndex === -1) {
      for (let i = 0; i < rows.length; i++) {
        if (Array.isArray(rows[i]) && rows[i].filter(c => c !== "").length >= 3) {
          headerIndex = i;
          break;
        }
      }
    }

    if (headerIndex === -1) {
      throw new Error(
        "Não foi possível encontrar o cabeçalho da tabela.\n\n" +
        "Sua planilha deve ter colunas como:\n" +
        "DATA | DESCRIÇÃO | CATEGORIA | TIPO | VALOR\n\n" +
        "Baixe o modelo oficial para garantir compatibilidade."
      );
    }

    const headerRow = rows[headerIndex];
    const headers = headerRow.map(h => String(h ?? "").trim().toLowerCase().replace(/\s+/g, ""));

    const col = {
      data:      headers.findIndex(h => /^(data|dia|date)/.test(h)),
      descricao: headers.findIndex(h => /descri|description|desc/.test(h)),
      categoria: headers.findIndex(h => /categoria|category|cat/.test(h)),
      tipo:      headers.findIndex(h => /^(tipo|type|mov|movement)/.test(h)),
      valor:     headers.findIndex(h => /valor|value|montante|amount/.test(h)),
    };

    if (col.valor === -1) {
      throw new Error(
        `Coluna 'VALOR' não encontrada.\n` +
        `Cabeçalhos detectados: ${headers.join(", ")}\n\n` +
        `Use o modelo oficial para garantir compatibilidade.`
      );
    }

    const dataRows = rows.slice(headerIndex + 1);

    const transactions = dataRows
      .filter(row => Array.isArray(row) && row.length > col.valor && row[col.valor] != null && row[col.valor] !== "")
      .map(row => {
        // Normaliza a data
        let data = row[col.data] ?? "";
        if (data instanceof Date) {
          data = data.toISOString().split("T")[0];
        } else {
          data = String(data);
        }

        // Normaliza o valor — aceita vírgula ou ponto como decimal
        const rawValor = String(row[col.valor] ?? "")
          .replace(/R\$|\s/g, "")
          .replace(/\./g, (m, offset, str) => {
            // Se tem vírgula, o ponto é separador de milhar
            return str.includes(",") ? "" : m;
          })
          .replace(",", ".");
        const valor = parseFloat(rawValor) || 0;

        return {
          data,
          descricao:  col.descricao  >= 0 ? String(row[col.descricao]  ?? "") : "",
          categoria:  col.categoria  >= 0 ? String(row[col.categoria]  ?? "Outros") : "Outros",
          tipo:       col.tipo       >= 0 ? String(row[col.tipo]       ?? "") : "",
          valor,
        };
      })
      .filter(t => t.valor !== 0 && !isNaN(t.valor));

    if (transactions.length === 0) {
      throw new Error(
        "Nenhuma transação válida encontrada.\n\n" +
        "Verifique se:\n" +
        "• A coluna VALOR contém números\n" +
        "• Há pelo menos uma linha de dados abaixo do cabeçalho\n" +
        "• O arquivo não está em branco"
      );
    }

    const analysis = await FinancialAnalyzer.analyze(transactions);

    return { transactions, analysis, summary: analysis.summary };

  } catch (err) {
    console.error("Erro no parser:", err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

import * as XLSX from "xlsx";

export async function parseExcel(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converte tudo para array de arrays (inclui linhas vazias e células mescladas)
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,          // retorna arrays simples [val1, val2, ...]
      defval: "",         // células vazias viram ""
      blankrows: true,    // não remove linhas em branco
      raw: true          // tenta converter datas e números corretamente
    });

    // Procura a linha do cabeçalho real (DATA, TIPO, VALOR, CATEGORIA)
    let headerIndex = -1;
    const headerKeywords = ["data", "tipo", "valor", "categoria", "date", "type", "value", "category"];

    for (let i = 0; i < Math.min(rows.length, 30); i++) {  // só olha as primeiras 30 linhas
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const lowerRow = row.map(cell => 
        String(cell || "").toLowerCase().trim()
      );

      // Conta quantas palavras-chave aparecem na linha
      const matchCount = lowerRow.filter(cell => 
        headerKeywords.some(kw => cell.includes(kw))
      ).length;

      if (matchCount >= 3) {  // pelo menos 3 das 4 colunas
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error(
        "Não encontrei o cabeçalho da tabela (DATA / TIPO / VALOR / CATEGORIA).\n" +
        "Tente usar o modelo oficial ou verificar se a planilha tem esses títulos."
      );
    }

    // Pega a partir do cabeçalho
    const tableRows = rows.slice(headerIndex);

    // Cabeçalho normalizado
    const headers = tableRows[0].map(h => 
      String(h || "").trim().toLowerCase().replace(/\s+/g, "")
    );

    // Mapeia posições das colunas (flexível)
    const col = {
      data:      findColumn(headers, ["data", "date", "dia", "dt"]),
      tipo:      findColumn(headers, ["tipo", "type", "mov", "natureza"]),
      valor:     findColumn(headers, ["valor", "value", "montante", "amount"]),
      categoria: findColumn(headers, ["categoria", "category", "cat", "grupo"])
    };

    if (col.valor === null) {
      throw new Error("Coluna 'VALOR' não encontrada após o cabeçalho.");
    }

    // Converte as linhas de dados (pula o cabeçalho)
    const transactions = tableRows.slice(1)
      .filter(row => {
        // Só linhas que têm valor numérico válido
        if (!row || row.length === 0) return false;
        const val = cleanValue(row[col.valor]);
        return val !== "" && !isNaN(val) && val != null;
      })
      .map(row => ({
        data:      row[col.data]      || "",
        tipo:      row[col.tipo]      || "",
        valor:     cleanValue(row[col.valor]),
        categoria: row[col.categoria] || "Outros"
      }));

    if (transactions.length === 0) {
      throw new Error("Nenhuma transação válida encontrada após o cabeçalho.");
    }

    return transactions;

  } catch (err) {
    console.error("Erro no parser:", err);
    throw err;  // repassa para o App.jsx mostrar alert
  }
}

// Helpers
function findColumn(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    if (keywords.some(kw => headers[i].includes(kw))) {
      return i;
    }
  }
  return null;
}

function cleanValue(val) {
  if (val == null) return 0;

  // Se já for número, retorna direto
  if (typeof val === "number") {
    return val;
  }

  let str = String(val).trim();

  // Remove R$ e espaços
  str = str.replace(/R\$/g, "").replace(/\s/g, "");

  // Se tiver vírgula (formato brasileiro)
  if (str.includes(",")) {
    str = str.replace(/\./g, ""); // remove milhar
    str = str.replace(",", ".");  // decimal
  }

  const num = parseFloat(str);

  return isNaN(num) ? 0 : num;
}
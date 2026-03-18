import * as XLSX from "xlsx";

export async function parseExcel(file) {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return json;
}
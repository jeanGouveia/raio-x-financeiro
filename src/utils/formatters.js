export function formatCurrencyNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

// Para campos de input date "YYYY-MM-DD"
export function formatInputDate(date: Date): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

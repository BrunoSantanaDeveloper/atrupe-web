// Filter options for Cash Flow Projection Report

export const periodOptions = [
  { value: 'current_month', label: 'Mês atual' },
  { value: 'next_month', label: 'Próximo mês' },
  { value: 'next_3_months', label: 'Próximos 3 meses' },
  { value: 'next_6_months', label: 'Próximos 6 meses' },
  { value: 'custom', label: 'Personalizado' },
]

export const movementOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'revenue', label: 'Recebidas' },
  { value: 'expense', label: 'Pagas' },
]

export const groupByOptions = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'date', label: 'Data' },
  { value: 'client', label: 'Cliente' },
]

export const orderByOptions = [
  { value: 'dueDate', label: 'Data do recebimento' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
  { value: 'clientName', label: 'Nome do cliente' },
]

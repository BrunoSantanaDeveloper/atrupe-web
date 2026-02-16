// Filter options for Cash Flow Projection Report

export const periodOptions = [
  { value: 'next_7_days', label: 'Próximos 7 dias' },
  { value: 'next_15_days', label: 'Próximos 15 dias' },
  { value: 'next_30_days', label: 'Próximos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
]

export const movementOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'revenue', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
]

export const groupByOptions = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'date', label: 'Data' },
]

export const orderByOptions = [
  { value: 'dueDate', label: 'Data' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

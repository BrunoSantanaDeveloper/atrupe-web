// Filter options for Financial Report

export const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '15days', label: 'Últimos 15 dias' },
  { value: 'thisMonth', label: 'Mês atual' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
]

export const statusOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'received', label: 'Recebidas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'to_receive', label: 'A receber' },
  { value: 'overdue', label: 'Vencidas' },
]

export const groupByOptions = [
  { value: 'none', label: 'Nenhum' },
  { value: 'client', label: 'Cliente' },
  { value: 'date', label: 'Data' },
]

export const orderByOptions = [
  { value: 'receivedDate', label: 'Data do recebimento' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
  { value: 'clientName', label: 'Nome do cliente' },
]

export const tabOptions = [
  { value: 'receitas', label: 'Receitas' },
  { value: 'despesas', label: 'Despesas' },
]

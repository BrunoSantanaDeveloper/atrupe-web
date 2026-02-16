// Filter options for Financial Report

export const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '15days', label: 'Últimos 15 dias' },
  { value: 'thisMonth', label: 'Mês atual' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
]

export const statusOptionsReceitas = [
  { value: 'received', label: 'Recebidas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'to_receive', label: 'A receber' },
  { value: 'overdue', label: 'Vencidas' },
]

export const statusOptionsDespesas = [
  { value: 'received', label: 'Pagas' },
  { value: 'to_receive', label: 'A pagar' },
  { value: 'overdue', label: 'Vencidas' },
]

export const groupByOptionsReceitas = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'client', label: 'Cliente' },
]

export const groupByOptionsDespesas = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'client', label: 'Fornecedor' },
]

export const orderByOptionsReceitas = [
  { value: 'saleDate', label: 'Data da venda' },
  { value: 'receivedDate', label: 'Data do recebimento' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

export const orderByOptionsDespesas = [
  { value: 'dueDate', label: 'Data do vencimento' },
  { value: 'receivedDate', label: 'Data do pagamento' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

export const tabOptions = [
  { value: 'receitas', label: 'Receitas' },
  { value: 'despesas', label: 'Despesas' },
]

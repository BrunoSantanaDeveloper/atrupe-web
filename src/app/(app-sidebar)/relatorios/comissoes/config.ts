// Filter options for Commission Report (Comissões)

export const commissionOptions = [
  { value: 'sold_value', label: 'Valor vendido' },
  { value: 'received_value', label: 'Valor recebido' },
]

export const periodOptions = [
  { value: 'current_month', label: 'Mês atual' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
]

export const groupByOptions = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'none', label: 'Nenhum' },
]

export const orderByOptions = [
  { value: 'receivedDate', label: 'Data do recebimento' },
  { value: 'saleDate', label: 'Data da venda' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

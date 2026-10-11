// Filter options for Commission Report (Comissões)

export const groupByOptions = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'saleDate', label: 'Data da venda' },
  { value: 'receivedDate', label: 'Data do recebimento' },
]

export const orderByOptions = [
  { value: 'saleDate', label: 'Data da venda' },
  { value: 'receivedDate', label: 'Data do recebimento' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

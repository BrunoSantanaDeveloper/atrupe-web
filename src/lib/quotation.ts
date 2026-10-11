// Os status listados em cada tipo de botão (ação) são os status do orçamento que o botão estará disponível
export const actionRules: { [key: string]: string[] } = {
  notes: ['ALL'],
  image: ['ALL'],
  duplicate: ['OPEN'],
  edit: ['OPEN'],
  values: ['OPEN'],
  delete: ['OPEN'],
  addItem: ['OPEN'],
  delivery: ['OPEN'],
  paymentConditions: ['OPEN'],
  editQuotation: ['OPEN'],
  duplicateQuotation: ['ALL'],
}

export const actionDisabled = (actionType: string, status: string) => {
  const rule = actionRules[actionType]

  if (rule?.includes('ALL')) return false

  return !rule?.includes(status)
}

// Preço de venda do terceirizado avulso a partir do custo (MS-16, T-4):
// custo ÷ (1 − markup). Valores em centavos; markup em percentual
export const outsourcedPriceFromCost = (cost: number, markup: number) => {
  const factor = 1 - Math.min(Math.max(markup, 0), 99) / 100
  return Math.round(cost / factor)
}

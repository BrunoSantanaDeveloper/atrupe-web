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

// Preço de venda do terceirizado avulso a partir do custo (T-4, T-5):
// custo + acréscimo sobre o custo. Valores em centavos; acréscimo em
// percentual. R$ 200 com 45 % → R$ 290
export const outsourcedPriceFromCost = (cost: number, markup: number) => {
  return Math.round(cost * (1 + Math.max(markup, 0) / 100))
}

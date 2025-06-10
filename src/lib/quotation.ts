// Os status listados em cada tipo de botão (ação) são os status do orçamento que o botão estará disponível
export const actionRules: { [key: string]: string[] } = {
  notes: ['ALL'],
  image: ['ALL'],
  duplicate: ['OPEN'],
  edit: ['OPEN'],
  values: ['OPEN'],
  delete: ['OPEN'],
  addItem: ['OPEN'],
  delivery: ['OPEN', 'DONE'],
  paymentConditions: ['OPEN', 'DONE'],
  editQuotation: ['OPEN'],
  duplicateQuotation: ['ALL'],
}

export const actionDisabled = (actionType: string, status: string) => {
  const rule = actionRules[actionType]

  if (rule?.includes('ALL')) return false

  return !rule?.includes(status)
}

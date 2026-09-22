export type CostCriterion =
  | 'LAST_MONTH'
  | 'AVG_3'
  | 'AVG_6'
  | 'AVG_12'
  | 'MANUAL'

// Valores em centavos. `null` = sem histórico suficiente para o cálculo.
export type AdminExpenseAccount = {
  id: string
  name: string
  chartAccount: string
  groupId: string
  lastMonth: number | null
  avg3: number | null
  avg6: number | null
  avg12: number | null
  criterion: CostCriterion
  manualValue: number | null
  referenceValue: number | null
}

export type AdminExpenseGroup = {
  id: string
  name: string
}

export type AdminExpensesResponse = {
  // Último mês completo usado nas médias, no formato AAAA-MM
  referenceMonth: string
  groups: AdminExpenseGroup[]
  accounts: AdminExpenseAccount[]
}

export type AdminExpensesTotals = {
  total: number
  byAverage: number
  manual: number
  referenceValue: number
}

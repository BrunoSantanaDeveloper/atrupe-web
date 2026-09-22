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

// A natureza vem do cadastro do setor (regras-de-negocio/areas/05-base-de-custos.md, BC-7)
export type SectorNature = 'ADMINISTRATIVE' | 'PRODUCTIVE'

// Valores em centavos. `percentage` é inteiro de 0 a 100:
// no setor administrativo é quanto do custo dele é distribuído;
// no setor produtivo é quanto do total administrativo ele recebe (BC-5 e BC-6).
export type DistributionSector = {
  id: string
  name: string
  nature: SectorNature
  percentage: number
  directCost: number | null
}

export type DistributionResponse = {
  referenceMonth: string
  sectors: DistributionSector[]
}

export type DistributionTotals = {
  administrativeCost: number
  distributedCost: number
  notDistributedCost: number
  receivingSectors: number
}

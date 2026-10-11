// Tipos da área de Precificação (regras-de-negocio/areas/06-precificacao.md).
// Valores em centavos; percentuais com uma casa decimal.

export type PricingGroup = 'labor' | 'machines' | 'materials' | 'products'

export type PricingParameters = {
  taxation: number
  commission: number
  financialCost: number
  desiredMargin: number
  // Calculado pelo método divisor: 1 ÷ (1 − soma dos quatro)
  markup: number
}

export type PricingGroupSummary = {
  group: PricingGroup
  total: number
  priced: number
  pending: number
  belowCost: number
}

export type PricingSummary = {
  referenceMonth: string
  parameters: PricingParameters
  groups: PricingGroupSummary[]
}

export type PriceRule = 'FIXED' | 'VARIABLE'

export type PricingItem = {
  id: string
  name: string
  code: string
  sector: string
  unit: string
  cost: number | null
  costUpdatedAt: string | null
  rule: PriceRule
  price: number | null
  margin: number | null
  status: 'PRICED' | 'PENDING' | 'BELOW_COST' | 'NO_COST'
}

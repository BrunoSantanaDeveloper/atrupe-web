// Tipos da área de Precificação (regras-de-negocio/areas/06-precificacao.md).
// Valores em centavos; parâmetros e lucro em décimos de ponto (60 = 6,0%);
// margem em % com uma casa decimal.

export type PricingGroup = 'labor' | 'machines' | 'materials' | 'products'

export type PricingParameters = {
  taxation: number
  commission: number
  financialCost: number
  desiredMargin: number
  // Calculado pela API no método divisor: 1 ÷ (1 − soma dos quatro), com duas
  // casas. Nulo quando encargos e lucro somam 100% ou mais: não há markup que
  // os pague
  markup: number | null
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

export type PricingStatus = 'PRICED' | 'PENDING' | 'BELOW_COST' | 'NO_COST'

export type PricingItem = {
  // Mão de obra: o id do setor. Máquinas: "setup:<configuração>" ou
  // "group:<grupo de bens>". Materiais: "mat:<material>[:<variação>]".
  // Produtos: o id do produto
  id: string
  name: string
  code: string | null
  sector: string | null
  unit: string
  cost: number | null
  costUpdatedAt: string | null
  rule: PriceRule
  price: number | null
  // O lucro que o preço variável preserva, em décimos de ponto. Opcional: o
  // cadastro de materiais e o de produtos montam o item sem ele
  profit?: number | null
  margin: number | null
  status: PricingStatus
}

// Uma página da lista de um grupo: a tela pagina pela URL
export type PricingItemsPage = {
  referenceMonth: string
  items: PricingItem[]
  page: number
  lastPage: number
  total: number
}

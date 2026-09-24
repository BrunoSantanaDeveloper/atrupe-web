// Composição do produto (documentação funcional §10 e DC-2/DC-14/DC-15).
// O produto nasce no START e ganha composição no PRO, sem recadastro.
// Valores em centavos.

// A etapa é um processo de um setor OU outro produto usado como parte
// (IP-9): o totem tem base, estrutura e letreiro, cada um com composição
export type StepKind = 'PROCESS' | 'PART'

export type CompositionStep = {
  id: string
  kind: StepKind
  name: string
  sector: string
  // Preenchido quando a etapa é uma parte: o produto usado dentro deste
  partId: string | null
  // Minutos de preparo herdados do processo (CP-15)
  setupMinutes: number
  // O processo pode ser um cadastro pronto ou composição direta da etapa
  processId: string | null
  estimatedMinutes: number
  cost: number
}

// Variável do produto, declarada UMA vez e consumida por quantas etapas
// precisarem (IP-4). No legado cada processo tinha o seu campo extra, e o
// mesmo número aparecia com três nomes e três valores diferentes
export type ProductField = {
  id: string
  name: string
  defaultValue: number
  // Etapas que usam esta variável: é o que mostra que ela não está solta
  usedBy: string[]
}

// Variação do produto composto: a camiseta em P, M, G e GG (PV-1). A
// variação NASCE herdando a composição base e só o que for alterado passa a
// ser dela, para não criar divergência silenciosa (PV-2)
export type ProductVariation = {
  id: string
  name: string
  // Preço próprio; sem ele vale o do produto (PV-4)
  price: number | null
  // Etapas cujo valor foi alterado nesta variação. O que não estiver aqui
  // continua acompanhando a base
  overrides: { stepId: string; cost: number; estimatedMinutes: number }[]
}

export type ProductComposition = {
  id: string
  name: string
  code: string
  unit: string
  // Preço que a empresa já praticava, preservado na migração (DC-15)
  price: number | null
  priceRule: 'FIXED' | 'VARIABLE'
  steps: CompositionStep[]
  variations: ProductVariation[]
  // Produto não liberado para venda é uma PARTE: serve para compor outros
  // produtos e não aparece para o vendedor no orçamento (CP-17)
  releasedForSale: boolean
  // Os campos que o vendedor preenche no orçamento, além de largura, altura e
  // quantidade (IP-6)
  fields: ProductField[]
  // null quando ainda não há composição: a tela mostra "custo não calculado"
  cost: number | null
  margin: number | null
  suggestedPrice: number | null
}

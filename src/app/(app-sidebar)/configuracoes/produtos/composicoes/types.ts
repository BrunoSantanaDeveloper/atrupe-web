// Composição do produto (documentação funcional §10 e DC-2/DC-14/DC-15).
// O produto nasce no START e ganha composição no PRO, sem recadastro.
// Valores em centavos.

export type CompositionStep = {
  id: string
  name: string
  sector: string
  // O processo pode ser um cadastro pronto ou composição direta da etapa
  processId: string | null
  estimatedMinutes: number
  cost: number
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
  // null quando ainda não há composição: a tela mostra "custo não calculado"
  cost: number | null
  margin: number | null
  suggestedPrice: number | null
}

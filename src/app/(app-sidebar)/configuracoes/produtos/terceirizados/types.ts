// Terceirizados (documentação funcional §11 e regras-de-negocio/areas/07-terceirizados.md).
// Custo variável ligado à venda: não entra na Base de custos, entra na
// composição. Valores em centavos.

export type OutsourcedService = {
  id: string
  name: string
  supplier: string
  unit: string
  cost: number
  price: number | null
  // Margem calculada do preço sobre o custo; null quando não há preço
  margin: number | null
  active: boolean
}

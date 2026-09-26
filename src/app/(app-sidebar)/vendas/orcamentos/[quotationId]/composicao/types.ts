// Itens do orçamento com composição completa (PRO em diante).
// Base: areas/08-composicao.md §3.9 (ORC-1 a ORC-6). Valores em centavos.
//
// A tela completa é desenhada primeiro e a versão do LITE é um recorte dela
// (ORC-6): menos tipos de recurso, sem processos e sem campos extras.

export type QuotationLineKind = 'PROCESS' | 'PART' | 'LOOSE'

// O retrato do cálculo no momento da venda (ORC-10). Sem ele não há contra o
// que comparar depois: refazer a conta no futuro dá outro número, porque
// custo de material e custo-hora mudam todo mês.
export type ResolvedResource = {
  id: string
  kind: 'MACHINE' | 'MATERIAL' | 'LABOR' | 'OUTSOURCED'
  name: string
  unit: string
  // Consumo previsto pela composição
  quantity: number
  unitCost: number
  cost: number
  // Consumo apurado na produção. Fica vazio até existir apontamento:
  // tempo no ELITE, material no FULL (ORC-9)
  actualQuantity: number | null
  actualCost: number | null
}

// Uma linha de dentro do item: o processo, a parte ou o terceirizado avulso
// que compõem o que está sendo vendido
export type QuotationLine = {
  id: string
  kind: QuotationLineKind
  name: string
  sector: string
  // Medidas e campos informados nesta venda, mostrados como etiquetas na
  // linha — é o que permite conferir de onde saiu o preço (ORC-5)
  tags: string[]
  cost: number
  price: number
  // Data em que o cálculo foi resolvido, e o retrato dele
  resolvedAt: string
  resolved: ResolvedResource[]
}

// O que o vendedor preencheu num produto com composição (IP-36): campos
// extras, escolhas e listas. O resumo é o que aparece na linha do item
export type ItemComposition = {
  extras: { blockId: string; value: number }[]
  // Tempo das etapas que pedem, em minutos (digitado em h:mm, IP-33)
  times: { blockId: string; minutes: number }[]
  choices: { blockId: string; lineId: string; optionId: string }[]
  // As linhas opcionais e se entraram nesta venda (IP-28)
  optionals: { blockId: string; lineId: string; included: boolean }[]
  lists: {
    blockId: string
    lineId: string
    optionId: string
    quantity: number
  }[]
  summary: string[]
}

export type QuotationItem = {
  id: string
  name: string
  // Produto com composição: permite abrir o relatório da composição completa
  productId?: string
  composition?: ItemComposition
  // Tipo interno (produto pronto, composição montada na hora). Fica discreto:
  // o vendedor não escolhe entre serviço, item pronto e produto (ORC-3)
  origin: 'LIBRARY' | 'COMPOSED'
  sector: string
  quantity: number
  width: number
  height: number
  // Campos do produto preenchidos nesta venda (IP-6)
  fields: { name: string; value: number }[]
  // Variação vendida. Sem ela a produção não sabe o que cortar e o estoque
  // não sabe o que baixar (PV-3)
  variation: string | null
  lines: QuotationLine[]
  discount: number
  // Preço praticado do item; quando vazio, vale a soma das linhas
  price: number | null
}

export type Quotation = {
  id: string
  reference: string
  client: string
  items: QuotationItem[]
}

// Opções oferecidas ao acrescentar, conforme o nível (ORC-5)
export type AddOption = {
  id: string
  name: string
  sector: string
  unit: string
  price: number
  // Produto não liberado para venda é parte: só aparece dentro do item
  releasedForSale?: boolean
  // Campos que o produto declara e o vendedor preenche na venda (IP-6)
  fields?: { name: string; defaultValue: number }[]
  // Variações do produto (tamanho, modelo): mudam a composição e podem ter
  // preço próprio (PV-1 a PV-5)
  variations?: { id: string; name: string; price: number | null }[]
  // Produto vendido por medida pede largura e altura; por unidade, não
  measured?: boolean
  // O produto tem composição cadastrada (PRO)
  hasComposition?: boolean
}

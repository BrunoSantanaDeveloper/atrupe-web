// Itens do orçamento com composição completa (PRO em diante).
// Base: areas/08-composicao.md §3.9 (ORC-1 a ORC-6). Valores em centavos.
//
// A tela completa é desenhada primeiro e a versão do LITE é um recorte dela
// (ORC-6): menos tipos de recurso, sem processos e sem campos extras.

export type QuotationLineKind = 'PROCESS' | 'PART' | 'LOOSE'

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
}

export type QuotationItem = {
  id: string
  name: string
  // Tipo interno (produto pronto, composição montada na hora). Fica discreto:
  // o vendedor não escolhe entre serviço, item pronto e produto (ORC-3)
  origin: 'LIBRARY' | 'COMPOSED'
  sector: string
  quantity: number
  width: number
  height: number
  // Campos do produto preenchidos nesta venda (IP-6)
  fields: { name: string; value: number }[]
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
  // Produto vendido por medida pede largura e altura; por unidade, não
  measured?: boolean
}

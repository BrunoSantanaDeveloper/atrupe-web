// O produto composto montado por etapas — o "item pronto" do legado na nova
// versão (área 8, §3.4.1, IP-14 a IP-24, e MS-3 a MS-8). Valores em
// centavos; medidas em metros.
//
// Vocabulário: "base" é o que recebe o acabamento (a lona impressa do
// banner). O legado chamava de "item pai".

// Types
import type {
  FormulaKey,
  ResourceKind,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Situação do produto composto (IP-14): compor leva tempo, e o vendedor não
// pode pegar no orçamento um produto pela metade
export type AssemblyStatus = 'DRAFT' | 'RELEASED' | 'PART'

// A cobrança segue o cadastro de produtos do START (IP-17): a unidade
// comercial, o valor de venda por essa unidade e o padrão de medidas. A
// composição só acrescenta o custo e o preço sugerido, na mesma unidade
export type UnitKind =
  | 'AREA'
  | 'LENGTH'
  | 'WEIGHT'
  | 'CAPACITY'
  | 'DISTANCE'
  | 'DURATION'
  | 'UNITY'

// Os mesmos rótulos do cadastro do START (UnitOfMeasureField)
export const unitKindObj: { [key in UnitKind]: string } = {
  LENGTH: 'Metro Linear (m)',
  WEIGHT: 'Peso (kg)',
  CAPACITY: 'Litro (l)',
  DISTANCE: 'Distância (km)',
  DURATION: 'Tempo (h)',
  UNITY: 'Unidade (un)',
  AREA: 'Metro Quadrado (m²)',
}

// "Valor de venda m²", como no START (UnitCostInput)
export const unitSaleLabel: { [key in UnitKind]: string } = {
  AREA: 'Valor de venda m²',
  LENGTH: 'Valor de venda metro',
  CAPACITY: 'Valor de venda litro',
  WEIGHT: 'Valor de venda kg',
  DISTANCE: 'Valor de venda km',
  DURATION: 'Valor de venda hora',
  UNITY: 'Valor de venda unitário',
}

export const unitSymbol: { [key in UnitKind]: string } = {
  AREA: 'm²',
  LENGTH: 'm',
  CAPACITY: 'l',
  WEIGHT: 'kg',
  DISTANCE: 'km',
  DURATION: 'h',
  UNITY: 'un',
}

// O campo do padrão de medidas quando a unidade não é m² nem unidade
export const unitAmountLabel: { [key in UnitKind]: string } = {
  AREA: 'Área total',
  LENGTH: 'Medida',
  CAPACITY: 'Quantidade',
  WEIGHT: 'Peso',
  DISTANCE: 'Distância',
  DURATION: 'Tempo',
  UNITY: '',
}

// A medida do produto no orçamento (IP-16)
export type ProductDimension = 'SALE' | 'FIXED'

export const productDimensionObj: { [key in ProductDimension]: string } = {
  SALE: 'Medida informada na venda',
  FIXED: 'Medida fixa',
}

// Regras de venda do processo (MS-3 a MS-6). O processo define; o produto
// pode sobrescrever só para ele (IP-18)
export type QuantityMode = 'HIDDEN_ONE' | 'FREE' | 'AREA_RATIO'

export const quantityModeObj: { [key in QuantityMode]: string } = {
  HIDDEN_ONE: 'Uma unidade, sem perguntar ao vendedor',
  FREE: 'O vendedor informa',
  AREA_RATIO: 'Quantas cabem na base (área da base ÷ área desta etapa)',
}

export type ExtraFieldKind = 'NONE' | 'DECIMAL' | 'INTEGER'

export const extraFieldKindObj: { [key in ExtraFieldKind]: string } = {
  NONE: 'Sem campo extra',
  DECIMAL: 'Número com casas decimais',
  INTEGER: 'Número inteiro',
}

export type SaleRules = {
  quantityMode: QuantityMode
  // Acompanha a quantidade da base (500 cartões → 500 laminações) ou entra
  // uma vez por pedido (a arte, o preparo)
  followsBase: boolean
  dimension: DimensionRule
  timeField: boolean
  extraField: ExtraFieldKind
  extraFieldName: string
  extraFieldDefault: number
  descriptionEditable: boolean
}

// Uma linha da etapa: um recurso, ou um grupo de recursos (IP-21)
export type LineMode = 'SINGLE' | 'CHOOSE' | 'LIST'

export const lineModeObj: { [key in LineMode]: string } = {
  SINGLE: 'Recurso único',
  CHOOSE: 'Escolha de um',
  LIST: 'Lista para o vendedor preencher',
}

export type ResourceOption = {
  id: string
  name: string
  unit: string
  // Custo por unidade do recurso. Mão de obra: por minuto
  unitCost: number
}

export type AssemblyLine = {
  id: string
  name: string
  kind: ResourceKind
  mode: LineMode
  options: ResourceOption[]
  selectedId: string
  // Consumo por unidade da fórmula (2,2 m de madeira por metro de largura)
  perUnit: number
  formula: FormulaKey
  // Perda e mínimo são de cada linha, não regra do sistema (CP-8)
  lossPercent: number
  minimum: number | null
  // Ajustada neste produto: o processo original continua como estava
  overridden: boolean
}

export type BlockRole = 'BASE' | 'FINISHING'

export type AssemblyBlock = {
  id: string
  processId: string
  name: string
  sector: string
  role: BlockRole
  // O acabamento sabe de qual base ele é (MS-2)
  baseBlockId: string | null
  setupMinutes: number
  // Custo-hora do setor, para o preparo. Vem da Base de custos
  sectorHourCost: number
  taskType: string
  // As regras do processo e, quando houver, as deste produto
  originalRules: SaleRules
  localRules: SaleRules | null
  lines: AssemblyLine[]
}

export type AssemblyMeasure = {
  quantity: number
  width: number
  height: number
}

export type ProductAssembly = {
  productId: string
  name: string
  code: string
  status: AssemblyStatus
  dimension: ProductDimension
  unitKind: UnitKind
  // Valor de venda por unidade comercial, como no START
  unitPrice: number | null
  // Padrão de medidas: no m², largura × altura; nas outras unidades, a
  // quantidade nelas (3 m, 2 kg). Largura e altura também alimentam a
  // composição, mesmo quando o produto é vendido por unidade
  measure: AssemblyMeasure
  unitAmount: number
  allowEditValues: boolean
  allowEditDescription: boolean
  technicalDescription: string
  blocks: AssemblyBlock[]
}

// O que o servidor devolve depois de calcular (SEG-1)
export type ComputedLine = AssemblyLine & {
  selected: ResourceOption | null
  quantity: number | null
  cost: number | null
}

export type ComputedBlock = Omit<AssemblyBlock, 'lines'> & {
  rules: SaleRules
  measure: AssemblyMeasure
  setupCost: number
  cost: number
  lines: ComputedLine[]
}

export type ComputedAssembly = Omit<ProductAssembly, 'blocks'> & {
  area: number
  blocks: ComputedBlock[]
  cost: number
  suggestedPrice: number
  // Quanto de unidade comercial há na medida (1,08 m², 3 m, 1 un)
  saleAmount: number
  // O valor de venda aplicado à medida: é o "Valor" do START
  priceForMeasure: number | null
  // O sugerido pela composição, na unidade comercial (por m², por metro…)
  suggestedUnitPrice: number
  margin: number | null
}

// Um processo do catálogo, para adicionar ao produto
export type ProcessCatalogItem = {
  id: string
  name: string
  sector: string
  role: BlockRole
  // Setor da base de que ele é acabamento
  finishingOf: string | null
}

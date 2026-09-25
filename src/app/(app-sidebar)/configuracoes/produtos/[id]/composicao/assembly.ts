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

export const assemblyStatusObj: {
  [key in AssemblyStatus]: {
    text: string
    variant: 'neutralLight' | 'successLight' | 'blueLight'
    help: string
  }
} = {
  DRAFT: {
    text: 'Em edição',
    variant: 'neutralLight',
    help: 'Não aparece no orçamento enquanto a composição é montada.',
  },
  RELEASED: {
    text: 'Liberado para venda',
    variant: 'successLight',
    help: 'O vendedor encontra o produto no orçamento.',
  },
  PART: {
    text: 'Parte',
    variant: 'blueLight',
    help: 'Serve para compor outros produtos e não aparece no orçamento.',
  },
}

// Como o preço do produto é formado (IP-17)
export type BillingMode = 'SUGGESTED' | 'PER_UNIT' | 'PER_AREA'

export const billingModeObj: { [key in BillingMode]: string } = {
  SUGGESTED: 'Preço sugerido pela composição',
  PER_UNIT: 'Preço por unidade',
  PER_AREA: 'Preço por m²',
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
  billing: BillingMode
  // Preço praticado: por unidade ou por m², conforme a cobrança
  price: number | null
  measure: AssemblyMeasure
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
  // O preço cobrado para a medida padrão, pela regra de cobrança
  priceForMeasure: number | null
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

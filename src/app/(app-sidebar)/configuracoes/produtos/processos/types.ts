// Tipos da composição de processos (documentação funcional §9 e
// regras-de-negocio/areas/01-patrimonios.md P-18).
// Processo é uma etapa produtiva de um setor, com máquina, material, mão de
// obra e terceirizado. Valores em centavos.

export type ResourceKind = 'MACHINE' | 'MATERIAL' | 'LABOR' | 'OUTSOURCED'

// Fórmulas legadas traduzidas para nomes (D3 §9.2). O código antigo fica no
// comentário para quem precisar conferir a migração.
export type FormulaKey =
  | 'FIXED' // 1 — fixo
  | 'SELLER' // 2 — definido pelo vendedor
  | 'PER_AREA' // 3 — insumo × m² × quantidade
  | 'PER_UNIT' // 5 — insumo × quantidade
  | 'PER_PERIMETER' // 6 — insumo × perímetro × quantidade
  | 'PER_WIDTH' // 7 — insumo × largura × quantidade
  | 'PER_HEIGHT' // 8 — insumo × altura × quantidade
  | 'PER_EXTRA' // 9 — insumo × campo extra × quantidade
  | 'PER_TIME' // 13 — campo tempo × quantidade
  | 'PER_PERIMETER_DIV_EXTRA' // 10 — insumo × perímetro × quantidade ÷ campo extra (o ilhós)
  // As que faltavam do legado (CP-14)
  | 'TIME_TIMES_EXTRA' // 11 — insumo × campo tempo × campo extra
  | 'EQUAL_TIME' // 12 — igual ao campo tempo
  | 'PER_WIDTH_EXTRA' // 14 — insumo × largura × campo extra × quantidade
  | 'PER_HEIGHT_EXTRA' // 15 — insumo × altura × campo extra × quantidade
  | 'EXTRA_ONLY' // 16 — insumo × campo extra
  | 'PER_AREA_DIV_EXTRA' // 17 — insumo × m² × quantidade ÷ campo extra
  | 'PER_PERIMETER_EXTRA' // 18 — insumo × perímetro × quantidade × campo extra
  | 'DIV_EXTRA' // 19 — insumo ÷ campo extra
  | 'AREA_EXTRA' // 20 — insumo × m² × campo extra
  | 'PER_AREA_EXTRA' // 21 — insumo × m² × quantidade × campo extra

export type DimensionRule =
  | 'NONE'
  | 'FREE_SIZE'
  | 'FREE_AREA'
  | 'FIXED_SIZE'
  | 'SAME_AS_PARENT'

export type ProcessResource = {
  id: string
  kind: ResourceKind
  // Nome do recurso escolhido: configuração produtiva, variação de material,
  // setor de mão de obra ou serviço terceirizado
  name: string
  origin: string
  unit: string
  unitCost: number | null
  formula: FormulaKey
  quantity: number
  extraFieldId: string | null
  // Perda e mínimo, configuráveis em cada recurso (CP-8): a perda soma ao
  // consumo, e o mínimo impede a peça pequena de sair com custo irreal
  lossPercent?: number
  minimum?: number | null
}

// Variável que o processo consome. Ela é declarada uma vez no produto e o
// processo diz de qual precisa (IP-4): nº de letras, perímetro, nº de folhas
export type ExtraField = {
  id: string
  name: string
  defaultValue: number
}

export type Process = {
  id: string
  name: string
  sector: string
  // Tempo de preparo em minutos (CP-15): entra uma vez por pedido, não
  // multiplica pela quantidade. Zero quando o processo não tem preparo
  setupMinutes: number
  // Custo-hora do setor, usado para custear o preparo. Vem da Base de custos
  sectorHourCost: number | null
  dimensionRule: DimensionRule
  multipliesParent: boolean
  extraFields: ExtraField[]
  // O que o vendedor vê na hora de vender: o que perguntar ao cliente, o
  // que conferir antes de fechar (CP-13)
  sellerInstructions?: string
  resources: ProcessResource[]
  active: boolean
}

// Simulação usada para conferir o custo do processo antes de usá-lo
export type ProcessSimulation = {
  width: number
  height: number
  quantity: number
  extras: { [key: string]: number }
}

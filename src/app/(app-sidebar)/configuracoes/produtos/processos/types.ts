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

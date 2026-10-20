// Tipos do cadastro de patrimônios (regras-de-negocio/areas/01-patrimonios.md).
// Valores em centavos. O cadastro se organiza pela unidade, não por tipo de
// equipamento (P-14), e tem dois níveis: detalhado e simplificado (P-15).

export type AssetUnit = 'HR' | 'M2' | 'M' | 'KM' | 'UN' | 'KG' | 'LT'

export type AssetLifeStatus =
  | 'DEPRECIATING'
  | 'REVIEW_NEEDED'
  | 'DEPRECIATED'
  | 'INCONSISTENT'
  | 'INACTIVE'

export type AssetKind = 'MACHINES' | 'FURNITURE' | 'VEHICLES'

export type CostNature = 'FIXED' | 'MACHINE_VARIABLE' | 'SETUP_VARIABLE'

/* --------------------------------------------------------------------------
 * Formato da API (/asset), o que as telas do cadastro usam. Os valores podem
 * vir nulos: sem cálculo (vida útil ou residual faltando) a tela mostra `-`
 * ou "Não calculada", nunca R$ 0,00.
 * ------------------------------------------------------------------------ */

// Situação pedida à lista (`status`) e as contagens de GET /asset/quantity
export type AssetStatusFilter =
  | 'ativos'
  | 'em-depreciacao'
  | 'em-revisao'
  | 'inconsistencias'
  | 'inativos'

export type AssetQuantity = {
  [key in Exclude<AssetStatusFilter, 'ativos'>]: number
}

// Processo ou produto cuja composição usa uma configuração do bem (P-16)
export type AssetComposition = {
  kind: 'PROCESS' | 'PRODUCT'
  id: string
  name: string
}

export type AssetCostItem = {
  id: string
  name: string
  nature: CostNature
  // Custo unitário em centavos e o quanto ele rende (a cada N unidades ou meses)
  unitCost: number
  yieldAmount: number
  yieldUnit: 'UNIT' | 'MONTH'
  // A subcategoria do plano de contas e o "código — nome" dela, para exibir
  financialNatureId: string | null
  chartAccount: string | null
  lastOccurrence: string | null
  monthlyCost: number
  setupId: string | null
}

export type AssetSetupItem = {
  id: string
  name: string
  abbreviation: string
  unit: AssetUnit
  // Tempo por unidade em minutos e produtividade de referência na unidade
  timePerUnit: number
  monthlyProductivity: number
  // Horas no mês: tempo × produtividade ÷ 60, calculado pela API (BC-2)
  activityHours: number
  unitCost: number | null
  salePrice: number | null
}

export type AssetSale = {
  date: string | null
  saleValue: number | null
  saleResult: number | null
  financialEntryId: string | null
}

export type AssetItem = {
  id: string
  name: string
  // Foto do bem pela URL do upload de arquivos (ALT-16)
  imageUrl: string | null
  kind: AssetKind
  // O setor pelo nome (para exibir) e pelo id (para gravar e filtrar)
  sector: string | null
  sectorId: string | null
  groupId: string | null
  group: { id: string; name: string } | null
  detailed: boolean
  unit: AssetUnit | null
  monthlyProductivity: number | null
  acquisitionDate: string | null
  acquisitionValue: number
  usefulLifeMonths: number | null
  residualPercent: number | null
  residualValue: number | null
  depreciableValue: number | null
  monthlyDepreciation: number | null
  depreciatedValue: number | null
  remainingValue: number | null
  elapsedMonths: number
  status: AssetLifeStatus
  inactivatedAt: string | null
  inactiveReason: string | null
  sale: AssetSale | null
}

export type AssetRecord = AssetItem & {
  // Custo do equipamento no mês: depreciação e custos do bem
  ownCost: number | null
  costs: AssetCostItem[]
  setups: AssetSetupItem[]
  // A API ainda não manda o tipo de tarefa do processo
  processes: { id: string; name: string; taskType?: string }[]
}

export type AssetGroupRow = {
  id: string
  name: string
  unit: AssetUnit
  // Carros, Motos e Caminhões nascem sem setor: o primeiro bem define
  sector: string | null
  sectorId: string | null
  assetCount: number
  // Média do custo unitário dos bens do grupo (P-28)
  averageCost: number | null
  totalProductivity: number
  // Grupo sem bem não gera custo (P-28)
  inconsistent: boolean
}

// Conta do plano de contas que a tela escolhe: a subcategoria
export type AssetAccount = {
  id: string
  code: string
  description: string
  label: string
}

// O aviso da inativação de um bem com configuração em composição (P-16)
export type AssetWarning = {
  message: string
  compositions: AssetComposition[]
}

// A venda (P-25): restante = aquisição − depreciação acumulada até a data
export type AssetSaleResult = {
  received: number
  remaining: number
  result: number
  financialEntryId: string | null
}

/* O que as telas mandam gravar (centavos e datas YYYY-MM-DD) */

export type AssetFormValues = {
  name: string
  imageUrl: string | null
  kind: AssetKind
  sectorId: string
  detailed: boolean
  unit: AssetUnit | null
  monthlyProductivity: number | null
  acquisitionDate: string | null
  acquisitionValue: number
  groupId: string | null
}

// Só na edição: vida útil e residual (o cadastro entra com 60 meses e 30 %)
export type AssetReviewValues = {
  usefulLifeMonths: number
  residualPercent: number
}

export type AssetCostValues = {
  name: string
  nature: CostNature
  unitCost: number
  yieldAmount: number
  financialNatureId: string | null
  lastOccurrence: string | null
  // Obrigatória no variável da configuração produtiva
  setupId: string | null
}

export type AssetSetupValues = {
  name: string
  abbreviation: string
  unit: AssetUnit
  timePerUnit: number
  monthlyProductivity: number
}

// Uma leitura do contador do bem (hodômetro, horímetro, contador de m²): a
// diferença entre as leituras é o volume do bem no comparativo da base de
// custos
export type AssetReading = {
  id: string
  date: string
  value: number
  createdByName: string
}

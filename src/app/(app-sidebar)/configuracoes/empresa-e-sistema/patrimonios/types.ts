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

export type AssetCost = {
  id: string
  name: string
  nature: CostNature
  // Custo unitário em centavos e o quanto ele rende (a cada N unidades ou meses)
  unitCost: number
  yieldAmount: number
  yieldUnit: 'UNIT' | 'MONTH'
  chartAccount: string
  lastOccurrence: string | null
  monthlyCost: number
  setupId: string | null
}

export type AssetSetup = {
  id: string
  name: string
  abbreviation: string
  unit: AssetUnit
  // Tempo por unidade em minutos e produtividade de referência na unidade
  timePerUnit: number
  monthlyProductivity: number
  unitCost: number | null
  salePrice: number | null
}

export type Asset = {
  id: string
  name: string
  kind: AssetKind
  sector: string
  groupId: string | null
  detailed: boolean
  unit: AssetUnit | null
  monthlyProductivity: number | null
  acquisitionDate: string
  acquisitionValue: number
  usefulLifeMonths: number | null
  residualPercent: number | null
  residualValue: number | null
  monthlyDepreciation: number | null
  status: AssetLifeStatus
  costs: AssetCost[]
  setups: AssetSetup[]
  processes: { id: string; name: string; taskType: string }[]
}

export type AssetGroupItem = {
  id: string
  name: string
  unit: AssetUnit
  sector: string
  assetCount: number
}

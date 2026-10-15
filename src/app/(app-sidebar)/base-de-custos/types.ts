export type CostCriterion =
  | 'LAST_MONTH'
  | 'AVG_3'
  | 'AVG_6'
  | 'AVG_12'
  | 'MANUAL'

export type ExpenseAllocationShare = {
  sectorId: string
  sectorName: string
  percentage: number
  value: number
}

// Valores em centavos. `null` = sem histórico suficiente para o cálculo.
export type AdminExpenseAccount = {
  id: string
  name: string
  // O código da conta no plano de contas ("02.01.01.02")
  chartAccount: string
  // A API não manda: a lista é plana (decisão de 22/09/2026)
  groupId?: string
  lastMonth: number | null
  avg3: number | null
  avg6: number | null
  avg12: number | null
  criterion: CostCriterion
  manualValue: number | null
  referenceValue: number | null
  // Rateio por item (BC-8): a parte de cada setor produtivo, o total rateado
  // e o que sobra no administrativo
  allocations: ExpenseAllocationShare[]
  allocatedValue: number
  remainder: number | null
}

// O diálogo de ratear uma despesa entre os setores produtivos (BC-8, BC-9)
export type ExpenseAllocation = {
  accountId: string
  accountName: string
  referenceValue: number
  sectors: {
    id: string
    name: string
    // Custo próprio do setor hoje, já com o que ele recebe desta e das outras
    // despesas rateadas
    ownCost: number | null
    percentage: number
  }[]
}

export type AdminExpensesResponse = {
  // Último mês completo usado nas médias, no formato AAAA-MM
  referenceMonth: string
  accounts: AdminExpenseAccount[]
}

export type AdminExpensesTotals = {
  total: number
  byAverage: number
  manual: number
  referenceValue: number
  // Rateado por item entre os setores produtivos, e o que fica no
  // administrativo (BC-8)
  allocatedValue: number
  remainingValue: number
}

// A natureza vem do cadastro do setor (regras-de-negocio/areas/05-base-de-custos.md, BC-7)
export type SectorNature = 'ADMINISTRATIVE' | 'PRODUCTIVE'

// Valores em centavos. `percentage` vai de 0 a 100, com até duas casas: é
// quanto do total administrativo o setor produtivo recebe (BC-5). No setor
// administrativo vem sempre zero: o custo dele entra inteiro no total (BC-7).
export type DistributionSector = {
  id: string
  name: string
  nature: SectorNature
  percentage: number
  directCost: number | null
}

export type DistributionTotals = {
  // Já sem o que foi rateado por item (BC-8)
  administrativeCost: number
  allocatedByItem: number
  distributedCost: number
  notDistributedCost: number
  receivingSectors: number
}

// A API devolve os setores e os totais juntos, na leitura e ao salvar
export type DistributionResponse = {
  referenceMonth: string
  sectors: DistributionSector[]
  totals: DistributionTotals
}

// --- Aba Por setor ------------------------------------------------------
// A tela para no custo: produtividade e custo unitário são da Precificação
// (regras-de-negocio/areas/05-base-de-custos.md §9).

// Critério do rateio do setor entre os seus equipamentos (BC-3, BC-3.1)
export type AllocationCriterion =
  | 'ACQUISITION_VALUE'
  | 'ACTIVITY_TIME'
  | 'MANUAL'

export type SectorCostOrigin = 'LABOR' | 'ASSETS' | 'DEPRECIATION' | 'OTHER'

export type SectorCostItem = {
  id: string
  name: string
  origin: SectorCostOrigin
  detail: string
  value: number
}

export type SectorCost = {
  id: string
  name: string
  nature: SectorNature
  labor: number | null
  assets: number | null
  depreciation: number | null
  other: number | null
  ownCost: number | null
  // Só existe quando a empresa distribui o administrativo (BC-5)
  receivedCost: number | null
  totalCost: number | null
  // Critério do rateio interno do setor entre as máquinas (BC-4)
  allocationCriterion: AllocationCriterion
  items: SectorCostItem[]
}

export type SectorCostsResponse = {
  referenceMonth: string
  isDistributing: boolean
  sectors: SectorCost[]
}

// --- Aba Resumo ---------------------------------------------------------
// Primeira tela da Base de custos: visual, de leitura, com links para as
// abas que definem cada número (areas/05-base-de-custos.md §8).

export type CostSummary = {
  referenceMonth: string
  total: number
  byOrigin: {
    adminExpenses: number
    labor: number
    assets: number
    depreciation: number
  }
  productiveCost: number
  administrativeCost: number
  distributedCost: number
  bySector: { id: string; name: string; value: number }[]
}

// --- Aba Mão de obra ----------------------------------------------------
// A carga do setor é a soma das horas por colaborador (F-11), e a coluna de
// resultado é a margem, não o markup (PR-3).

export type LaborCollaborator = {
  id: string
  name: string
  role: string
  hours: number
}

export type LaborSector = {
  id: string
  name: string
  distributedCost: number | null
  hours: number | null
  costPerHour: number | null
  salePrice: number | null
  margin: number | null
  collaborators: LaborCollaborator[]
}

export type LaborResponse = {
  referenceMonth: string
  sectors: LaborSector[]
}

// --- Aba Patrimônios ----------------------------------------------------
// Relatório de depreciação, com as quatro situações da P-9 e a inconsistência
// definida na P-26 (areas/01-patrimonios.md). A lista é a do cadastro de
// patrimônios (actions/asset.ts, P-23); daqui saem só os totais do topo.

export type AssetStatus =
  | 'DEPRECIATING'
  | 'REVIEW_NEEDED'
  | 'DEPRECIATED'
  | 'INCONSISTENT'
  | 'INACTIVE'

export type AssetGroup = 'MACHINES' | 'FURNITURE' | 'VEHICLES'

export type DepreciationTotals = {
  invested: number
  depreciated: number
  remaining: number
  monthlyDepreciation: number
  activeAssets: number
}

// --- Aba Comparativo ----------------------------------------------------
// Previsto (estimativa unitária × volume do período) contra o realizado no
// financeiro, sem médias (areas/05-base-de-custos.md §10).

export type ComparisonSource = {
  id: string
  name: string
  detail: string
  value: number
}

export type ComparisonAccount = {
  id: string
  chartAccount: string
  name: string
  estimated: number | null
  actual: number | null
  difference: number | null
  differencePercent: number | null
  sources: ComparisonSource[]
}

export type ComparisonResponse = {
  referenceMonth: string
  period: string
  // Os meses do período, do mais antigo ao de referência (AAAA-MM)
  months: string[]
  accounts: ComparisonAccount[]
  // O comparativo cobre o plano de contas que sobra depois das despesas
  // administrativas: a cobertura diz quanto desse resto já tem previsão,
  // sem o filtro de situação
  coverage: {
    total: number
    withEstimate: number
    withoutEstimate: number
  }
  // A lista vem paginada (até 100 por página)
  page: number
  lastPage: number
  total: number
}

// --- Rateio do setor entre os equipamentos ------------------------------
// O custo do setor que não é de um equipamento detalhado (bens simplificados,
// lançamentos diretos, administrativo recebido) é repartido entre os
// equipamentos detalhados do setor (P-15, P-16) pelo critério que o setor
// escolhe (BC-3, BC-3.1, BC-4).

export type AllocationEquipment = {
  id: string
  name: string
  acquisitionValue: number
  // Tempo de atividade por mês, em horas: tempo por unidade × produtividade
  // de cada configuração produtiva (BC-2)
  activityHours: number
  // Custo do próprio bem no mês: depreciação e custos cadastrados nele
  ownCost: number
  // Percentual que cada critério daria, para comparar (BC-3.1)
  shares: { [key in AllocationCriterion]: number | null }
  // Percentual em uso, pelo critério do setor
  share: number
  // Custo do bem no mês já com a parte do setor, e o custo-hora dele
  monthlyCost: number
  hourCost: number | null
}

export type SectorAllocation = {
  sectorId: string
  sectorName: string
  criterion: AllocationCriterion
  // O critério automático em uso antes do manual: é de onde os percentuais
  // manuais nasceram
  previousCriterion: Exclude<AllocationCriterion, 'MANUAL'> | null
  // No manual, entrou ou saiu um equipamento do setor depois do último
  // salvar: o rateio não se atualiza sozinho, e o bem novo fica com 0% até a
  // empresa salvar de novo (BC-3.1)
  allocationOutdated?: boolean
  // O custo do setor a repartir entre os equipamentos
  pool: number
  equipment: AllocationEquipment[]
  // Bem sem tempo informado não recebe nada pelo tempo de atividade (ORG-33)
  missingTime: string[]
}

// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
  AssetGroup,
  AssetStatus,
  CostCriterion,
  SectorCostOrigin,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Critério é informação, não alerta: todos com a mesma cor (design.md §6.2)
export const costCriterionObj: { [key in CostCriterion]: BadgeType } = {
  LAST_MONTH: { text: 'Último mês', variant: 'neutralLight' },
  AVG_3: { text: 'Média 3 meses', variant: 'neutralLight' },
  AVG_6: { text: 'Média 6 meses', variant: 'neutralLight' },
  AVG_12: { text: 'Média 12 meses', variant: 'neutralLight' },
  MANUAL: { text: 'Manual', variant: 'neutralLight' },
}

export const costCriterionOptions = (
  Object.keys(costCriterionObj) as CostCriterion[]
).map((key) => ({ value: key, label: costCriterionObj[key].text as string }))

export const costBaseTabs = [
  { tab: 'resumo', label: 'Resumo', permission: 'cost:base:view' },
  {
    tab: 'despesas-administrativas',
    label: 'Despesas administrativas',
    permission: 'cost:base:view',
  },
  { tab: 'mao-de-obra', label: 'Mão de obra', permission: 'cost:base:view' },
  { tab: 'comparativo', label: 'Comparativo', permission: 'cost:base:view' },
  { tab: 'patrimonios', label: 'Patrimônios', permission: 'cost:base:view' },
  { tab: 'distribuicao', label: 'Distribuição', permission: 'cost:base:view' },
  { tab: 'por-setor', label: 'Por setor', permission: 'cost:base:view' },
]

// Origem de cada parcela do custo do setor (areas/05-base-de-custos.md §9)
export const sectorCostOriginObj: { [key in SectorCostOrigin]: string } = {
  LABOR: 'Mão de obra',
  ASSETS: 'Patrimônio',
  DEPRECIATION: 'Depreciação',
  OTHER: 'Outros custos',
}

// Critério do rateio interno do setor entre as máquinas (BC-4)
export const sectorAllocationObj = {
  ACQUISITION_VALUE: 'valor de aquisição',
  ACTIVITY_TIME: 'tempo de atividade',
}

// Situação do patrimônio (P-9 e P-26). Inconsistência é erro de cadastro que
// impede o custo de ser confiável, por isso vermelho.
export const assetStatusObj: { [key in AssetStatus]: BadgeType } = {
  DEPRECIATING: { text: 'Em depreciação', variant: 'successLight' },
  REVIEW_NEEDED: { text: 'Revisão necessária', variant: 'warningLight' },
  DEPRECIATED: { text: 'Depreciado', variant: 'blueLight' },
  INCONSISTENT: { text: 'Inconsistência', variant: 'errorLight' },
  INACTIVE: { text: 'Inativo', variant: 'neutralLight' },
}

export const assetGroupObj: { [key in AssetGroup]: string } = {
  MACHINES: 'Máquinas e equipamentos',
  FURNITURE: 'Móveis e utensílios',
  VEHICLES: 'Veículos e frota',
}

export const assetStatusTabs = [
  { tab: 'ativos', label: 'Ativos' },
  { tab: 'em-revisao', label: 'Em revisão' },
  { tab: 'inconsistencias', label: 'Inconsistências' },
  { tab: 'inativos', label: 'Inativos' },
]

// O comparativo compara período contra período, sem médias (§10 e §10.1)
export const comparisonPeriods = [
  { value: '1', label: 'Último mês' },
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

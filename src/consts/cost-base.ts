// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
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

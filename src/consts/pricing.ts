// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
  PriceRule,
  PricingGroup,
} from '@/app/(app-sidebar)/precificacao/types'

export const pricingTabs = [
  { tab: 'resumo', label: 'Resumo' },
  { tab: 'mao-de-obra', label: 'Mão de obra' },
  { tab: 'maquinas', label: 'Máquinas' },
  { tab: 'materiais', label: 'Materiais' },
  { tab: 'produtos', label: 'Produtos' },
]

export const pricingGroupObj: { [key in PricingGroup]: string } = {
  labor: 'Mão de obra',
  machines: 'Máquinas',
  materials: 'Materiais',
  products: 'Produtos',
}

export const pricingGroupPath: { [key in PricingGroup]: string } = {
  labor: '/precificacao/mao-de-obra',
  machines: '/precificacao/maquinas',
  materials: '/precificacao/materiais',
  products: '/precificacao/produtos',
}

export const priceRuleObj: { [key in PriceRule]: BadgeType } = {
  FIXED: { text: 'Fixo', variant: 'neutralLight' },
  VARIABLE: { text: 'Variável', variant: 'blueLight' },
}

// Alertas em ordem de gravidade (D3 §7.3). "Sem precificação" é pendência,
// não alerta, por isso usa cinza.
export const pricingStatusObj: { [key: string]: BadgeType } = {
  PRICED: { text: 'Com preço', variant: 'successLight' },
  PENDING: { text: 'Sem precificação', variant: 'neutralLight' },
  BELOW_COST: { text: 'Preço abaixo do custo', variant: 'errorLight' },
  NO_COST: { text: 'Custo não calculado', variant: 'warningLight' },
}

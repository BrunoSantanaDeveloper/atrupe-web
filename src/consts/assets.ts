// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
  AssetKind,
  AssetUnit,
  CostNature,
  AssetLifeStatus,
} from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Unidade única em todas as telas (MT-6)
export const assetUnitObj: { [key in AssetUnit]: string } = {
  HR: 'HR – Hora',
  M2: 'M² – Metro quadrado',
  M: 'M – Metro',
  KM: 'KM – Quilometragem',
  UN: 'UN – Unidade',
  KG: 'KG – Quilograma',
  LT: 'LT – Litro',
}

export const assetUnitShort: { [key in AssetUnit]: string } = {
  HR: 'h',
  M2: 'm²',
  M: 'm',
  KM: 'km',
  UN: 'un',
  KG: 'kg',
  LT: 'l',
}

export const assetUnitOptions = (Object.keys(assetUnitObj) as AssetUnit[]).map(
  (unit) => ({ value: unit, label: assetUnitObj[unit] }),
)

// Agrupamento da listagem, mantido depois que os tipos saíram (P-29)
export const assetKindObj: { [key in AssetKind]: string } = {
  MACHINES: 'Máquinas e equipamentos',
  FURNITURE: 'Móveis e utensílios',
  VEHICLES: 'Veículos e frota',
}

export const assetKindOptions = (Object.keys(assetKindObj) as AssetKind[]).map(
  (kind) => ({ value: kind, label: assetKindObj[kind] }),
)

// Ciclo de vida (P-9) e inconsistência (P-26)
export const assetLifeStatusObj: { [key in AssetLifeStatus]: BadgeType } = {
  DEPRECIATING: { text: 'Em depreciação', variant: 'successLight' },
  REVIEW_NEEDED: { text: 'Revisão necessária', variant: 'warningLight' },
  DEPRECIATED: { text: 'Depreciado', variant: 'blueLight' },
  INCONSISTENT: { text: 'Inconsistência', variant: 'errorLight' },
  INACTIVE: { text: 'Inativo', variant: 'neutralLight' },
}

// As três naturezas de custo confirmadas pelo time (P-6)
export const costNatureObj: { [key in CostNature]: string } = {
  FIXED: 'Custos fixos',
  MACHINE_VARIABLE: 'Máquina — custos variáveis',
  SETUP_VARIABLE: 'Configuração produtiva — custos variáveis',
}

export const costNatureOptions = (
  Object.keys(costNatureObj) as CostNature[]
).map((nature) => ({ value: nature, label: costNatureObj[nature] }))

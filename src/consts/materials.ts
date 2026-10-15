// Status do cadastro de materiais. Seguem a convenção de cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'
import type { MaterialUnit } from '@/app/(app-sidebar)/configuracoes/produtos/materiais/types'

// A unidade do material como a tela mostra
const unitSymbol: { [key: string]: string } = {
  M2: 'm²',
  M: 'm',
  UN: 'un',
  KG: 'kg',
  LT: 'l',
  L: 'l',
  HR: 'h',
  KM: 'km',
}

export const materialUnitSymbol = (unit: MaterialUnit) =>
  unitSymbol[unit as string] || String(unit).toLowerCase()

// Situação de cada linha na importação de lista (IMP-1, área 4)
export const importStatusObj: { [key: string]: BadgeType } = {
  NEW: { text: 'Novo', variant: 'successLight' },
  MATCH: { text: 'Já cadastrado', variant: 'blueLight' },
  LINKED: { text: 'De-para guardado', variant: 'blueLight' },
  INVALID: { text: 'Ignorada', variant: 'errorLight' },
}

// Status do cadastro de materiais. Seguem a convenção de cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'

// Situação de cada linha na importação de lista (IMP-1, área 4)
export const importStatusObj: { [key: string]: BadgeType } = {
  NEW: { text: 'Novo', variant: 'successLight' },
  MATCH: { text: 'Já cadastrado', variant: 'blueLight' },
  LINKED: { text: 'De-para guardado', variant: 'blueLight' },
  INVALID: { text: 'Ignorada', variant: 'errorLight' },
}

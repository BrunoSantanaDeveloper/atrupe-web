// Status das contas bancárias e do caixa do dia (regras CX-0 a CX-3).
// Seguem a convenção de cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'

export const bankAccountStatusObj: { [key: string]: BadgeType } = {
  CONTROLLED: { text: 'Com controle de caixa', variant: 'successLight' },
  FREE: { text: 'Livre', variant: 'neutralLight' },
  INACTIVE: { text: 'Inativa', variant: 'errorLight' },
}

// O cartão do dia no Controle de caixa. Aberto e fechado usam o
// cashControlStatusObj, que já existia; aqui ficam os outros estados
export const cashTodayStatusObj: { [key: string]: BadgeType } = {
  FREE: { text: 'Livre', variant: 'neutralLight' },
  NO_DAY: { text: 'Sem caixa hoje', variant: 'warningLight' },
  REOPENED: { text: 'Reaberto', variant: 'warningLight' },
  // A operadora de cartão não fecha o dia (CX-3)
  NO_CLOSE: { text: 'Não fecha', variant: 'neutralLight' },
}

// Type
import { BadgeType } from '@/types/coreTypes'

export const fixedExpensesStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Aberto', variant: 'blueLight' },
  CLOSED: { text: 'Fechado', variant: 'warningLight' },
}

type RecurringTypeOptionsType = BadgeType & {
  value: string
  label: string
}

export const recurringTypeOptions: RecurringTypeOptionsType[] = [
  {
    value: 'WEEKLY',
    label: 'Semanalmente',
    text: 'Semanal',
    variant: 'purpleLight',
  },
  {
    value: 'MONTHLY',
    label: 'Mensalmente',
    text: 'Mensal',
    variant: 'blueLight',
  },
  {
    value: 'BIMONTHLY',
    label: 'Bimestralmente',
    text: 'Bimestral',
    variant: 'roseLight',
  },
  {
    value: 'QUARTERLY',
    label: 'Trimestralmente',
    text: 'Trimestral',
    variant: 'successLight',
  },
  {
    value: 'SEMIANNUALLY',
    label: 'Semestralmente',
    text: 'Semestral',
    variant: 'warningLight',
  },
  {
    value: 'YEARLY',
    label: 'Anualmente',
    text: 'Anual',
    variant: 'orangeLight',
  },
  {
    value: 'BIWEEKLY',
    label: 'Quinzenalmente',
    text: 'Quinzenal',
    variant: 'blueLight',
  },
]

export const fixedExpensesRecurringTypeObj: {
  [key: string]: BadgeType
} = recurringTypeOptions.reduce(
  (acc, option) => {
    acc[option.value] = {
      text: option.text,
      variant: option.variant,
    }
    return acc
  },
  {} as { [key: string]: BadgeType },
)

// export const fixedExpensesRecurringTypeObj: {
//   [key: string]: BadgeType
// } = {
//   ANNUAL: { text: 'Anual', variant: 'orangeLight' },
//   SEMIANNUAL: { text: 'Semestral', variant: 'warningLight' },
//   QUARTERLY: { text: 'Trimestral', variant: 'blueLight' },
//   BIMONTHLY: { text: 'Bimestral', variant: 'roseLight' },
//   MONTHLY: { text: 'Mensal', variant: 'successLight' },
//   BIWEEKLY: { text: 'Quinzenal', variant: 'blueLight' },
//   WEEKLY: { text: 'Semanal', variant: 'purpleLight' },
// }

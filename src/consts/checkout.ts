// Type
import { BadgeType } from '@/types/coreTypes'

export const checkoutStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Aberto', variant: 'blueLight' },
  CLOSED: { text: 'Fechado', variant: 'warningLight' },
}

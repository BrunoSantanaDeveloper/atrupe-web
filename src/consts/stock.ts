// Types
import type { BadgeType } from '@/types/coreTypes'
import type { StockMovementKind } from '@/app/(app-sidebar)/estoque/types'

export const stockMovementObj: { [key in StockMovementKind]: BadgeType } = {
  ENTRY: { text: 'Entrada', variant: 'successLight' },
  CONSUMPTION: { text: 'Consumo', variant: 'blueLight' },
  ADJUSTMENT: { text: 'Ajuste', variant: 'neutralLight' },
}

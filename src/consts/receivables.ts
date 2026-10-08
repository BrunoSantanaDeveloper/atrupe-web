import type { BadgeProps } from '@/components/ui/badge'
import type { ButtonProps } from '@/components/ui/button'

// Realizado = dinheiro (IconCash); não realizado = dinheiro cortado;
// cancelado = IconBan. Polegar não diz nada sobre dinheiro (icones §4.4).
import {
  IconBan,
  IconCash,
  IconCashBanknoteOff,
  IconQuestionMark,
} from '@tabler/icons-react'

import type { IconProps } from '@tabler/icons-react'

type TransactionStatusType = {
  [key: string]: {
    icon: React.ComponentType<IconProps>
    text: string
    tooltip: string
    button: ButtonProps['variant']
    badge: BadgeProps['variant']
  }
}

export const transactionStatus: TransactionStatusType = {
  PENDING: {
    icon: IconCashBanknoteOff,
    text: 'Não realizado',
    tooltip: 'Movimentação prevista',
    button: 'neutralGhost',
    badge: 'neutralLight',
  },
  PROVISIONED: {
    icon: IconCash,
    text: 'Provisionado',
    tooltip: 'Movimentação provisionada',
    button: 'warningGhost',
    badge: 'warningLight',
  },
  PAID: {
    icon: IconCash,
    text: 'Realizado',
    tooltip: 'Movimentação realizada',
    button: 'successGhost',
    badge: 'successLight',
  },
  OVERDUE: {
    icon: IconCashBanknoteOff,
    text: 'Não realizado',
    tooltip: 'Movimentação atrasada',
    button: 'errorGhost',
    badge: 'errorLight',
  },
  CANCELED: {
    icon: IconBan,
    text: 'Cancelado',
    tooltip: 'Movimentação cancelada',
    button: 'errorGhost',
    badge: 'errorLight',
  },
  UNKNOWN: {
    icon: IconQuestionMark,
    text: 'Desconhecido',
    tooltip: 'Status desconhecido',
    button: 'neutralGhost',
    badge: 'neutralLight',
  },
}

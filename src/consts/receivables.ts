import type { BadgeProps } from '@/components/ui/badge'
import type { ButtonProps } from '@/components/ui/button'

// Realizado = polegar para cima; não realizado = polegar para baixo;
// cancelado = IconBan. A "mãozinha" do legado volta no financeiro (decisão
// do produto, 23/10/2026), que os clientes reconhecem como dar baixa.
import {
  IconBan,
  IconThumbUp,
  IconThumbDown,
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
    icon: IconThumbDown,
    text: 'Não realizado',
    tooltip: 'Movimentação prevista',
    button: 'neutralGhost',
    badge: 'neutralLight',
  },
  PROVISIONED: {
    icon: IconThumbUp,
    text: 'Provisionado',
    tooltip: 'Movimentação provisionada',
    button: 'warningGhost',
    badge: 'warningLight',
  },
  PAID: {
    icon: IconThumbUp,
    text: 'Realizado',
    tooltip: 'Movimentação realizada',
    button: 'successGhost',
    badge: 'successLight',
  },
  OVERDUE: {
    icon: IconThumbDown,
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

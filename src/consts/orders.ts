// Type
import { BadgeType } from '@/types/coreTypes'

export const ordersStatusObj: {
  [key: string]: BadgeType
} = {
  PENDING: { text: 'Aguardando', variant: 'neutralLight' },
  IN_PRODUCTION: { text: 'Em produção', variant: 'blueLight' },
  COMPLETED: { text: 'Concluida', variant: 'successLight' },
  FINISHED: { text: 'Finalizada', variant: 'successLight' },
  CANCELED: { text: 'Cancelada', variant: 'errorLight' },
  DELIVERING: { text: 'Em entrega', variant: 'neutralLight' },
}

// Aguardando produção
// Atrasada
// Disponível
// Em andamento
// Pausada
// Com pendência
// Finalizada
// Cancelada

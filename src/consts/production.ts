// Types
import type { BadgeType } from '@/types/coreTypes'
import type { StageStatus } from '@/app/(app-sidebar)/producao/gerenciador/types'

// Situação da etapa no gerenciador (D3 §12)
export const stageStatusObj: { [key in StageStatus]: BadgeType } = {
  BLOCKED: { text: 'Aguardando etapa anterior', variant: 'neutralLight' },
  READY: { text: 'Liberada', variant: 'blueLight' },
  IN_PROGRESS: { text: 'Em produção', variant: 'warningLight' },
  PAUSED: { text: 'Pausada', variant: 'neutralLight' },
  DONE: { text: 'Concluída', variant: 'successLight' },
}

export const stageColumns: { status: StageStatus; label: string }[] = [
  { status: 'BLOCKED', label: 'Aguardando' },
  { status: 'READY', label: 'Liberadas' },
  { status: 'IN_PROGRESS', label: 'Em produção' },
  { status: 'DONE', label: 'Concluídas' },
]

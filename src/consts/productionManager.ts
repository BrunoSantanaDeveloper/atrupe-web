// Rótulos e situações do gerenciador de produção (ELITE). Seguem a convenção
// de cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
  TimeMode,
  TaskStatus,
  ReleaseRule,
  ManagerModel,
  ProjectStatus,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

export const timeModeObj: {
  [key in TimeMode]: { text: string; help: string }
} = {
  PLAY_STOP: {
    text: 'Play & Stop (individual)',
    help: 'Cada colaborador inicia e para o relógio da tarefa.',
  },
  DRAG_DROP: {
    text: 'Arrastar colaborador (coletivo)',
    help: 'Arraste quem está disponível para a tarefa; o tempo corre enquanto ele está nela.',
  },
}

export const managerModelObj: {
  [key in ManagerModel]: { text: string; help: string }
} = {
  SIMPLE: {
    text: 'Simples',
    help: 'Uma fila: as tarefas agendadas por dia e as não agendadas.',
  },
  KANBAN: {
    text: 'Fluxo Kanban',
    help: 'Colunas por etapa: a tarefa anda da esquerda para a direita.',
  },
  MULTI: {
    text: 'Múltiplos gerenciadores',
    help: 'Reúne as filas de vários gerenciadores numa tela só.',
  },
}

export const releaseRuleObj: {
  [key in ReleaseRule]: { text: string; help: string }
} = {
  AFTER_BASE: {
    text: 'Depois que a base terminar',
    help: 'O acabamento espera a etapa em que ele é aplicado ser concluída.',
  },
  WITH_BASE: {
    text: 'Junto com a base',
    help: 'Pode ser feito em paralelo com a base.',
  },
  DONE: {
    text: 'Já nasce concluída',
    help: 'Para o que não passa pela produção, como a arte já aprovada.',
  },
}

export const taskStatusObj: { [key in TaskStatus]: BadgeType } = {
  WAITING: { text: 'Aguardando liberação', variant: 'neutralLight' },
  PRODUCTION: { text: 'Em produção', variant: 'warningLight' },
  DONE: { text: 'Concluída', variant: 'successLight' },
  CANCELED: { text: 'Cancelada', variant: 'errorLight' },
}

export const projectStatusObj: { [key in ProjectStatus]: BadgeType } = {
  STANDBY: { text: 'Stand-by', variant: 'neutralLight' },
  PRODUCTION: { text: 'Em produção', variant: 'warningLight' },
  DONE: { text: 'Concluído', variant: 'successLight' },
  CANCELED: { text: 'Cancelado', variant: 'errorLight' },
}

// Cores dos tipos de tarefa: a faixa que identifica a tarefa na fila
export const TASK_TYPE_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#4b5563',
]

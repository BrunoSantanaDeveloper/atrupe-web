// Rótulos e situações do gerenciador de produção (ELITE). Seguem a convenção
// de cor do design.md §6.2 e os seis estados da etapa do Figma (GP-28).

// Types
import type { BadgeType } from '@/types/coreTypes'
import type {
  TimeMode,
  TaskAction,
  TaskStatus,
  ReleaseRule,
  ProjectStatus,
  AttachmentKind,
  CollaboratorRole,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

export const timeModeObj: {
  [key in TimeMode]: { text: string; help: string }
} = {
  PLAY_STOP: {
    text: 'Play & Stop (individual)',
    help: 'Cada colaborador inicia e para o relógio da tarefa. Para quem trabalha sozinho na fila: criação, impressora com computador próprio.',
  },
  DRAG_DROP: {
    text: 'Arrastar colaborador (coletivo)',
    help: 'Arraste quem está disponível para a tarefa; o tempo corre enquanto ele está nela. Para setores em que várias pessoas trabalham juntas: acabamento, instalação.',
  },
  NONE: {
    text: 'Sem controle de tempo',
    help: 'A tarefa só se conclui: sem relógio nem pessoas na tarefa. É o modo do PRO; iniciar, pausar e medir o tempo são do ELITE.',
  },
}

export const releaseRuleObj: {
  [key in ReleaseRule]: { text: string; help: string }
} = {
  AFTER_BASE: {
    text: 'Depois que a base terminar',
    help: 'O acabamento espera a etapa em que ele é aplicado ser concluída (ou liberada antes).',
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

// Os seis estados da etapa (GP-28), na ordem das colunas do quadro
export const TASK_STATUS_ORDER: TaskStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'PAUSED',
  'PENDING',
  'DONE',
  'CANCELED',
]

export const taskStatusObj: { [key in TaskStatus]: BadgeType } = {
  NOT_STARTED: { text: 'Não iniciada', variant: 'neutralLight' },
  IN_PROGRESS: { text: 'Em andamento', variant: 'blueLight' },
  PAUSED: { text: 'Pausada', variant: 'pinkLight' },
  PENDING: { text: 'Com pendência', variant: 'warningLight' },
  DONE: { text: 'Finalizada', variant: 'successLight' },
  CANCELED: { text: 'Cancelada', variant: 'errorLight' },
}

// As ações de cada estado (GP-28)
export const taskActionObj: { [key in TaskAction]: string } = {
  START: 'Iniciar',
  PAUSE: 'Pausar',
  RESUME: 'Continuar',
  FINISH: 'Finalizar',
  CANCEL: 'Cancelar',
  RESTART: 'Reiniciar',
}

export const actionsByStatus: { [key in TaskStatus]: TaskAction[] } = {
  NOT_STARTED: ['START', 'FINISH', 'CANCEL'],
  IN_PROGRESS: ['PAUSE', 'FINISH', 'CANCEL'],
  PAUSED: ['RESUME', 'FINISH', 'CANCEL'],
  PENDING: ['RESUME', 'CANCEL'],
  DONE: ['RESTART'],
  CANCELED: ['RESTART'],
}

export const projectStatusObj: { [key in ProjectStatus]: BadgeType } = {
  STANDBY: { text: 'Stand-by', variant: 'neutralLight' },
  PRODUCTION: { text: 'Em produção', variant: 'warningLight' },
  DONE: { text: 'Concluído', variant: 'successLight' },
  CANCELED: { text: 'Cancelado', variant: 'errorLight' },
}

export const attachmentKindObj: { [key in AttachmentKind]: string } = {
  ART: 'Arte final',
  CUT: 'Desenho de corte',
  PHOTO: 'Foto',
  OTHER: 'Outro arquivo',
}

export const collaboratorRoleObj: {
  [key in CollaboratorRole]: { text: string; help: string }
} = {
  OPERATOR: {
    text: 'Operador',
    help: 'Vê as tarefas do seu setor ou as atribuídas a ele, conforme o acesso de cada gerenciador.',
  },
  MANAGER: {
    text: 'Gerente de produção',
    help: 'Vê tudo, corrige apontamentos e lê a produtividade por pessoa.',
  },
}

// Permissões usadas pela produção (GP-11, GP-44, PCP-3): ver abre o
// gerenciador; editar é o gerente (vê tudo, corrige tempo, lê produtividade
// por pessoa). Modelado como configuração de acesso, não como regra fixa
export const PRODUCTION_VIEW = ['production:production:view']
export const PRODUCTION_MANAGE = ['production:production:edit']

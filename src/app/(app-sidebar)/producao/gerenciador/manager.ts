// O gerenciador de produção do ELITE, como o legado o organiza
// (legado-gerenciador-de-producao.md, §6.1 e §9): fluxos agrupam
// gerenciadores; cada gerenciador é um setor de trabalho com modelo e
// controle de tempo; o tipo de tarefa diz em quais gerenciadores a tarefa
// passa, etapa por etapa, e quando ela é liberada; e cada etapa da
// composição do produto vendido vira uma tarefa (GP-16).

// Fluxo de produção: agrupa gerenciadores ("Comunicação Visual") (GP-15)
export type ProductionFlow = { id: string; name: string }

// Como o tempo é controlado no gerenciador (GP-10)
export type TimeMode = 'PLAY_STOP' | 'DRAG_DROP'

// Como o gerenciador mostra as tarefas (GP-9)
export type ManagerModel = 'SIMPLE' | 'KANBAN' | 'MULTI'

export type ManagerUser = {
  collaboratorId: string
  // Vê só as tarefas atribuídas a ele (GP-11)
  onlyAssigned: boolean
}

export type ProductionManager = {
  id: string
  name: string
  flowId: string
  model: ManagerModel
  timeMode: TimeMode
  users: ManagerUser[]
  active: boolean
}

// Quando a tarefa é liberada para produzir (GP-13): o acabamento espera a
// base terminar, é feito junto com ela, ou já nasce concluído (serviço que
// não passa pela produção)
export type ReleaseRule = 'AFTER_BASE' | 'WITH_BASE' | 'DONE'

// Etapa do tipo de tarefa: cada uma pode estar num gerenciador diferente — a
// tarefa muda de setor de uma etapa para outra (GP-14)
export type TaskStep = { id: string; name: string; managerId: string }

export type TaskType = {
  id: string
  name: string
  color: string
  release: ReleaseRule
  timeControl: boolean
  steps: TaskStep[]
  active: boolean
}

export type TaskStatus = 'WAITING' | 'PRODUCTION' | 'DONE' | 'CANCELED'

export type ProjectStatus = 'STANDBY' | 'PRODUCTION' | 'DONE' | 'CANCELED'

export type Collaborator = {
  id: string
  name: string
  // Trabalhando agora: em qual tarefa e desde quando (GP-17)
  working: { taskId: string; since: string } | null
}

// A tarefa é a etapa da composição do item vendido, com o consumo resolvido
// na medida da venda (GP-4, GP-16)
export type ProductionTask = {
  id: string
  // Código curto, como o legado ("C7E12"), para achar a tarefa no chão de
  // fábrica e na ficha
  code: string
  projectId: string
  itemName: string
  stageName: string
  sector: string
  taskTypeId: string
  stepIndex: number
  status: TaskStatus
  estimatedMinutes: number
  actualMinutes: number
  // A tarefa da base, quando esta é acabamento: é o que a regra de liberação
  // olha
  baseTaskId: string | null
  measureText: string
  // Campos informados na venda ("Nº de letras: 6")
  fields: string[]
  consumption: {
    kind: string
    resource: string
    quantity: number | null
    unit: string
  }[]
  // Observação de produção deixada na venda (MS-13)
  note: string | null
  schedule: { date: string; start: string; minutes: number } | null
  assigneeId: string | null
}

export type ProductionProject = {
  id: string
  number: string
  client: string
  seller: string
  approvedAt: string
  deliveryType: string
  // Primeiro prazo prometido e o prazo atual, que pode ter sido alterado
  firstDue: string
  due: string
  status: ProjectStatus
}

// O que a tela recebe de uma tarefa, já com o que se deriva dela
export type TaskView = ProductionTask & {
  project: ProductionProject
  taskType: TaskType
  step: TaskStep
  managerId: string
  // Aguardando a base terminar, pela regra de liberação (GP-13)
  waitingBase: boolean
  assignee: Collaborator | null
  late: boolean
}

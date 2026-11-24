// O gerenciador de produção do ELITE (área 9, §4.6 a §4.14): fluxos agrupam
// gerenciadores; cada gerenciador é um setor de trabalho, com o jeito de
// controlar o tempo (GP-43); o tipo de tarefa diz em quais gerenciadores a
// tarefa passa, etapa por etapa, e quando ela é liberada (GP-13); e cada
// etapa da composição do produto vendido vira uma tarefa (GP-16, FL-10).
// Revisto em 06/10/2026 pelas decisões de 05/10 (§4.14): seis estados
// (GP-28), apontamento por pessoa com correção registrada (GP-43, GP-44),
// anexos por etapa com versão (GP-25/26), pendência descrita, liberação da
// próxima etapa com quantidade opcional (FL-13), cadeia de produção sem
// reagendamento automático (§12.2) e a frota (VS-7). A cor é do setor.

// Fluxo de produção: agrupa gerenciadores ("Comunicação Visual") (GP-15)
export type ProductionFlow = { id: string; name: string }

// Como o tempo é capturado no gerenciador (GP-43): Play & Stop individual
// ou arrastar o colaborador no coletivo. O modelo é do setor
// NONE (GP-47, 29/10/2026): sem controle de tempo, a tarefa só se conclui.
// É o modo da tela por setor do PRO; o tempo é do ELITE
export type TimeMode = 'PLAY_STOP' | 'DRAG_DROP' | 'NONE'

export type ManagerUser = {
  collaboratorId: string
  // Vê só as tarefas atribuídas a ele (GP-11)
  onlyAssigned: boolean
}

export type LiveSchedule = 'WARN' | 'RESCHEDULE'

export type ManagerHours = {
  workStart: string | null
  workEnd: string | null
  breakStart: string | null
  breakEnd: string | null
  // A máquina segue trabalhando no intervalo (a impressora); a equipe para
  runsThroughBreak: boolean
}

export const NO_HOURS: ManagerHours = {
  workStart: null,
  workEnd: null,
  breakStart: null,
  breakEnd: null,
  runsThroughBreak: false,
}

export type ProductionManager = {
  id: string
  name: string
  // O setor do cadastro a que o gerenciador corresponde: é dele que vem a
  // cor e o ícone (área 9 §4.14)
  sector: string
  flowId: string
  timeMode: TimeMode
  // Intervalo programado entre uma tarefa e a seguinte no mesmo recurso
  // (GP-20): capacidade que se perde, não custo. Quem já embute a troca no
  // preparo deixa zero
  intervalMinutes: number
  // O expediente do gerenciador (GP-48 item 19): sem início e fim, vale o da
  // empresa; o intervalo (almoço) é opcional
  hours: ManagerHours
  // Agenda viva (item 20): só avisa, ou reagenda em sequência e avisa
  liveSchedule: LiveSchedule
  // A espera depois de concluir antes da etapa seguinte, ex.: secagem (item 21)
  afterDoneMinutes: number
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

// O tipo de tarefa não tem cor própria: usa a do setor do gerenciador (§4.14)
export type TaskType = {
  id: string
  name: string
  release: ReleaseRule
  timeControl: boolean
  steps: TaskStep[]
  active: boolean
}

// Os seis estados da etapa, com as ações de cada um (GP-28)
export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'PENDING'
  | 'DONE'
  | 'CANCELED'

export type TaskAction =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'FINISH'
  | 'CANCEL'
  | 'RESTART'

export type ProjectStatus = 'STANDBY' | 'PRODUCTION' | 'DONE' | 'CANCELED'

// Quem vê o quê (GP-11) é configuração de acesso: o operador vê as tarefas
// do seu setor ou atribuídas a ele; o gerente vê tudo e corrige tempo
export type CollaboratorRole = 'OPERATOR' | 'MANAGER'

export type Collaborator = {
  id: string
  name: string
  // E-mail do usuário do sistema, para casar com a sessão
  email: string | null
  role: CollaboratorRole
  // Trabalhando agora: em qual tarefa e desde quando (GP-17)
  working: { taskId: string; since: string } | null
}

// Um trecho de tempo apontado por uma pessoa numa tarefa (GP-32: o relógio
// é por pessoa, não só por tarefa)
export type TaskSlot = {
  id: string
  date: string
  start: string | null
  minutes: number
  kind: 'NORMAL' | 'EXTRA'
  reason: string | null
  by: string
}

export type TimeEntry = {
  id: string
  collaboratorId: string
  start: string
  // Aberto enquanto a pessoa está na tarefa
  end: string | null
  minutes: number
  // Como entrou: relógio individual, arrastar no coletivo, ou lançado numa
  // correção
  source: 'CLOCK' | 'DRAG' | 'CORRECTION'
  note: string | null
  // O bloco de agenda em que o tempo foi feito (GP-52); nulo = o bloco 1
  slotId?: string | null
}

// A correção de um apontamento, com o que era antes e quem mudou (GP-44)
export type TimeCorrection = {
  id: string
  at: string
  by: string
  entryId: string
  // Nulo no tempo lançado à mão (não havia trecho antes)
  before: { collaboratorId: string; minutes: number } | null
  after: { collaboratorId: string; minutes: number }
  note: string
}

export type AttachmentKind = 'ART' | 'CUT' | 'PHOTO' | 'OTHER'

// O anexo é da etapa e guarda versões; uma delas é a válida (GP-25, GP-26)
export type AttachmentVersion = {
  version: number
  fileName: string
  size: number
  mime: string
  // O link assinado de 15 minutos do arquivo (GP-27); a prévia da imagem
  // usa o mesmo link
  url: string | null
  dataUrl: string | null
  uploadedBy: string
  uploadedAt: string
  current: boolean
  // Apagado na limpeza do espaço (GP-49): sem link
  removedAt?: string | null
}

export type TaskAttachment = {
  id: string
  name: string
  kind: AttachmentKind
  versions: AttachmentVersion[]
}

// O comentário da equipe vive no histórico (VS-5, GP-47): kind COMMENT
export type TaskHistory = {
  id: string
  at: string
  by: string
  text: string
  kind?: 'EVENT' | 'COMMENT'
}

export type TaskPriority = 'NORMAL' | 'URGENT'

// Veículo da frota (VS-7): a instalação e a entrega ocupam o veículo
export type Vehicle = {
  id: string
  name: string
  plate: string
  active: boolean
  // O patrimônio do veículo (VE-1): o bem da frota
  assetId?: string | null
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
  // A imagem do item da venda: quem está na máquina reconhece o trabalho
  // pela arte antes de ler o nome (GP-39)
  itemImage: string | null
  stageName: string
  sector: string
  taskTypeId: string
  stepIndex: number
  status: TaskStatus
  // Tempo previsto (vendido) e o preparo, que ocupa a máquina quando há
  // máquina (CP-15, §4.14)
  estimatedMinutes: number
  setupMinutes: number
  machine: string | null
  // A configuração vendida (o AssetSetup do bem): a manutenção da máquina
  // casa por ela (GP-49 item 6)
  machineSetupId?: string | null
  // A qualidade vendida (GP-48 item 22): a configuração da máquina
  machineQuality?: string | null
  // A tarefa da base, quando esta é acabamento: é o que a regra de liberação
  // olha; e as tarefas de que esta depende de fato
  baseTaskId: string | null
  dependsOn: string[]
  // Liberou a próxima etapa antes de concluir (FL-13, GP-37): quem, quando
  // e, se quiser, quanto ("10 de 50")
  releasedNext: {
    at: string
    by: string
    quantity: number | null
    of: number | null
  } | null
  quantity: number
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
  // Sem a hora, agendada só no dia (GP-49)
  schedule: { date: string; start: string | null; minutes: number } | null
  assigneeId: string | null
  // Impedimento descrito em texto, que sinaliza sem interromper (GP-28)
  pendency: { text: string; at: string; by: string } | null
  timeEntries: TimeEntry[]
  // Os blocos além do agendamento da tarefa (o bloco 1), GP-52: o resto de um
  // trabalho dividido em dois dias e o tempo extra, com motivo
  slots?: TaskSlot[]
  corrections: TimeCorrection[]
  attachments: TaskAttachment[]
  history: TaskHistory[]
  // Quem concluiu, sempre registrado (§4.14)
  completedBy: string | null
  completedAt: string | null
  // Frota (VS-7): o veículo, os km e o horário da saída
  vehicleId: string | null
  km: number | null
  // Urgente sobe na fila do setor (GP-47, item 4); o balão conta os
  // comentários da equipe (VS-5). A API manda; o front antigo não tinha
  priority?: TaskPriority
  comments?: number
}

export type ProductionProject = {
  id: string
  // A venda de onde o projeto nasceu (a API manda)
  quotationId?: string
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

// O alerta da cadeia de produção (§12.2, GP-42): a etapa anterior atrasou,
// ou o que falta não cabe até a entrega. Some sozinho quando a cadeia volta
// a ficar alinhada; ninguém reagenda automaticamente
export type ChainAlert = {
  kind: 'LATE_PREDECESSOR' | 'DELIVERY_RISK' | 'OVERDUE'
  text: string
}

// O que a tela recebe de uma tarefa, já com o que se deriva dela
export type TaskView = ProductionTask & {
  // O id do setor do gerenciador da etapa (a API manda)
  sectorId?: string | null
  project: ProductionProject
  taskType: TaskType
  step: TaskStep
  managerId: string
  // Ainda não pode começar: depende de uma etapa que não terminou nem
  // liberou (PR-2, FL-13)
  blocked: boolean
  blockedBy: string | null
  assignee: Collaborator | null
  // Quem está na tarefa agora
  workers: Collaborator[]
  // Minutos apontados, somando os trechos fechados e o que está correndo
  actualMinutes: number
  late: boolean
  alert: ChainAlert | null
}

// Como a tela do quadro é aberta (GP-11): o gerente vê tudo; o operador, o
// que o acesso dele ao gerenciador permite
export type BoardViewer = {
  manager: boolean
  collaboratorId: string | null
}

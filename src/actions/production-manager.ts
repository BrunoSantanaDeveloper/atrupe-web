'use server'

// PROVISÓRIO: a API ainda não tem o gerenciador de produção (recurso do
// ELITE). Estado em memória para as telas; o contrato está em
// openspec/analise/backend-pendente.md. As tarefas nascem da composição do
// produto vendido, pelo mesmo cálculo da composição (SEG-1).
//
// Revisto em 06/10/2026 pelas decisões de 05/10/2026 (área 9 §4.14): os seis
// estados da etapa (GP-28), apontamento por pessoa com quem concluiu e
// correção registrada (GP-43, GP-44), anexos por etapa com versão (GP-25,
// GP-26), pendência descrita, liberação da próxima etapa com quantidade
// opcional (FL-13), a cadeia de produção sem reagendamento automático
// (§12.2, GP-42), preparo ocupando a máquina, frota (VS-7) e a produtividade
// pelo tempo vendido (GP-30, GP-32).

// Types
import type {
  Vehicle,
  TaskStep,
  TaskType,
  TaskView,
  TimeMode,
  ChainAlert,
  TaskAction,
  TaskStatus,
  ReleaseRule,
  BoardViewer,
  Collaborator,
  ProductionFlow,
  ProductionTask,
  AttachmentKind,
  CollaboratorRole,
  ProductionManager,
  ProductionProject,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'
import type { AssemblyMeasure } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
import { getSaleComposition } from '@/actions/product-assembly'

const uid = () => Math.random().toString(36).slice(2, 9)
const code = () => Math.random().toString(16).slice(2, 7).toUpperCase()
const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = (message: string) => ({ success: false, data: null, message })

const br = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const now = () => new Date().toISOString()
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60000).toISOString()

// O expediente de referência para a cadeia de tempos (§4.8): 8h às 18h
const WORK_START = '08:00'
const WORK_END = '18:00'
const WORK_MINUTES_PER_DAY = 10 * 60

/* ---------------------------------------------------------------------------
 * Configuração: fluxos, gerenciadores, colaboradores, tipos de tarefa e
 * veículos
 * ------------------------------------------------------------------------- */

const flows: ProductionFlow[] = [{ id: 'flow-cv', name: 'Comunicação Visual' }]

const collaborators: Collaborator[] = [
  {
    id: 'col-marcos',
    name: 'Marcos',
    email: 'marcos@atrupe.com.br',
    role: 'OPERATOR',
    working: null,
  },
  {
    id: 'col-natihely',
    name: 'Natihely',
    email: 'natihely@atrupe.com.br',
    role: 'MANAGER',
    working: null,
  },
  {
    id: 'col-pedro',
    name: 'Pedro',
    email: 'pedro@atrupe.com.br',
    role: 'OPERATOR',
    working: null,
  },
  {
    id: 'col-ana',
    name: 'Ana',
    email: 'ana@atrupe.com.br',
    role: 'OPERATOR',
    working: null,
  },
]

const managers: ProductionManager[] = [
  {
    id: 'mgr-criacao',
    name: 'Criação',
    sector: 'Criação',
    flowId: 'flow-cv',
    timeMode: 'PLAY_STOP',
    intervalMinutes: 0,
    users: [{ collaboratorId: 'col-natihely', onlyAssigned: false }],
    active: true,
  },
  {
    id: 'mgr-impressao',
    name: 'Impressão',
    sector: 'Impressão',
    flowId: 'flow-cv',
    timeMode: 'PLAY_STOP',
    // Troca de material entre impressões (GP-20): 10 min
    intervalMinutes: 10,
    users: [
      { collaboratorId: 'col-marcos', onlyAssigned: false },
      { collaboratorId: 'col-pedro', onlyAssigned: true },
    ],
    active: true,
  },
  {
    id: 'mgr-producao',
    name: 'Produção',
    sector: 'Produção',
    flowId: 'flow-cv',
    timeMode: 'DRAG_DROP',
    intervalMinutes: 0,
    users: [
      { collaboratorId: 'col-marcos', onlyAssigned: false },
      { collaboratorId: 'col-ana', onlyAssigned: false },
    ],
    active: true,
  },
  {
    id: 'mgr-instalacao',
    name: 'Instalação',
    sector: 'Instalação',
    flowId: 'flow-cv',
    timeMode: 'DRAG_DROP',
    intervalMinutes: 0,
    users: [{ collaboratorId: 'col-pedro', onlyAssigned: false }],
    active: true,
  },
]

const vehicles: Vehicle[] = [
  { id: 'veh-fiorino', name: 'Fiorino', plate: 'ABC-1D23', active: true },
  { id: 'veh-hr', name: 'HR baú', plate: 'XYZ-9K87', active: true },
]

const step = (name: string, managerId: string): TaskStep => ({
  id: `st-${uid()}`,
  name,
  managerId,
})

// O tipo de tarefa tem o nome do "tipo de tarefa" da etapa da composição
// (IP-23): é por ele que a tarefa sabe em quais gerenciadores passa
const taskTypes: TaskType[] = [
  {
    id: 'tt-criacao',
    name: 'Criação',
    release: 'WITH_BASE',
    timeControl: true,
    steps: [step('Arte', 'mgr-criacao'), step('Aprovação', 'mgr-criacao')],
    active: true,
  },
  {
    id: 'tt-impressao',
    name: 'Impressão',
    release: 'WITH_BASE',
    timeControl: true,
    // A impressão passa pela Impressão e o refile é feito na Produção: a
    // tarefa muda de gerenciador de uma etapa para outra (GP-14)
    steps: [step('Impressão', 'mgr-impressao'), step('Refile', 'mgr-producao')],
    active: true,
  },
  {
    id: 'tt-producao',
    name: 'Produção',
    // Como no legado: o que a Produção faz sobre uma base espera a base
    // terminar. A etapa de base não tem base, então não espera nada
    release: 'AFTER_BASE',
    timeControl: true,
    steps: [step('Montagem', 'mgr-producao')],
    active: true,
  },
  {
    id: 'tt-acabamento',
    name: 'Acabamento',
    release: 'AFTER_BASE',
    timeControl: true,
    steps: [step('Acabamento', 'mgr-producao')],
    active: true,
  },
  {
    id: 'tt-instalacao',
    name: 'Instalação',
    release: 'AFTER_BASE',
    timeControl: true,
    steps: [step('Instalação', 'mgr-instalacao')],
    active: true,
  },
]

/* ---------------------------------------------------------------------------
 * Projetos e tarefas, gerados da composição
 * ------------------------------------------------------------------------- */

const projects: ProductionProject[] = []
const tasks: ProductionTask[] = []
let seeded = false

const log = (task: ProductionTask, by: string, text: string) =>
  task.history.unshift({ id: `h-${uid()}`, at: now(), by, text })

// Uma tarefa por etapa da composição do item vendido (GP-16, FL-10). O
// consumo e os campos vêm do mesmo cálculo da composição; o acabamento
// guarda a tarefa da base, que é o que a regra de liberação olha (GP-13)
const tasksFromComposition = async ({
  projectId,
  productId,
  itemName,
  itemImage,
  measure,
}: {
  projectId: string
  productId: string
  itemName: string
  itemImage: string | null
  measure: AssemblyMeasure
}) => {
  const res = await getSaleComposition({ productId, measure })
  const report = res.data
  if (!report) return []
  const created: ProductionTask[] = []
  const byBlock = new Map<string, string>()

  report.blocks.forEach((block) => {
    // Etapa que ficou vazia nesta venda (a opcional desmarcada) não vira
    // tarefa
    if (!block.lines.length && !block.setupMinutes) return
    // O tipo vem do "tipo de tarefa" da etapa (IP-23); sem correspondente,
    // cai na Produção
    const type =
      taskTypes.find(
        (item) =>
          item.active &&
          item.name.toLowerCase() === block.taskType.toLowerCase(),
      ) || taskTypes.find((item) => item.id === 'tt-producao')!
    const baseTaskId = block.baseName
      ? byBlock.get(
          report.blocks.find((item) => item.name === block.baseName)?.id || '',
        ) || null
      : null
    // O tempo previsto é a mão de obra das linhas mais o preparo
    const labor = block.lines
      .filter((line) => line.unit === 'min' && line.quantity !== null)
      .reduce((sum, line) => sum + (line.quantity || 0), 0)
    const machine =
      block.lines.find((line) => line.kind === 'MACHINE')?.resource || null
    const task: ProductionTask = {
      id: `tk-${uid()}`,
      code: code(),
      projectId,
      itemName,
      itemImage,
      stageName: block.name,
      sector: block.sector,
      taskTypeId: type.id,
      stepIndex: 0,
      status: 'NOT_STARTED',
      estimatedMinutes: Math.round(block.setupMinutes + labor),
      setupMinutes: block.setupMinutes,
      machine,
      baseTaskId,
      // A dependência de verdade: só o acabamento que espera a base (GP-13)
      dependsOn:
        baseTaskId && type.release === 'AFTER_BASE' ? [baseTaskId] : [],
      releasedNext: null,
      quantity: block.measure.quantity,
      measureText: [
        `${block.measure.quantity} un`,
        block.measure.width && block.measure.height
          ? `${br(block.measure.width)} × ${br(block.measure.height)} m`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
      fields: block.extra ? [block.extra] : [],
      consumption: block.lines.flatMap((line) =>
        line.entries
          ? line.entries.map((entry) => ({
              kind: line.kind,
              resource: entry.name,
              quantity: entry.quantity,
              unit: entry.unit,
            }))
          : [
              {
                kind: line.kind,
                resource: line.resource || line.name,
                quantity: line.quantity,
                unit: line.unit,
              },
            ],
      ),
      note: block.note,
      schedule: null,
      assigneeId: null,
      pendency: null,
      timeEntries: [],
      corrections: [],
      attachments: [],
      history: [],
      completedBy: null,
      completedAt: null,
      vehicleId: null,
      km: null,
    }
    byBlock.set(block.id, task.id)
    created.push(task)
  })
  return created
}

// Ao liberar a produção, a tarefa que já nasce concluída fecha (GP-13); as
// outras começam "não iniciadas", bloqueadas ou não pela dependência
const applyRelease = (projectId: string, by: string) => {
  tasks
    .filter((task) => task.projectId === projectId)
    .forEach((task) => {
      const type = taskTypes.find((item) => item.id === task.taskTypeId)!
      if (type.release === 'DONE' && task.status === 'NOT_STARTED') {
        task.status = 'DONE'
        task.completedBy = 'sistema'
        task.completedAt = now()
        log(task, by, 'Nasceu concluída pela regra do tipo de tarefa')
      }
    })
}

const seed = async () => {
  if (seeded) return
  seeded = true
  const plan: {
    number: string
    client: string
    status: ProductionProject['status']
    due: number
    deliveryType: string
    items: {
      productId: string
      name: string
      image: string | null
      measure: AssemblyMeasure
    }[]
  }[] = [
    {
      number: '1024-V1',
      client: 'Supermercado Bom Preço',
      status: 'PRODUCTION',
      due: 2,
      deliveryType: 'Entrega na instalação',
      items: [
        {
          productId: 'placa-quadro',
          name: 'Placa em lona com quadro de ferro',
          image: '/img/product-placeholder.png',
          measure: { quantity: 1, width: 2, height: 1 },
        },
        {
          productId: 'banner',
          name: 'Banner 440 com bastão',
          image: '/img/og.jpg',
          measure: { quantity: 3, width: 0.9, height: 1.2 },
        },
      ],
    },
    {
      number: '1025-V1',
      client: 'Clínica Sorriso',
      status: 'PRODUCTION',
      due: -1,
      deliveryType: 'Cliente retira',
      items: [
        {
          productId: 'cartao',
          name: 'Cartão de visita',
          image: null,
          measure: { quantity: 1000, width: 0.05, height: 0.09 },
        },
      ],
    },
    {
      number: '1026-V1',
      client: 'Padaria Pão Quente',
      status: 'STANDBY',
      due: 5,
      deliveryType: 'Cliente retira',
      items: [
        {
          productId: 'banner',
          name: 'Banner 440 com bastão',
          image: '/img/og.jpg',
          measure: { quantity: 1, width: 1.5, height: 2 },
        },
      ],
    },
  ]

  for (const entry of plan) {
    const project: ProductionProject = {
      id: `pj-${uid()}`,
      number: entry.number,
      client: entry.client,
      seller: 'Natihely',
      approvedAt: addDays(-2),
      deliveryType: entry.deliveryType,
      firstDue: addDays(entry.due),
      due: addDays(entry.due),
      status: entry.status,
    }
    projects.push(project)
    for (const item of entry.items) {
      tasks.push(
        ...(await tasksFromComposition({
          projectId: project.id,
          productId: item.productId,
          itemName: item.name,
          itemImage: item.image,
          measure: item.measure,
        })),
      )
    }
    if (project.status === 'PRODUCTION') applyRelease(project.id, 'sistema')
  }

  // Um pouco de movimento, para o quadro ser conferido sem a API
  const open = tasks.filter((task) => task.status === 'NOT_STARTED')
  const first = open.find((task) => !task.dependsOn.length)
  if (first) {
    first.schedule = { date: today(), start: '08:30', minutes: 60 }
    first.assigneeId = 'col-marcos'
    first.status = 'IN_PROGRESS'
    first.timeEntries.push({
      id: `te-${uid()}`,
      collaboratorId: 'col-marcos',
      start: minutesAgo(25),
      end: null,
      minutes: 0,
      source: 'CLOCK',
      note: null,
    })
    collaborators.find((item) => item.id === 'col-marcos')!.working = {
      taskId: first.id,
      since: minutesAgo(25),
    }
    log(first, 'Marcos', 'Iniciou a etapa')
    first.attachments.push({
      id: `at-${uid()}`,
      name: 'Arte final',
      kind: 'ART',
      versions: [
        {
          version: 1,
          fileName: 'arte-v1.pdf',
          size: 2_400_000,
          mime: 'application/pdf',
          dataUrl: null,
          uploadedBy: 'Natihely',
          uploadedAt: minutesAgo(600),
          current: false,
        },
        {
          version: 2,
          fileName: 'arte-v2-aprovada.pdf',
          size: 2_500_000,
          mime: 'application/pdf',
          dataUrl: null,
          uploadedBy: 'Natihely',
          uploadedAt: minutesAgo(120),
          current: true,
        },
      ],
    })
  }
  const second = open.find(
    (task) => task.id !== first?.id && !task.dependsOn.length,
  )
  if (second) {
    second.status = 'PENDING'
    second.pendency = {
      text: 'Cliente ainda não aprovou a arte.',
      at: minutesAgo(90),
      by: 'Natihely',
    }
    second.schedule = { date: today(), start: '10:00', minutes: 45 }
    log(
      second,
      'Natihely',
      'Adicionou pendência: cliente ainda não aprovou a arte.',
    )
  }
  // Uma etapa atrasada no projeto vencido, para a cadeia acusar
  const lateProject = projects.find((project) => project.due < today())
  const lateTask = tasks.find(
    (task) => task.projectId === lateProject?.id && !task.dependsOn.length,
  )
  if (lateTask && lateTask.status === 'NOT_STARTED') {
    lateTask.schedule = { date: addDays(-1), start: '14:00', minutes: 90 }
  }
  // A instalação com veículo (VS-7)
  const install = tasks.find((task) => task.sector === 'Instalação')
  if (install) {
    install.vehicleId = 'veh-fiorino'
    install.km = 24
    install.schedule = { date: addDays(1), start: '09:00', minutes: 180 }
  }
}

/* ---------------------------------------------------------------------------
 * Derivações: tempo apontado, bloqueio, cadeia de produção
 * ------------------------------------------------------------------------- */

const minutesBetween = (start: string, end: string) =>
  Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000)

const actualOf = (task: ProductionTask) =>
  Math.round(
    task.timeEntries.reduce(
      (sum, entry) =>
        sum + (entry.end ? entry.minutes : minutesBetween(entry.start, now())),
      0,
    ) * 10,
  ) / 10

const typeOf = (task: ProductionTask) =>
  taskTypes.find((item) => item.id === task.taskTypeId) || taskTypes[0]

const isOpen = (task: ProductionTask) =>
  task.status !== 'DONE' && task.status !== 'CANCELED'

// A etapa anterior libera esta quando termina ou quando libera a próxima
// antes de terminar (FL-13)
const satisfied = (dependency: ProductionTask) =>
  dependency.status === 'DONE' ||
  dependency.status === 'CANCELED' ||
  !!dependency.releasedNext

const blockerOf = (task: ProductionTask) =>
  task.dependsOn
    .map((id) => tasks.find((item) => item.id === id))
    .find((dependency) => dependency && !satisfied(dependency)) || null

const scheduleEnd = (task: ProductionTask) => {
  if (!task.schedule) return null
  const [hours, minutes] = task.schedule.start.split(':').map(Number)
  const date = new Date(`${task.schedule.date}T00:00:00`)
  date.setHours(hours, minutes + task.schedule.minutes, 0, 0)
  return date
}

const dueEnd = (project: ProductionProject) =>
  new Date(`${project.due}T${WORK_END}:00`)

// Passou do horário planejado sem terminar
const overdue = (task: ProductionTask) => {
  const end = scheduleEnd(task)
  return !!end && isOpen(task) && end.getTime() < Date.now()
}

// O que ainda falta desta etapa para a frente, no caminho mais longo
// (§4.7): é o que diz se a entrega está em risco (GP-42)
const remainingAhead = (
  task: ProductionTask,
  seen = new Set<string>(),
): number => {
  if (seen.has(task.id)) return 0
  seen.add(task.id)
  const own = isOpen(task)
    ? Math.max(task.estimatedMinutes - actualOf(task), 0)
    : 0
  const next = tasks
    .filter((item) => item.dependsOn.includes(task.id) && isOpen(item))
    .map((item) => remainingAhead(item, seen))
  return own + (next.length ? Math.max(...next) : 0)
}

// Quantos minutos de expediente existem de agora até o fim do prazo
const workMinutesUntil = (deadline: Date) => {
  const start = new Date()
  if (deadline.getTime() <= start.getTime()) return 0
  let minutes = 0
  const cursor = new Date(start)
  while (cursor.getTime() < deadline.getTime()) {
    const dayStart = new Date(cursor)
    const [sh, sm] = WORK_START.split(':').map(Number)
    dayStart.setHours(sh, sm, 0, 0)
    const dayEnd = new Date(cursor)
    const [eh, em] = WORK_END.split(':').map(Number)
    dayEnd.setHours(eh, em, 0, 0)
    const from = Math.max(cursor.getTime(), dayStart.getTime())
    const to = Math.min(deadline.getTime(), dayEnd.getTime())
    if (to > from) minutes += (to - from) / 60000
    cursor.setDate(cursor.getDate() + 1)
    cursor.setHours(0, 0, 0, 0)
    if (minutes > WORK_MINUTES_PER_DAY * 60) break
  }
  return minutes
}

const alertOf = (
  task: ProductionTask,
  project: ProductionProject,
): ChainAlert | null => {
  if (!isOpen(task) || project.status !== 'PRODUCTION') return null
  if (overdue(task)) {
    return {
      kind: 'OVERDUE',
      text: 'Passou do horário planejado sem terminar. Reagende ou recupere o atraso: as etapas seguintes estão avisadas.',
    }
  }
  // A etapa anterior atrasou: o aviso só some quando ela terminar ou for
  // reagendada de um jeito que a cadeia volte a caber (§12.2)
  const latePredecessor = task.dependsOn
    .map((id) => tasks.find((item) => item.id === id))
    .find(
      (dependency) =>
        dependency &&
        isOpen(dependency) &&
        (overdue(dependency) || !!alertOf(dependency, project)),
    )
  if (latePredecessor) {
    return {
      kind: 'LATE_PREDECESSOR',
      text: `${latePredecessor.stageName} atrasou. Esta etapa herda o atraso até a cadeia voltar a ficar alinhada.`,
    }
  }
  const remaining = remainingAhead(task)
  const available = workMinutesUntil(dueEnd(project))
  if (remaining > available) {
    return {
      kind: 'DELIVERY_RISK',
      text: `O que falta daqui para a frente (${Math.round(remaining)} min) não cabe até a entrega em ${project.due.split('-').reverse().join('/')}.`,
    }
  }
  if (task.schedule && task.schedule.date > project.due) {
    return {
      kind: 'DELIVERY_RISK',
      text: 'Agendada para depois da data de entrega.',
    }
  }
  return null
}

const viewOf = (task: ProductionTask): TaskView => {
  const project = projects.find((item) => item.id === task.projectId)!
  const taskType = typeOf(task)
  const current =
    taskType.steps[Math.min(task.stepIndex, taskType.steps.length - 1)]
  const blocker = task.status === 'NOT_STARTED' ? blockerOf(task) : null
  return {
    ...task,
    project,
    taskType,
    step: current,
    managerId: current.managerId,
    blocked: !!blocker || project.status === 'STANDBY',
    blockedBy: blocker
      ? blocker.stageName
      : project.status === 'STANDBY'
        ? 'produção não liberada'
        : null,
    assignee: collaborators.find((item) => item.id === task.assigneeId) || null,
    workers: collaborators.filter((item) => item.working?.taskId === task.id),
    actualMinutes: actualOf(task),
    late: isOpen(task) && project.due < today(),
    alert: alertOf(task, project),
  }
}

const projectRisk = (project: ProductionProject) => {
  const own = tasks.filter((task) => task.projectId === project.id)
  return own.some((task) => alertOf(task, project)?.kind === 'DELIVERY_RISK')
}

/* ---------------------------------------------------------------------------
 * Leitura
 * ------------------------------------------------------------------------- */

export const getManagerConfig = async () =>
  ok({ flows, managers, taskTypes, collaborators, vehicles })

// O cartão de cada gerenciador, com quantas tarefas abertas ele tem
export const getManagerSummary = async () => {
  await seed()
  return ok(
    managers
      .filter((manager) => manager.active)
      .map((manager) => {
        const own = tasks
          .map(viewOf)
          .filter(
            (task) =>
              task.managerId === manager.id &&
              task.project.status === 'PRODUCTION' &&
              isOpen(task),
          )
        return {
          ...manager,
          open: own.length,
          alerts: own.filter((task) => task.alert).length,
        }
      }),
  )
}

// Quem acessa o gerenciador, e como (GP-11): o gerente vê tudo; o operador,
// o que o acesso dele ao gerenciador permite
const visibleTo = (
  task: TaskView,
  manager: ProductionManager,
  viewer: BoardViewer,
) => {
  if (viewer.manager) return true
  if (!viewer.collaboratorId) return false
  const access = manager.users.find(
    (user) => user.collaboratorId === viewer.collaboratorId,
  )
  if (!access) return false
  if (!access.onlyAssigned) return true
  return (
    task.assigneeId === viewer.collaboratorId ||
    task.workers.some((person) => person.id === viewer.collaboratorId)
  )
}

export const getManagerBoard = async ({
  managerId,
  viewer = { manager: true, collaboratorId: null },
}: {
  managerId: string
  viewer?: BoardViewer
}) => {
  await seed()
  const manager = managers.find((item) => item.id === managerId)
  if (!manager) return fail('Gerenciador não encontrado')
  const all = tasks
    .map(viewOf)
    .filter(
      (task) =>
        task.managerId === managerId && task.project.status === 'PRODUCTION',
    )
  return ok({
    manager,
    tasks: all.filter((task) => visibleTo(task, manager, viewer)),
    hidden:
      all.length -
      all.filter((task) => visibleTo(task, manager, viewer)).length,
    // Os colaboradores com acesso a este gerenciador (GP-11, GP-17)
    collaborators: manager.users
      .map((user) => ({
        ...collaborators.find((item) => item.id === user.collaboratorId)!,
        onlyAssigned: user.onlyAssigned,
      }))
      .filter((item) => item.id),
    taskTypes: taskTypes.filter((type) =>
      type.steps.some((item) => item.managerId === managerId),
    ),
    vehicles: vehicles.filter((vehicle) => vehicle.active),
  })
}

// Quem é o usuário da sessão na produção: o colaborador com o mesmo e-mail
export const getViewer = async ({
  email,
  isManager,
}: {
  email: string | null
  isManager: boolean
}) => {
  const person = email
    ? collaborators.find(
        (item) => item.email?.toLowerCase() === email.toLowerCase(),
      )
    : null
  return ok({
    collaboratorId: person?.id || null,
    name: person?.name || null,
    manager: isManager || person?.role === 'MANAGER',
  })
}

// A agenda viva (§4.8): as tarefas agendadas de todos os gerenciadores, por
// dia, mais a ocupação dos veículos (VS-7)
export const getAgenda = async ({ from, to }: { from: string; to: string }) => {
  await seed()
  const scheduled = tasks
    .map(viewOf)
    .filter(
      (task) =>
        task.project.status === 'PRODUCTION' &&
        task.schedule &&
        task.schedule.date >= from &&
        task.schedule.date <= to,
    )
    .sort((a, b) =>
      `${a.schedule!.date}${a.schedule!.start}`.localeCompare(
        `${b.schedule!.date}${b.schedule!.start}`,
      ),
    )
  const unscheduled = tasks
    .map(viewOf)
    .filter(
      (task) =>
        task.project.status === 'PRODUCTION' && isOpen(task) && !task.schedule,
    )
  return ok({
    scheduled,
    unscheduled,
    vehicles: vehicles.filter((vehicle) => vehicle.active),
    managers: managers.filter((manager) => manager.active),
  })
}

export const getTask = async ({ id }: { id: string }) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  return ok(viewOf(task))
}

export const getProjects = async () => {
  await seed()
  return ok(
    projects.map((project) => {
      const own = tasks.filter((task) => task.projectId === project.id)
      return {
        ...project,
        total: own.length,
        done: own.filter((task) => task.status === 'DONE').length,
        alerts: own.filter((task) => alertOf(task, project)).length,
        risk: projectRisk(project),
        late:
          project.status !== 'DONE' &&
          project.status !== 'CANCELED' &&
          project.due < today(),
      }
    }),
  )
}

export const getProject = async ({ id }: { id: string }) => {
  await seed()
  const project = projects.find((item) => item.id === id)
  if (!project) return fail('Projeto não encontrado')
  return ok({
    project,
    late:
      project.status !== 'DONE' &&
      project.status !== 'CANCELED' &&
      project.due < today(),
    risk: projectRisk(project),
    tasks: tasks.filter((task) => task.projectId === id).map(viewOf),
  })
}

/* ---------------------------------------------------------------------------
 * Configuração: gravação
 * ------------------------------------------------------------------------- */

export const saveManager = async ({
  id,
  values,
}: {
  id?: string
  values: {
    name: string
    sector: string
    flowId: string
    timeMode: TimeMode
    intervalMinutes: number
  }
}) => {
  if (!values.name.trim()) return fail('Informe o nome do gerenciador')
  if (!values.sector.trim()) return fail('Escolha o setor do gerenciador')
  const interval = Math.max(0, Math.round(values.intervalMinutes || 0))
  const existing = managers.find((item) => item.id === id)
  if (existing) {
    Object.assign(existing, {
      ...values,
      name: values.name.trim(),
      intervalMinutes: interval,
    })
    return ok(existing.id)
  }
  const manager: ProductionManager = {
    id: `mgr-${uid()}`,
    ...values,
    name: values.name.trim(),
    intervalMinutes: interval,
    users: [],
    active: true,
  }
  managers.push(manager)
  return ok(manager.id)
}

// Inativar pede destino para as etapas: nenhuma tarefa fica sem gerenciador
// (GP-15)
export const inactivateManager = async ({
  id,
  destinationId,
}: {
  id: string
  destinationId: string
}) => {
  const manager = managers.find((item) => item.id === id)
  const destination = managers.find(
    (item) => item.id === destinationId && item.active && item.id !== id,
  )
  if (!manager) return fail('Gerenciador não encontrado')
  if (!destination) return fail('Escolha um gerenciador ativo de destino')
  taskTypes.forEach((type) =>
    type.steps.forEach((item) => {
      if (item.managerId === id) item.managerId = destinationId
    }),
  )
  manager.active = false
  return ok(null)
}

export const reactivateManager = async ({ id }: { id: string }) => {
  const manager = managers.find((item) => item.id === id)
  if (!manager) return fail('Gerenciador não encontrado')
  manager.active = true
  return ok(null)
}

export const setManagerUser = async ({
  managerId,
  collaboratorId,
  access,
}: {
  managerId: string
  collaboratorId: string
  // Sem acesso, com acesso a tudo, ou só às tarefas atribuídas (GP-11)
  access: 'NONE' | 'ALL' | 'ASSIGNED'
}) => {
  const manager = managers.find((item) => item.id === managerId)
  if (!manager) return fail('Gerenciador não encontrado')
  manager.users = manager.users.filter(
    (user) => user.collaboratorId !== collaboratorId,
  )
  if (access !== 'NONE') {
    manager.users.push({ collaboratorId, onlyAssigned: access === 'ASSIGNED' })
  }
  return ok(null)
}

// O perfil do colaborador na produção (GP-11): operador ou gerente
export const setCollaboratorRole = async ({
  collaboratorId,
  role,
}: {
  collaboratorId: string
  role: CollaboratorRole
}) => {
  const person = collaborators.find((item) => item.id === collaboratorId)
  if (!person) return fail('Colaborador não encontrado')
  person.role = role
  return ok(null)
}

export const saveTaskType = async ({
  id,
  values,
}: {
  id?: string
  values: {
    name: string
    release: ReleaseRule
    timeControl: boolean
    // Só ao criar: o gerenciador da primeira etapa
    managerId?: string
  }
}) => {
  if (!values.name.trim()) return fail('Informe o nome do tipo de tarefa')
  const existing = taskTypes.find((item) => item.id === id)
  if (existing) {
    Object.assign(existing, {
      name: values.name.trim(),
      release: values.release,
      timeControl: values.timeControl,
    })
    return ok(existing.id)
  }
  if (!values.managerId) return fail('Escolha o gerenciador da primeira etapa')
  const type: TaskType = {
    id: `tt-${uid()}`,
    name: values.name.trim(),
    release: values.release,
    timeControl: values.timeControl,
    steps: [step('Primeira etapa', values.managerId)],
    active: true,
  }
  taskTypes.push(type)
  return ok(type.id)
}

export const setTaskTypeActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const type = taskTypes.find((item) => item.id === id)
  if (!type) return fail('Tipo de tarefa não encontrado')
  type.active = active
  return ok(null)
}

export const saveTaskStep = async ({
  typeId,
  stepId,
  name,
  managerId,
}: {
  typeId: string
  stepId?: string
  name: string
  managerId: string
}) => {
  const type = taskTypes.find((item) => item.id === typeId)
  if (!type) return fail('Tipo de tarefa não encontrado')
  if (!name.trim()) return fail('Informe o nome da etapa')
  const existing = type.steps.find((item) => item.id === stepId)
  if (existing) {
    existing.name = name.trim()
    existing.managerId = managerId
  } else {
    type.steps.push(step(name.trim(), managerId))
  }
  return ok(null)
}

export const removeTaskStep = async ({
  typeId,
  stepId,
}: {
  typeId: string
  stepId: string
}) => {
  const type = taskTypes.find((item) => item.id === typeId)
  if (!type) return fail('Tipo de tarefa não encontrado')
  if (type.steps.length <= 1)
    return fail('O tipo precisa de ao menos uma etapa')
  type.steps = type.steps.filter((item) => item.id !== stepId)
  return ok(null)
}

export const moveTaskStep = async ({
  typeId,
  stepId,
  direction,
}: {
  typeId: string
  stepId: string
  direction: 'UP' | 'DOWN'
}) => {
  const type = taskTypes.find((item) => item.id === typeId)
  if (!type) return fail('Tipo de tarefa não encontrado')
  const index = type.steps.findIndex((item) => item.id === stepId)
  const target = direction === 'UP' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= type.steps.length) return ok(null)
  const [moved] = type.steps.splice(index, 1)
  type.steps.splice(target, 0, moved)
  return ok(null)
}

// Frota (VS-7): os veículos cadastrados
export const saveVehicle = async ({
  id,
  values,
}: {
  id?: string
  values: { name: string; plate: string }
}) => {
  if (!values.name.trim()) return fail('Informe o nome do veículo')
  const existing = vehicles.find((item) => item.id === id)
  if (existing) {
    Object.assign(existing, {
      name: values.name.trim(),
      plate: values.plate.trim().toUpperCase(),
    })
    return ok(existing.id)
  }
  const vehicle: Vehicle = {
    id: `veh-${uid()}`,
    name: values.name.trim(),
    plate: values.plate.trim().toUpperCase(),
    active: true,
  }
  vehicles.push(vehicle)
  return ok(vehicle.id)
}

export const setVehicleActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const vehicle = vehicles.find((item) => item.id === id)
  if (!vehicle) return fail('Veículo não encontrado')
  vehicle.active = active
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Tarefas: os seis estados (GP-28), com quem fez cada coisa
 * ------------------------------------------------------------------------- */

const closeEntries = (task: ProductionTask) => {
  task.timeEntries.forEach((entry) => {
    if (!entry.end) {
      entry.end = now()
      entry.minutes =
        Math.round(minutesBetween(entry.start, entry.end) * 10) / 10
    }
  })
  collaborators.forEach((person) => {
    if (person.working?.taskId === task.id) person.working = null
  })
}

const transitions: {
  [key in TaskAction]: { from: TaskStatus[]; to: TaskStatus; text: string }
} = {
  START: { from: ['NOT_STARTED'], to: 'IN_PROGRESS', text: 'Iniciou a etapa' },
  PAUSE: { from: ['IN_PROGRESS'], to: 'PAUSED', text: 'Pausou a etapa' },
  RESUME: {
    from: ['PAUSED', 'PENDING'],
    to: 'IN_PROGRESS',
    text: 'Continuou a etapa',
  },
  FINISH: {
    from: ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'PENDING'],
    to: 'DONE',
    text: 'Concluiu a etapa',
  },
  CANCEL: {
    from: ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'PENDING'],
    to: 'CANCELED',
    text: 'Cancelou a etapa',
  },
  RESTART: {
    from: ['DONE', 'CANCELED'],
    to: 'NOT_STARTED',
    text: 'Reiniciou a etapa',
  },
}

// A ação muda o estado da etapa e registra quem fez. Concluir a última etapa
// conclui a tarefa e libera o que esperava por ela (GP-13); concluir uma
// etapa do meio passa para a próxima, que pode estar em outro gerenciador
// (GP-14). Iniciar com o relógio ligado começa o apontamento de quem iniciou
export const actOnTask = async ({
  id,
  action,
  by,
  collaboratorId,
}: {
  id: string
  action: TaskAction
  by: string
  collaboratorId?: string | null
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  const rule = transitions[action]
  if (!rule.from.includes(task.status)) {
    return fail(`Não dá para ${rule.text.toLowerCase()} neste estado`)
  }
  const view = viewOf(task)
  if ((action === 'START' || action === 'RESUME') && view.blocked) {
    return fail(`Esta etapa espera ${view.blockedBy}`)
  }

  if (action === 'START' || action === 'RESUME') {
    task.status = 'IN_PROGRESS'
    if (action === 'RESUME' && task.pendency) {
      log(task, by, `Resolveu a pendência: ${task.pendency.text}`)
      task.pendency = null
    }
    if (collaboratorId && view.taskType.timeControl) {
      await startWork({ id, collaboratorId, source: 'CLOCK' })
    }
    log(task, by, rule.text)
    return ok(rule.text)
  }

  if (action === 'PAUSE' || action === 'CANCEL') {
    closeEntries(task)
    task.status = rule.to
    log(task, by, rule.text)
    return ok(rule.text)
  }

  if (action === 'RESTART') {
    task.status = 'NOT_STARTED'
    task.completedBy = null
    task.completedAt = null
    log(task, by, `${rule.text} (o tempo apontado foi mantido para correção)`)
    return ok(rule.text)
  }

  // FINISH
  closeEntries(task)
  if (task.stepIndex < view.taskType.steps.length - 1) {
    task.stepIndex++
    task.status = 'NOT_STARTED'
    task.schedule = null
    const next = view.taskType.steps[task.stepIndex]
    log(task, by, `Concluiu ${view.step.name} e passou para ${next.name}`)
    return ok(`Foi para ${next.name}`)
  }
  task.status = 'DONE'
  task.completedBy = by
  task.completedAt = now()
  task.pendency = null
  log(task, by, 'Concluiu a tarefa')
  return ok('Tarefa concluída')
}

// Pendência: um impedimento descrito em texto, que sinaliza sem interromper
// (GP-28). O relógio de quem estava na tarefa para
export const addPendency = async ({
  id,
  text,
  by,
}: {
  id: string
  text: string
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  if (!text.trim()) return fail('Descreva a pendência')
  if (!isOpen(task)) return fail('A tarefa já foi encerrada')
  closeEntries(task)
  task.status = 'PENDING'
  task.pendency = { text: text.trim(), at: now(), by }
  log(task, by, `Adicionou pendência: ${text.trim()}`)
  return ok(null)
}

// Liberar a próxima etapa antes de concluir esta (FL-13, GP-37): simples por
// padrão; a quantidade é opcional ("10 de 50")
export const releaseNext = async ({
  id,
  by,
  quantity,
}: {
  id: string
  by: string
  quantity?: number | null
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  if (!isOpen(task)) return fail('A tarefa já foi encerrada')
  const dependents = tasks.filter((item) => item.dependsOn.includes(id))
  if (!dependents.length) return fail('Nenhuma etapa espera por esta')
  task.releasedNext = {
    at: now(),
    by,
    quantity: quantity ?? null,
    of: quantity ? task.quantity : null,
  }
  log(
    task,
    by,
    quantity
      ? `Liberou a próxima etapa com ${quantity} de ${task.quantity}`
      : 'Liberou a próxima etapa antes de concluir',
  )
  return ok(
    `${dependents.map((item) => item.stageName).join(', ')} liberada(s)`,
  )
}

export const scheduleTask = async ({
  id,
  schedule,
  by,
}: {
  id: string
  schedule: { date: string; start: string; minutes: number } | null
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.schedule = schedule
  log(
    task,
    by,
    schedule
      ? `Agendou para ${schedule.date.split('-').reverse().join('/')} às ${schedule.start}`
      : 'Tirou da agenda',
  )
  return ok(null)
}

export const assignTask = async ({
  id,
  collaboratorId,
  by,
}: {
  id: string
  collaboratorId: string | null
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.assigneeId = collaboratorId
  const person = collaborators.find((item) => item.id === collaboratorId)
  log(task, by, person ? `Atribuiu a ${person.name}` : 'Tirou a atribuição')
  return ok(null)
}

// Veículo, km e horário da saída (VS-7)
export const setTaskVehicle = async ({
  id,
  vehicleId,
  km,
  by,
}: {
  id: string
  vehicleId: string | null
  km: number | null
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.vehicleId = vehicleId
  task.km = km
  const vehicle = vehicles.find((item) => item.id === vehicleId)
  log(
    task,
    by,
    vehicle
      ? `Reservou ${vehicle.name}${km ? ` · ${km} km` : ''}`
      : 'Tirou o veículo',
  )
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Apontamento de tempo (GP-43): o relógio por pessoa. No modelo coletivo,
 * arrastar o colaborador para a tarefa faz o mesmo
 * ------------------------------------------------------------------------- */

export const startWork = async ({
  id,
  collaboratorId,
  source = 'CLOCK',
}: {
  id: string
  collaboratorId: string
  source?: 'CLOCK' | 'DRAG'
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  const person = collaborators.find((item) => item.id === collaboratorId)
  if (!task || !person) return fail('Tarefa ou colaborador não encontrado')
  const view = viewOf(task)
  if (view.blocked) return fail(`Esta etapa espera ${view.blockedBy}`)
  if (!isOpen(task)) return fail('A tarefa já foi encerrada')
  // Quem já estava em outra tarefa para aquela primeiro
  if (person.working) await stopWork({ collaboratorId })
  const start = now()
  person.working = { taskId: id, since: start }
  task.timeEntries.push({
    id: `te-${uid()}`,
    collaboratorId,
    start,
    end: null,
    minutes: 0,
    source,
    note: null,
  })
  task.assigneeId = task.assigneeId || collaboratorId
  if (task.status === 'NOT_STARTED' || task.status === 'PAUSED') {
    task.status = 'IN_PROGRESS'
  }
  log(task, person.name, 'Entrou na tarefa (relógio ligado)')
  return ok(null)
}

export const stopWork = async ({
  collaboratorId,
}: {
  collaboratorId: string
}) => {
  const person = collaborators.find((item) => item.id === collaboratorId)
  if (!person?.working) return ok(null)
  const task = tasks.find((item) => item.id === person.working!.taskId)
  if (task) {
    const entry = task.timeEntries.find(
      (item) => item.collaboratorId === collaboratorId && !item.end,
    )
    if (entry) {
      entry.end = now()
      entry.minutes =
        Math.round(minutesBetween(entry.start, entry.end) * 10) / 10
    }
    log(task, person.name, 'Saiu da tarefa (relógio parado)')
  }
  person.working = null
  return ok(null)
}

// O gerente corrige o tempo ou a pessoa de um apontamento; o que era antes
// fica no histórico (GP-44)
export const correctTimeEntry = async ({
  id,
  entryId,
  minutes,
  collaboratorId,
  note,
  by,
}: {
  id: string
  entryId: string
  minutes: number
  collaboratorId: string
  note: string
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  const entry = task.timeEntries.find((item) => item.id === entryId)
  if (!entry) return fail('Apontamento não encontrado')
  if (!entry.end) return fail('Pare o relógio antes de corrigir')
  if (!note.trim()) return fail('Diga o motivo da correção')
  if (minutes < 0) return fail('O tempo não pode ser negativo')
  const before = {
    collaboratorId: entry.collaboratorId,
    minutes: entry.minutes,
  }
  entry.minutes = Math.round(minutes * 10) / 10
  entry.collaboratorId = collaboratorId
  entry.source = 'CORRECTION'
  entry.note = note.trim()
  task.corrections.unshift({
    id: `tc-${uid()}`,
    at: now(),
    by,
    entryId,
    before,
    after: { collaboratorId, minutes: entry.minutes },
    note: note.trim(),
  })
  const who = collaborators.find((item) => item.id === collaboratorId)?.name
  log(
    task,
    by,
    `Corrigiu o apontamento: ${before.minutes} min → ${entry.minutes} min (${who}). ${note.trim()}`,
  )
  return ok(null)
}

// Lançar um tempo à mão (quem esqueceu de ligar o relógio); fica marcado
// como correção, com motivo
export const addTimeEntry = async ({
  id,
  collaboratorId,
  minutes,
  note,
  by,
}: {
  id: string
  collaboratorId: string
  minutes: number
  note: string
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  if (minutes <= 0) return fail('Informe o tempo')
  if (!note.trim()) return fail('Diga o motivo do lançamento')
  const end = now()
  task.timeEntries.push({
    id: `te-${uid()}`,
    collaboratorId,
    start: minutesAgo(minutes),
    end,
    minutes: Math.round(minutes * 10) / 10,
    source: 'CORRECTION',
    note: note.trim(),
  })
  const who = collaborators.find((item) => item.id === collaboratorId)?.name
  log(task, by, `Lançou ${minutes} min para ${who}. ${note.trim()}`)
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Anexos por etapa, com versão (GP-25, GP-26)
 * ------------------------------------------------------------------------- */

export const addAttachment = async ({
  id,
  attachmentId,
  name,
  kind,
  file,
  by,
}: {
  id: string
  // Com id, é uma versão nova de um anexo existente
  attachmentId?: string | null
  name: string
  kind: AttachmentKind
  file: { fileName: string; size: number; mime: string; dataUrl: string | null }
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  if (!file.fileName) return fail('Escolha o arquivo')
  const uploadedAt = now()
  let attachment = task.attachments.find((item) => item.id === attachmentId)
  if (!attachment) {
    if (!name.trim()) return fail('Dê um nome ao anexo')
    attachment = { id: `at-${uid()}`, name: name.trim(), kind, versions: [] }
    task.attachments.push(attachment)
  }
  attachment.versions.forEach((version) => (version.current = false))
  attachment.versions.push({
    version: attachment.versions.length + 1,
    fileName: file.fileName,
    size: file.size,
    mime: file.mime,
    dataUrl: file.dataUrl,
    uploadedBy: by,
    uploadedAt,
    current: true,
  })
  log(
    task,
    by,
    `Anexou ${attachment.name} v${attachment.versions.length} (${file.fileName})`,
  )
  return ok(attachment.id)
}

// Qual versão vale: a válida é a que a produção usa; as outras ficam para
// consulta (GP-26)
export const setCurrentVersion = async ({
  id,
  attachmentId,
  version,
  by,
}: {
  id: string
  attachmentId: string
  version: number
  by: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  const attachment = task?.attachments.find((item) => item.id === attachmentId)
  if (!task || !attachment) return fail('Anexo não encontrado')
  attachment.versions.forEach(
    (item) => (item.current = item.version === version),
  )
  log(task, by, `Marcou ${attachment.name} v${version} como a válida`)
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Projetos: liberar, concluir, cancelar, alterar entrega (GP-8) e nascer da
 * venda aprovada
 * ------------------------------------------------------------------------- */

export const setProjectStatus = async ({
  id,
  status,
  by,
}: {
  id: string
  status: 'PRODUCTION' | 'DONE' | 'CANCELED'
  by: string
}) => {
  await seed()
  const project = projects.find((item) => item.id === id)
  if (!project) return fail('Projeto não encontrado')
  const own = tasks.filter((task) => task.projectId === id)
  if (status === 'DONE' && own.some(isOpen)) {
    return fail('Ainda há tarefas abertas neste projeto')
  }
  const wasStandby = project.status === 'STANDBY'
  project.status = status
  if (status === 'PRODUCTION' && wasStandby) applyRelease(id, by)
  if (status === 'CANCELED') {
    own.filter(isOpen).forEach((task) => {
      closeEntries(task)
      task.status = 'CANCELED'
      log(task, by, 'Cancelada com o projeto')
    })
  }
  return ok(null)
}

export const changeDelivery = async ({
  id,
  due,
}: {
  id: string
  due: string
}) => {
  await seed()
  const project = projects.find((item) => item.id === id)
  if (!project) return fail('Projeto não encontrado')
  if (!due) return fail('Informe a nova data')
  project.due = due
  return ok(null)
}

// O projeto nasce da venda aprovada (PCP-4): uma tarefa por etapa da
// composição de cada item. A API chamará isto ao aprovar o orçamento;
// enquanto não chama, a tela de Projetos tem um botão de exemplo
export const createProjectFromSale = async ({
  number,
  client,
  seller,
  deliveryType,
  due,
  items,
  releaseNow = false,
}: {
  number: string
  client: string
  seller: string
  deliveryType: string
  due: string
  items: {
    productId: string
    name: string
    image?: string | null
    measure: AssemblyMeasure
  }[]
  releaseNow?: boolean
}) => {
  await seed()
  if (!number.trim() || !client.trim()) {
    return fail('Informe o número da venda e o cliente')
  }
  if (!items.length) return fail('A venda não tem itens com composição')
  const project: ProductionProject = {
    id: `pj-${uid()}`,
    number: number.trim(),
    client: client.trim(),
    seller,
    approvedAt: today(),
    deliveryType,
    firstDue: due || addDays(7),
    due: due || addDays(7),
    status: releaseNow ? 'PRODUCTION' : 'STANDBY',
  }
  projects.unshift(project)
  let created = 0
  for (const item of items) {
    const own = await tasksFromComposition({
      projectId: project.id,
      productId: item.productId,
      itemName: item.name,
      itemImage: item.image || null,
      measure: item.measure,
    })
    created += own.length
    tasks.push(...own)
  }
  if (!created) {
    projects.shift()
    return fail('Nenhum item da venda tem composição: não há etapa a produzir')
  }
  if (releaseNow) applyRelease(project.id, 'venda aprovada')
  return ok({ id: project.id, tasks: created })
}

/* ---------------------------------------------------------------------------
 * Produtividade pelo tempo vendido (GP-30, GP-32): o que conta é o tempo
 * vendido da tarefa, repartido entre as pessoas na proporção do tempo que
 * cada uma trabalhou. Por pessoa só para quem tem permissão (PCP-3)
 * ------------------------------------------------------------------------- */

export const getProductivity = async ({
  perPerson,
}: {
  perPerson: boolean
}) => {
  await seed()
  const done = tasks.filter((task) => task.status === 'DONE')
  const bySector = Array.from(new Set(done.map((task) => task.sector))).map(
    (sector) => {
      const own = done.filter((task) => task.sector === sector)
      const sold = own.reduce((sum, task) => sum + task.estimatedMinutes, 0)
      const worked = own.reduce((sum, task) => sum + actualOf(task), 0)
      return {
        sector,
        tasks: own.length,
        sold,
        worked,
        productivity: worked ? Math.round((sold / worked) * 1000) / 10 : null,
      }
    },
  )
  const people = perPerson
    ? collaborators
        .map((person) => {
          let sold = 0
          let worked = 0
          let count = 0
          done.forEach((task) => {
            const total = task.timeEntries.reduce(
              (sum, entry) => sum + entry.minutes,
              0,
            )
            const mine = task.timeEntries
              .filter((entry) => entry.collaboratorId === person.id)
              .reduce((sum, entry) => sum + entry.minutes, 0)
            if (!mine) return
            count += 1
            worked += mine
            // A divisão proporcional (GP-32): 70 % do tempo, 70 % do vendido
            sold += total ? (task.estimatedMinutes * mine) / total : 0
          })
          return {
            collaboratorId: person.id,
            name: person.name,
            tasks: count,
            sold: Math.round(sold),
            worked: Math.round(worked),
            productivity: worked
              ? Math.round((sold / worked) * 1000) / 10
              : null,
          }
        })
        .filter((person) => person.tasks > 0)
    : []
  return ok({ bySector, people })
}

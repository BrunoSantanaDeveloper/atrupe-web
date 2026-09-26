'use server'

// PROVISÓRIO: a API ainda não tem o gerenciador de produção (recurso do
// ELITE). Estado em memória para as telas; o contrato está em
// openspec/analise/backend-pendente.md. As tarefas nascem da composição do
// produto vendido, pelo mesmo cálculo da composição (SEG-1).

// Types
import type {
  TaskStep,
  TaskType,
  TaskView,
  TimeMode,
  TaskStatus,
  ReleaseRule,
  Collaborator,
  ManagerModel,
  ProductionFlow,
  ProductionTask,
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

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

/* ---------------------------------------------------------------------------
 * Configuração: fluxos, gerenciadores, colaboradores e tipos de tarefa
 * ------------------------------------------------------------------------- */

const flows: ProductionFlow[] = [{ id: 'flow-cv', name: 'Comunicação Visual' }]

const collaborators: Collaborator[] = [
  { id: 'col-marcos', name: 'Marcos', working: null },
  { id: 'col-natihely', name: 'Natihely', working: null },
  { id: 'col-pedro', name: 'Pedro', working: null },
  { id: 'col-ana', name: 'Ana', working: null },
]

const managers: ProductionManager[] = [
  {
    id: 'mgr-criacao',
    name: 'Criação',
    flowId: 'flow-cv',
    model: 'SIMPLE',
    timeMode: 'PLAY_STOP',
    users: [{ collaboratorId: 'col-natihely', onlyAssigned: false }],
    active: true,
  },
  {
    id: 'mgr-impressao',
    name: 'Impressão',
    flowId: 'flow-cv',
    model: 'SIMPLE',
    timeMode: 'PLAY_STOP',
    users: [
      { collaboratorId: 'col-marcos', onlyAssigned: false },
      { collaboratorId: 'col-pedro', onlyAssigned: true },
    ],
    active: true,
  },
  {
    id: 'mgr-producao',
    name: 'Produção',
    flowId: 'flow-cv',
    model: 'KANBAN',
    timeMode: 'DRAG_DROP',
    users: [
      { collaboratorId: 'col-marcos', onlyAssigned: false },
      { collaboratorId: 'col-ana', onlyAssigned: false },
    ],
    active: true,
  },
  {
    id: 'mgr-instalacao',
    name: 'Instalação',
    flowId: 'flow-cv',
    model: 'SIMPLE',
    timeMode: 'DRAG_DROP',
    users: [{ collaboratorId: 'col-pedro', onlyAssigned: false }],
    active: true,
  },
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
    color: '#7c3aed',
    release: 'WITH_BASE',
    timeControl: true,
    steps: [step('Arte', 'mgr-criacao'), step('Aprovação', 'mgr-criacao')],
    active: true,
  },
  {
    id: 'tt-impressao',
    name: 'Impressão',
    color: '#2563eb',
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
    color: '#059669',
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
    color: '#d97706',
    release: 'AFTER_BASE',
    timeControl: true,
    steps: [step('Acabamento', 'mgr-producao')],
    active: true,
  },
  {
    id: 'tt-instalacao',
    name: 'Instalação',
    color: '#dc2626',
    release: 'AFTER_BASE',
    timeControl: false,
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

// Uma tarefa por etapa da composição do item vendido (GP-16). O consumo e os
// campos vêm do mesmo cálculo da composição; o acabamento guarda a tarefa da
// base, que é o que a regra de liberação olha (GP-13)
const tasksFromComposition = async ({
  projectId,
  productId,
  itemName,
  measure,
}: {
  projectId: string
  productId: string
  itemName: string
  measure: AssemblyMeasure
}) => {
  const res = await getSaleComposition({ productId, measure })
  const report = res.data
  if (!report) return []
  const created: ProductionTask[] = []
  const byBlock = new Map<string, string>()

  report.blocks.forEach((block) => {
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
    const minutes = block.lines
      .filter((line) => line.unit === 'min' && line.quantity !== null)
      .reduce((sum, line) => sum + (line.quantity || 0), 0)
    const task: ProductionTask = {
      id: `tk-${uid()}`,
      code: code(),
      projectId,
      itemName,
      stageName: block.name,
      sector: block.sector,
      taskTypeId: type.id,
      stepIndex: 0,
      status: 'WAITING',
      estimatedMinutes: Math.round(minutes),
      actualMinutes: 0,
      baseTaskId,
      measureText: [
        `${block.measure.quantity} un`,
        block.measure.width && block.measure.height
          ? `${block.measure.width} × ${block.measure.height} m`
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
    }
    byBlock.set(block.id, task.id)
    created.push(task)
  })
  return created
}

// Ao liberar a produção, cada tarefa recebe a situação que a regra do tipo
// manda: a que espera a base fica aguardando, a que já nasce concluída fecha
const applyRelease = (projectId: string) => {
  const own = tasks.filter((task) => task.projectId === projectId)
  own.forEach((task) => {
    const type = taskTypes.find((item) => item.id === task.taskTypeId)!
    if (type.release === 'DONE') {
      task.status = 'DONE'
      return
    }
    const base = own.find((item) => item.id === task.baseTaskId)
    task.status =
      type.release === 'AFTER_BASE' && base && base.status !== 'DONE'
        ? 'WAITING'
        : 'PRODUCTION'
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
    items: { productId: string; name: string; measure: AssemblyMeasure }[]
  }[] = [
    {
      number: '1024-V1',
      client: 'Supermercado Bom Preço',
      status: 'PRODUCTION',
      due: 2,
      items: [
        {
          productId: 'placa-quadro',
          name: 'Placa em lona com quadro de ferro',
          measure: { quantity: 1, width: 2, height: 1 },
        },
        {
          productId: 'banner',
          name: 'Banner 440 com bastão',
          measure: { quantity: 3, width: 0.9, height: 1.2 },
        },
      ],
    },
    {
      number: '1025-V1',
      client: 'Clínica Sorriso',
      status: 'PRODUCTION',
      due: -1,
      items: [
        {
          productId: 'cartao',
          name: 'Cartão de visita',
          measure: { quantity: 1000, width: 0.05, height: 0.09 },
        },
      ],
    },
    {
      number: '1026-V1',
      client: 'Padaria Pão Quente',
      status: 'STANDBY',
      due: 5,
      items: [
        {
          productId: 'banner',
          name: 'Banner 440 com bastão',
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
      deliveryType: 'Cliente retira',
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
          measure: item.measure,
        })),
      )
    }
    if (project.status === 'PRODUCTION') applyRelease(project.id)
  }

  // Um pouco de movimento: a primeira tarefa agendada para hoje, com gente
  const first = tasks.find((task) => task.status === 'PRODUCTION')
  if (first) {
    first.schedule = { date: today(), start: '08:30', minutes: 60 }
    first.assigneeId = 'col-marcos'
  }
}

/* ---------------------------------------------------------------------------
 * Leitura
 * ------------------------------------------------------------------------- */

const viewOf = (task: ProductionTask): TaskView => {
  const project = projects.find((item) => item.id === task.projectId)!
  const taskType =
    taskTypes.find((item) => item.id === task.taskTypeId) || taskTypes[0]
  const current =
    taskType.steps[Math.min(task.stepIndex, taskType.steps.length - 1)]
  const base = tasks.find((item) => item.id === task.baseTaskId)
  return {
    ...task,
    project,
    taskType,
    step: current,
    managerId: current.managerId,
    waitingBase:
      task.status === 'WAITING' &&
      taskType.release === 'AFTER_BASE' &&
      !!base &&
      base.status !== 'DONE',
    assignee: collaborators.find((item) => item.id === task.assigneeId) || null,
    late:
      task.status !== 'DONE' &&
      task.status !== 'CANCELED' &&
      project.due < today(),
  }
}

export const getManagerConfig = async () =>
  ok({ flows, managers, taskTypes, collaborators })

// O cartão de cada gerenciador, com quantas tarefas abertas ele tem
export const getManagerSummary = async () => {
  await seed()
  return ok(
    managers
      .filter((manager) => manager.active)
      .map((manager) => ({
        ...manager,
        open: tasks
          .map(viewOf)
          .filter(
            (task) =>
              task.managerId === manager.id &&
              task.project.status === 'PRODUCTION' &&
              (task.status === 'PRODUCTION' || task.status === 'WAITING'),
          ).length,
      })),
  )
}

export const getManagerBoard = async ({ managerId }: { managerId: string }) => {
  await seed()
  const manager = managers.find((item) => item.id === managerId)
  if (!manager) return fail('Gerenciador não encontrado')
  return ok({
    manager,
    tasks: tasks
      .map(viewOf)
      .filter(
        (task) =>
          task.managerId === managerId &&
          task.project.status === 'PRODUCTION' &&
          task.status !== 'CANCELED',
      ),
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
    flowId: string
    model: ManagerModel
    timeMode: TimeMode
  }
}) => {
  if (!values.name.trim()) return fail('Informe o nome do gerenciador')
  const existing = managers.find((item) => item.id === id)
  if (existing) {
    Object.assign(existing, { ...values, name: values.name.trim() })
    return ok(existing.id)
  }
  const manager: ProductionManager = {
    id: `mgr-${uid()}`,
    ...values,
    name: values.name.trim(),
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

export const saveTaskType = async ({
  id,
  values,
}: {
  id?: string
  values: {
    name: string
    color: string
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
      color: values.color,
      release: values.release,
      timeControl: values.timeControl,
    })
    return ok(existing.id)
  }
  if (!values.managerId) return fail('Escolha o gerenciador da primeira etapa')
  const type: TaskType = {
    id: `tt-${uid()}`,
    name: values.name.trim(),
    color: values.color,
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

/* ---------------------------------------------------------------------------
 * Tarefas: situação, agenda, atribuição e relógio
 * ------------------------------------------------------------------------- */

// Concluir a última etapa conclui a tarefa e libera os acabamentos que
// esperavam por ela (GP-13); concluir uma etapa do meio passa para a próxima,
// que pode estar em outro gerenciador (GP-14)
export const advanceTask = async ({ id }: { id: string }) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  const view = viewOf(task)
  if (view.waitingBase) return fail('Esta tarefa espera a base terminar')
  if (task.status === 'DONE') return fail('A tarefa já está concluída')
  if (task.stepIndex < view.taskType.steps.length - 1) {
    task.stepIndex++
    task.status = 'PRODUCTION'
    task.schedule = null
    return ok(`Foi para ${view.taskType.steps[task.stepIndex].name}`)
  }
  task.status = 'DONE'
  collaborators.forEach((item) => {
    if (item.working?.taskId === id) item.working = null
  })
  tasks
    .filter((item) => item.baseTaskId === id && item.status === 'WAITING')
    .forEach((item) => (item.status = 'PRODUCTION'))
  return ok('Tarefa concluída')
}

export const setTaskStatus = async ({
  id,
  status,
  stepIndex,
}: {
  id: string
  status: TaskStatus
  stepIndex: number
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.status = status
  task.stepIndex = stepIndex
  return ok(null)
}

export const scheduleTask = async ({
  id,
  schedule,
}: {
  id: string
  schedule: { date: string; start: string; minutes: number } | null
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.schedule = schedule
  return ok(null)
}

export const assignTask = async ({
  id,
  collaboratorId,
}: {
  id: string
  collaboratorId: string | null
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  if (!task) return fail('Tarefa não encontrada')
  task.assigneeId = collaboratorId
  return ok(null)
}

// O relógio de trabalho (GP-3): o tempo realizado é medido, não digitado.
// No modelo coletivo, arrastar o colaborador para a tarefa faz o mesmo
export const startWork = async ({
  id,
  collaboratorId,
}: {
  id: string
  collaboratorId: string
}) => {
  await seed()
  const task = tasks.find((item) => item.id === id)
  const person = collaborators.find((item) => item.id === collaboratorId)
  if (!task || !person) return fail('Tarefa ou colaborador não encontrado')
  if (viewOf(task).waitingBase)
    return fail('Esta tarefa espera a base terminar')
  // Quem já estava em outra tarefa para aquela primeiro
  if (person.working) await stopWork({ collaboratorId })
  person.working = { taskId: id, since: new Date().toISOString() }
  task.assigneeId = task.assigneeId || collaboratorId
  if (task.status === 'WAITING') task.status = 'PRODUCTION'
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
    const minutes =
      (Date.now() - new Date(person.working.since).getTime()) / 60000
    task.actualMinutes = Math.round((task.actualMinutes + minutes) * 10) / 10
  }
  person.working = null
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Projetos: liberar, concluir, cancelar, alterar entrega (GP-8)
 * ------------------------------------------------------------------------- */

export const setProjectStatus = async ({
  id,
  status,
}: {
  id: string
  status: 'PRODUCTION' | 'DONE' | 'CANCELED'
}) => {
  await seed()
  const project = projects.find((item) => item.id === id)
  if (!project) return fail('Projeto não encontrado')
  const own = tasks.filter((task) => task.projectId === id)
  if (
    status === 'DONE' &&
    own.some((task) => task.status !== 'DONE' && task.status !== 'CANCELED')
  ) {
    return fail('Ainda há tarefas abertas neste projeto')
  }
  const wasStandby = project.status === 'STANDBY'
  project.status = status
  if (status === 'PRODUCTION' && wasStandby) applyRelease(id)
  if (status === 'CANCELED') own.forEach((task) => (task.status = 'CANCELED'))
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

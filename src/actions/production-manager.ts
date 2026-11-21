'use server'

// O gerenciador de produção do ELITE (módulo 3, Fase 6) pela API
// (/production). Quem age é sempre o usuário da sessão: o servidor grava o
// nome dele no histórico e decide quem é gerente e o que cada um vê (GP-11).
// As telas recebem o setor pelo nome (a cor sai do hook useSectorColor) e o
// anexo com o link assinado de 15 minutos (GP-27). O arquivo do anexo vai do
// navegador direto para a API (src/lib/production-upload.ts): a server action
// e a Vercel não passam 20 MB.

// Types
import type {
  Vehicle,
  TaskType,
  TaskView,
  TimeMode,
  TaskAction,
  ReleaseRule,
  Collaborator,
  ProductionFlow,
  CollaboratorRole,
  ProductionManager,
  ProductionProject,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

// Actions
import {
  getItem,
  putItemNew,
  createItemNew,
  deleteItemNew,
  updateItemNew,
} from '@/actions/_cruds'

// Utils
import { normalizeSectorName } from '@/lib/sector-color'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

// O formato da resposta da API, antes de virar o tipo da tela
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false,
  data,
  message: message || 'Não foi possível concluir.',
})

/** A mensagem da API vira o texto do aviso (o diálogo mostra `data`). */
const done = (res: ApiResult, fallback: string) =>
  res.success
    ? ok<string>(res.data?.message || fallback)
    : fail(res.message, null as string | null)

/* ---------------------------------------------------------------------------
 * Da API para os tipos da tela
 * ------------------------------------------------------------------------- */

const sectorName = (sector: Raw) =>
  typeof sector === 'string' ? sector : sector?.name || ''

const toManager = (row: Raw): ProductionManager & { sectorId: string } => ({
  id: row.id,
  name: row.name,
  sector: sectorName(row.sector),
  sectorId: row.sector?.id || '',
  flowId: row.flowId || '',
  timeMode: row.timeMode,
  intervalMinutes: row.intervalMinutes ?? 0,
  users: row.users || [],
  active: row.active ?? true,
})

const toCollaborator = (row: Raw): Collaborator => ({
  id: row.id,
  name: row.name || '',
  email: row.email ?? null,
  role: row.role || 'OPERATOR',
  working: row.working ?? null,
})

const toVehicle = (row: Raw): Vehicle => ({
  id: row.id,
  name: row.name,
  plate: row.plate || '',
  active: row.active ?? true,
})

const toTask = (row: Raw): TaskView => {
  const taskType: TaskType = row.taskType || {
    id: row.taskTypeId,
    name: '',
    release: 'AFTER_BASE',
    timeControl: true,
    steps: [],
    active: true,
  }
  return {
    ...row,
    sector: sectorName(row.sector),
    sectorId: row.sector?.id ?? null,
    taskType,
    step: row.step || {
      id: '',
      name: row.stageName,
      managerId: row.managerId || '',
    },
    assignee: row.assignee ? toCollaborator(row.assignee) : null,
    workers: (row.workers || []).map(toCollaborator),
    attachments: (row.attachments || []).map((attachment: Raw) => ({
      ...attachment,
      versions: (attachment.versions || []).map((version: Raw) => ({
        ...version,
        url: version.url ?? null,
        // A prévia da imagem usa o próprio link assinado
        dataUrl: version.mime?.startsWith('image/') ? version.url : null,
      })),
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Leitura
 * ------------------------------------------------------------------------- */

/** O expediente (§4.8): dias (0 = domingo), horário e feriados. */
export type ProductionCalendar = {
  workDays: number[]
  startTime: string
  endTime: string
  holidays: string[]
}

const DEFAULT_CALENDAR: ProductionCalendar = {
  workDays: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '18:00',
  holidays: [],
}

export const getManagerConfig = async () => {
  const res: ApiResult = await getItem({ route: '/production/config' })
  const empty = {
    calendar: DEFAULT_CALENDAR,
    flows: [] as ProductionFlow[],
    managers: [] as (ProductionManager & { sectorId: string })[],
    taskTypes: [] as TaskType[],
    collaborators: [] as Collaborator[],
    vehicles: [] as Vehicle[],
  }
  if (!res.success) return fail(res.message, empty)
  return ok<typeof empty>({
    flows: res.data.flows || [],
    managers: (res.data.managers || []).map(toManager),
    taskTypes: res.data.taskTypes || [],
    collaborators: (res.data.collaborators || []).map(toCollaborator),
    vehicles: (res.data.vehicles || []).map(toVehicle),
    calendar: res.data.calendar || DEFAULT_CALENDAR,
  })
}

/** As abas do gerenciador, com as abertas e os alertas. */
export const getManagerSummary = async () => {
  const res: ApiResult = await getItem({ route: '/production/manager' })
  if (!res.success) {
    return fail(
      res.message,
      [] as (ProductionManager & { open: number; alerts: number })[],
    )
  }
  return ok(
    (res.data || []).map((row: Raw) => ({
      ...toManager(row),
      open: row.open ?? 0,
      alerts: row.alerts ?? 0,
    })) as (ProductionManager & { open: number; alerts: number })[],
  )
}

/** Quem é o usuário da sessão na produção (GP-11), pelo servidor. */
export const getViewer = async () => {
  const res: ApiResult = await getItem({ route: '/production/viewer' })
  const none = {
    collaboratorId: null as string | null,
    name: null as string | null,
    manager: false,
    timeEditor: false,
    productivity: false,
  }
  if (!res.success) return fail(res.message, none)
  return ok<typeof none>({ ...none, ...res.data })
}

export const getManagerBoard = async ({ managerId }: { managerId: string }) => {
  const res: ApiResult = await getItem({
    route: `/production/manager/${managerId}/board`,
  })
  if (!res.success) return fail(res.message, null)
  return ok({
    manager: toManager(res.data.manager),
    viewer: res.data.viewer as {
      collaboratorId: string | null
      name: string
      manager: boolean
    },
    tasks: (res.data.tasks || []).map(toTask) as TaskView[],
    hidden: res.data.hidden ?? 0,
    collaborators: (res.data.collaborators || []).map((row: Raw) => ({
      ...toCollaborator(row),
      onlyAssigned: !!row.onlyAssigned,
    })) as (Collaborator & { onlyAssigned: boolean })[],
    taskTypes: (res.data.taskTypes || []) as TaskType[],
    vehicles: (res.data.vehicles || []).map(toVehicle) as Vehicle[],
  })
}

/** A agenda viva e a ocupação dos veículos, num período de até 92 dias. */
export const getAgenda = async ({ from, to }: { from: string; to: string }) => {
  const res: ApiResult = await getItem({
    route: '/production/agenda',
    params: { from, to },
  })
  const empty = {
    scheduled: [] as (TaskView & { occupies?: number; conflict?: boolean })[],
    unscheduled: [] as TaskView[],
    vehicles: [] as Vehicle[],
    managers: [] as ProductionManager[],
    vehicleUsage: [] as {
      vehicleId: string
      date: string
      km: number
      tasks: string[]
      conflict: boolean
    }[],
  }
  if (!res.success) return fail(res.message, empty)
  return ok<typeof empty>({
    scheduled: (res.data.scheduled || []).map((row: Raw) => ({
      ...toTask(row),
      occupies: row.occupies,
      conflict: !!row.conflict,
    })),
    unscheduled: (res.data.unscheduled || []).map(toTask),
    vehicles: (res.data.vehicles || []).map(toVehicle),
    managers: (res.data.managers || []).map(toManager),
    vehicleUsage: res.data.vehicleUsage || [],
  })
}

export type ProjectRow = ProductionProject & {
  quotationId: string
  total: number
  done: number
  alerts: number
  risk: boolean
  late: boolean
}

/** Os projetos de uma situação, paginados no servidor. */
export const getProjects = async ({
  status,
  search,
  page,
}: {
  status: ProductionProject['status']
  search?: string
  page?: number
}) => {
  const res: ApiResult = await getItem({
    route: '/production/project',
    params: {
      status,
      page: String(page || 1),
      limit: '20',
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
  })
  const empty = { data: [] as ProjectRow[], page: 1, lastPage: 1, total: 0 }
  if (!res.success) return fail(res.message, empty)
  return ok<typeof empty>({
    data: (res.data.data || []) as ProjectRow[],
    page: res.data.page ?? 1,
    lastPage: res.data.lastPage ?? 1,
    total: res.data.total ?? 0,
  })
}

/** Quantos projetos em cada situação (as abas). */
export const getProjectQuantity = async () => {
  const res: ApiResult = await getItem({
    route: '/production/project/quantity',
  })
  const empty = { STANDBY: 0, PRODUCTION: 0, DONE: 0, CANCELED: 0 }
  if (!res.success) return fail(res.message, empty)
  return ok<typeof empty>({ ...empty, ...res.data })
}

export const getProject = async ({ id }: { id: string }) => {
  const res: ApiResult = await getItem({ route: `/production/project/${id}` })
  if (!res.success) return fail(res.message, null)
  return ok({
    project: res.data.project as ProductionProject & { quotationId: string },
    late: !!res.data.late,
    risk: !!res.data.risk,
    tasks: (res.data.tasks || []).map(toTask) as TaskView[],
    hidden: res.data.hidden ?? 0,
    history: (res.data.history || []) as {
      id: string
      at: string
      by: string
      text: string
    }[],
  })
}

/* ---------------------------------------------------------------------------
 * Configuração: gravação
 * ------------------------------------------------------------------------- */

/** O id do setor pelo nome que o diálogo escolhe. */
const sectorIdOf = async (name: string) => {
  const res: ApiResult = await getItem({
    route: '/sector',
    params: { page: '1', limit: '100' },
  })
  const key = normalizeSectorName(name)
  const sector = (res.data?.data || []).find(
    (row: Raw) => normalizeSectorName(row.name || '') === key,
  )
  return sector?.id as string | undefined
}

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
  const sectorId = values.sector ? await sectorIdOf(values.sector) : undefined
  const data = {
    name: values.name,
    sectorId,
    flowId: values.flowId || undefined,
    timeMode: values.timeMode,
    intervalMinutes: Math.max(0, Math.round(values.intervalMinutes || 0)),
  }
  const res: ApiResult = id
    ? await putItemNew({ route: `/production/manager/${id}`, data })
    : await createItemNew({ route: '/production/manager', data })
  if (!res.success) return fail(res.message, null as string | null)
  return ok<string | null>(res.data?.id ?? id ?? null)
}

// Inativar pede destino para as etapas: nenhuma tarefa fica sem lugar (GP-15)
export const inactivateManager = async ({
  id,
  destinationId,
}: {
  id: string
  destinationId: string
}) => {
  const res: ApiResult = await createItemNew({
    route: `/production/manager/${id}/inactivate`,
    data: { destinationId },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

export const reactivateManager = async ({ id }: { id: string }) => {
  const res: ApiResult = await createItemNew({
    route: `/production/manager/${id}/reactivate`,
  })
  return res.success ? ok(null) : fail(res.message, null)
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
  const res: ApiResult = await putItemNew({
    route: `/production/manager/${managerId}/user/${collaboratorId}`,
    data: { access },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// O perfil do colaborador na produção (GP-11): operador ou gerente
export const setCollaboratorRole = async ({
  collaboratorId,
  role,
}: {
  collaboratorId: string
  role: CollaboratorRole
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/production/collaborator/${collaboratorId}`,
    data: { role },
  })
  return res.success ? ok(null) : fail(res.message, null)
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
  const data = {
    name: values.name,
    release: values.release,
    timeControl: values.timeControl,
    ...(id ? {} : { managerId: values.managerId }),
  }
  const res: ApiResult = id
    ? await putItemNew({ route: `/production/task-type/${id}`, data })
    : await createItemNew({ route: '/production/task-type', data })
  if (!res.success) return fail(res.message, null as string | null)
  return ok<string | null>(res.data?.id ?? id ?? null)
}

export const setTaskTypeActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/production/task-type/${id}/toggle-status`,
    data: { active },
  })
  return res.success ? ok(null) : fail(res.message, null)
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
  const data = { name, managerId }
  const res: ApiResult = stepId
    ? await updateItemNew({
        route: `/production/task-type/${typeId}/step/${stepId}`,
        data,
      })
    : await createItemNew({
        route: `/production/task-type/${typeId}/step`,
        data,
      })
  return res.success ? ok(null) : fail(res.message, null)
}

export const removeTaskStep = async ({
  typeId,
  stepId,
}: {
  typeId: string
  stepId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/production/task-type/${typeId}/step/${stepId}`,
  })
  return res.success ? ok(null) : fail(res.message, null)
}

/** Sobe ou desce uma etapa: a API grava a sequência inteira. */
export const moveTaskStep = async ({
  typeId,
  stepId,
  direction,
}: {
  typeId: string
  stepId: string
  direction: 'UP' | 'DOWN'
}) => {
  const config = await getManagerConfig()
  const type = config.data.taskTypes.find((item) => item.id === typeId)
  if (!type) return fail('Tipo de tarefa não encontrado', null)
  const ids = type.steps.map((step) => step.id)
  const index = ids.indexOf(stepId)
  const target = direction === 'UP' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= ids.length) return ok(null)
  const [moved] = ids.splice(index, 1)
  ids.splice(target, 0, moved)
  const res: ApiResult = await putItemNew({
    route: `/production/task-type/${typeId}/step-order`,
    data: { stepIds: ids },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// O expediente da produção: a cadeia de alertas conta só esse tempo
export const saveCalendar = async (values: ProductionCalendar) => {
  const res: ApiResult = await putItemNew({
    route: '/production/calendar',
    data: values,
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// Frota (VS-7): os veículos cadastrados
export const saveVehicle = async ({
  id,
  values,
}: {
  id?: string
  values: { name: string; plate: string }
}) => {
  const res: ApiResult = id
    ? await putItemNew({ route: `/production/vehicle/${id}`, data: values })
    : await createItemNew({ route: '/production/vehicle', data: values })
  if (!res.success) return fail(res.message, null as string | null)
  return ok<string | null>(res.data?.id ?? id ?? null)
}

export const setVehicleActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/production/vehicle/${id}/toggle-status`,
    data: { active },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

/* ---------------------------------------------------------------------------
 * Tarefas: os seis estados (GP-28), relógio, correção e anexos
 * ------------------------------------------------------------------------- */

export const actOnTask = async ({
  id,
  action,
  collaboratorId,
}: {
  id: string
  action: TaskAction
  collaboratorId?: string | null
}) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/action`,
      data: { action, ...(collaboratorId ? { collaboratorId } : {}) },
    }),
    'Tarefa atualizada',
  )

// Pendência: um impedimento descrito em texto (GP-28); os relógios param
export const addPendency = async ({ id, text }: { id: string; text: string }) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/pendency`,
      data: { text },
    }),
    'Pendência registrada',
  )

// O comentário da equipe, no histórico da tarefa (VS-5; GP-47, item 3)
export const addComment = async ({ id, text }: { id: string; text: string }) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/comment`,
      data: { text },
    }),
    'Comentário registrado',
  )

// Urgente sobe na fila do setor (GP-47, item 4)
export const setTaskPriority = async ({
  id,
  priority,
}: {
  id: string
  priority: 'NORMAL' | 'URGENT'
}) =>
  done(
    await updateItemNew({
      route: `/production/task/${id}`,
      data: { priority },
    }),
    priority === 'URGENT' ? 'Marcada como urgente' : 'Urgência retirada',
  )

// Liberar a próxima etapa antes de concluir esta (FL-13, GP-37)
export const releaseNext = async ({
  id,
  quantity,
}: {
  id: string
  quantity?: number | null
}) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/release-next`,
      data: quantity ? { quantity } : {},
    }),
    'Próxima etapa liberada',
  )

export const scheduleTask = async ({
  id,
  schedule,
}: {
  id: string
  schedule: { date: string; start: string; minutes: number } | null
}) =>
  done(
    await putItemNew({
      route: `/production/task/${id}/schedule`,
      data: { schedule },
    }),
    schedule ? 'Agendada' : 'Tirou da agenda',
  )

export const assignTask = async ({
  id,
  collaboratorId,
}: {
  id: string
  collaboratorId: string | null
}) =>
  done(
    await updateItemNew({
      route: `/production/task/${id}`,
      data: { assigneeId: collaboratorId },
    }),
    'Atribuição salva',
  )

// Veículo e km (VS-7)
export const setTaskVehicle = async ({
  id,
  vehicleId,
  km,
}: {
  id: string
  vehicleId: string | null
  km: number | null
}) =>
  done(
    await updateItemNew({
      route: `/production/task/${id}`,
      data: { vehicleId, ...(vehicleId ? { km } : {}) },
    }),
    'Veículo salvo',
  )

// O relógio por pessoa (GP-43); no coletivo, arrastar faz o mesmo
export const startWork = async ({
  id,
  collaboratorId,
  source = 'CLOCK',
}: {
  id: string
  collaboratorId: string
  source?: 'CLOCK' | 'DRAG'
}) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/work/start`,
      data: { collaboratorId, source },
    }),
    'Colaborador na tarefa: o relógio começou',
  )

/** Para o relógio; sem a tarefa, procura onde a pessoa está trabalhando. */
export const stopWork = async ({
  id,
  collaboratorId,
}: {
  id?: string | null
  collaboratorId: string
}) => {
  let taskId = id || null
  if (!taskId) {
    const config = await getManagerConfig()
    taskId =
      config.data.collaborators.find((person) => person.id === collaboratorId)
        ?.working?.taskId || null
  }
  if (!taskId) return ok<string>('Relógio parado')
  return done(
    await createItemNew({
      route: `/production/task/${taskId}/work/stop`,
      data: { collaboratorId },
    }),
    'Relógio parado',
  )
}

// O gerente corrige o tempo ou a pessoa de um apontamento (GP-44)
export const correctTimeEntry = async ({
  id,
  entryId,
  minutes,
  collaboratorId,
  note,
}: {
  id: string
  entryId: string
  minutes: number
  collaboratorId: string
  note: string
}) =>
  done(
    await putItemNew({
      route: `/production/task/${id}/time-entry/${entryId}`,
      data: { minutes, collaboratorId, note },
    }),
    'Apontamento corrigido',
  )

// Lançar um tempo à mão (quem esqueceu de ligar o relógio)
export const addTimeEntry = async ({
  id,
  collaboratorId,
  minutes,
  note,
}: {
  id: string
  collaboratorId: string
  minutes: number
  note: string
}) =>
  done(
    await createItemNew({
      route: `/production/task/${id}/time-entry`,
      data: { minutes, collaboratorId, note },
    }),
    'Tempo lançado',
  )

/**
 * O endereço da API para o envio do anexo pelo navegador: o arquivo de até
 * 20 MB não passa pela server action nem pela Vercel.
 */
export const productionUploadBase = async () =>
  ok<string>((process.env.API_URL || '').replace(/\/$/, ''))

// Qual versão vale (GP-26)
export const setCurrentVersion = async ({
  id,
  attachmentId,
  version,
}: {
  id: string
  attachmentId: string
  version: number
}) => {
  const res: ApiResult = await putItemNew({
    route: `/production/task/${id}/attachment/${attachmentId}/current`,
    data: { version },
  })
  return res.success
    ? ok<string>(`Versão ${version} marcada como a válida`)
    : fail(res.message, null as string | null)
}

// Apagar libera o espaço dos arquivos de produção (GP-48 item 27): o anexo
// inteiro ou uma versão; apagar a única versão apaga o anexo
export const deleteAttachment = async ({
  id,
  attachmentId,
  version,
}: {
  id: string
  attachmentId: string
  version?: number
}) => {
  const res: ApiResult = await deleteItemNew({
    route:
      version === undefined
        ? `/production/task/${id}/attachment/${attachmentId}`
        : `/production/task/${id}/attachment/${attachmentId}/version/${version}`,
  })
  return res.success
    ? ok<string>(
        version === undefined ? 'Anexo apagado' : `Versão ${version} apagada`,
      )
    : fail(res.message, null as string | null)
}

/* ---------------------------------------------------------------------------
 * Projetos: liberar, concluir, cancelar, alterar entrega (GP-8)
 * ------------------------------------------------------------------------- */

const PROJECT_ROUTE = {
  PRODUCTION: 'release',
  DONE: 'finish',
  CANCELED: 'cancel',
} as const

const PROJECT_MESSAGE = {
  PRODUCTION: 'Produção liberada',
  DONE: 'Projeto concluído',
  CANCELED: 'Projeto cancelado',
} as const

export const setProjectStatus = async ({
  id,
  status,
}: {
  id: string
  status: 'PRODUCTION' | 'DONE' | 'CANCELED'
}) => {
  const res: ApiResult = await createItemNew({
    route: `/production/project/${id}/${PROJECT_ROUTE[status]}`,
  })
  return res.success
    ? ok<string>(
        status === 'PRODUCTION' && res.data?.autoDone
          ? `${PROJECT_MESSAGE[status]}: ${res.data.autoDone} tarefa(s) já concluída(s) pela regra do tipo`
          : PROJECT_MESSAGE[status],
      )
    : fail(res.message, null as string | null)
}

export const changeDelivery = async ({
  id,
  due,
}: {
  id: string
  due: string
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/production/project/${id}/delivery`,
    data: { due },
  })
  // A Agenda de entrega vai junto (decisão de 15/10/2026)
  return res.success
    ? ok<string>(
        res.data?.scheduleMoved
          ? 'Entrega alterada, também na Agenda de entrega'
          : 'Entrega alterada',
      )
    : fail(res.message, null as string | null)
}

/* ---------------------------------------------------------------------------
 * Produtividade pelo tempo vendido (GP-30, GP-32, GP-34): por pessoa só
 * para quem tem a permissão, decidido pelo servidor (PCP-3)
 * ------------------------------------------------------------------------- */

export type ProductivityRow = {
  sector: string
  sectorId: string | null
  tasks: number
  sold: number
  worked: number
  productivity: number | null
}

export type ProductivityPerson = {
  collaboratorId: string
  name: string
  tasks: number
  sold: number
  worked: number
  productivity: number | null
}

export const getProductivity = async (
  period: { from?: string; to?: string } = {},
) => {
  const res: ApiResult = await getItem({
    route: '/production/productivity',
    params: period.from && period.to ? period : undefined,
  })
  const empty = {
    bySector: [] as ProductivityRow[],
    // Nulo: sem a permissão, o servidor não manda
    people: null as ProductivityPerson[] | null,
    unsold: { minutes: 0 },
  }
  if (!res.success) return fail(res.message, empty)
  return ok<typeof empty>({
    bySector: (res.data.bySector || []).map((row: Raw) => ({
      ...row,
      sector: sectorName(row.sector),
      sectorId: row.sector?.id ?? null,
    })) as ProductivityRow[],
    people: Array.isArray(res.data.people)
      ? (res.data.people as ProductivityPerson[])
      : null,
    unsold: res.data.unsold || { minutes: 0 },
  })
}

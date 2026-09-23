'use server'

// PROVISÓRIO: a API ainda não tem os endpoints do gerenciador de produção
// (recurso do ELITE). Dados de exemplo em memória.

// Types
import type {
  StageStatus,
  SectorCapacity,
  ProductionStage,
} from '@/app/(app-sidebar)/producao/gerenciador/types'

const stages: ProductionStage[] = [
  {
    id: 's1',
    orderNumber: '#1042',
    client: 'Padaria Central',
    product: 'Banner 440 com bastão',
    stageName: 'Criação',
    sector: 'Criação',
    status: 'DONE',
    plannedMinutes: 60,
    actualMinutes: 75,
    assignee: 'Allan',
    dueDate: '2026-09-23',
    dependsOn: [],
    releasedEarly: false,
  },
  {
    id: 's2',
    orderNumber: '#1042',
    client: 'Padaria Central',
    product: 'Banner 440 com bastão',
    stageName: 'Impressão em lona',
    sector: 'Impressão',
    status: 'IN_PROGRESS',
    plannedMinutes: 25,
    actualMinutes: 18,
    assignee: 'João',
    dueDate: '2026-09-23',
    dependsOn: ['s1'],
    releasedEarly: false,
  },
  {
    id: 's3',
    orderNumber: '#1042',
    client: 'Padaria Central',
    product: 'Banner 440 com bastão',
    stageName: 'Acabamento de banner',
    sector: 'Produção',
    status: 'READY',
    plannedMinutes: 45,
    actualMinutes: null,
    assignee: null,
    dueDate: '2026-09-24',
    dependsOn: ['s2'],
    releasedEarly: true,
  },
  {
    id: 's4',
    orderNumber: '#1043',
    client: 'Auto Peças Silva',
    product: 'Placa PVC 3 mm',
    stageName: 'Corte e acabamento',
    sector: 'Marcenaria',
    status: 'BLOCKED',
    plannedMinutes: 90,
    actualMinutes: null,
    assignee: null,
    dueDate: '2026-09-23',
    dependsOn: ['s5'],
    releasedEarly: false,
  },
  {
    id: 's5',
    orderNumber: '#1043',
    client: 'Auto Peças Silva',
    product: 'Placa PVC 3 mm',
    stageName: 'Criação',
    sector: 'Criação',
    status: 'IN_PROGRESS',
    plannedMinutes: 40,
    actualMinutes: 65,
    assignee: 'Allan',
    dueDate: '2026-09-22',
    dependsOn: [],
    releasedEarly: false,
  },
  {
    id: 's6',
    orderNumber: '#1044',
    client: 'Studio Fit',
    product: 'Adesivo recortado',
    stageName: 'Impressão',
    sector: 'Impressão',
    status: 'READY',
    plannedMinutes: 30,
    actualMinutes: null,
    assignee: null,
    dueDate: '2026-09-25',
    dependsOn: [],
    releasedEarly: false,
  },
  {
    id: 's7',
    orderNumber: '#1044',
    client: 'Studio Fit',
    product: 'Adesivo recortado',
    stageName: 'Instalação em obra',
    sector: 'Instalação',
    status: 'BLOCKED',
    plannedMinutes: 120,
    actualMinutes: null,
    assignee: null,
    dueDate: '2026-09-26',
    dependsOn: ['s6'],
    releasedEarly: false,
  },
]

const capacities: SectorCapacity[] = [
  { sector: 'Criação', dailyHours: 8, plannedHours: 0 },
  { sector: 'Impressão', dailyHours: 8, plannedHours: 0 },
  { sector: 'Produção', dailyHours: 16, plannedHours: 0 },
  { sector: 'Marcenaria', dailyHours: 8, plannedHours: 0 },
  { sector: 'Instalação', dailyHours: 8, plannedHours: 0 },
]

export const getProductionStages = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const sector = filters?.sector

  const data = stages.filter((stage) => !sector || stage.sector === sector)

  return { success: true, data, message: '' }
}

export const getSectorCapacities = async () => {
  const data = capacities.map((capacity) => ({
    ...capacity,
    plannedHours:
      Math.round(
        (stages
          .filter(
            (stage) =>
              stage.sector === capacity.sector && stage.status !== 'DONE',
          )
          .reduce((sum, stage) => sum + stage.plannedMinutes, 0) /
          60) *
          10,
      ) / 10,
  }))

  return { success: true, data, message: '' }
}

// Mover a etapa respeita as dependências: uma etapa bloqueada só começa quando
// a anterior termina ou é liberada antecipadamente (§12.1 e §12.3)
export const moveStage = async ({
  id,
  status,
}: {
  id: string
  status: StageStatus
}) => {
  const stage = stages.find((item) => item.id === id)

  if (!stage) {
    return { success: false, data: null, message: 'Etapa não encontrada' }
  }

  const blocking = stage.dependsOn
    .map((dependency) => stages.find((item) => item.id === dependency))
    .filter(
      (dependency) =>
        dependency && dependency.status !== 'DONE' && !dependency.releasedEarly,
    )

  if (blocking.length && status !== 'BLOCKED') {
    return {
      success: false,
      data: null,
      message: `Depende de "${blocking[0]?.stageName}", que ainda não terminou.`,
    }
  }

  stage.status = status

  // Concluir a etapa libera as que dependiam dela
  if (status === 'DONE') {
    stages
      .filter((item) => item.dependsOn.includes(stage.id))
      .forEach((item) => {
        if (item.status === 'BLOCKED') item.status = 'READY'
      })
  }

  return { success: true, data: stage, message: '' }
}

// Liberação antecipada: desbloqueia a próxima etapa antes do fim da atual
export const releaseStageEarly = async ({ id }: { id: string }) => {
  const stage = stages.find((item) => item.id === id)

  if (!stage) {
    return { success: false, data: null, message: 'Etapa não encontrada' }
  }

  stage.releasedEarly = true

  stages
    .filter((item) => item.dependsOn.includes(stage.id))
    .forEach((item) => {
      if (item.status === 'BLOCKED') item.status = 'READY'
    })

  return { success: true, data: stage, message: '' }
}

export const setStageAssignee = async ({
  id,
  assignee,
}: {
  id: string
  assignee: string
}) => {
  const stage = stages.find((item) => item.id === id)

  if (!stage) {
    return { success: false, data: null, message: 'Etapa não encontrada' }
  }

  stage.assignee = assignee

  return { success: true, data: stage, message: '' }
}

// Produtividade: previsto × realizado por setor e por colaborador (§12.4)
export const getProductivity = async () => {
  const bySector = Array.from(new Set(stages.map((stage) => stage.sector))).map(
    (sector) => {
      const done = stages.filter(
        (stage) => stage.sector === sector && stage.actualMinutes !== null,
      )

      const planned = done.reduce((sum, stage) => sum + stage.plannedMinutes, 0)
      const actual = done.reduce(
        (sum, stage) => sum + (stage.actualMinutes || 0),
        0,
      )

      return {
        sector,
        stages: done.length,
        planned,
        actual,
        efficiency: actual ? Math.round((planned / actual) * 1000) / 10 : null,
      }
    },
  )

  const people = Array.from(
    new Set(
      stages
        .filter((stage) => stage.assignee && stage.actualMinutes !== null)
        .map((stage) => stage.assignee as string),
    ),
  ).map((assignee) => {
    const done = stages.filter(
      (stage) => stage.assignee === assignee && stage.actualMinutes !== null,
    )

    const planned = done.reduce((sum, stage) => sum + stage.plannedMinutes, 0)
    const actual = done.reduce(
      (sum, stage) => sum + (stage.actualMinutes || 0),
      0,
    )

    return {
      assignee,
      stages: done.length,
      planned,
      actual,
      efficiency: actual ? Math.round((planned / actual) * 1000) / 10 : null,
    }
  })

  return { success: true, data: { bySector, people }, message: '' }
}

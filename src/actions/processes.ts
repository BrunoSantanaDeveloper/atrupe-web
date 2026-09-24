'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da composição (recurso do PRO).
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  Process,
  ProcessResource,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

const processes: Process[] = [
  {
    id: 'impressao-lona',
    name: 'Impressão em lona',
    sector: 'Impressão',
    setupMinutes: 10,
    sectorHourCost: 2890,
    dimensionRule: 'FREE_SIZE',
    multipliesParent: true,
    extraFields: [],
    resources: [
      {
        id: 'r1',
        kind: 'MACHINE',
        name: 'Impressora Solvente · 4 passes',
        origin: 'Patrimônio',
        unit: 'm²',
        unitCost: 289,
        formula: 'PER_AREA',
        quantity: 1,
        extraFieldId: null,
      },
      {
        id: 'r2',
        kind: 'MATERIAL',
        name: 'Lona 440 · Marca X · Branca',
        origin: 'Material',
        unit: 'm²',
        unitCost: 1250,
        formula: 'PER_AREA',
        quantity: 1,
        extraFieldId: null,
      },
    ],
    active: true,
  },
  {
    id: 'acabamento-banner',
    name: 'Acabamento de banner',
    sector: 'Produção',
    setupMinutes: 10,
    sectorHourCost: 1649,
    dimensionRule: 'SAME_AS_PARENT',
    multipliesParent: true,
    extraFields: [{ id: 'e1', name: 'Ilhoses por metro', defaultValue: 2 }],
    resources: [
      {
        id: 'r3',
        kind: 'MATERIAL',
        name: 'Ilhós',
        origin: 'Material',
        unit: 'un',
        unitCost: 12,
        formula: 'PER_EXTRA',
        quantity: 1,
        extraFieldId: 'e1',
      },
      {
        id: 'r4',
        kind: 'LABOR',
        name: 'Produção',
        origin: 'Setor',
        unit: 'h',
        unitCost: 1649,
        formula: 'PER_TIME',
        quantity: 0.25,
        extraFieldId: null,
      },
    ],
    active: true,
  },
  {
    id: 'instalacao',
    name: 'Instalação em obra',
    sector: 'Instalação',
    setupMinutes: 0,
    sectorHourCost: 2100,
    dimensionRule: 'NONE',
    multipliesParent: false,
    extraFields: [],
    resources: [
      {
        id: 'r5',
        kind: 'OUTSOURCED',
        name: 'Instalador terceirizado',
        origin: 'Terceirizado',
        unit: 'un',
        unitCost: 18000,
        formula: 'FIXED',
        quantity: 1,
        extraFieldId: null,
      },
    ],
    active: true,
  },
]

export const getProcesses = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()

  const data = processes
    .filter((process) => process.active)
    .filter((process) => !filters?.sector || process.sector === filters.sector)
    .filter((process) => !search || process.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const getProcess = async ({ id }: { id: string }) => {
  const process = processes.find((item) => item.id === id)

  if (!process) {
    return { success: false, data: null, message: 'Processo não encontrado' }
  }

  return { success: true, data: process, message: '' }
}

// Custo-hora de referência por setor, até a Base de custos entregar o valor
const sectorHourCosts: { [key: string]: number } = {
  Impressão: 2890,
  Produção: 1649,
  Criação: 2210,
  CNC: 3120,
  Marcenaria: 1820,
  Instalação: 2100,
  Gráfica: 1740,
}

export const createProcess = async ({
  name,
  sector,
  dimensionRule,
  setupMinutes,
}: Pick<Process, 'name' | 'sector' | 'dimensionRule'> & {
  setupMinutes?: number
}) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome do processo' }
  }

  const process: Process = {
    id: `process-${processes.length + 1}`,
    name,
    sector,
    // Tempo padrão de preparo: quem não tem preparo informa zero (CP-15)
    setupMinutes: setupMinutes ?? 10,
    sectorHourCost: sectorHourCosts[sector] ?? null,
    dimensionRule,
    multipliesParent: true,
    extraFields: [],
    resources: [],
    active: true,
  }

  processes.push(process)

  return { success: true, data: process, message: '' }
}

export const updateProcess = async ({
  id,
  ...values
}: Partial<Process> & { id: string }) => {
  const process = processes.find((item) => item.id === id)

  if (!process) {
    return { success: false, data: null, message: 'Processo não encontrado' }
  }

  if (values.name !== undefined && !values.name.trim()) {
    return { success: false, data: null, message: 'Informe o nome do processo' }
  }

  Object.assign(process, values)

  if (values.sector) {
    process.sectorHourCost = sectorHourCosts[values.sector] ?? null
  }

  return { success: true, data: process, message: '' }
}

export const addProcessResource = async ({
  processId,
  resource,
}: {
  processId: string
  resource: Omit<ProcessResource, 'id'>
}) => {
  const process = processes.find((item) => item.id === processId)

  if (!process) {
    return { success: false, data: null, message: 'Processo não encontrado' }
  }

  process.resources.push({ ...resource, id: `resource-${Date.now()}` })

  return { success: true, data: process, message: '' }
}

export const removeProcessResource = async ({
  processId,
  resourceId,
}: {
  processId: string
  resourceId: string
}) => {
  const process = processes.find((item) => item.id === processId)

  if (!process) {
    return { success: false, data: null, message: 'Processo não encontrado' }
  }

  process.resources = process.resources.filter(
    (resource) => resource.id !== resourceId,
  )

  return { success: true, data: process, message: '' }
}

// Recursos disponíveis para compor: só patrimônio detalhado entra na lista de
// máquinas (P-16), e o material entra pela variação (MT-5).
export const getAvailableResources = async () => ({
  success: true,
  data: {
    MACHINE: [
      {
        id: 'sub-standart',
        name: 'Impressora Sublimática · Standart',
        origin: 'Patrimônio',
        unit: 'm²',
        unitCost: 152,
      },
      {
        id: 'sol-4',
        name: 'Impressora Solvente · 4 passes',
        origin: 'Patrimônio',
        unit: 'm²',
        unitCost: 289,
      },
      {
        id: 'sol-6',
        name: 'Impressora Solvente · 6 passes',
        origin: 'Patrimônio',
        unit: 'm²',
        unitCost: 412,
      },
      {
        id: 'motos',
        name: 'Motos (grupo)',
        origin: 'Grupo de bens',
        unit: 'km',
        unitCost: 120,
      },
    ],
    MATERIAL: [
      {
        id: 'lona-x-branca',
        name: 'Lona 440 · Marca X · Branca',
        origin: 'Material',
        unit: 'm²',
        unitCost: 1250,
      },
      {
        id: 'lona-y-branca',
        name: 'Lona 440 · Marca Y · Branca',
        origin: 'Material',
        unit: 'm²',
        unitCost: 1420,
      },
      {
        id: 'ilhos',
        name: 'Ilhós',
        origin: 'Material',
        unit: 'un',
        unitCost: 12,
      },
      {
        id: 'mdf-15',
        name: 'MDF 15 mm',
        origin: 'Material',
        unit: 'un',
        unitCost: 11200,
      },
    ],
    LABOR: [
      {
        id: 'producao',
        name: 'Produção',
        origin: 'Setor',
        unit: 'h',
        unitCost: 1649,
      },
      {
        id: 'criacao',
        name: 'Criação',
        origin: 'Setor',
        unit: 'h',
        unitCost: 3623,
      },
    ],
    OUTSOURCED: [
      {
        id: 'instalador',
        name: 'Instalador terceirizado',
        origin: 'Terceirizado',
        unit: 'un',
        unitCost: 18000,
      },
    ],
  },
  message: '',
})

// Mesma regra do material: processo usado em composição é inativado
export const setProcessActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const process = processes.find((item) => item.id === id)

  if (!process) {
    return { success: false, data: null, message: 'Processo não encontrado' }
  }

  process.active = active

  return { success: true, data: process, message: '' }
}

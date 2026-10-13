'use server'

// Processos (recurso do PRO): as rotas /process da API (contrato, módulo 1,
// parte A). A tela foi feita sobre o exemplo em memória (product-assembly.ts),
// em metros, com o setor pelo nome e o processo como "host" `processo:<id>`
// das ações da composição. Aqui as respostas da API voltam a esse formato:
// medidas em metros (a API usa mm) e setor pelo nome (a API usa o id).
//
// Custo e venda só vêm para quem tem a permissão de valores; sem ela, os
// valores chegam vazios e a tela mostra zero.

// Types
import type {
  AfterBase,
  AssemblyMeasure,
  AssemblyResource,
  ComputedBlock,
  ComputedLine,
  NewLineValues,
  ResourceOption,
  ResourceSummary,
  SaleRules,
  UsualNeighbor,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'
import type { ResourceKind } from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Actions
import {
  getItem,
  putItemNew,
  createItemNew,
  deleteItemNew,
  updateItemNew,
} from '@/actions/_cruds'

const HOST = 'processo:'
// As listas vêm em páginas de até 100 (teto da API)
const PAGE_SIZE = 100
const MAX_PAGES = 20

type Result<T> = { success: boolean; data: T; message: string }
// O corpo de cada rota é tipado onde é lido
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResult = { success: boolean; data?: any; message?: string }

const ok = <T>(data: T): Result<T> => ({ success: true, data, message: '' })
const fail = <T>(res: ApiResult, data: T): Result<T> => ({
  success: false,
  data,
  message: res.message || 'Não foi possível concluir.',
})

const idOf = (hostId: string) =>
  hostId.startsWith(HOST) ? hostId.slice(HOST.length) : hostId

// A medida vai em mm para a API e volta em metros para a tela
const toMm = (meters: number) => Math.round(meters * 1_000_000) / 1000
const toMeters = (mm: number) => mm / 1000
const measureOf = (measure: {
  quantity: number
  width: number
  height: number
}): AssemblyMeasure => ({
  quantity: measure.quantity,
  width: toMeters(measure.width),
  height: toMeters(measure.height),
})

/* --------------------------------------------------------------------------
 * Formato da API
 * ------------------------------------------------------------------------ */

type ApiOption = {
  id: string
  resourceId: string
  configName: string | null
  name: string
  unit: string
  unitCost?: number
  unitSale?: number
  perUnit: number | null
  lossPercent: number | null
  minimum: number | null
  sheet?: { width: number; height: number; wholeSheets: boolean }
  profile?: { x: number; y: number; barLength?: number | null }
  weight?: number
}

type ApiLine = {
  id: string
  name: string
  kind: ResourceKind
  mode: 'SINGLE' | 'CHOOSE' | 'LIST'
  selectedId: string | null
  formula: ComputedLine['formula']
  perUnit: number
  lossPercent: number
  minimum: number | null
  optional: boolean
  optionalDefault: boolean
  fieldName: string | null
  formulaId: string | null
  formulaName: string | null
  people: number | null
  sheetMargin: number | null
  sheetGap: number | null
  chargeWholeSheets: boolean | null
  overridden: boolean
  addedHere: boolean
  options: ApiOption[]
  selected: ApiOption | null
  effective: ComputedLine['effective']
  quantity: number | null
  minimumApplied: boolean
  sheetYield: ComputedLine['sheetYield']
  extraValue: number | null
  cost?: number | null
  sale?: number | null
}

type ApiDetail = {
  id: string
  name: string
  sectorId: string
  sector: string
  afterBase: AfterBase
  setupMinutes: number
  taskType: string
  sellerInstructions: string
  isActive: boolean
  category: string
  rules: SaleRules
  measure: { quantity: number; width: number; height: number }
  block: {
    id: string
    name: string
    sector: string
    setupMinutes: number
    taskType: string
    rules: SaleRules
    measure: { quantity: number; width: number; height: number }
    setupCost?: number
    setupSale?: number
    cost?: number
    sale?: number
    lines: ApiLine[]
  }
  fields: {
    id: string
    name: string
    defaultValue: number
    allowsFraction: boolean
    usedBy: string[]
  }[]
  formulas: {
    id: string
    name: string
    expression: string
    usedBy: string[]
    error: string | null
  }[]
  resourceSummary: {
    resourceId: string
    name: string
    kind: ResourceKind
    unit: string
    quantity: number
    cost?: number
    sale?: number
    people: number | null
  }[]
  cost?: number
  sale?: number
  usedIn: { productId: string; name: string }[]
}

type ApiResource = {
  resourceId: string
  kind: ResourceKind
  name: string
  unit: string
  unitCost?: number
  unitSale?: number
  sheet?: { width: number; height: number; wholeSheets: boolean }
  profile?: { x: number; y: number; barLength: number | null }
  weight?: number
}

type ApiSector = {
  id: string
  name: string
  isActive: boolean
  saleUnit?: 'HOUR' | 'M2' | 'M' | 'UN' | 'KM'
}

/* --------------------------------------------------------------------------
 * Para o formato da tela
 * ------------------------------------------------------------------------ */

const toOption = (option: ApiOption): ResourceOption => ({
  id: option.id,
  resourceId: option.resourceId,
  ...(option.configName ? { configName: option.configName } : {}),
  name: option.name,
  unit: option.unit,
  unitCost: option.unitCost ?? 0,
  ...(option.unitSale !== undefined ? { unitSale: option.unitSale } : {}),
  ...(option.sheet
    ? {
        sheet: {
          width: toMeters(option.sheet.width),
          height: toMeters(option.sheet.height),
          wholeSheets: option.sheet.wholeSheets,
        },
      }
    : {}),
  ...(option.profile ? { profile: option.profile } : {}),
  ...(option.weight ? { weight: option.weight } : {}),
  ...(option.perUnit !== null ? { perUnit: option.perUnit } : {}),
  ...(option.lossPercent !== null ? { lossPercent: option.lossPercent } : {}),
  ...(option.minimum !== null ? { minimum: option.minimum } : {}),
})

const toLine = (line: ApiLine): ComputedLine => ({
  id: line.id,
  name: line.name,
  kind: line.kind,
  mode: line.mode,
  options: line.options.map(toOption),
  selectedId: line.selectedId ?? '',
  perUnit: line.perUnit,
  formula: line.formula,
  lossPercent: line.lossPercent,
  minimum: line.minimum,
  overridden: line.overridden,
  ...(line.addedHere ? { addedHere: true } : {}),
  optional: line.optional,
  ...(line.optional ? { optionalDefault: line.optionalDefault } : {}),
  ...(line.fieldName ? { fieldName: line.fieldName } : {}),
  ...(line.formulaId ? { formulaId: line.formulaId } : {}),
  ...(line.people !== null ? { people: line.people } : {}),
  ...(line.sheetMargin !== null ? { sheetMargin: line.sheetMargin } : {}),
  ...(line.sheetGap !== null ? { sheetGap: line.sheetGap } : {}),
  ...(line.chargeWholeSheets !== null
    ? { chargeWholeSheets: line.chargeWholeSheets }
    : {}),
  variationOverride: false,
  extraValue: line.extraValue,
  formulaName: line.formulaName,
  sheetYield: line.sheetYield,
  selected: line.selected ? toOption(line.selected) : null,
  quantity: line.quantity,
  minimumApplied: line.minimumApplied,
  effective: line.effective,
  cost: line.cost ?? null,
  sale: line.sale ?? null,
})

// O processo é uma etapa sozinha (MS-11): as regras dele são as originais,
// e `rules` é o que valeu na simulação (com a base simulada, as da posição)
const toBlock = (detail: ApiDetail): ComputedBlock => ({
  id: detail.block.id,
  processId: null,
  name: detail.name,
  sector: detail.sector,
  role: 'BASE',
  dependsOn: [],
  baseBlockId: null,
  setupMinutes: detail.setupMinutes,
  sectorHourCost: 0,
  taskType: detail.taskType,
  originalRules: detail.rules,
  localRules: null,
  rules: detail.block.rules,
  measure: measureOf(detail.block.measure),
  setupCost: detail.block.setupCost ?? 0,
  setupSale: detail.block.setupSale ?? 0,
  cost: detail.block.cost ?? 0,
  sale: detail.block.sale ?? 0,
  lines: detail.block.lines.map(toLine),
  part: null,
  partFlow: null,
  partLines: [],
  partSetupMinutes: 0,
  variationOnly: false,
  processInactive: false,
  partInactive: false,
})

const toSummary = (
  entry: ApiDetail['resourceSummary'][number],
): ResourceSummary => ({
  id: entry.resourceId,
  name: entry.name,
  kind: entry.kind,
  unit: entry.unit,
  quantity: entry.quantity,
  cost: entry.cost ?? 0,
  sale: entry.sale ?? 0,
  ...(entry.people !== null ? { people: entry.people } : {}),
})

const SALE_UNIT_LABEL: { [key in NonNullable<ApiSector['saleUnit']>]: string } =
  {
    HOUR: 'hora',
    M2: 'm²',
    M: 'metro',
    UN: 'unidade',
    KM: 'km',
  }

const sectorsOf = async () => {
  const res: ApiResult = await getItem({
    route: '/sector',
    params: { page: '1', limit: '100' },
  })
  const sectors: ApiSector[] = res.success ? (res.data?.data ?? []) : []
  return { res, sectors }
}

// O setor pelo nome, como a tela escolhe; vale o ativo
const sectorIdOf = async (name: string) => {
  const { sectors } = await sectorsOf()
  return sectors.find((sector) => sector.isActive && sector.name === name)?.id
}

/* --------------------------------------------------------------------------
 * Lista, detalhe e cadastro
 * ------------------------------------------------------------------------ */

type ApiListItem = {
  id: string
  name: string
  sector: string
  category: string
  afterBase: AfterBase
  taskType: string
  setupMinutes: number
  rules: SaleRules
  lines: number
  kinds: ResourceKind[]
  incomplete: boolean
  isActive: boolean
  usedIn: number
}

const listItem = (item: ApiListItem) => ({
  id: item.id,
  name: item.name,
  sector: item.sector,
  category: item.category,
  afterBase: item.afterBase,
  taskType: item.taskType,
  setupMinutes: item.setupMinutes,
  rules: item.rules,
  lines: item.lines,
  kinds: item.kinds,
  incomplete: item.incomplete,
  active: item.isActive,
  usedIn: item.usedIn,
})

// A tela separa ativos e inativos em abas sobre a lista inteira
export const getProcessList = async () => {
  const items: ApiListItem[] = []
  for (const status of ['ativos', 'inativos']) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res: ApiResult = await getItem({
        route: '/process',
        params: { status, page: String(page), limit: String(PAGE_SIZE) },
      })
      if (!res.success) return fail(res, [] as ReturnType<typeof listItem>[])
      items.push(...(res.data?.data ?? []))
      if (page >= (res.data?.lastPage ?? 1)) break
    }
  }
  return ok(items.map(listItem))
}

// Só os ativos, para o painel do orçamento ("Acrescentar a este item"): o
// vendedor sem acesso ao cadastro recebe só os ativos em qualquer filtro
export const getActiveProcesses = async () => {
  const items: ApiListItem[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/process',
      params: {
        status: 'ativos',
        page: String(page),
        limit: String(PAGE_SIZE),
      },
    })
    if (!res.success) return fail(res, [] as ReturnType<typeof listItem>[])
    items.push(...(res.data?.data ?? []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok(items.map(listItem))
}

export const getProcessDetail = async ({
  processId,
  measure,
  baseMeasure,
}: {
  processId: string
  measure?: AssemblyMeasure
  // Simular depois de outra etapa (§9.1): a medida e a quantidade da base
  baseMeasure?: AssemblyMeasure
}) => {
  const params: { [key: string]: string } = {}
  if (measure) {
    params.quantity = String(measure.quantity)
    params.width = String(toMm(measure.width))
    params.height = String(toMm(measure.height))
  }
  if (baseMeasure) {
    params.baseQuantity = String(baseMeasure.quantity)
    params.baseWidth = String(toMm(baseMeasure.width))
    params.baseHeight = String(toMm(baseMeasure.height))
  }
  const res: ApiResult = await getItem({
    route: `/process/${idOf(processId)}`,
    params,
  })
  if (!res.success) return fail(res, null)
  const detail: ApiDetail = res.data
  return ok({
    id: detail.id,
    hostId: HOST + detail.id,
    meta: {
      afterBase: detail.afterBase,
      sellerInstructions: detail.sellerInstructions,
      active: detail.isActive,
    },
    category: detail.category,
    block: toBlock(detail),
    fields: detail.fields,
    formulas: detail.formulas,
    cost: detail.cost ?? 0,
    sale: detail.sale ?? 0,
    resourceSummary: detail.resourceSummary.map(toSummary),
    measure: measureOf(detail.measure),
    usedIn: detail.usedIn,
  })
}

export const createProcessDef = async ({
  name,
  sector,
  afterBase = 'INHERIT',
}: {
  name: string
  sector: string
  afterBase?: AfterBase
}) => {
  if (!name.trim())
    return fail({ success: false, message: 'Informe o nome do processo' }, null)
  const sectorId = await sectorIdOf(sector)
  if (!sectorId) {
    return fail({ success: false, message: 'Escolha um setor ativo' }, null)
  }
  const res: ApiResult = await createItemNew({
    route: '/process',
    data: { name, sectorId, afterBase },
  })
  return res.success ? ok(res.data?.id as string) : fail(res, null)
}

export const updateProcessMeta = async ({
  processId,
  values,
}: {
  processId: string
  values: {
    sector?: string
    afterBase?: AfterBase
    setupMinutes?: number
    sellerInstructions?: string
    active?: boolean
  }
}) => {
  const id = idOf(processId)
  // Inativar é outra rota: o processo nunca é excluído (PAD-7)
  if (values.active !== undefined) {
    const res: ApiResult = await updateItemNew({
      route: `/process/${id}/toggle-status`,
      data: { isActive: values.active },
    })
    if (!res.success) return fail(res, null)
  }

  const data: { [key: string]: unknown } = {}
  if (values.sector !== undefined) {
    const sectorId = await sectorIdOf(values.sector)
    if (!sectorId) {
      return fail({ success: false, message: 'Escolha um setor ativo' }, null)
    }
    data.sectorId = sectorId
  }
  if (values.afterBase !== undefined) data.afterBase = values.afterBase
  if (values.setupMinutes !== undefined) {
    data.setupMinutes = Math.max(0, Math.round(values.setupMinutes))
  }
  if (values.sellerInstructions !== undefined) {
    data.sellerInstructions = values.sellerInstructions
  }
  if (!Object.keys(data).length) return ok(null)
  const res: ApiResult = await updateItemNew({
    route: `/process/${id}`,
    data,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const getProcessUsage = async ({ processId }: { processId: string }) => {
  const res: ApiResult = await getItem({
    route: `/process/${idOf(processId)}/usage`,
  })
  if (!res.success) return fail(res, [])
  return ok(
    (res.data?.data ?? []) as {
      productId: string
      name: string
      variation: string | null
      stage: string
    }[],
  )
}

export const getUsualNext = async ({ processId }: { processId: string }) => {
  const res: ApiResult = await getItem({
    route: `/process/${idOf(processId)}/usual-next`,
  })
  if (!res.success) return fail(res, null)
  return ok(res.data as { before: UsualNeighbor[]; after: UsualNeighbor[] })
}

export const setUsualNext = async ({
  fromProcessId,
  toProcessId,
  usual,
}: {
  fromProcessId: string
  toProcessId: string
  usual: boolean
}) => {
  const res: ApiResult = await putItemNew({
    route: '/process/usual-next',
    data: {
      fromProcessId: idOf(fromProcessId),
      toProcessId: idOf(toProcessId),
      usual,
    },
  })
  return res.success ? ok(null) : fail(res, null)
}

// Os recursos que a linha do processo pode usar, e como cada setor vende
// (AB-19): a tela não oferece mão de obra de setor que vende por equipamento
export const getProcessResources = async () => {
  const empty = {
    sectors: [] as string[],
    sectorSales: {} as { [sector: string]: string },
    resources: [] as AssemblyResource[],
  }
  const { res: sectorsRes, sectors } = await sectorsOf()
  if (!sectorsRes.success) return fail(sectorsRes, empty)

  const resources: ApiResource[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/product/assembly-resource',
      params: { page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, empty)
    resources.push(...(res.data?.data ?? []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }

  const active = sectors.filter((sector) => sector.isActive)
  return ok({
    sectors: active.map((sector) => sector.name),
    sectorSales: Object.fromEntries(
      active.map((sector) => [
        sector.name,
        SALE_UNIT_LABEL[sector.saleUnit ?? 'HOUR'],
      ]),
    ),
    resources: resources.map(
      (resource): AssemblyResource => ({
        id: resource.resourceId,
        resourceId: resource.resourceId,
        kind: resource.kind,
        name: resource.name,
        unit: resource.unit,
        unitCost: resource.unitCost ?? 0,
        ...(resource.unitSale !== undefined
          ? { unitSale: resource.unitSale }
          : {}),
        ...(resource.sheet
          ? {
              sheet: {
                width: toMeters(resource.sheet.width),
                height: toMeters(resource.sheet.height),
                wholeSheets: resource.sheet.wholeSheets,
              },
            }
          : {}),
        ...(resource.profile ? { profile: resource.profile } : {}),
        ...(resource.weight ? { weight: resource.weight } : {}),
      }),
    ),
  })
}

/* --------------------------------------------------------------------------
 * As ações da composição no host `processo:<id>`: o editor de processos e os
 * cards compartilhados de campos e fórmulas chamam estas no lugar das do
 * exemplo (product-assembly.ts), que segue para o produto até a 3.4
 * ------------------------------------------------------------------------ */

const SALE_RULE_KEYS: (keyof SaleRules)[] = [
  'quantityMode',
  'followsBase',
  'dimension',
  'timeField',
  'timeFieldDefault',
  'extraField',
  'extraFieldName',
  'extraFieldDefault',
  'descriptionEditable',
]

// O nome, o tipo de tarefa e as regras do processo (os seletores da etapa)
export const setProcessStage = async ({
  hostId,
  rules,
  name,
  taskType,
}: {
  hostId: string
  rules: SaleRules | null
  name?: string
  taskType?: string
}) => {
  const data: { [key: string]: unknown } = {}
  if (rules) {
    data.rules = Object.fromEntries(
      SALE_RULE_KEYS.filter((key) => rules[key] !== undefined).map((key) => [
        key,
        rules[key],
      ]),
    )
  }
  if (name !== undefined) data.name = name
  if (taskType !== undefined) data.taskType = taskType
  if (!Object.keys(data).length) return ok(null)
  const res: ApiResult = await updateItemNew({
    route: `/process/${idOf(hostId)}`,
    data,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addProcessLine = async ({
  hostId,
  values,
}: {
  hostId: string
  values: NewLineValues
}) => {
  const res: ApiResult = await createItemNew({
    route: `/process/${idOf(hostId)}/line`,
    data: {
      name: values.name,
      kind: values.kind,
      mode: values.mode,
      resourceIds: values.optionIds,
      perUnit: values.perUnit,
      formula: values.formula,
      lossPercent: values.lossPercent,
      minimum: values.minimum,
      optional: values.optional,
      optionalDefault: values.optionalDefault,
      fieldName: values.fieldName,
      fieldDefault: values.fieldDefault,
      formulaId: values.formulaId,
      people: values.kind === 'LABOR' ? values.people : undefined,
    },
  })
  return res.success ? ok(null) : fail(res, null)
}

const LINE_KEYS = [
  'selectedId',
  'perUnit',
  'formula',
  'lossPercent',
  'minimum',
  'optional',
  'optionalDefault',
  'sheetMargin',
  'sheetGap',
  'chargeWholeSheets',
  'fieldName',
  'fieldDefault',
  'formulaId',
  'people',
  'optionValues',
] as const

export const updateProcessLine = async ({
  hostId,
  lineId,
  values,
}: {
  hostId: string
  lineId: string
  values: { [key: string]: unknown }
}) => {
  const data: { [key: string]: unknown } = {}
  for (const key of LINE_KEYS) {
    if (!(key in values)) continue
    const value = values[key]
    // Vazio tira o campo lido e a fórmula da linha, como no exemplo
    if (key === 'fieldName' || key === 'formulaId') data[key] = value ?? null
    else if (value !== undefined) data[key] = value
  }
  const res: ApiResult = await updateItemNew({
    route: `/process/${idOf(hostId)}/line/${lineId}`,
    data,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProcessLine = async ({
  hostId,
  lineId,
}: {
  hostId: string
  lineId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/process/${idOf(hostId)}/line/${lineId}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addProcessLineOption = async ({
  hostId,
  lineId,
  resourceId,
  configName,
  perUnit,
}: {
  hostId: string
  lineId: string
  resourceId: string
  configName?: string
  perUnit?: number
}) => {
  const res: ApiResult = await createItemNew({
    route: `/process/${idOf(hostId)}/line/${lineId}/option`,
    data: { resourceId, configName, perUnit },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProcessLineOption = async ({
  hostId,
  lineId,
  optionId,
}: {
  hostId: string
  lineId: string
  optionId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/process/${idOf(hostId)}/line/${lineId}/option/${optionId}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addProcessField = async ({
  hostId,
  name,
  defaultValue,
  allowsFraction,
}: {
  hostId: string
  name: string
  defaultValue: number
  allowsFraction?: boolean
}) => {
  const res: ApiResult = await createItemNew({
    route: `/process/${idOf(hostId)}/field`,
    data: { name, defaultValue, allowsFraction },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const updateProcessField = async ({
  hostId,
  fieldId,
  name,
  defaultValue,
  allowsFraction,
}: {
  hostId: string
  fieldId: string
  name?: string
  defaultValue?: number
  allowsFraction?: boolean
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/process/${idOf(hostId)}/field/${fieldId}`,
    data: { name, defaultValue, allowsFraction },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProcessField = async ({
  hostId,
  fieldId,
}: {
  hostId: string
  fieldId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/process/${idOf(hostId)}/field/${fieldId}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addProcessFormula = async ({
  hostId,
  name,
  expression,
}: {
  hostId: string
  name: string
  expression: string
}) => {
  const res: ApiResult = await createItemNew({
    route: `/process/${idOf(hostId)}/formula`,
    data: { name, expression },
  })
  return res.success ? ok(res.data?.id as string) : fail(res, null)
}

export const updateProcessFormula = async ({
  hostId,
  formulaId,
  name,
  expression,
}: {
  hostId: string
  formulaId: string
  name?: string
  expression?: string
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/process/${idOf(hostId)}/formula/${formulaId}`,
    data: { name, expression },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProcessFormula = async ({
  hostId,
  formulaId,
}: {
  hostId: string
  formulaId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/process/${idOf(hostId)}/formula/${formulaId}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

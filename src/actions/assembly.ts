'use server'

// Composição do produto (recurso do PRO): as rotas /product/:id/assembly da
// API (contrato, módulo 1, parte A). A tela foi feita sobre o exemplo em
// memória (product-assembly.ts): medidas em metros, setor pelo nome e a
// variação com composição própria como uma aba de id "<produto>::v:<id>".
// Aqui as respostas da API voltam a esse formato, e as assinaturas são as
// mesmas das actions do exemplo.
//
// Custo e venda só vêm para quem tem a permissão de valores; sem ela, os
// valores chegam vazios e a tela mostra zero.

// Types
import type {
  AssemblyMeasure,
  AssemblyStatus,
  ComputedAssembly,
  ComputedBlock,
  ComputedLine,
  FlowStage,
  NewLineValues,
  TimePrecision,
  NextStepCandidates,
  PriceTier,
  ProductDimension,
  ResourceOption,
  SaleChoice,
  SaleCompositionReport,
  SaleExtra,
  SaleForm,
  SaleListEntry,
  SaleOptional,
  SaleRules,
  SaleSheetUsage,
  SaleTime,
  SheetYield,
  UnitKind,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'
import type { ResourceKind } from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Actions
import {
  getItem,
  createItemNew,
  deleteItemNew,
  updateItemNew,
} from '@/actions/_cruds'
import { DRAFT_HOST_PREFIX } from '@/lib/composed-draft'
import { getProcessResources } from '@/actions/processes'

const VARIANT_SEP = '::v:'
const PAGE_SIZE = 100
const MAX_PAGES = 10

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

// O rascunho do item montado no orçamento (ORC-11, Fase 4.5) usa o mesmo
// editor: o id é "qdraft:<orçamento>:<rascunho>" e as rotas são as do
// orçamento, com o rascunho como dono da composição
const DRAFT_HOST = DRAFT_HOST_PREFIX

// A aba da variação é "<produto>::v:<variação>"
const hostOf = (productId: string) => {
  if (productId.startsWith(DRAFT_HOST)) {
    const [, quotationId, draftId] = productId.split(':')
    return {
      id: draftId,
      variationId: null,
      base: `/sale/quotation/${quotationId}/composed-draft/${draftId}`,
    }
  }
  const [id, variationId] = productId.split(VARIANT_SEP)
  return { id, variationId: variationId || null, base: `/product/${id}` }
}
const withVariation = (
  variationId: string | null,
): { [key: string]: string } => (variationId ? { variationId } : {})

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

type ApiLine = Omit<
  ComputedLine,
  | 'options'
  | 'selected'
  | 'selectedId'
  | 'fieldName'
  | 'formulaId'
  | 'people'
  | 'sheetMargin'
  | 'sheetGap'
  | 'chargeWholeSheets'
  | 'timePrecision'
  | 'variationOverride'
  | 'cost'
  | 'sale'
  | 'addedHere'
> & {
  selectedId: string | null
  fieldName: string | null
  formulaId: string | null
  people: number | null
  sheetMargin: number | null
  sheetGap: number | null
  chargeWholeSheets: boolean | null
  timePrecision?: TimePrecision | null
  addedHere: boolean
  options: ApiOption[]
  selected: ApiOption | null
  cost?: number | null
  sale?: number | null
}

type ApiBlock = {
  id: string
  type: 'OWN' | 'PROCESS' | 'PART'
  processId: string | null
  partProductId: string | null
  name: string
  localName: string | null
  sectorId: string | null
  sector: string
  dependsOn: string[]
  baseBlockId: string | null
  role: 'BASE' | 'FINISHING'
  setupMinutes: number
  taskType: string
  rules: SaleRules
  originalRules: SaleRules
  rulesOverridden: boolean
  removedProcessLines: number
  processInactive: boolean
  partInactive: boolean
  measure: { quantity: number; width: number; height: number }
  setupCost?: number
  setupSale?: number
  cost?: number
  sale?: number
  part: { productId: string; name: string; stages: number } | null
  partFlow: FlowStage[] | null
  partLines: ApiLine[]
  partSetupMinutes: number
  lines: ApiLine[]
}

type ApiAssembly = {
  productId: string
  name: string
  code: string
  unitKind: UnitKind
  unitPrice: number | null
  unitAmount: number
  technicalDescription: string
  allowEditValues: boolean
  allowEditDescription: boolean
  priceTiers: PriceTier[]
  status: AssemblyStatus
  dimension: ProductDimension
  allowRenameStages: boolean
  isActive: boolean
  measure: { quantity: number; width: number; height: number }
  area: number
  blocks: ApiBlock[]
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
    processId: string | null
    usedBy: string[]
    error: string | null
  }[]
  cost?: number
  suggestedPrice?: number
  saleAmount: number
  priceForMeasure?: number | null
  suggestedUnitPrice?: number
  margin?: number | null
  activeTier: PriceTier | null
  effectiveTiers: PriceTier[]
  tiersFromVariation: boolean
  tierSummary?: ComputedAssembly['tierSummary']
  variationSummary?: {
    id: string | null
    name: string
    cost: number
    priceForMeasure: number | null
    margin: number | null
  }[]
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
  // A linha que acompanha um processo guarda a origem (CP-21)
  ...(line.addedHere ? { addedHere: true } : {}),
  optional: line.optional,
  ...(line.optional ? { optionalDefault: line.optionalDefault } : {}),
  ...(line.fieldName ? { fieldName: line.fieldName } : {}),
  ...(line.formulaId ? { formulaId: line.formulaId } : {}),
  ...(line.people !== null ? { people: line.people } : {}),
  ...(line.sheetMargin !== null ? { sheetMargin: line.sheetMargin } : {}),
  ...(line.sheetGap !== null ? { sheetGap: line.sheetGap } : {}),
  ...(line.timePrecision ? { timePrecision: line.timePrecision } : {}),
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

const toBlock = (block: ApiBlock): ComputedBlock => {
  const lines = block.lines.map(toLine)
  // A etapa de processo: a linha que veio dele tem a origem marcada
  if (block.type === 'PROCESS') {
    lines.forEach((line) => {
      if (!line.addedHere) line.sourceLineId = line.id
    })
  }
  return {
    id: block.id,
    processId: block.type === 'PROCESS' ? block.processId : null,
    name: block.name,
    ...(block.localName ? { localName: block.localName } : {}),
    ...(block.partProductId ? { partProductId: block.partProductId } : {}),
    sector: block.sector,
    role: block.role,
    dependsOn: block.dependsOn,
    baseBlockId: block.baseBlockId,
    setupMinutes: block.setupMinutes,
    sectorHourCost: 0,
    taskType: block.taskType,
    // A tela só lê a quantidade: "restaurar as linhas do processo"
    removedSourceLineIds: Array.from(
      { length: block.removedProcessLines },
      (_, index) => `${block.id}:${index}`,
    ),
    originalRules: block.originalRules,
    localRules: block.rulesOverridden ? block.rules : null,
    rules: block.rules,
    measure: measureOf(block.measure),
    setupCost: block.setupCost ?? 0,
    setupSale: block.setupSale ?? 0,
    cost: block.cost ?? 0,
    sale: block.sale ?? 0,
    lines,
    part: block.part,
    partFlow: block.partFlow,
    partLines: block.partLines.map(toLine),
    partSetupMinutes: block.partSetupMinutes,
    variationOnly: false,
    processInactive: block.processInactive,
    partInactive: block.partInactive,
  }
}

const toAssembly = (hostId: string, api: ApiAssembly): ComputedAssembly => ({
  productId: hostId,
  name: api.name,
  code: api.code,
  status: api.status,
  dimension: api.dimension,
  unitKind: api.unitKind,
  unitPrice: api.unitPrice,
  measure: measureOf(api.measure),
  unitAmount: api.unitAmount,
  allowEditValues: api.allowEditValues,
  allowEditDescription: api.allowEditDescription,
  allowRenameStages: api.allowRenameStages,
  priceTiers: api.priceTiers,
  technicalDescription: api.technicalDescription,
  // As exceções por linha (PV-2) não existem na API: a variação tem a
  // composição própria, como aba
  variations: [],
  inactive: !api.isActive,
  area: api.area,
  blocks: api.blocks.map(toBlock),
  resourceSummary: api.resourceSummary.map((entry) => ({
    id: entry.resourceId,
    name: entry.name,
    kind: entry.kind,
    unit: entry.unit,
    quantity: entry.quantity,
    cost: entry.cost ?? 0,
    sale: entry.sale ?? 0,
    ...(entry.people !== null ? { people: entry.people } : {}),
  })),
  fields: api.fields,
  formulas: api.formulas.map(({ processId, ...formula }) => ({
    ...formula,
    ...(processId ? { processId } : {}),
  })),
  cost: api.cost ?? 0,
  suggestedPrice: api.suggestedPrice ?? 0,
  saleAmount: api.saleAmount,
  priceForMeasure: api.priceForMeasure ?? null,
  suggestedUnitPrice: api.suggestedUnitPrice ?? 0,
  margin: api.margin ?? null,
  activeVariation: null,
  activeTier: api.activeTier,
  effectiveTiers: api.effectiveTiers,
  tiersFromVariation: api.tiersFromVariation,
  tierSummary: api.tierSummary ?? [],
  variationSummary: (api.variationSummary ?? []).map((item) => ({
    ...item,
    id: item.id ?? '',
  })),
})

/* --------------------------------------------------------------------------
 * Leitura
 * ------------------------------------------------------------------------ */

export const getAssembly = async ({
  productId,
  measure,
}: {
  productId: string
  measure?: AssemblyMeasure
  // A variação de preço (PV-2) e a semente do cadastro eram do exemplo: a
  // API lê o cadastro e a variação com composição vem pela aba
  variationId?: string | null
  seed?: unknown
}) => {
  const host = hostOf(productId)
  const params: { [key: string]: string } = {
    ...withVariation(host.variationId),
  }
  if (measure) {
    params.quantity = String(measure.quantity)
    params.width = String(toMm(measure.width))
    params.height = String(toMm(measure.height))
  }
  const res: ApiResult = await getItem({
    route: `${host.base}/assembly`,
    params,
  })
  if (!res.success) return fail(res, null)
  return ok(toAssembly(productId, res.data))
}

export const getAssemblyResources = async () => getProcessResources()

export const getNextStepCandidates = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string | null
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await getItem({
    route: `${host.base}/assembly/next-step`,
    params: {
      ...withVariation(host.variationId),
      ...(blockId ? { blockId } : {}),
    },
  })
  const empty: NextStepCandidates = { usual: [], all: [] }
  if (!res.success) return fail(res, empty)
  const toItem = (item: {
    id: string
    name: string
    sector: string
    afterBase: 'INHERIT' | 'OWN'
  }) => ({
    id: item.id,
    name: item.name,
    sector: item.sector,
    afterBase: item.afterBase,
  })
  return ok<NextStepCandidates>({
    usual: res.data.usual.map(toItem),
    all: res.data.all.map(toItem),
  })
}

export const getPartCandidates = async ({
  productId,
}: {
  productId: string
}) => {
  const host = hostOf(productId)
  const data: {
    productId: string
    name: string
    code: string
    status: AssemblyStatus
    stages: number
  }[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: `${host.base}/assembly/part-candidate`,
      params: { page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, data)
    data.push(...(res.data?.data ?? []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok(data)
}

/* --------------------------------------------------------------------------
 * Cabeçalho: o que é da composição vai para a composição; o que é do
 * cadastro (valor, unidade, medida padrão, descritivo, permissões) vai para
 * o PATCH /product/:id
 * ------------------------------------------------------------------------ */

const COMMERCIAL_FACTOR: Record<UnitKind, number> = {
  AREA: 1_000_000,
  LENGTH: 1_000,
  CAPACITY: 1_000,
  WEIGHT: 1_000_000,
  DISTANCE: 1_000,
  DURATION: 3_600,
  UNITY: 1,
}

// O campo do item que guarda a quantidade, na unidade bruta
const AMOUNT_FIELD: Partial<Record<UnitKind, string>> = {
  LENGTH: 'length',
  CAPACITY: 'volume',
  WEIGHT: 'weight',
  DISTANCE: 'distance',
  DURATION: 'duration',
}

type ApiItem = {
  id: string
  unitKind: UnitKind | null
  unitCost: number | null
  width: number | null
  height: number | null
  length: number | null
  volume: number | null
  weight: number | null
  distance: number | null
  duration: number | null
}

const rawAmountOf = (unitKind: UnitKind, item: ApiItem) => {
  if (unitKind === 'AREA') return (item.width ?? 0) * (item.height ?? 0)
  const field = AMOUNT_FIELD[unitKind]
  return field ? Number(item[field as keyof ApiItem] ?? 0) : 1
}

export const updateAssembly = async ({
  productId,
  values,
}: {
  productId: string
  values: Partial<{
    status: AssemblyStatus
    dimension: ProductDimension
    allowRenameStages: boolean
    unitKind: UnitKind
    unitPrice: number | null
    measure: AssemblyMeasure
    unitAmount: number
    allowEditValues: boolean
    allowEditDescription: boolean
    technicalDescription: string
  }>
}) => {
  const host = hostOf(productId)

  // Situação, dimensão e renomear etapas: da composição
  const header: { [key: string]: unknown } = {}
  for (const key of ['status', 'dimension', 'allowRenameStages'] as const) {
    if (values[key] !== undefined) header[key] = values[key]
  }
  if (Object.keys(header).length) {
    const res: ApiResult = await updateItemNew({
      route: `${host.base}/assembly`,
      data: { ...withVariation(host.variationId), ...header },
    })
    if (!res.success) return fail(res, null)
  }

  // O preço na aba da variação é o preço dela (PV-4)
  if (host.variationId && values.unitPrice !== undefined) {
    const res: ApiResult = await updateItemNew({
      route: `/product/${host.id}/variation/${host.variationId}`,
      data: { unitPrice: values.unitPrice },
    })
    if (!res.success) return fail(res, null)
  }

  // O resto é do cadastro do produto
  const product: { [key: string]: unknown } = {}
  for (const key of [
    'allowEditValues',
    'allowEditDescription',
    'technicalDescription',
  ] as const) {
    if (values[key] !== undefined) product[key] = values[key]
  }
  const touchesItem =
    (!host.variationId && values.unitPrice !== undefined) ||
    values.unitKind !== undefined ||
    values.measure !== undefined ||
    values.unitAmount !== undefined
  if (touchesItem) {
    const current: ApiResult = await getItem({ route: `/product/${host.id}` })
    if (!current.success) return fail(current, null)
    const items: ApiItem[] = current.data?.items ?? []
    const main = items[0]
    if (!main) {
      return fail(
        { success: false, message: 'Produto sem item de venda' },
        null,
      )
    }
    const unitKind: UnitKind = values.unitKind ?? main.unitKind ?? 'UNITY'
    const next: ApiItem = { ...main, unitKind }
    if (values.measure) {
      next.width = toMm(values.measure.width)
      next.height = toMm(values.measure.height)
    }
    const field = AMOUNT_FIELD[unitKind]
    if (values.unitAmount !== undefined && field) {
      ;(next as Record<string, unknown>)[field] =
        values.unitAmount * COMMERCIAL_FACTOR[unitKind]
    }
    if (!host.variationId && values.unitPrice !== undefined) {
      next.unitCost =
        values.unitPrice === null
          ? 0
          : values.unitPrice / COMMERCIAL_FACTOR[unitKind]
    }
    // O valor da medida padrão acompanha o preço e a medida
    const salePrice = (next.unitCost ?? 0) * rawAmountOf(unitKind, next)
    // Os outros itens vão como estão: o PATCH com a lista tira o que faltar
    product.items = [
      {
        id: main.id,
        unitKind,
        unitCost: next.unitCost,
        salePrice,
        width: next.width,
        height: next.height,
        ...(field ? { [field]: (next as Record<string, unknown>)[field] } : {}),
      },
      ...items.slice(1).map((item) => ({ id: item.id })),
    ]
  }
  if (Object.keys(product).length) {
    const res: ApiResult = await updateItemNew({
      route: `/product/${host.id}`,
      data: product,
    })
    if (!res.success) return fail(res, null)
  }
  return ok(null)
}

/* --------------------------------------------------------------------------
 * Etapas
 * ------------------------------------------------------------------------ */

const sectorIdOf = async (name: string) => {
  const res: ApiResult = await getItem({
    route: '/sector',
    params: { page: '1', limit: '100' },
  })
  const sectors: { id: string; name: string; isActive: boolean }[] = res.success
    ? (res.data?.data ?? [])
    : []
  return sectors.find((sector) => sector.isActive && sector.name === name)?.id
}

const addBlock = async (
  productId: string,
  body: { [key: string]: unknown },
) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${host.base}/assembly/block`,
    data: { ...withVariation(host.variationId), ...body },
  })
  return res.success ? ok(res.data?.id as string) : fail(res, null)
}

// PRO: o fluxo de ícones do produto vira a composição, com uma etapa por
// setor, na ordem dos ícones (área 9; Maicol, 23/11/2026). Só no produto do
// cadastro e na composição sem etapas
export const createAssemblyFromFlow = async (productId: string) => {
  const res: ApiResult = await createItemNew({
    route: `/product/${productId}/assembly/from-flow`,
  })
  return res.success ? ok((res.data?.created as number) ?? 0) : fail(res, 0)
}

export const addAssemblyBlock = async ({
  productId,
  processId,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  processId: string
  dependsOn?: string[]
  insertBefore?: string
}) =>
  addBlock(productId, { type: 'PROCESS', processId, dependsOn, insertBefore })

export const addOwnBlock = async ({
  productId,
  name,
  sector,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  name: string
  sector: string
  dependsOn?: string[]
  insertBefore?: string
}) => {
  const sectorId = await sectorIdOf(sector)
  if (!sectorId) {
    return fail({ success: false, message: 'Escolha um setor ativo' }, null)
  }
  return addBlock(productId, {
    type: 'OWN',
    name,
    sectorId,
    dependsOn,
    insertBefore,
  })
}

export const addPartBlock = async ({
  productId,
  partProductId,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  partProductId: string
  dependsOn?: string[]
  insertBefore?: string
}) =>
  addBlock(productId, { type: 'PART', partProductId, dependsOn, insertBefore })

const patchBlock = async (
  productId: string,
  blockId: string,
  body: { [key: string]: unknown },
) => {
  const host = hostOf(productId)
  const res: ApiResult = await updateItemNew({
    route: `${host.base}/assembly/block/${blockId}`,
    data: { ...withVariation(host.variationId), ...body },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeAssemblyBlock = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `${host.base}/assembly/block/${blockId}`,
    params: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

// As ligações substituem a lista: lê as da etapa antes de mudar
const dependsOnOf = async (productId: string, blockId: string) => {
  const res = await getAssembly({ productId })
  return res.data?.blocks.find((block) => block.id === blockId)?.dependsOn
}

export const linkBlock = async ({
  productId,
  blockId,
  toId,
}: {
  productId: string
  blockId: string
  toId: string
}) => {
  const current = await dependsOnOf(productId, blockId)
  if (!current) {
    return fail({ success: false, message: 'Etapa não encontrada' }, null)
  }
  if (current.includes(toId)) return ok(null)
  return patchBlock(productId, blockId, { dependsOn: [...current, toId] })
}

export const unlinkBlock = async ({
  productId,
  blockId,
  fromId,
}: {
  productId: string
  blockId: string
  fromId: string
}) => {
  const current = await dependsOnOf(productId, blockId)
  if (!current) {
    return fail({ success: false, message: 'Etapa não encontrada' }, null)
  }
  return patchBlock(productId, blockId, {
    dependsOn: current.filter((id) => id !== fromId),
  })
}

export const replaceBlockProcess = async ({
  productId,
  blockId,
  processId,
}: {
  productId: string
  blockId: string
  processId: string
}) => patchBlock(productId, blockId, { processId })

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

export const setBlockLocalRules = async ({
  productId,
  blockId,
  rules,
  name,
  taskType,
}: {
  productId: string
  blockId: string
  rules: SaleRules | null
  name?: string
  taskType?: string
}) =>
  patchBlock(productId, blockId, {
    // Nulo volta às regras do processo
    rules: rules
      ? Object.fromEntries(
          SALE_RULE_KEYS.filter((key) => rules[key] !== undefined).map(
            (key) => [key, rules[key]],
          ),
        )
      : null,
    ...(name !== undefined ? { name } : {}),
    ...(taskType !== undefined ? { taskType } : {}),
  })

export const restoreProcessLines = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${host.base}/assembly/block/${blockId}/restore-process-lines`,
    data: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

/* --------------------------------------------------------------------------
 * Linhas e opções
 * ------------------------------------------------------------------------ */

const linePath = (productId: string, blockId: string) =>
  `/product/${hostOf(productId).id}/assembly/block/${blockId}/line`

export const addAssemblyLine = async ({
  productId,
  blockId,
  values,
}: {
  productId: string
  blockId: string
  values: NewLineValues
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: linePath(productId, blockId),
    data: {
      ...withVariation(host.variationId),
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
      timePrecision: values.timePrecision,
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
  'timePrecision',
  'fieldName',
  'fieldDefault',
  'formulaId',
  'people',
  'optionValues',
] as const

export const updateAssemblyLine = async ({
  productId,
  blockId,
  lineId,
  values,
}: {
  productId: string
  blockId: string
  lineId: string
  values: { [key: string]: unknown }
}) => {
  const host = hostOf(productId)
  const data: { [key: string]: unknown } = withVariation(host.variationId)
  for (const key of LINE_KEYS) {
    if (!(key in values)) continue
    const value = values[key]
    // Vazio tira o campo lido e a fórmula da linha, como no exemplo
    if (key === 'fieldName' || key === 'formulaId') data[key] = value ?? null
    else if (value !== undefined) data[key] = value
  }
  const res: ApiResult = await updateItemNew({
    route: `${linePath(productId, blockId)}/${lineId}`,
    data,
  })
  return res.success ? ok(null) : fail(res, null)
}

export const resetAssemblyLine = async ({
  productId,
  blockId,
  lineId,
}: {
  productId: string
  blockId: string
  lineId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${linePath(productId, blockId)}/${lineId}/reset`,
    data: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeAssemblyLine = async ({
  productId,
  blockId,
  lineId,
}: {
  productId: string
  blockId: string
  lineId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `${linePath(productId, blockId)}/${lineId}`,
    params: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addLineOption = async ({
  productId,
  blockId,
  lineId,
  resourceId,
  configName,
  perUnit,
}: {
  productId: string
  blockId: string
  lineId: string
  resourceId: string
  configName?: string
  perUnit?: number
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${linePath(productId, blockId)}/${lineId}/option`,
    data: {
      ...withVariation(host.variationId),
      resourceId,
      configName,
      perUnit,
    },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeLineOption = async ({
  productId,
  blockId,
  lineId,
  optionId,
}: {
  productId: string
  blockId: string
  lineId: string
  optionId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `${linePath(productId, blockId)}/${lineId}/option/${optionId}`,
    params: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

/* --------------------------------------------------------------------------
 * Campos do orçamento e fórmulas
 * ------------------------------------------------------------------------ */

export const addProductField = async ({
  productId,
  name,
  defaultValue,
  allowsFraction,
}: {
  productId: string
  name: string
  defaultValue: number
  allowsFraction?: boolean
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${host.base}/assembly/field`,
    data: {
      ...withVariation(host.variationId),
      name,
      defaultValue,
      allowsFraction,
    },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const updateProductField = async ({
  productId,
  fieldId,
  name,
  defaultValue,
  allowsFraction,
}: {
  productId: string
  fieldId: string
  name?: string
  defaultValue?: number
  allowsFraction?: boolean
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await updateItemNew({
    route: `${host.base}/assembly/field/${fieldId}`,
    data: {
      ...withVariation(host.variationId),
      name,
      defaultValue,
      allowsFraction,
    },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProductField = async ({
  productId,
  fieldId,
}: {
  productId: string
  fieldId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `${host.base}/assembly/field/${fieldId}`,
    params: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

export const addProductFormula = async ({
  productId,
  name,
  expression,
}: {
  productId: string
  name: string
  expression: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${host.base}/assembly/formula`,
    data: { ...withVariation(host.variationId), name, expression },
  })
  return res.success ? ok(res.data?.id as string) : fail(res, null)
}

export const updateProductFormula = async ({
  productId,
  formulaId,
  name,
  expression,
}: {
  productId: string
  formulaId: string
  name?: string
  expression?: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await updateItemNew({
    route: `${host.base}/assembly/formula/${formulaId}`,
    data: { ...withVariation(host.variationId), name, expression },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProductFormula = async ({
  productId,
  formulaId,
}: {
  productId: string
  formulaId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `${host.base}/assembly/formula/${formulaId}`,
    params: withVariation(host.variationId),
  })
  return res.success ? ok(null) : fail(res, null)
}

/* --------------------------------------------------------------------------
 * Variações com composição própria, como abas (03/10/2026)
 * ------------------------------------------------------------------------ */

export const getProductVariants = async ({
  productId,
}: {
  productId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await getItem({
    route: `/product/${host.id}/variation`,
  })
  const empty = { baseProductId: host.id, variants: [] }
  if (!res.success) return fail(res, empty)
  const rows: { id: string; name: string; hasOwnAssembly: boolean }[] =
    res.data?.data ?? []
  return ok({
    baseProductId: host.id,
    variants: rows
      .filter((row) => row.hasOwnAssembly)
      .map(({ id, name }) => ({ id, name })),
  })
}

// Nasce como cópia da composição aberta (a padrão ou a de outra variação)
export const createProductVariant = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `/product/${host.id}/variation`,
    data: { name, copyFrom: host.variationId },
  })
  return res.success
    ? ok(`${host.id}${VARIANT_SEP}${res.data?.id}`)
    : fail(res, null)
}

export const renameProductVariant = async ({
  productId,
  variantId,
  name,
}: {
  productId: string
  variantId: string
  name: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await updateItemNew({
    route: `/product/${host.id}/variation/${variantId}`,
    data: { name },
  })
  return res.success ? ok(null) : fail(res, null)
}

export const removeProductVariant = async ({
  productId,
  variantId,
}: {
  productId: string
  variantId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await deleteItemNew({
    route: `/product/${host.id}/variation/${variantId}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

/** Adota o preço sugerido na medida padrão (o servidor calcula). */
export const adoptSuggestedPrice = async ({
  productId,
}: {
  productId: string
}) => {
  const host = hostOf(productId)
  const res: ApiResult = await createItemNew({
    route: `${host.base}/assembly/adopt-suggested-price`,
    data: withVariation(host.variationId),
  })
  return res.success ? ok(res.data?.unitPrice as number) : fail(res, null)
}

/* --------------------------------------------------------------------------
 * O produto no cadastro: duplicar e onde é usado
 * ------------------------------------------------------------------------ */

// Cadastro e composição num passo só; a cópia nasce em edição (IP-14)
export const duplicateProduct = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  const res: ApiResult = await createItemNew({
    route: `/product/${productId}/duplicate`,
    data: { name },
  })
  return res.success ? ok(res.data?.id as string) : fail(res, null)
}

// Onde o produto é parte e os orçamentos abertos que o têm (PAD-7)
export const getProductUsage = async ({ productId }: { productId: string }) => {
  const res: ApiResult = await getItem({ route: `/product/${productId}/usage` })
  const empty = {
    asPart: [] as {
      productId: string
      name: string
      variation: string | null
      stage: string
    }[],
    // Em quantos itens de orçamento o produto já entrou: com algum, o tipo
    // dele trava (25/11/2026)
    soldCount: 0,
    openQuotations: [] as {
      quotationId: string
      reference: string | null
      client: string | null
      itemId: string
      itemName: string
    }[],
  }
  if (!res.success) return fail(res, empty)
  return ok({ ...empty, ...(res.data as Partial<typeof empty>) })
}

/* --------------------------------------------------------------------------
 * O produto na venda (IP-36): as escolhas do item do orçamento e o relatório
 * da composição daquela venda, sem custo (ORC-7). A API mede em mm
 * ------------------------------------------------------------------------ */

type SaleChoices = {
  extras?: SaleExtra[]
  times?: SaleTime[]
  choices?: SaleChoice[]
  optionals?: SaleOptional[]
  lists?: SaleListEntry[]
  notes?: { blockId: string; text: string }[]
}

type ApiSaleReport = Omit<SaleCompositionReport, 'measure' | 'blocks'> & {
  measure: { quantity: number; width: number; height: number }
  blocks: (Omit<SaleCompositionReport['blocks'][number], 'measure' | 'sale'> & {
    measure: { quantity: number; width: number; height: number }
    sale?: number | null
  })[]
}

// Sem composição o produto volta vazio, e o item segue sem as escolhas
export const getSaleForm = async ({
  productId,
  variationId = null,
}: {
  productId: string
  variationId?: string | null
}) => {
  const res: ApiResult = await getItem({
    route: `/product/${productId}/sale-form`,
    params: withVariation(variationId),
  })
  if (!res.success) return fail<SaleForm | null>(res, null)
  return ok<SaleForm | null>((res.data as SaleForm | null) || null)
}

// O relatório da composição daquela venda; não grava nada
export const getSaleComposition = async ({
  productId,
  variationId = null,
  measure,
  ...choices
}: SaleChoices & {
  productId: string
  variationId?: string | null
  measure?: AssemblyMeasure
}) => {
  const res: ApiResult = await createItemNew({
    route: `/product/${productId}/sale-composition`,
    data: {
      ...choices,
      ...withVariation(variationId),
      ...(measure
        ? {
            measure: {
              quantity: measure.quantity,
              width: toMm(measure.width),
              height: toMm(measure.height),
            },
          }
        : {}),
    },
  })
  if (!res.success) return fail<SaleCompositionReport | null>(res, null)
  const api = res.data as ApiSaleReport
  return ok<SaleCompositionReport | null>({
    ...api,
    measure: measureOf(api.measure),
    blocks: api.blocks.map((block) => ({
      ...block,
      // Sem a permissão de valores, a venda da etapa chega vazia
      sale: block.sale ?? 0,
      measure: measureOf(block.measure),
    })),
  })
}

// O aproveitamento de folha da venda (AP-5), lido do relatório: só a linha
// da própria folha ou chapa traz o aproveitamento
export const getSaleSheetUsage = async ({
  productId,
  variationId = null,
  measure,
  choices = [],
}: {
  productId: string
  variationId?: string | null
  measure: AssemblyMeasure
  choices?: SaleChoice[]
}) => {
  // A medida que faltar (vendido por unidade) vem do padrão do produto
  const report = await getSaleComposition({
    productId,
    variationId,
    measure,
    choices,
  })
  if (!report.success || !report.data) return ok<SaleSheetUsage[]>([])
  return ok<SaleSheetUsage[]>(
    report.data.blocks.flatMap((block) =>
      block.lines
        .filter((line) => line.sheetYield)
        .map((line) => ({
          blockId: block.id,
          blockName: block.name,
          lineName: line.name,
          resource: line.resource || line.sheetYield!.sheetName,
          unit: line.unit,
          sheetYield: line.sheetYield as SheetYield,
        })),
    ),
  )
}

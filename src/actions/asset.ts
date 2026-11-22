'use server'

// Patrimônios (recurso do PRO, módulo 4): as rotas /asset da API. Valores
// em centavos e datas YYYY-MM-DD dos dois lados; o setor, o grupo e a conta
// do plano de contas vão pelo id.
//
// Sem values:values:view, a leitura vem sem os valores e a escrita é
// recusada (403). As páginas já pedem a permissão; o valor que faltar chega
// nulo, e a tela mostra `-`.

// Types
import type {
  AssetAccount,
  AssetComposition,
  AssetCostItem,
  AssetCostValues,
  AssetFormValues,
  AssetGroupRow,
  AssetItem,
  AssetKind,
  AssetQuantity,
  AssetReading,
  AssetRecord,
  AssetReviewValues,
  AssetSale,
  AssetSaleResult,
  AssetSetupItem,
  AssetSetupValues,
  AssetStatusFilter,
  AssetUnit,
  AssetWarning,
} from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Actions
import {
  getItem,
  createItemNew,
  deleteItemNew,
  updateItemNew,
} from '@/actions/_cruds'
import { domainCall } from '@/actions/domain-call'

// Lib
import { FORBIDDEN_MESSAGE } from '@/lib/api-error-message'

// As listas vêm em páginas de até 100 (teto da API)
const PAGE_SIZE = 100
const MAX_PAGES = 20

const STATUS_FILTERS: AssetStatusFilter[] = [
  'ativos',
  'em-depreciacao',
  'em-revisao',
  'inconsistencias',
  'inativos',
]
const KINDS: AssetKind[] = ['MACHINES', 'FURNITURE', 'VEHICLES']

type Result<T> = { success: boolean; data: T; message: string }
type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
  compositions?: AssetComposition[]
}

const ok = <T>(data: T): Result<T> => ({ success: true, data, message: '' })
const fail = <T>(res: ApiResult, data: T): Result<T> => ({
  success: false,
  data,
  message: res.message || 'Não foi possível concluir.',
})
const refuse = <T>(message: string, data: T) =>
  fail({ success: false, message }, data)

// O id entra no caminho da rota: nada de "/" ou "?" vindo da URL da tela
const seg = (id: string) => encodeURIComponent(id)

// As duas rotas que recusam com 409 e a lista das composições afetadas
// (P-16): os helpers de _cruds descartam os campos do erro, e o domainCall
// os guarda em `details`
const withCompositions = async (
  method: 'patch' | 'delete',
  route: string,
  data?: unknown,
): Promise<ApiResult> => {
  const res = await domainCall((api) =>
    method === 'patch' ? api.patch(route, data) : api.delete(route),
  )
  if (res.success) return { success: true, data: res.data }
  const compositions = res.details?.compositions
  return {
    success: false,
    // O 403 do Nest sem motivo chega como "Forbidden resource"
    message:
      res.status === 403 && /^Forbidden/.test(res.message ?? '')
        ? FORBIDDEN_MESSAGE
        : res.message,
    compositions: Array.isArray(compositions)
      ? (compositions as AssetComposition[])
      : undefined,
  }
}

const dateOf = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : null

/* --------------------------------------------------------------------------
 * Formato da API
 * ------------------------------------------------------------------------ */

// Os campos de valor que saem sem values:values:view
type MoneyField =
  | 'acquisitionValue'
  | 'residualValue'
  | 'depreciableValue'
  | 'monthlyDepreciation'
  | 'depreciatedValue'
  | 'remainingValue'

type ApiItem = Omit<AssetItem, MoneyField | 'sale'> &
  Partial<Pick<AssetItem, MoneyField>> & {
    sale: Partial<AssetSale> | null
  }

type ApiRecord = ApiItem & {
  ownCost?: number | null
  costs?: (Omit<AssetCostItem, 'unitCost' | 'monthlyCost'> & {
    unitCost?: number
    monthlyCost?: number
  })[]
  setups?: (Omit<AssetSetupItem, 'unitCost' | 'salePrice'> & {
    unitCost?: number | null
    salePrice?: number | null
  })[]
  processes?: { id: string; name: string; taskType?: string }[]
}

type ApiGroup = Omit<AssetGroupRow, 'averageCost' | 'inconsistent'> & {
  averageCost?: number | null
  inconsistent?: boolean
}

/* --------------------------------------------------------------------------
 * Para o formato da tela
 * ------------------------------------------------------------------------ */

const toItem = (item: ApiItem): AssetItem => ({
  id: item.id,
  name: item.name,
  imageUrl: item.imageUrl ?? null,
  kind: item.kind,
  sector: item.sector ?? null,
  sectorId: item.sectorId ?? null,
  groupId: item.groupId ?? null,
  group: item.group ?? null,
  detailed: item.detailed,
  unit: item.unit ?? null,
  monthlyProductivity: item.monthlyProductivity ?? null,
  acquisitionDate: dateOf(item.acquisitionDate),
  acquisitionValue: item.acquisitionValue ?? 0,
  usefulLifeMonths: item.usefulLifeMonths ?? null,
  residualPercent: item.residualPercent ?? null,
  residualValue: item.residualValue ?? null,
  depreciableValue: item.depreciableValue ?? null,
  monthlyDepreciation: item.monthlyDepreciation ?? null,
  depreciatedValue: item.depreciatedValue ?? null,
  remainingValue: item.remainingValue ?? null,
  elapsedMonths: item.elapsedMonths ?? 0,
  status: item.status,
  inactivatedAt: item.inactivatedAt ?? null,
  inactiveReason: item.inactiveReason ?? null,
  sale: item.sale
    ? {
        date: dateOf(item.sale.date),
        saleValue: item.sale.saleValue ?? null,
        saleResult: item.sale.saleResult ?? null,
        financialEntryId: item.sale.financialEntryId ?? null,
      }
    : null,
})

const toRecord = (record: ApiRecord): AssetRecord => ({
  ...toItem(record),
  ownCost: record.ownCost ?? null,
  costs: (record.costs ?? []).map((cost) => ({
    id: cost.id,
    name: cost.name,
    nature: cost.nature,
    unitCost: cost.unitCost ?? 0,
    yieldAmount: cost.yieldAmount,
    yieldUnit: cost.yieldUnit,
    financialNatureId: cost.financialNatureId ?? null,
    chartAccount: cost.chartAccount ?? null,
    lastOccurrence: dateOf(cost.lastOccurrence),
    blocksSchedule: !!cost.blocksSchedule,
    blockStart: cost.blockStart ?? null,
    blockMinutes: cost.blockMinutes ?? null,
    monthlyCost: cost.monthlyCost ?? 0,
    setupId: cost.setupId ?? null,
  })),
  setups: (record.setups ?? []).map((setup) => ({
    id: setup.id,
    name: setup.name,
    abbreviation: setup.abbreviation ?? '',
    unit: setup.unit,
    timePerUnit: setup.timePerUnit,
    monthlyProductivity: setup.monthlyProductivity,
    activityHours:
      setup.activityHours ??
      (setup.timePerUnit * setup.monthlyProductivity) / 60,
    unitCost: setup.unitCost ?? null,
    salePrice: setup.salePrice ?? null,
  })),
  processes: (record.processes ?? []).map((process) => ({
    id: process.id,
    name: process.name,
    ...(process.taskType ? { taskType: process.taskType } : {}),
  })),
})

const toGroup = (group: ApiGroup): AssetGroupRow => ({
  id: group.id,
  name: group.name,
  unit: group.unit,
  sector: group.sector ?? null,
  sectorId: group.sectorId ?? null,
  assetCount: group.assetCount ?? 0,
  averageCost: group.averageCost ?? null,
  totalProductivity: group.totalProductivity ?? 0,
  inconsistent: group.inconsistent ?? !group.assetCount,
})

/* --------------------------------------------------------------------------
 * Para o formato da API: só os campos do DTO (a API recusa campo a mais)
 * ------------------------------------------------------------------------ */

const assetBody = (
  values: Partial<AssetFormValues & AssetReviewValues>,
): { [key: string]: unknown } => ({
  ...(values.name !== undefined && { name: values.name.trim() }),
  // A foto vai pela URL do upload; a API recusa data URL (ALT-16)
  ...(values.imageUrl !== undefined && { imageUrl: values.imageUrl || null }),
  ...(values.kind !== undefined && { kind: values.kind }),
  ...(values.sectorId !== undefined && { sectorId: values.sectorId }),
  ...(values.detailed !== undefined && { detailed: values.detailed }),
  ...(values.unit !== undefined && { unit: values.unit }),
  ...(values.monthlyProductivity !== undefined && {
    monthlyProductivity: values.monthlyProductivity,
  }),
  ...(values.acquisitionDate !== undefined && {
    acquisitionDate: dateOf(values.acquisitionDate),
  }),
  ...(values.acquisitionValue !== undefined && {
    acquisitionValue: Math.round(values.acquisitionValue),
  }),
  ...(values.groupId !== undefined && { groupId: values.groupId || null }),
  ...(values.usefulLifeMonths !== undefined && {
    usefulLifeMonths: Math.round(values.usefulLifeMonths),
  }),
  // Percentual com até duas casas
  ...(values.residualPercent !== undefined && {
    residualPercent: Math.round(values.residualPercent * 100) / 100,
  }),
})

// O fixo rende por mês; os variáveis, por unidade (P-19). A configuração só
// vai no variável dela
const costBody = (
  cost: Partial<AssetCostValues>,
): { [key: string]: unknown } => ({
  ...(cost.name !== undefined && { name: cost.name.trim() }),
  ...(cost.nature !== undefined && {
    nature: cost.nature,
    yieldUnit: cost.nature === 'FIXED' ? 'MONTH' : 'UNIT',
    setupId: cost.nature === 'SETUP_VARIABLE' ? cost.setupId || null : null,
  }),
  ...(cost.unitCost !== undefined && {
    unitCost: Math.round(cost.unitCost),
  }),
  ...(cost.yieldAmount !== undefined && { yieldAmount: cost.yieldAmount }),
  ...(cost.financialNatureId !== undefined && {
    financialNatureId: cost.financialNatureId || null,
  }),
  ...(cost.lastOccurrence !== undefined && {
    lastOccurrence: dateOf(cost.lastOccurrence),
  }),
  ...(cost.blocksSchedule !== undefined && {
    blocksSchedule: cost.blocksSchedule,
    blockStart: cost.blocksSchedule ? cost.blockStart || null : null,
    blockMinutes: cost.blocksSchedule ? cost.blockMinutes || null : null,
  }),
})

const setupBody = (
  setup: Partial<AssetSetupValues>,
): { [key: string]: unknown } => ({
  ...(setup.name !== undefined && { name: setup.name.trim() }),
  ...(setup.abbreviation?.trim()
    ? { abbreviation: setup.abbreviation.trim().slice(0, 20) }
    : {}),
  ...(setup.unit !== undefined && { unit: setup.unit }),
  ...(setup.timePerUnit !== undefined && { timePerUnit: setup.timePerUnit }),
  ...(setup.monthlyProductivity !== undefined && {
    monthlyProductivity: setup.monthlyProductivity,
  }),
})

/* --------------------------------------------------------------------------
 * Patrimônios
 * ------------------------------------------------------------------------ */

// A lista do cadastro agrupa por tipo e não pagina: vem inteira. Os filtros
// são os da URL da tela; o que a API não conhece fica de fora
export const getAssets = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const params: { [key: string]: string } = {}
  const status = filters?.status as AssetStatusFilter | undefined
  if (status && STATUS_FILTERS.includes(status)) params.status = status
  if (filters?.sectorId) params.sectorId = filters.sectorId
  const kind = filters?.kind as AssetKind | undefined
  if (kind && KINDS.includes(kind)) params.kind = kind
  const search = filters?.search?.trim().slice(0, 120)
  if (search) params.search = search

  const items: ApiItem[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/asset',
      params: { ...params, page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, [] as AssetItem[])
    items.push(...(res.data?.data ?? []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok(items.map(toItem))
}

// As contagens das abas da situação
export const getAssetQuantity = async () => {
  const empty: AssetQuantity = {
    'em-depreciacao': 0,
    'em-revisao': 0,
    inconsistencias: 0,
    inativos: 0,
  }
  const res: ApiResult = await getItem({ route: '/asset/quantity' })
  if (!res.success) return fail(res, empty)
  return ok<AssetQuantity>({ ...empty, ...(res.data ?? {}) })
}

export const getAsset = async ({ id }: { id: string }) => {
  const res: ApiResult = await getItem({ route: `/asset/${seg(id)}` })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

// Cadastro rápido (P-12): vida útil e residual entram com o padrão da API
export const createAsset = async (values: AssetFormValues) => {
  if (!values.sectorId) {
    return refuse<AssetRecord | null>('Escolha o setor do bem', null)
  }
  const res: ApiResult = await createItemNew({
    route: '/asset',
    data: assetBody(values),
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

// De detalhado para simplificado com configuração usada em composição, a API
// recusa com 409 e a lista das composições: a tela mostra e manda de novo
// com `confirmed` (P-16)
export const updateAsset = async ({
  id,
  confirmed,
  ...values
}: Partial<AssetFormValues & AssetReviewValues> & {
  id: string
  confirmed?: boolean
}) => {
  const res = await withCompositions('patch', `/asset/${seg(id)}`, {
    ...assetBody(values),
    ...(confirmed ? { confirmed: true } : {}),
  })
  if (!res.success) {
    return {
      ...fail<AssetRecord | null>(res, null),
      compositions: res.compositions ?? [],
    }
  }
  return {
    ...ok<AssetRecord | null>(toRecord(res.data)),
    compositions: [] as AssetComposition[],
  }
}

// Inativa ou reativa, nunca exclui. Ao inativar um bem com configuração em
// composição, a API grava e devolve o aviso (P-16)
export const setAssetActive = async ({
  id,
  active,
  reason,
}: {
  id: string
  active: boolean
  reason?: string
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/asset/${seg(id)}/toggle-status`,
    data: {
      active,
      ...(reason?.trim() ? { reason: reason.trim().slice(0, 200) } : {}),
    },
  })
  if (!res.success) {
    return {
      ...fail<AssetRecord | null>(res, null),
      warnings: [] as AssetWarning[],
    }
  }
  return {
    ...ok<AssetRecord | null>(toRecord(res.data)),
    warnings: (res.data?.warnings ?? []) as AssetWarning[],
  }
}

// A venda lança a receita na conta escolhida e inativa o bem (P-25)
export const sellAsset = async ({
  id,
  value,
  date,
  financialNatureId,
  bankAccountId,
}: {
  id: string
  value: number
  date: string
  financialNatureId: string
  bankAccountId?: string | null
}) => {
  if (!financialNatureId) {
    return refuse<AssetSaleResult | null>('Escolha a conta de receita', null)
  }
  const res: ApiResult = await createItemNew({
    route: `/asset/${seg(id)}/sell`,
    data: {
      value: Math.round(value),
      date: dateOf(date),
      financialNatureId,
      ...(bankAccountId ? { bankAccountId } : {}),
    },
  })
  if (!res.success) return fail<AssetSaleResult | null>(res, null)
  return ok<AssetSaleResult | null>({
    received: res.data?.received ?? Math.round(value),
    remaining: res.data?.remaining ?? 0,
    result: res.data?.result ?? 0,
    financialEntryId: res.data?.financialEntryId ?? null,
  })
}

/* --------------------------------------------------------------------------
 * Custos do bem
 * ------------------------------------------------------------------------ */

export const createAssetCost = async ({
  assetId,
  cost,
}: {
  assetId: string
  cost: AssetCostValues
}) => {
  if (cost.nature === 'SETUP_VARIABLE' && !cost.setupId) {
    return refuse<AssetRecord | null>('Escolha a configuração produtiva', null)
  }
  const res: ApiResult = await createItemNew({
    route: `/asset/${seg(assetId)}/cost`,
    data: costBody(cost),
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

export const updateAssetCost = async ({
  assetId,
  costId,
  cost,
}: {
  assetId: string
  costId: string
  cost: Partial<AssetCostValues>
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/asset/${seg(assetId)}/cost/${seg(costId)}`,
    data: costBody(cost),
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

export const deleteAssetCost = async ({
  assetId,
  costId,
}: {
  assetId: string
  costId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/asset/${seg(assetId)}/cost/${seg(costId)}`,
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

/* --------------------------------------------------------------------------
 * Configurações produtivas (só do bem detalhado, na unidade dele)
 * ------------------------------------------------------------------------ */

export const createAssetSetup = async ({
  assetId,
  setup,
}: {
  assetId: string
  setup: AssetSetupValues
}) => {
  const res: ApiResult = await createItemNew({
    route: `/asset/${seg(assetId)}/setup`,
    data: setupBody(setup),
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

export const updateAssetSetup = async ({
  assetId,
  setupId,
  setup,
}: {
  assetId: string
  setupId: string
  setup: Partial<AssetSetupValues>
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/asset/${seg(assetId)}/setup/${seg(setupId)}`,
    data: setupBody(setup),
  })
  if (!res.success) return fail<AssetRecord | null>(res, null)
  return ok<AssetRecord | null>(toRecord(res.data))
}

// A configuração usada em composição não sai: 409 com as composições
export const deleteAssetSetup = async ({
  assetId,
  setupId,
}: {
  assetId: string
  setupId: string
}) => {
  const res = await withCompositions(
    'delete',
    `/asset/${seg(assetId)}/setup/${seg(setupId)}`,
  )
  if (!res.success) {
    return {
      ...fail<AssetRecord | null>(res, null),
      compositions: res.compositions ?? [],
    }
  }
  return {
    ...ok<AssetRecord | null>(toRecord(res.data)),
    compositions: [] as AssetComposition[],
  }
}

/* --------------------------------------------------------------------------
 * Grupos de bens equivalentes (P-5.2, P-13, P-28)
 * ------------------------------------------------------------------------ */

export const getAssetGroups = async () => {
  const groups: ApiGroup[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/asset/group',
      params: { page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, [] as AssetGroupRow[])
    groups.push(...(res.data?.data ?? []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok(groups.map(toGroup))
}

export const createAssetGroup = async ({
  name,
  unit,
  sectorId,
}: {
  name: string
  unit: AssetUnit
  sectorId: string
}) => {
  if (!sectorId) {
    return refuse<{ id: string } | null>('Escolha o setor do grupo', null)
  }
  const res: ApiResult = await createItemNew({
    route: '/asset/group',
    data: { name: name.trim(), unit, sectorId },
  })
  if (!res.success) return fail<{ id: string } | null>(res, null)
  return ok<{ id: string } | null>({ id: res.data?.id as string })
}

export const renameAssetGroup = async ({
  id,
  name,
}: {
  id: string
  name: string
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/asset/group/${seg(id)}`,
    data: { name: name.trim() },
  })
  return res.success ? ok(null) : fail(res, null)
}

// Só o grupo vazio sai; com bem, a API diz quantos tirar antes
export const deleteAssetGroup = async ({ id }: { id: string }) => {
  const res: ApiResult = await deleteItemNew({
    route: `/asset/group/${seg(id)}`,
  })
  return res.success ? ok(null) : fail(res, null)
}

/* --------------------------------------------------------------------------
 * Contas do plano de contas
 * ------------------------------------------------------------------------ */

// O custo do bem e a venda apontam para uma subcategoria do plano de contas:
// de despesa (payable, nível 02) no custo e de receita (receivable, nível
// 01) na venda. A lista é a do próprio patrimônio, que pede só a permissão
// da base de custos (PO, 14/10/2026): o código vem completo e ordenado
export const getAssetAccounts = async ({
  type,
}: {
  type: 'receivable' | 'payable'
}) => {
  const res: ApiResult = await getItem({
    route: `/asset/accounts?type=${type}`,
  })
  if (!res.success) return fail(res, [] as AssetAccount[])
  const rows: AssetAccount[] = Array.isArray(res.data) ? res.data : []
  return ok(
    rows.map((account) => ({
      id: account.id,
      code: account.code ?? '',
      description: account.description ?? '',
      label:
        account.label ??
        [account.code, account.description].filter(Boolean).join(' — '),
    })),
  )
}

/* --------------------------------------------------------------------------
 * Leituras do contador (hodômetro, horímetro, contador de m²): a diferença
 * entre elas é o volume do bem no período, no comparativo da base de custos
 * ------------------------------------------------------------------------ */

export const getAssetReadings = async ({ assetId }: { assetId: string }) => {
  const empty = {
    unit: null as AssetUnit | null,
    readings: [] as AssetReading[],
  }
  const res: ApiResult = await getItem({
    route: `/asset/${seg(assetId)}/readings`,
    params: { page: '1', limit: String(PAGE_SIZE) },
  })
  if (!res.success) return fail(res, empty)
  const rows: { [key: string]: unknown }[] = Array.isArray(res.data?.data)
    ? res.data.data
    : []
  return ok({
    unit: (res.data?.unit ?? null) as AssetUnit | null,
    readings: rows.map(
      (row): AssetReading => ({
        id: String(row.id ?? ''),
        date: String(row.date ?? ''),
        value: Number(row.value) || 0,
        createdByName: String(row.createdByName ?? ''),
      }),
    ),
  })
}

export const createAssetReading = async ({
  assetId,
  date,
  value,
}: {
  assetId: string
  date: string
  value: number
}) => {
  if (!date) return refuse<null>('Informe a data da leitura', null)
  if (!Number.isFinite(value)) {
    return refuse<null>('Informe o que o contador marca', null)
  }
  const res: ApiResult = await createItemNew({
    route: `/asset/${seg(assetId)}/readings`,
    data: { date, value },
  })
  if (!res.success) return fail<null>(res, null)
  return ok<null>(null)
}

export const deleteAssetReading = async ({
  assetId,
  readingId,
}: {
  assetId: string
  readingId: string
}) => {
  const res: ApiResult = await deleteItemNew({
    route: `/asset/${seg(assetId)}/readings/${seg(readingId)}`,
  })
  if (!res.success) return fail<null>(res, null)
  return ok<null>(null)
}

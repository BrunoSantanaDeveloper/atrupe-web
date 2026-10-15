'use server'

// Base de custos (recurso do PRO, módulo 4): as rotas /cost-base da API. Tudo
// ali é valor: sem values:values:view a API recusa (403), e as páginas já
// pedem a permissão. Dinheiro em centavos dos dois lados; percentual em % com
// até duas casas (a API recusa mais). O rateio entre os equipamentos do setor
// fica em sector-allocation.ts. Toda resposta traz o mês de referência
// (AAAA-MM), o último mês completo.

// Types
import type {
  CostCriterion,
  CostSummary,
  SectorCost,
  SectorNature,
  SectorCostOrigin,
  AllocationCriterion,
  LaborSector,
  LaborResponse,
  ExpenseAllocation,
  AdminExpenseAccount,
  AdminExpensesResponse,
  AdminExpensesTotals,
  DistributionResponse,
  DistributionTotals,
  SectorCostsResponse,
  DepreciationTotals,
  ComparisonAccount,
  ComparisonResponse,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Actions
import { getItem, putItemNew, updateItemNew } from '@/actions/_cruds'

// As listas vêm em páginas de até 100 (teto da API). As despesas
// administrativas cabem numa página (poucas dezenas de contas); o laço é só
// para não cortar uma base maior
const PAGE_SIZE = 100
const MAX_PAGES = 20

const CRITERIA: CostCriterion[] = [
  'LAST_MONTH',
  'AVG_3',
  'AVG_6',
  'AVG_12',
  'MANUAL',
]
const PERIODS = ['1', '3', '6', '12']
const COMPARISON_STATUSES = ['todas', 'com-previsao', 'sem-previsao']

type Result<T> = { success: boolean; data: T; message: string }
type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T): Result<T> => ({ success: true, data, message: '' })
const fail = <T>(res: ApiResult, data: T): Result<T> => ({
  success: false,
  data,
  message: res.message || 'Não foi possível concluir.',
})

// O id entra no caminho da rota: nada de "/" ou "?" vindo da tela
const seg = (id: string) => encodeURIComponent(id)

// Sem cálculo o valor vem nulo, e a tela mostra `-`, nunca R$ 0,00
const numOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const num = (value: unknown) => numOrNull(value) ?? 0

// Percentual com até duas casas: a API recusa mais (BC-9)
const twoPlaces = (value: number) =>
  Math.round((Number(value) || 0) * 100) / 100

/* --------------------------------------------------------------------------
 * Formato da API para o da tela: só os campos que a tela lê
 * ------------------------------------------------------------------------ */

type ApiRow = { [key: string]: unknown }
const rowsOf = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? (value as ApiRow[]) : []

const toAccount = (account: ApiRow): AdminExpenseAccount => ({
  id: String(account.id ?? ''),
  name: String(account.name ?? ''),
  chartAccount: String(account.chartAccount ?? ''),
  lastMonth: numOrNull(account.lastMonth),
  avg3: numOrNull(account.avg3),
  avg6: numOrNull(account.avg6),
  avg12: numOrNull(account.avg12),
  criterion: account.criterion as CostCriterion,
  manualValue: numOrNull(account.manualValue),
  referenceValue: numOrNull(account.referenceValue),
  allocations: rowsOf(account.allocations).map((share) => ({
    sectorId: String(share.sectorId ?? ''),
    sectorName: String(share.sectorName ?? ''),
    percentage: num(share.percentage),
    value: num(share.value),
  })),
  allocatedValue: num(account.allocatedValue),
  remainder: numOrNull(account.remainder),
})

const toExpenseAllocation = (allocation: ApiRow): ExpenseAllocation => ({
  accountId: String(allocation.accountId ?? ''),
  accountName: String(allocation.accountName ?? ''),
  referenceValue: num(allocation.referenceValue),
  sectors: rowsOf(allocation.sectors).map((sector) => ({
    id: String(sector.id ?? ''),
    name: String(sector.name ?? ''),
    ownCost: numOrNull(sector.ownCost),
    percentage: num(sector.percentage),
  })),
})

const toDistribution = (body: ApiRow): DistributionResponse => {
  const totals = (body.totals ?? {}) as ApiRow

  return {
    referenceMonth: String(body.referenceMonth ?? ''),
    sectors: rowsOf(body.sectors).map((sector) => ({
      id: String(sector.id ?? ''),
      name: String(sector.name ?? ''),
      nature: sector.nature as SectorNature,
      percentage: num(sector.percentage),
      directCost: numOrNull(sector.directCost),
    })),
    totals: {
      administrativeCost: num(totals.administrativeCost),
      allocatedByItem: num(totals.allocatedByItem),
      distributedCost: num(totals.distributedCost),
      notDistributedCost: num(totals.notDistributedCost),
      receivingSectors: num(totals.receivingSectors),
    },
  }
}

const toSectorCost = (sector: ApiRow): SectorCost => ({
  id: String(sector.id ?? ''),
  name: String(sector.name ?? ''),
  nature: sector.nature as SectorNature,
  labor: numOrNull(sector.labor),
  assets: numOrNull(sector.assets),
  depreciation: numOrNull(sector.depreciation),
  other: numOrNull(sector.other),
  ownCost: numOrNull(sector.ownCost),
  receivedCost: numOrNull(sector.receivedCost),
  totalCost: numOrNull(sector.totalCost),
  // Sem critério gravado vale o valor de aquisição, a regra base (BC-3)
  allocationCriterion: (sector.allocationCriterion ??
    'ACQUISITION_VALUE') as AllocationCriterion,
  items: rowsOf(sector.items).map((item) => ({
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    origin: item.origin as SectorCostOrigin,
    detail: String(item.detail ?? ''),
    value: num(item.value),
  })),
})

const toLaborSector = (sector: ApiRow): LaborSector => ({
  id: String(sector.id ?? ''),
  name: String(sector.name ?? ''),
  distributedCost: numOrNull(sector.distributedCost),
  hours: numOrNull(sector.hours),
  costPerHour: numOrNull(sector.costPerHour),
  salePrice: numOrNull(sector.salePrice),
  margin: numOrNull(sector.margin),
  collaborators: rowsOf(sector.collaborators).map((person) => ({
    id: String(person.id ?? ''),
    name: String(person.name ?? ''),
    role: String(person.role ?? ''),
    hours: num(person.hours),
  })),
})

const toComparisonAccount = (account: ApiRow): ComparisonAccount => ({
  id: String(account.id ?? ''),
  chartAccount: String(account.chartAccount ?? ''),
  name: String(account.name ?? ''),
  estimated: numOrNull(account.estimated),
  actual: numOrNull(account.actual),
  difference: numOrNull(account.difference),
  differencePercent: numOrNull(account.differencePercent),
  sources: rowsOf(account.sources).map((source) => ({
    id: String(source.id ?? ''),
    name: String(source.name ?? ''),
    detail: String(source.detail ?? ''),
    value: num(source.value),
  })),
})

/* --------------------------------------------------------------------------
 * Despesas administrativas
 * ------------------------------------------------------------------------ */

// A lista é plana, sem grupo (decisão de 22/09/2026). Os filtros são os da
// URL da tela; o que a API não conhece fica de fora
export const getAdminExpenses = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const empty: AdminExpensesResponse = { referenceMonth: '', accounts: [] }
  const params: { [key: string]: string } = {}
  const criterion = filters?.criterion as CostCriterion | undefined
  if (criterion && CRITERIA.includes(criterion)) params.criterion = criterion
  const search = filters?.search?.trim().slice(0, 120)
  if (search) params.search = search

  let referenceMonth = ''
  const accounts: AdminExpenseAccount[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/cost-base/admin-expense',
      params: { ...params, page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, empty)
    referenceMonth = res.data?.referenceMonth ?? referenceMonth
    accounts.push(...rowsOf(res.data?.data).map(toAccount))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok<AdminExpensesResponse>({ referenceMonth, accounts })
}

export const getAdminExpensesTotals = async () => {
  const empty: AdminExpensesTotals = {
    total: 0,
    byAverage: 0,
    manual: 0,
    referenceValue: 0,
    allocatedValue: 0,
    remainingValue: 0,
  }
  const res: ApiResult = await getItem({
    route: '/cost-base/admin-expense/totals',
  })
  if (!res.success) return fail(res, empty)
  return ok<AdminExpensesTotals>({
    total: num(res.data?.total),
    byAverage: num(res.data?.byAverage),
    manual: num(res.data?.manual),
    referenceValue: num(res.data?.referenceValue),
    allocatedValue: num(res.data?.allocatedValue),
    remainingValue: num(res.data?.remainingValue),
  })
}

// Grava na hora (DC-17). Fora do manual o valor não vai: a API grava nulo
export const updateAdminExpenseCriterion = async ({
  id,
  criterion,
  manualValue,
}: {
  id: string
  criterion: CostCriterion
  manualValue?: number | null
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/cost-base/admin-expense/${seg(id)}`,
    data:
      criterion === 'MANUAL'
        ? {
            criterion,
            manualValue:
              typeof manualValue === 'number' ? Math.round(manualValue) : null,
          }
        : { criterion },
  })
  if (!res.success) return fail<AdminExpenseAccount | null>(res, null)
  return ok<AdminExpenseAccount | null>(toAccount(res.data ?? {}))
}

// --- Rateio por item (BC-8): a conta entre os setores produtivos ---------

export const getExpenseAllocation = async ({ id }: { id: string }) => {
  const res: ApiResult = await getItem({
    route: `/cost-base/admin-expense/${seg(id)}/allocation`,
  })
  if (!res.success) return fail<ExpenseAllocation | null>(res, null)
  return ok<ExpenseAllocation | null>(toExpenseAllocation(res.data ?? {}))
}

// A soma pode ficar abaixo de 100% (a sobra volta ao administrativo), mas não
// passar: a API confere pelo valor, com 1 centavo de tolerância (BC-9)
export const updateExpenseAllocation = async ({
  id,
  percentages,
}: {
  id: string
  percentages: { sectorId: string; percentage: number }[]
}) => {
  const res: ApiResult = await putItemNew({
    route: `/cost-base/admin-expense/${seg(id)}/allocation`,
    data: {
      allocations: percentages.map(({ sectorId, percentage }) => ({
        sectorId,
        percentage: twoPlaces(percentage),
      })),
    },
  })
  if (!res.success) return fail<ExpenseAllocation | null>(res, null)
  return ok<ExpenseAllocation | null>(toExpenseAllocation(res.data ?? {}))
}

/* --------------------------------------------------------------------------
 * Distribuição do administrativo (BC-5, BC-7)
 * ------------------------------------------------------------------------ */

const emptyTotals: DistributionTotals = {
  administrativeCost: 0,
  allocatedByItem: 0,
  distributedCost: 0,
  notDistributedCost: 0,
  receivingSectors: 0,
}

// Setores e totais vêm juntos: a tela lê os dois sempre ao mesmo tempo
export const getDistribution = async () => {
  const res: ApiResult = await getItem({ route: '/cost-base/distribution' })
  if (!res.success) {
    return fail<DistributionResponse>(res, {
      referenceMonth: '',
      sectors: [],
      totals: emptyTotals,
    })
  }
  return ok<DistributionResponse>(toDistribution(res.data ?? {}))
}

// Só os produtivos: administrativo recebe 400, e o produtivo que não vier
// fica com zero. A resposta já vem recalculada
export const updateDistribution = async ({
  percentages,
}: {
  percentages: { id: string; percentage: number }[]
}) => {
  const res: ApiResult = await putItemNew({
    route: '/cost-base/distribution',
    data: {
      percentages: percentages.map(({ id, percentage }) => ({
        id,
        percentage: twoPlaces(percentage),
      })),
    },
  })
  if (!res.success) return fail<DistributionResponse | null>(res, null)
  return ok<DistributionResponse | null>(toDistribution(res.data ?? {}))
}

/* --------------------------------------------------------------------------
 * Por setor e Resumo: o mesmo cálculo, consolidado no Resumo
 * ------------------------------------------------------------------------ */

export const getSectorCosts = async () => {
  const res: ApiResult = await getItem({ route: '/cost-base/sector' })
  if (!res.success) {
    return fail<SectorCostsResponse>(res, {
      referenceMonth: '',
      isDistributing: false,
      sectors: [],
    })
  }
  return ok<SectorCostsResponse>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    isDistributing: !!res.data?.isDistributing,
    sectors: rowsOf(res.data?.sectors).map(toSectorCost),
  })
}

export const getCostSummary = async () => {
  const res: ApiResult = await getItem({ route: '/cost-base/summary' })
  if (!res.success) return fail<CostSummary | null>(res, null)
  const byOrigin = (res.data?.byOrigin ?? {}) as ApiRow
  return ok<CostSummary | null>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    total: num(res.data?.total),
    byOrigin: {
      adminExpenses: num(byOrigin.adminExpenses),
      labor: num(byOrigin.labor),
      assets: num(byOrigin.assets),
      depreciation: num(byOrigin.depreciation),
    },
    productiveCost: num(res.data?.productiveCost),
    administrativeCost: num(res.data?.administrativeCost),
    distributedCost: num(res.data?.distributedCost),
    bySector: rowsOf(res.data?.bySector).map((sector) => ({
      id: String(sector.id ?? ''),
      name: String(sector.name ?? ''),
      value: num(sector.value),
    })),
  })
}

/* --------------------------------------------------------------------------
 * Mão de obra (F-11): custo do setor pela carga dos colaboradores
 * ------------------------------------------------------------------------ */

export const getLaborSectors = async () => {
  const res: ApiResult = await getItem({ route: '/cost-base/labor' })
  if (!res.success) {
    return fail<LaborResponse>(res, { referenceMonth: '', sectors: [] })
  }
  return ok<LaborResponse>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    sectors: rowsOf(res.data?.data).map(toLaborSector),
  })
}

// A API arredonda ao minuto e recusa colaborador de outro setor
export const updateLaborHours = async ({
  sectorId,
  hours,
}: {
  sectorId: string
  hours: { id: string; hours: number }[]
}) => {
  const res: ApiResult = await putItemNew({
    route: `/cost-base/labor/${seg(sectorId)}/hours`,
    // Só os campos do corpo: a API recusa campo a mais
    data: {
      hours: hours.map(({ id, hours: value }) => ({ id, hours: value })),
    },
  })
  if (!res.success) return fail<LaborSector | null>(res, null)
  return ok<LaborSector | null>(toLaborSector(res.data ?? {}))
}

/* --------------------------------------------------------------------------
 * Patrimônios: a lista e as contagens vêm do cadastro (actions/asset.ts);
 * aqui ficam só os totais do topo
 * ------------------------------------------------------------------------ */

export const getDepreciationTotals = async () => {
  const empty: DepreciationTotals = {
    invested: 0,
    depreciated: 0,
    remaining: 0,
    monthlyDepreciation: 0,
    activeAssets: 0,
  }
  const res: ApiResult = await getItem({ route: '/cost-base/depreciation' })
  if (!res.success) return fail(res, empty)
  return ok<DepreciationTotals>({
    invested: num(res.data?.invested),
    depreciated: num(res.data?.depreciated),
    remaining: num(res.data?.remaining),
    monthlyDepreciation: num(res.data?.monthlyDepreciation),
    activeAssets: num(res.data?.activeAssets),
  })
}

/* --------------------------------------------------------------------------
 * Comparativo: previsto × realizado no período (§10)
 * ------------------------------------------------------------------------ */

// Uma página por vez: a tela pagina pela URL
export const getCostComparison = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const period = PERIODS.includes(filters?.period ?? '')
    ? (filters?.period as string)
    : '12'
  const status = COMPARISON_STATUSES.includes(filters?.status ?? '')
    ? (filters?.status as string)
    : 'todas'
  const page = Math.max(Math.floor(Number(filters?.page) || 1), 1)

  const res: ApiResult = await getItem({
    route: '/cost-base/comparison',
    params: {
      period,
      status,
      page: String(page),
      limit: String(PAGE_SIZE),
    },
  })
  if (!res.success) {
    return fail<ComparisonResponse>(res, {
      referenceMonth: '',
      period,
      months: [],
      accounts: [],
      coverage: { total: 0, withEstimate: 0, withoutEstimate: 0 },
      page: 1,
      lastPage: 1,
      total: 0,
    })
  }
  const coverage = (res.data?.coverage ?? {}) as ApiRow
  return ok<ComparisonResponse>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    period: String(res.data?.period ?? period),
    months: Array.isArray(res.data?.months) ? res.data.months.map(String) : [],
    // A lista sai em `data` na API
    accounts: rowsOf(res.data?.data).map(toComparisonAccount),
    coverage: {
      total: num(coverage.total),
      withEstimate: num(coverage.withEstimate),
      withoutEstimate: num(coverage.withoutEstimate),
    },
    page: num(res.data?.page) || 1,
    lastPage: num(res.data?.lastPage) || 1,
    total: num(res.data?.total),
  })
}

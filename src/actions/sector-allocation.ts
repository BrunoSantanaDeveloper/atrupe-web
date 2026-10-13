'use server'

// Rateio do custo do setor entre os seus equipamentos detalhados (BC-3,
// BC-3.1, BC-4): as rotas /cost-base/sector/allocation da API. O servidor faz
// a conta e devolve o custo pronto de cada equipamento (SEG-1); a tela só
// simula com os números que recebeu, e a API confere de novo ao salvar.
// Dinheiro em centavos. O percentual manual aceita mais de duas casas (BC-9),
// para o equipamento receber o valor que foi arredondado à mão.
//
// A Precificação e a composição ainda leem o rateio do exemplo em memória
// (sector-allocation-data.ts) até serem ligadas à API.

// Types
import type {
  AllocationCriterion,
  AllocationEquipment,
  SectorAllocation,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Actions
import { getItem, putItemNew } from '@/actions/_cruds'

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

const numOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const num = (value: unknown) => numOrNull(value) ?? 0

type ApiRow = { [key: string]: unknown }
const rowsOf = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? (value as ApiRow[]) : []

const toEquipment = (item: ApiRow): AllocationEquipment => {
  const shares = (item.shares ?? {}) as ApiRow

  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    acquisitionValue: num(item.acquisitionValue),
    activityHours: num(item.activityHours),
    ownCost: num(item.ownCost),
    // O que cada critério daria; nulo quando o critério não tem como
    // repartir (nenhum tempo informado) ou, no manual, quando não é o em uso
    shares: {
      ACQUISITION_VALUE: numOrNull(shares.ACQUISITION_VALUE),
      ACTIVITY_TIME: numOrNull(shares.ACTIVITY_TIME),
      MANUAL: numOrNull(shares.MANUAL),
    },
    share: num(item.share),
    monthlyCost: num(item.monthlyCost),
    hourCost: numOrNull(item.hourCost),
  }
}

const toAllocation = (allocation: ApiRow): SectorAllocation => ({
  sectorId: String(allocation.sectorId ?? ''),
  sectorName: String(allocation.sectorName ?? ''),
  criterion: (allocation.criterion ??
    'ACQUISITION_VALUE') as AllocationCriterion,
  previousCriterion: (allocation.previousCriterion ??
    null) as SectorAllocation['previousCriterion'],
  allocationOutdated: !!allocation.allocationOutdated,
  pool: num(allocation.pool),
  equipment: rowsOf(allocation.equipment).map(toEquipment),
  missingTime: Array.isArray(allocation.missingTime)
    ? allocation.missingTime.map(String)
    : [],
})

// Os setores produtivos que têm equipamento detalhado: são os que têm o que
// ratear entre equipamentos (P-15, P-16)
export const getSectorAllocations = async () => {
  const res: ApiResult = await getItem({
    route: '/cost-base/sector/allocation',
  })
  if (!res.success) return fail(res, [] as SectorAllocation[])
  return ok(rowsOf(res.data?.data).map(toAllocation))
}

// Fora do manual vai só o critério. No manual, um percentual para cada
// equipamento do setor, fechando 100% pelo valor (BC-3.1): a API confere e
// diz qual equipamento faltou. Na tela o item chama `id`; na API, `assetId`
export const updateSectorAllocation = async ({
  sectorId,
  criterion,
  percentages,
}: {
  sectorId: string
  criterion: AllocationCriterion
  // Só no critério manual: o percentual de cada equipamento
  percentages?: { id: string; percentage: number }[]
}) => {
  const res: ApiResult = await putItemNew({
    route: `/cost-base/sector/${seg(sectorId)}/allocation`,
    data:
      criterion === 'MANUAL'
        ? {
            criterion,
            percentages: (percentages ?? []).map(({ id, percentage }) => ({
              assetId: id,
              percentage,
            })),
          }
        : { criterion },
  })
  if (!res.success) return fail<SectorAllocation | null>(res, null)
  return ok<SectorAllocation | null>(toAllocation(res.data ?? {}))
}

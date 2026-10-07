// PROVISÓRIO: o rateio do custo do setor entre os seus equipamentos (BC-3,
// BC-3.1, BC-4), em memória. Fica num módulo comum, sem 'use server', porque
// três telas leem o mesmo número: a Base de custos (que configura), a
// Precificação (custo da máquina) e a composição (custo da linha de máquina).
// Com a API, o servidor faz esta conta e devolve o custo pronto (SEG-1).

// Types
import type {
  AllocationCriterion,
  AllocationEquipment,
  SectorAllocation,
} from '@/app/(app-sidebar)/base-de-custos/types'
import type { Asset } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Data
import { assets } from './assets-data'
import { sectors, sectorCostItems, administrativeCost } from './cost-base-data'

type AutomaticCriterion = Exclude<AllocationCriterion, 'MANUAL'>

type SectorConfig = {
  criterion: AllocationCriterion
  previousCriterion: AutomaticCriterion | null
  // Percentual por equipamento, só no critério manual
  manual: { [equipmentId: string]: number }
}

// O critério de cada setor. Sem configuração vale o valor de aquisição, a
// regra base (BC-3); a Impressão do exemplo já usa o tempo de atividade
const configs: { [sectorId: string]: SectorConfig } = {
  impressao: {
    criterion: 'ACTIVITY_TIME',
    previousCriterion: null,
    manual: {},
  },
}

export const configOf = (sectorId: string): SectorConfig =>
  configs[sectorId] || {
    criterion: 'ACQUISITION_VALUE',
    previousCriterion: null,
    manual: {},
  }

export const saveConfig = (sectorId: string, config: SectorConfig) => {
  configs[sectorId] = config
}

// Só o patrimônio detalhado recebe rateio entre equipamentos (P-15, P-16): o
// simplificado não tem produtividade e entra como custo a repartir
export const equipmentOf = (sectorName: string) =>
  assets.filter(
    (asset) =>
      asset.sector === sectorName &&
      asset.detailed &&
      asset.status !== 'INACTIVE',
  )

// Tempo de atividade do mês em horas (BC-2): tempo por unidade (min) ×
// produtividade de cada configuração produtiva
const setupHours = (setup: Asset['setups'][number]) =>
  (setup.timePerUnit * setup.monthlyProductivity) / 60

const activityHours = (asset: Asset) =>
  asset.setups.reduce((sum, setup) => sum + setupHours(setup), 0)

const ownCostOf = (asset: Asset) =>
  (asset.monthlyDepreciation || 0) +
  asset.costs.reduce((sum, cost) => sum + cost.monthlyCost, 0)

// O que o setor custa além dos próprios equipamentos detalhados: bens
// simplificados, lançamentos diretos e o administrativo que ele recebe
const poolOf = (sectorId: string, equipment: Asset[]) => {
  const names = equipment.map((asset) => asset.name)
  const items = (sectorCostItems[sectorId] || []).filter(
    (item) => !names.includes(item.name),
  )
  const sector = sectors.find((item) => item.id === sectorId)
  const received =
    sector?.nature === 'PRODUCTIVE'
      ? Math.round((administrativeCost() * sector.percentage) / 100)
      : 0

  return items.reduce((sum, item) => sum + item.value, 0) + received
}

// Percentuais com duas casas que fecham 100: a sobra do arredondamento vai
// para o maior, para a soma não ficar em 99,99%
const toPercentages = (weights: number[]) => {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  if (!total) return weights.map(() => null)

  const shares = weights.map(
    (weight) => Math.round((weight / total) * 10000) / 100,
  )
  const gap =
    Math.round((100 - shares.reduce((sum, share) => sum + share, 0)) * 100) /
    100
  const biggest = shares.indexOf(Math.max(...shares))
  shares[biggest] = Math.round((shares[biggest] + gap) * 100) / 100

  return shares
}

export const automaticShares = (
  equipment: Asset[],
  criterion: AutomaticCriterion,
) =>
  toPercentages(
    equipment.map((asset) =>
      criterion === 'ACQUISITION_VALUE'
        ? asset.acquisitionValue
        : activityHours(asset),
    ),
  )

// O percentual de cada equipamento pelo critério pedido. O tempo de
// atividade sem nenhum tempo informado cai na regra base (ORG-33)
const sharesBy = (
  equipment: Asset[],
  criterion: AllocationCriterion,
  config: SectorConfig,
): number[] => {
  if (criterion === 'MANUAL') {
    return equipment.map((asset) => config.manual[asset.id] ?? 0)
  }

  const shares = automaticShares(equipment, criterion)
  if (shares.every((share) => share === null)) {
    return automaticShares(equipment, 'ACQUISITION_VALUE').map(
      (share) => share ?? 0,
    )
  }

  return shares.map((share) => share ?? 0)
}

export const sectorAllocation = (sectorId: string): SectorAllocation | null => {
  const sector = sectors.find((item) => item.id === sectorId)
  if (!sector) return null

  const config = configOf(sectorId)
  const equipment = equipmentOf(sector.name)
  const pool = poolOf(sectorId, equipment)
  const inUse = sharesBy(equipment, config.criterion, config)
  const byAcquisition = automaticShares(equipment, 'ACQUISITION_VALUE')
  const byActivity = automaticShares(equipment, 'ACTIVITY_TIME')

  const rows: AllocationEquipment[] = equipment.map((asset, index) => {
    const hours = activityHours(asset)
    const monthlyCost =
      ownCostOf(asset) + Math.round((pool * inUse[index]) / 100)

    return {
      id: asset.id,
      name: asset.name,
      acquisitionValue: asset.acquisitionValue,
      activityHours: Math.round(hours * 100) / 100,
      ownCost: ownCostOf(asset),
      shares: {
        ACQUISITION_VALUE: byAcquisition[index],
        ACTIVITY_TIME: byActivity[index],
        MANUAL:
          config.criterion === 'MANUAL' ? (config.manual[asset.id] ?? 0) : null,
      },
      share: inUse[index],
      monthlyCost,
      hourCost: hours ? Math.round(monthlyCost / hours) : null,
    }
  })

  return {
    sectorId,
    sectorName: sector.name,
    criterion: config.criterion,
    previousCriterion: config.previousCriterion,
    pool,
    equipment: rows,
    missingTime: equipment
      .filter((asset) => !activityHours(asset))
      .map((asset) => asset.name),
  }
}

// Custo do equipamento no mês por um critério qualquer
const equipmentCost = (
  sectorId: string,
  assetId: string,
  criterion: AllocationCriterion,
) => {
  const sector = sectors.find((item) => item.id === sectorId)
  if (!sector) return null

  const equipment = equipmentOf(sector.name)
  const index = equipment.findIndex((asset) => asset.id === assetId)
  if (index < 0) return null

  const shares = sharesBy(equipment, criterion, configOf(sectorId))

  return (
    ownCostOf(equipment[index]) +
    (poolOf(sectorId, equipment) * shares[index]) / 100
  )
}

// Quanto o custo de uma configuração produtiva muda com o rateio manual. Os
// custos unitários de exemplo (Precificação, composição, patrimônio) estão
// pelo critério automático que o setor usava; no manual, a parte do setor
// que o equipamento recebe muda, e o custo da configuração acompanha na
// mesma proporção (a divisão entre as configurações continua pelo tempo de
// atividade). Fora do manual, 1: nada muda.
export const allocationFactor = (setupId: string) => {
  const asset = assets.find((item) =>
    item.setups.some((setup) => setup.id === setupId),
  )
  const sector = asset && sectors.find((item) => item.name === asset.sector)
  if (!asset || !sector) return 1

  const config = configOf(sector.id)
  if (config.criterion !== 'MANUAL') return 1

  const before = equipmentCost(
    sector.id,
    asset.id,
    config.previousCriterion || 'ACQUISITION_VALUE',
  )
  const now = equipmentCost(sector.id, asset.id, 'MANUAL')

  return before && now !== null ? now / before : 1
}

// O custo unitário de exemplo de uma configuração, já com o rateio manual
export const allocatedUnitCost = (setupId: string, unitCost: number) =>
  Math.round(unitCost * allocationFactor(setupId))

// Recursos de máquina da composição e itens da Precificação que são uma
// configuração produtiva de um patrimônio (com a API, a linha guarda só a
// referência ao recurso e o custo vem do cadastro, CP-21)
export const SETUP_BY_RESOURCE: { [resourceId: string]: string } = {
  // Precificação › Máquinas
  'sublimatica-standart': 's1',
  'solvente-4passes': 's2',
  // Composição: as opções da linha de máquina
  solv4: 's2',
  solv6: 's3',
}

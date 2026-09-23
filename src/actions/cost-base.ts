'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da Base de custos (recurso do
// PRO). Estas actions devolvem dados de exemplo em memória, no mesmo formato
// `{ success, data, message }` das actions reais, para a interface ser
// desenvolvida e revisada. Trocar por `getData`/`updateItemNew` quando os
// endpoints existirem; as telas não precisam mudar.

// Types
import type {
  CostCriterion,
  AdminExpenseAccount,
  AdminExpenseGroup,
  AdminExpensesResponse,
  AdminExpensesTotals,
  DistributionSector,
  DistributionResponse,
  DistributionTotals,
  SectorCostItem,
  SectorCostOrigin,
  SectorCostsResponse,
  CostSummary,
  LaborSector,
  LaborCollaborator,
  AssetStatus,
  DepreciationAsset,
  DepreciationTotals,
  ComparisonSource,
  ComparisonResponse,
} from '@/app/(app-sidebar)/base-de-custos/types'

const REFERENCE_MONTH = '2026-08'

const groups: AdminExpenseGroup[] = [
  { id: 'ocupacao', name: 'Ocupação' },
  { id: 'utilidades', name: 'Utilidades' },
  { id: 'servicos', name: 'Serviços contratados' },
  { id: 'financeiras', name: 'Despesas financeiras' },
  { id: 'escritorio', name: 'Escritório' },
]

type Seed = Omit<AdminExpenseAccount, 'referenceValue'>

const accounts: Seed[] = [
  {
    id: '1',
    name: 'Aluguel',
    chartAccount: 'Despesas administrativas',
    groupId: 'ocupacao',
    lastMonth: 880000,
    avg3: 873333,
    avg6: 866667,
    avg12: 870000,
    criterion: 'AVG_6',
    manualValue: null,
  },
  {
    id: '2',
    name: 'Condomínio',
    chartAccount: 'Despesas administrativas',
    groupId: 'ocupacao',
    lastMonth: 65000,
    avg3: 65000,
    avg6: 64200,
    avg12: 62500,
    criterion: 'LAST_MONTH',
    manualValue: null,
  },
  {
    id: '3',
    name: 'IPTU',
    chartAccount: 'Impostos e taxas',
    groupId: 'ocupacao',
    lastMonth: 0,
    avg3: 0,
    avg6: 38000,
    avg12: 38000,
    criterion: 'AVG_12',
    manualValue: null,
  },
  {
    id: '4',
    name: 'Energia elétrica',
    chartAccount: 'Despesas administrativas',
    groupId: 'utilidades',
    lastMonth: 215000,
    avg3: 208000,
    avg6: 213000,
    avg12: 212000,
    criterion: 'AVG_12',
    manualValue: null,
  },
  {
    id: '5',
    name: 'Água e esgoto',
    chartAccount: 'Despesas administrativas',
    groupId: 'utilidades',
    lastMonth: 18500,
    avg3: 17900,
    avg6: 17600,
    avg12: 17200,
    criterion: 'AVG_6',
    manualValue: null,
  },
  {
    id: '6',
    name: 'Internet',
    chartAccount: 'Despesas administrativas',
    groupId: 'utilidades',
    lastMonth: 22000,
    avg3: 22000,
    avg6: 21500,
    avg12: 21000,
    criterion: 'LAST_MONTH',
    manualValue: null,
  },
  {
    id: '7',
    name: 'Contabilidade',
    chartAccount: 'Serviços de terceiros',
    groupId: 'servicos',
    lastMonth: 39000,
    avg3: 39000,
    avg6: 39000,
    avg12: 37500,
    criterion: 'LAST_MONTH',
    manualValue: null,
  },
  {
    id: '8',
    name: 'Sistemas e assinaturas',
    chartAccount: 'Serviços de terceiros',
    groupId: 'servicos',
    lastMonth: 48900,
    avg3: 47300,
    avg6: null,
    avg12: null,
    criterion: 'AVG_3',
    manualValue: null,
  },
  {
    id: '9',
    name: 'Limpeza',
    chartAccount: 'Serviços de terceiros',
    groupId: 'servicos',
    lastMonth: 32000,
    avg3: 32000,
    avg6: 31000,
    avg12: 30500,
    criterion: 'MANUAL',
    manualValue: 35000,
  },
  {
    id: '10',
    name: 'Tarifas bancárias',
    chartAccount: 'Despesas financeiras',
    groupId: 'financeiras',
    lastMonth: 56000,
    avg3: 54300,
    avg6: 55800,
    avg12: 54900,
    criterion: 'AVG_6',
    manualValue: null,
  },
  {
    id: '11',
    name: 'Material de escritório',
    chartAccount: 'Despesas administrativas',
    groupId: 'escritorio',
    lastMonth: 60000,
    avg3: 20000,
    avg6: 10000,
    avg12: 5000,
    criterion: 'AVG_12',
    manualValue: null,
  },
  {
    id: '12',
    name: 'Correios e entregas',
    chartAccount: 'Despesas administrativas',
    groupId: 'escritorio',
    lastMonth: 9800,
    avg3: 11200,
    avg6: 10400,
    avg12: 10100,
    criterion: 'AVG_6',
    manualValue: null,
  },
]

const criterionValue = (account: Seed): number | null => {
  const map: Record<CostCriterion, number | null> = {
    LAST_MONTH: account.lastMonth,
    AVG_3: account.avg3,
    AVG_6: account.avg6,
    AVG_12: account.avg12,
    MANUAL: account.manualValue,
  }

  return map[account.criterion]
}

const withReference = (account: Seed): AdminExpenseAccount => ({
  ...account,
  referenceValue: criterionValue(account),
})

export const getAdminExpenses = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()

  const data: AdminExpensesResponse = {
    referenceMonth: REFERENCE_MONTH,
    groups,
    accounts: accounts
      .filter(
        (account) => !filters?.groupId || account.groupId === filters.groupId,
      )
      .filter(
        (account) =>
          !filters?.criterion || account.criterion === filters.criterion,
      )
      .filter(
        (account) =>
          !search ||
          account.name.toLowerCase().includes(search) ||
          account.chartAccount.toLowerCase().includes(search),
      )
      .map(withReference),
  }

  return { success: true, data, message: '' }
}

export const getAdminExpensesTotals = async () => {
  const all = accounts.map(withReference)

  const data: AdminExpensesTotals = {
    total: all.length,
    byAverage: all.filter((account) => account.criterion !== 'MANUAL').length,
    manual: all.filter((account) => account.criterion === 'MANUAL').length,
    referenceValue: all.reduce(
      (sum, account) => sum + (account.referenceValue || 0),
      0,
    ),
  }

  return { success: true, data, message: '' }
}

export const updateAdminExpenseCriterion = async ({
  id,
  criterion,
  manualValue,
}: {
  id: string
  criterion: CostCriterion
  manualValue?: number | null
}) => {
  const account = accounts.find((item) => item.id === id)

  if (!account) {
    return { success: false, data: null, message: 'Conta não encontrada' }
  }

  if (
    criterion !== 'MANUAL' &&
    criterionValue({ ...account, criterion }) === null
  ) {
    return {
      success: false,
      data: null,
      message: 'Esta conta ainda não tem histórico para este critério',
    }
  }

  account.criterion = criterion
  account.manualValue = criterion === 'MANUAL' ? (manualValue ?? null) : null

  return { success: true, data: withReference(account), message: '' }
}

// --- Aba Distribuição ---------------------------------------------------
// Também provisória. O padrão nasce sem distribuição, como manda o método do
// custo puro (openspec/regras-de-negocio/metodo-custo-puro.md).

const sectors: DistributionSector[] = [
  {
    id: 'administracao',
    name: 'Administração',
    nature: 'ADMINISTRATIVE',
    percentage: 0,
    directCost: 1619099,
  },
  {
    id: 'comercial',
    name: 'Comercial',
    nature: 'ADMINISTRATIVE',
    percentage: 0,
    directCost: 480000,
  },
  {
    id: 'impressao',
    name: 'Impressão',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 183417,
  },
  {
    id: 'cnc',
    name: 'CNC',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 119583,
  },
  {
    id: 'producao',
    name: 'Produção',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 405750,
  },
  {
    id: 'criacao',
    name: 'Criação',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 362250,
  },
  {
    id: 'grafica',
    name: 'Gráfica',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 30333,
  },
  {
    id: 'frota',
    name: 'Frota',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 20000,
  },
  {
    id: 'marcenaria',
    name: 'Marcenaria',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: null,
  },
  {
    id: 'instalacao',
    name: 'Instalação',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: null,
  },
]

// Os administrativos formam um total único; o percentual vive nos produtivos (BC-7)
const administrativeCost = () =>
  sectors
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce((sum, sector) => sum + (sector.directCost || 0), 0)

const distributedCost = () =>
  sectors
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .reduce(
      (sum, sector) =>
        sum + Math.round((administrativeCost() * sector.percentage) / 100),
      0,
    )

export const getDistribution = async () => {
  const data: DistributionResponse = {
    referenceMonth: REFERENCE_MONTH,
    sectors,
  }

  return { success: true, data, message: '' }
}

export const getDistributionTotals = async () => {
  const data: DistributionTotals = {
    administrativeCost: administrativeCost(),
    distributedCost: distributedCost(),
    notDistributedCost: administrativeCost() - distributedCost(),
    receivingSectors: sectors.filter(
      (sector) => sector.nature === 'PRODUCTIVE' && sector.percentage > 0,
    ).length,
  }

  return { success: true, data, message: '' }
}

export const updateDistribution = async ({
  percentages,
}: {
  percentages: { id: string; percentage: number }[]
}) => {
  const received = sectors.filter((sector) => sector.nature === 'PRODUCTIVE')
  const total = percentages
    .filter((item) => received.some((sector) => sector.id === item.id))
    .reduce((sum, item) => sum + item.percentage, 0)

  if (total > 100) {
    return {
      success: false,
      data: null,
      message: 'A soma dos setores produtivos não pode passar de 100%.',
    }
  }

  percentages.forEach(({ id, percentage }) => {
    const sector = sectors.find((item) => item.id === id)

    if (sector) sector.percentage = Math.min(Math.max(percentage, 0), 100)
  })

  return { success: true, data: null, message: '' }
}

// --- Aba Por setor ------------------------------------------------------

const sectorCostItems: { [key: string]: SectorCostItem[] } = {
  impressao: [
    {
      id: 'imp-1',
      name: 'Impressora Solvente',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 64167,
    },
    {
      id: 'imp-2',
      name: 'Impressora Solvente',
      origin: 'ASSETS',
      detail: 'Manutenção — a cada 6 meses',
      value: 41667,
    },
    {
      id: 'imp-3',
      name: 'Impressora Sublimática',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 23333,
    },
    {
      id: 'imp-4',
      name: 'Plotter de recorte',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 11667,
    },
    {
      id: 'imp-5',
      name: 'Impressora Offset',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 35000,
    },
    {
      id: 'imp-6',
      name: 'Móveis do setor',
      origin: 'DEPRECIATION',
      detail: 'Cadastro simplificado',
      value: 7583,
    },
  ],
  producao: [
    {
      id: 'prod-1',
      name: 'Marcos — Gerente de produção',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 405750,
    },
  ],
  criacao: [
    {
      id: 'cri-1',
      name: 'Allan — Designer',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 362250,
    },
  ],
  cnc: [
    {
      id: 'cnc-1',
      name: 'Router',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 58333,
    },
    {
      id: 'cnc-2',
      name: 'Router',
      origin: 'ASSETS',
      detail: 'Manutenção e consumíveis',
      value: 60500,
    },
    {
      id: 'cnc-3',
      name: 'Laser CO2',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 32083,
    },
    {
      id: 'cnc-4',
      name: 'Fiber',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 29167,
    },
  ],
  grafica: [
    {
      id: 'gra-1',
      name: 'Laser Color',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 30333,
    },
  ],
  frota: [
    {
      id: 'fro-1',
      name: 'Veículo',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 20000,
    },
  ],
  administracao: [
    {
      id: 'adm-1',
      name: 'Natihely — Administrativo',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 716833,
    },
    {
      id: 'adm-2',
      name: 'Despesas administrativas',
      origin: 'OTHER',
      detail: 'Aluguel, energia, contabilidade e outras contas',
      value: 875099,
    },
    {
      id: 'adm-3',
      name: 'Móveis administrativo',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 16667,
    },
    {
      id: 'adm-4',
      name: 'Material de limpeza',
      origin: 'OTHER',
      detail: 'Lançamento direto no setor',
      value: 10500,
    },
  ],
  comercial: [
    {
      id: 'com-1',
      name: 'Equipe comercial',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 480000,
    },
  ],
}

const sumOrigin = (items: SectorCostItem[], origin: SectorCostOrigin) => {
  const total = items
    .filter((item) => item.origin === origin)
    .reduce((sum, item) => sum + item.value, 0)

  // Sem lançamento na origem devolve null: a tela mostra `-` (design.md §7)
  return total || null
}

export const getSectorCosts = async () => {
  const distributed = distributedCost()

  const data: SectorCostsResponse = {
    referenceMonth: REFERENCE_MONTH,
    isDistributing: distributed > 0,
    sectors: sectors.map((sector) => {
      const items = sectorCostItems[sector.id] || []
      const ownCost = items.reduce((sum, item) => sum + item.value, 0) || null
      const receivedCost =
        sector.nature === 'PRODUCTIVE' && sector.percentage > 0
          ? Math.round((administrativeCost() * sector.percentage) / 100)
          : null

      return {
        id: sector.id,
        name: sector.name,
        nature: sector.nature,
        labor: sumOrigin(items, 'LABOR'),
        assets: sumOrigin(items, 'ASSETS'),
        depreciation: sumOrigin(items, 'DEPRECIATION'),
        other: sumOrigin(items, 'OTHER'),
        ownCost,
        receivedCost,
        totalCost:
          ownCost === null && receivedCost === null
            ? null
            : (ownCost || 0) + (receivedCost || 0),
        allocationCriterion:
          sector.id === 'impressao'
            ? ('ACTIVITY_TIME' as const)
            : ('ACQUISITION_VALUE' as const),
        items,
      }
    }),
  }

  return { success: true, data, message: '' }
}

// --- Aba Resumo ---------------------------------------------------------

export const getCostSummary = async () => {
  const response = await getSectorCosts()
  const all = response.data?.sectors || []

  const sumOf = (key: 'labor' | 'assets' | 'depreciation' | 'other') =>
    all.reduce((total, sector) => total + (sector[key] || 0), 0)

  const productiveCost = all
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .reduce((total, sector) => total + (sector.ownCost || 0), 0)

  const administrative = all
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce((total, sector) => total + (sector.ownCost || 0), 0)

  const data: CostSummary = {
    referenceMonth: REFERENCE_MONTH,
    total: productiveCost + administrative,
    byOrigin: {
      adminExpenses: sumOf('other'),
      labor: sumOf('labor'),
      assets: sumOf('assets'),
      depreciation: sumOf('depreciation'),
    },
    productiveCost,
    administrativeCost: administrative,
    distributedCost: distributedCost(),
    bySector: all
      .filter((sector) => sector.ownCost)
      .map((sector) => ({
        id: sector.id,
        name: sector.name,
        value: sector.ownCost || 0,
      }))
      .sort((a, b) => b.value - a.value),
  }

  return { success: true, data, message: '' }
}

// --- Aba Mão de obra ----------------------------------------------------

const collaborators: { [key: string]: LaborCollaborator[] } = {
  producao: [
    { id: 'joao', name: 'João', role: 'Aplicação', hours: 100 },
    { id: 'marcos', name: 'Marcos', role: 'Gerente de produção', hours: 146 },
  ],
  criacao: [{ id: 'allan', name: 'Allan', role: 'Designer', hours: 100 }],
}

const salePrices: { [key: string]: number } = {
  producao: 6000,
  criacao: 3000,
  confeccao: 3000,
  instalacao: 3000,
  marcenaria: 3500,
}

export const getLaborSectors = async () => {
  const response = await getSectorCosts()

  const data: LaborSector[] = (response.data?.sectors || [])
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .map((sector) => {
      const team = collaborators[sector.id] || []
      const hours = team.reduce((sum, person) => sum + person.hours, 0) || null
      const distributedCost = sector.totalCost
      const costPerHour =
        hours && distributedCost ? Math.round(distributedCost / hours) : null
      const salePrice = salePrices[sector.id] ?? null
      const margin =
        costPerHour && salePrice
          ? Math.round(((salePrice - costPerHour) / salePrice) * 1000) / 10
          : null

      return {
        id: sector.id,
        name: sector.name,
        distributedCost,
        hours,
        costPerHour,
        salePrice,
        margin,
        collaborators: team,
      }
    })

  return { success: true, data, message: '' }
}

export const updateLaborHours = async ({
  sectorId,
  hours,
}: {
  sectorId: string
  hours: { id: string; hours: number }[]
}) => {
  const team = collaborators[sectorId]

  if (!team) {
    return { success: false, data: null, message: 'Setor sem colaboradores' }
  }

  hours.forEach(({ id, hours: value }) => {
    const person = team.find((item) => item.id === id)

    if (person) person.hours = Math.max(Math.round(value) || 0, 0)
  })

  return { success: true, data: null, message: '' }
}

// --- Aba Patrimônios ----------------------------------------------------

type AssetSeed = Omit<
  DepreciationAsset,
  'depreciableValue' | 'depreciatedValue' | 'remainingValue'
> & { residualValue: number }

const assetSeeds: AssetSeed[] = [
  {
    id: '1',
    name: 'Impressora Solvente',
    group: 'MACHINES',
    sector: 'Impressão',
    acquisitionValue: 7000000,
    residualValue: 2100000,
    monthlyDepreciation: 64167,
    usefulLifeMonths: 76,
    elapsedMonths: 19,
    status: 'DEPRECIATING',
  },
  {
    id: '2',
    name: 'Impressora Sublimática',
    group: 'MACHINES',
    sector: 'Impressão',
    acquisitionValue: 4000000,
    residualValue: 1200000,
    monthlyDepreciation: 23333,
    usefulLifeMonths: 120,
    elapsedMonths: 52,
    status: 'DEPRECIATING',
  },
  {
    id: '3',
    name: 'Plotter de recorte',
    group: 'MACHINES',
    sector: 'Impressão',
    acquisitionValue: 2000000,
    residualValue: 600000,
    monthlyDepreciation: 11667,
    usefulLifeMonths: 120,
    elapsedMonths: 96,
    status: 'REVIEW_NEEDED',
  },
  {
    id: '4',
    name: 'Router',
    group: 'MACHINES',
    sector: 'CNC',
    acquisitionValue: 8000000,
    residualValue: 2400000,
    monthlyDepreciation: 58333,
    usefulLifeMonths: 96,
    elapsedMonths: 96,
    status: 'DEPRECIATED',
  },
  {
    id: '5',
    name: 'Ilhoseira',
    group: 'MACHINES',
    sector: 'Produção',
    acquisitionValue: 600000,
    residualValue: 600000,
    monthlyDepreciation: null,
    usefulLifeMonths: 60,
    elapsedMonths: 4,
    status: 'INCONSISTENT',
  },
  {
    id: '6',
    name: 'Móveis administrativo',
    group: 'FURNITURE',
    sector: 'Administração',
    acquisitionValue: 1200000,
    residualValue: 200000,
    monthlyDepreciation: 16667,
    usefulLifeMonths: 60,
    elapsedMonths: 24,
    status: 'DEPRECIATING',
  },
  {
    id: '7',
    name: 'Veículo de entrega',
    group: 'VEHICLES',
    sector: 'Frota',
    acquisitionValue: 9000000,
    residualValue: 3000000,
    monthlyDepreciation: 20000,
    usefulLifeMonths: 72,
    elapsedMonths: 18,
    status: 'DEPRECIATING',
  },
  {
    id: '8',
    name: 'Impressora antiga',
    group: 'MACHINES',
    sector: 'Impressão',
    acquisitionValue: 3000000,
    residualValue: 900000,
    monthlyDepreciation: null,
    usefulLifeMonths: 60,
    elapsedMonths: 60,
    status: 'INACTIVE',
  },
]

const withDepreciation = (asset: AssetSeed): DepreciationAsset => {
  const depreciableValue = asset.acquisitionValue - asset.residualValue
  const depreciatedValue = Math.min(
    (asset.monthlyDepreciation || 0) * asset.elapsedMonths,
    depreciableValue,
  )

  return {
    id: asset.id,
    name: asset.name,
    group: asset.group,
    sector: asset.sector,
    acquisitionValue: asset.acquisitionValue,
    depreciableValue,
    monthlyDepreciation: asset.monthlyDepreciation,
    depreciatedValue,
    remainingValue: depreciableValue - depreciatedValue,
    usefulLifeMonths: asset.usefulLifeMonths,
    elapsedMonths: asset.elapsedMonths,
    status: asset.status,
  }
}

const statusByTab: { [key: string]: AssetStatus[] } = {
  ativos: ['DEPRECIATING', 'DEPRECIATED'],
  'em-revisao': ['REVIEW_NEEDED'],
  inconsistencias: ['INCONSISTENT'],
  inativos: ['INACTIVE'],
}

export const getDepreciationAssets = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const tab = filters?.status || 'ativos'
  const search = filters?.search?.trim().toLowerCase()

  const data = assetSeeds
    .map(withDepreciation)
    .filter((asset) => statusByTab[tab]?.includes(asset.status))
    .filter((asset) => !search || asset.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const getDepreciationTotals = async () => {
  const all = assetSeeds.map(withDepreciation)
  const active = all.filter((asset) => asset.status !== 'INACTIVE')

  const data: DepreciationTotals = {
    invested: active.reduce((sum, asset) => sum + asset.acquisitionValue, 0),
    depreciated: active.reduce((sum, asset) => sum + asset.depreciatedValue, 0),
    remaining: active.reduce((sum, asset) => sum + asset.remainingValue, 0),
    monthlyDepreciation: active.reduce(
      (sum, asset) => sum + (asset.monthlyDepreciation || 0),
      0,
    ),
    activeAssets: active.length,
  }

  return { success: true, data, message: '' }
}

export const getDepreciationCounts = async () => {
  const all = assetSeeds.map(withDepreciation)

  const data = Object.fromEntries(
    Object.entries(statusByTab).map(([tab, statuses]) => [
      tab,
      all.filter((asset) => statuses.includes(asset.status)).length,
    ]),
  )

  return { success: true, data, message: '' }
}

// --- Aba Comparativo ----------------------------------------------------

type ComparisonSeed = {
  id: string
  chartAccount: string
  name: string
  // Por mês; a tela multiplica pelo número de meses do período escolhido
  monthlyEstimated: number | null
  monthlyActual: number | null
  sources: ComparisonSource[]
}

const comparisonSeeds: ComparisonSeed[] = [
  {
    id: '1',
    chartAccount: '02.01.03.03',
    name: 'Manutenção de máquina',
    monthlyEstimated: 41831,
    monthlyActual: 78000,
    sources: [
      {
        id: '1-1',
        name: 'Impressora Solvente',
        detail: 'Manutenção — a cada 6 meses',
        value: 41667,
      },
      {
        id: '1-2',
        name: 'Impressora Sublimática',
        detail: 'Tinta — R$ 0,01 por m² × 164 m²',
        value: 164,
      },
    ],
  },
  {
    id: '2',
    chartAccount: '02.01.04.01',
    name: 'Combustível',
    monthlyEstimated: 120000,
    monthlyActual: 98500,
    sources: [
      {
        id: '2-1',
        name: 'Veículo de entrega',
        detail: 'R$ 1,20 por km × 1.000 km',
        value: 120000,
      },
    ],
  },
  {
    id: '3',
    chartAccount: '02.01.02.09',
    name: 'Taxas bancárias',
    monthlyEstimated: 56000,
    monthlyActual: 61200,
    sources: [
      {
        id: '3-1',
        name: 'Custo financeiro de referência',
        detail: '1,5% sobre o valor recebido',
        value: 56000,
      },
    ],
  },
  {
    id: '4',
    chartAccount: '02.02.04.02',
    name: 'Matéria-prima',
    monthlyEstimated: 240000,
    monthlyActual: 318000,
    sources: [
      {
        id: '4-1',
        name: 'Composições vendidas no período',
        detail: 'Material estimado nas vendas',
        value: 240000,
      },
    ],
  },
  {
    id: '5',
    chartAccount: '02.01.03.07',
    name: 'Ferramentas e consumíveis',
    monthlyEstimated: null,
    monthlyActual: 43000,
    sources: [],
  },
]

const monthsByPeriod: { [key: string]: number } = {
  '1': 1,
  '3': 3,
  '6': 6,
  '12': 12,
}

export const getCostComparison = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const period = filters?.period || '12'
  const months = monthsByPeriod[period] || 12
  const status = filters?.status || 'todas'

  // O comparativo trabalha o resto do plano de contas: o que é despesa
  // administrativa já entrou na aba própria, com custo mensal de referência
  const visible = comparisonSeeds.filter((seed) => {
    if (status === 'com-previsao') return seed.monthlyEstimated !== null
    if (status === 'sem-previsao') return seed.monthlyEstimated === null

    return true
  })

  const data: ComparisonResponse = {
    period,
    coverage: {
      total: comparisonSeeds.length,
      withEstimate: comparisonSeeds.filter(
        (seed) => seed.monthlyEstimated !== null,
      ).length,
      withoutEstimate: comparisonSeeds.filter(
        (seed) => seed.monthlyEstimated === null,
      ).length,
    },
    accounts: visible.map((seed) => {
      const estimated =
        seed.monthlyEstimated === null ? null : seed.monthlyEstimated * months
      const actual =
        seed.monthlyActual === null ? null : seed.monthlyActual * months
      const difference =
        estimated === null || actual === null ? null : estimated - actual

      return {
        id: seed.id,
        chartAccount: seed.chartAccount,
        name: seed.name,
        estimated,
        actual,
        difference,
        differencePercent:
          difference === null || !estimated
            ? null
            : Math.round((difference / estimated) * 1000) / 10,
        sources: seed.sources.map((source) => ({
          ...source,
          value: source.value * months,
        })),
      }
    }),
  }

  return { success: true, data, message: '' }
}

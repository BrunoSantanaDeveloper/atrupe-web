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

const distributedCost = () =>
  sectors
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce(
      (sum, sector) =>
        sum + Math.round(((sector.directCost || 0) * sector.percentage) / 100),
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
  const administrativeCost = sectors
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce((sum, sector) => sum + (sector.directCost || 0), 0)

  const data: DistributionTotals = {
    administrativeCost,
    distributedCost: distributedCost(),
    notDistributedCost: administrativeCost - distributedCost(),
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

// PROVISÓRIO: os setores da Base de custos e o que forma o custo de cada um,
// compartilhados entre as abas (actions/cost-base.ts) e o rateio do setor
// entre os equipamentos (actions/sector-allocation-data.ts). Não é
// 'use server' de propósito: módulo 'use server' só exporta funções
// assíncronas.

// Types
import type {
  CostCriterion,
  SectorCostItem,
  DistributionSector,
  AdminExpenseAccount,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Também provisória. O padrão nasce sem distribuição, como manda o método do
// custo puro (openspec/regras-de-negocio/metodo-custo-puro.md).

export const sectors: DistributionSector[] = [
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
export const administrativeCost = () =>
  sectors
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce((sum, sector) => sum + (directCostOf(sector.id) || 0), 0)

export const distributedCost = () =>
  sectors
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .reduce(
      (sum, sector) =>
        sum + Math.round((administrativeCost() * sector.percentage) / 100),
      0,
    )

export const sectorCostItems: { [key: string]: SectorCostItem[] } = {
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

export type ExpenseSeed = Omit<
  AdminExpenseAccount,
  'referenceValue' | 'allocations' | 'allocatedValue' | 'remainder'
>

export const accounts: ExpenseSeed[] = [
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

export const criterionValue = (account: ExpenseSeed): number | null => {
  const map: Record<CostCriterion, number | null> = {
    LAST_MONTH: account.lastMonth,
    AVG_3: account.avg3,
    AVG_6: account.avg6,
    AVG_12: account.avg12,
    MANUAL: account.manualValue,
  }

  return map[account.criterion]
}

export const referenceOf = (account: ExpenseSeed) =>
  criterionValue(account) || 0

// Soma do custo mensal de referência de todas as despesas administrativas:
// é o que forma o item "Despesas administrativas" do setor Administração
export const adminExpensesTotal = () =>
  accounts.reduce((sum, account) => sum + referenceOf(account), 0)

// --- Rateio por item de custo administrativo (BC-8) ----------------------
// O aluguel, a energia e outros custos podem ser repartidos entre os setores
// produtivos que os consomem. A parte rateada vira custo próprio do setor; o
// que sobra continua no total administrativo (areas/05-base-de-custos.md §7).
// Em memória até a API guardar o rateio na conta (backend-pendente.md).

export type ExpenseShare = { sectorId: string; percentage: number }

const expenseAllocations: { [accountId: string]: ExpenseShare[] } = {}

export const allocationOf = (accountId: string): ExpenseShare[] =>
  (expenseAllocations[accountId] || []).filter((share) => share.percentage > 0)

export const saveAllocation = (accountId: string, shares: ExpenseShare[]) => {
  expenseAllocations[accountId] = shares.filter((share) => share.percentage > 0)
}

// Quanto do custo de referência da conta vai para um setor, em centavos
export const shareValue = (account: ExpenseSeed, percentage: number) =>
  Math.round((referenceOf(account) * percentage) / 100)

export const allocatedValue = (account: ExpenseSeed) =>
  allocationOf(account.id).reduce(
    (sum, share) => sum + shareValue(account, share.percentage),
    0,
  )

export const allocatedTotal = () =>
  accounts.reduce((sum, account) => sum + allocatedValue(account), 0)

export const withReference = (account: ExpenseSeed): AdminExpenseAccount => {
  const referenceValue = criterionValue(account)
  const allocated = allocatedValue(account)

  return {
    ...account,
    referenceValue,
    allocations: allocationOf(account.id).map((share) => ({
      sectorId: share.sectorId,
      sectorName:
        sectors.find((sector) => sector.id === share.sectorId)?.name || '',
      percentage: share.percentage,
      value: shareValue(account, share.percentage),
    })),
    allocatedValue: allocated,
    remainder: referenceValue === null ? null : referenceValue - allocated,
  }
}

// O que cada setor produtivo recebeu pelo rateio por item, como custo
// próprio dele, com a origem visível ("Aluguel · 50%")
export const allocatedToSector = (sectorId: string): SectorCostItem[] =>
  accounts.flatMap((account) =>
    allocationOf(account.id)
      .filter((share) => share.sectorId === sectorId)
      .map((share) => ({
        id: `rateio-${account.id}-${sectorId}`,
        name: account.name,
        origin: 'OTHER' as const,
        detail: `Rateio por item · ${share.percentage.toLocaleString('pt-BR')}% do custo de referência`,
        value: shareValue(account, share.percentage),
      })),
  )

// Os itens que formam o custo do setor, já com o rateio por item: o setor
// produtivo ganha a parte que recebeu, e o item "Despesas administrativas"
// da Administração fica só com o que sobrou
export const sectorItemsOf = (sectorId: string): SectorCostItem[] => {
  const items = sectorCostItems[sectorId] || []
  const sector = sectors.find((item) => item.id === sectorId)

  if (sector?.nature === 'PRODUCTIVE') {
    return [...items, ...allocatedToSector(sectorId)]
  }

  return items.map((item) => {
    if (item.id !== 'adm-2') return item
    const allocated = allocatedTotal()

    return {
      ...item,
      value: adminExpensesTotal() - allocated,
      detail: allocated
        ? `Aluguel, energia, contabilidade e outras contas · já sem o que foi rateado por item`
        : item.detail,
    }
  })
}

// Custo próprio do setor é a soma dos itens dele; sem item, não há custo
export const directCostOf = (sectorId: string) =>
  sectorItemsOf(sectorId).reduce((sum, item) => sum + item.value, 0) || null

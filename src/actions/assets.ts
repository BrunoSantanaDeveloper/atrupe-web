'use server'

// PROVISÓRIO: a API ainda não tem os endpoints do cadastro de patrimônios
// (recurso do PRO). Estas actions devolvem dados de exemplo em memória, no
// mesmo formato `{ success, data, message }` das actions reais.

// Types
import type {
  Asset,
  AssetCost,
  AssetSetup,
  AssetGroupItem,
} from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Grupos de bens equivalentes: os de veículo vêm pré-cadastrados e são
// editáveis (P-13); qualquer equipamento repetido pode ter grupo (P-5.2).
const groups: AssetGroupItem[] = [
  { id: 'carros', name: 'Carros', unit: 'KM', sector: 'Frota', assetCount: 0 },
  { id: 'motos', name: 'Motos', unit: 'KM', sector: 'Frota', assetCount: 1 },
  {
    id: 'caminhoes',
    name: 'Caminhões',
    unit: 'KM',
    sector: 'Frota',
    assetCount: 0,
  },
]

const assets: Asset[] = [
  {
    id: 'sublimatica',
    name: 'Impressora Sublimática',
    kind: 'MACHINES',
    sector: 'Impressão',
    groupId: null,
    detailed: true,
    unit: 'M2',
    monthlyProductivity: 164,
    acquisitionDate: '2022-05-27',
    acquisitionValue: 4000000,
    usefulLifeMonths: 120,
    residualPercent: 30,
    residualValue: 1200000,
    monthlyDepreciation: 23333,
    status: 'DEPRECIATING',
    costs: [
      {
        id: 'c1',
        name: 'Tinta',
        nature: 'MACHINE_VARIABLE',
        unitCost: 1,
        yieldAmount: 1,
        yieldUnit: 'UNIT',
        chartAccount: '02.01.03.03 — Manutenção de máquina',
        lastOccurrence: '2026-08-12',
        monthlyCost: 164,
        setupId: null,
      },
      {
        id: 'c2',
        name: 'Cabeça de impressão',
        nature: 'FIXED',
        unitCost: 480000,
        yieldAmount: 24,
        yieldUnit: 'MONTH',
        chartAccount: '02.01.03.03 — Manutenção de máquina',
        lastOccurrence: '2025-11-03',
        monthlyCost: 20000,
        setupId: null,
      },
    ],
    setups: [
      {
        id: 's1',
        name: 'Standart',
        abbreviation: 'std',
        unit: 'M2',
        timePerUnit: 60,
        monthlyProductivity: 164,
        unitCost: 152,
        salePrice: 447,
      },
    ],
    processes: [
      { id: 'p1', name: 'Impressão sublimática', taskType: 'Impressão' },
    ],
  },
  {
    id: 'solvente',
    name: 'Impressora Solvente',
    kind: 'MACHINES',
    sector: 'Impressão',
    groupId: null,
    detailed: true,
    unit: 'M2',
    monthlyProductivity: 400,
    acquisitionDate: '2021-03-10',
    acquisitionValue: 7000000,
    usefulLifeMonths: 76,
    residualPercent: 30,
    residualValue: 2100000,
    monthlyDepreciation: 64167,
    status: 'DEPRECIATING',
    costs: [
      {
        id: 'c3',
        name: 'Manutenção preventiva',
        nature: 'FIXED',
        unitCost: 250000,
        yieldAmount: 6,
        yieldUnit: 'MONTH',
        chartAccount: '02.01.03.03 — Manutenção de máquina',
        lastOccurrence: '2026-06-20',
        monthlyCost: 41667,
        setupId: null,
      },
    ],
    setups: [
      {
        id: 's2',
        name: '4 passes',
        abbreviation: '4pas',
        unit: 'M2',
        timePerUnit: 5,
        monthlyProductivity: 200,
        unitCost: 289,
        salePrice: null,
      },
      {
        id: 's3',
        name: '6 passes',
        abbreviation: '6pas',
        unit: 'M2',
        timePerUnit: 8,
        monthlyProductivity: 200,
        unitCost: 412,
        salePrice: null,
      },
    ],
    processes: [],
  },
  {
    id: 'moto-1',
    name: 'Moto de entrega 1',
    kind: 'VEHICLES',
    sector: 'Frota',
    groupId: 'motos',
    detailed: true,
    unit: 'KM',
    monthlyProductivity: 1000,
    acquisitionDate: '2024-01-15',
    acquisitionValue: 1800000,
    usefulLifeMonths: 60,
    residualPercent: 30,
    residualValue: 540000,
    monthlyDepreciation: 21000,
    status: 'DEPRECIATING',
    costs: [
      {
        id: 'c4',
        name: 'Combustível',
        nature: 'MACHINE_VARIABLE',
        unitCost: 30,
        yieldAmount: 1,
        yieldUnit: 'UNIT',
        chartAccount: '02.01.04.01 — Combustível',
        lastOccurrence: '2026-09-01',
        monthlyCost: 30000,
        setupId: null,
      },
    ],
    setups: [],
    processes: [],
  },
  {
    id: 'moveis',
    name: 'Móveis do administrativo',
    kind: 'FURNITURE',
    sector: 'Administração',
    groupId: null,
    detailed: false,
    unit: null,
    monthlyProductivity: null,
    acquisitionDate: '2024-09-22',
    acquisitionValue: 1200000,
    usefulLifeMonths: 60,
    residualPercent: 30,
    residualValue: 360000,
    monthlyDepreciation: 14000,
    status: 'DEPRECIATING',
    costs: [],
    setups: [],
    processes: [],
  },
  {
    id: 'ilhoseira',
    name: 'Ilhoseira',
    kind: 'MACHINES',
    sector: 'Produção',
    groupId: null,
    detailed: false,
    unit: null,
    monthlyProductivity: null,
    acquisitionDate: '2026-05-02',
    acquisitionValue: 600000,
    usefulLifeMonths: null,
    residualPercent: null,
    residualValue: null,
    monthlyDepreciation: null,
    status: 'INCONSISTENT',
    costs: [],
    setups: [],
    processes: [],
  },
]

export const getAssets = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()
  const status = filters?.status || 'ativos'

  const data = assets
    .filter((asset) =>
      status === 'inativos'
        ? asset.status === 'INACTIVE'
        : asset.status !== 'INACTIVE',
    )
    .filter((asset) => !filters?.sector || asset.sector === filters.sector)
    .filter((asset) => !filters?.kind || asset.kind === filters.kind)
    .filter((asset) => !search || asset.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const getAsset = async ({ id }: { id: string }) => {
  const asset = assets.find((item) => item.id === id)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  return { success: true, data: asset, message: '' }
}

export const getAssetGroups = async () => {
  // Custo pela média e capacidade pela soma dos bens do grupo (P-28)
  const data = groups.map((group) => {
    const members = assets.filter(
      (asset) => asset.groupId === group.id && asset.status !== 'INACTIVE',
    )

    const costs = members
      .map((asset) => asset.monthlyDepreciation)
      .filter((cost): cost is number => cost !== null)

    return {
      ...group,
      assetCount: members.length,
      averageCost: costs.length
        ? Math.round(costs.reduce((sum, cost) => sum + cost, 0) / costs.length)
        : null,
      totalProductivity: members.reduce(
        (sum, asset) => sum + (asset.monthlyProductivity || 0),
        0,
      ),
    }
  })

  return { success: true, data, message: '' }
}

export const createAssetGroup = async ({
  name,
  unit,
  sector,
}: {
  name: string
  unit: AssetGroupItem['unit']
  sector: string
}) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome do grupo' }
  }

  const group: AssetGroupItem = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    unit,
    sector,
    assetCount: 0,
  }

  groups.push(group)

  return { success: true, data: group, message: '' }
}

export const renameAssetGroup = async ({
  id,
  name,
}: {
  id: string
  name: string
}) => {
  const group = groups.find((item) => item.id === id)

  if (!group) {
    return { success: false, data: null, message: 'Grupo não encontrado' }
  }

  group.name = name

  return { success: true, data: group, message: '' }
}

// Depreciação = (aquisição − residual) ÷ vida útil (D3 §6.6)
const monthlyDepreciationOf = (asset: Asset) => {
  if (!asset.usefulLifeMonths || asset.residualValue === null) return null

  return Math.round(
    (asset.acquisitionValue - asset.residualValue) / asset.usefulLifeMonths,
  )
}

export const createAsset = async ({
  name,
  kind,
  sector,
  detailed,
  unit,
  monthlyProductivity,
  acquisitionDate,
  acquisitionValue,
  groupId,
  imageUrl,
}: Pick<
  Asset,
  | 'name'
  | 'imageUrl'
  | 'kind'
  | 'sector'
  | 'detailed'
  | 'unit'
  | 'monthlyProductivity'
  | 'acquisitionDate'
  | 'acquisitionValue'
  | 'groupId'
>) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome do bem' }
  }

  // Cadastro rápido: vida útil e residual vêm preenchidos, com lembrete para
  // revisar (P-12 e P-24)
  const residualPercent = 30
  const asset: Asset = {
    id: `asset-${assets.length + 1}`,
    name,
    imageUrl: imageUrl || null,
    kind,
    sector,
    groupId,
    detailed,
    unit: detailed ? unit : null,
    monthlyProductivity: detailed ? monthlyProductivity : null,
    acquisitionDate,
    acquisitionValue,
    usefulLifeMonths: 60,
    residualPercent,
    residualValue: Math.round((acquisitionValue * residualPercent) / 100),
    monthlyDepreciation: null,
    status: 'DEPRECIATING',
    costs: [],
    setups: [],
    processes: [],
  }

  asset.monthlyDepreciation = monthlyDepreciationOf(asset)
  assets.push(asset)

  if (asset.groupId) {
    const group = groups.find((item) => item.id === asset.groupId)

    if (group) group.assetCount += 1
  }

  return { success: true, data: asset, message: '' }
}

export const updateAsset = async ({
  id,
  ...values
}: Partial<Asset> & { id: string }) => {
  const asset = assets.find((item) => item.id === id)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  Object.assign(asset, values)

  if (asset.residualPercent !== null) {
    asset.residualValue = Math.round(
      (asset.acquisitionValue * asset.residualPercent) / 100,
    )
  }

  asset.monthlyDepreciation = monthlyDepreciationOf(asset)

  if (asset.monthlyDepreciation === null) asset.status = 'INCONSISTENT'

  return { success: true, data: asset, message: '' }
}

export const createAssetCost = async ({
  assetId,
  cost,
}: {
  assetId: string
  cost: Omit<AssetCost, 'id' | 'monthlyCost'>
}) => {
  const asset = assets.find((item) => item.id === assetId)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  // Custo por mês: o fixo é diluído na periodicidade; o variável multiplica
  // pela produtividade de referência (P-19 e P-32)
  const monthlyCost =
    cost.yieldUnit === 'MONTH'
      ? Math.round(cost.unitCost / (cost.yieldAmount || 1))
      : Math.round(
          (cost.unitCost / (cost.yieldAmount || 1)) *
            (asset.monthlyProductivity || 0),
        )

  asset.costs.push({ ...cost, id: `cost-${Date.now()}`, monthlyCost })

  return { success: true, data: null, message: '' }
}

export const createAssetSetup = async ({
  assetId,
  setup,
}: {
  assetId: string
  setup: Omit<AssetSetup, 'id' | 'unitCost' | 'salePrice'>
}) => {
  const asset = assets.find((item) => item.id === assetId)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  asset.setups.push({
    ...setup,
    id: `setup-${Date.now()}`,
    unitCost: null,
    salePrice: null,
  })

  // A produtividade do bem é a soma das configurações (P-31)
  asset.monthlyProductivity = asset.setups.reduce(
    (sum, item) => sum + item.monthlyProductivity,
    0,
  )

  return { success: true, data: null, message: '' }
}

export const sellAsset = async ({
  id,
  value,
}: {
  id: string
  value: number
}) => {
  const asset = assets.find((item) => item.id === id)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  asset.status = 'INACTIVE'

  // A venda gera receita no financeiro (P-25); aqui só devolvemos o resultado
  const remaining =
    asset.residualValue !== null
      ? asset.acquisitionValue - asset.residualValue
      : asset.acquisitionValue

  return {
    success: true,
    data: { received: value, result: value - remaining },
    message: '',
  }
}

// Regra geral do sistema: só se exclui o que não compromete nada nem depende
// de histórico. O patrimônio tem depreciação, custos e configurações usadas em
// composições, então ele é INATIVADO, nunca excluído.
export const setAssetActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const asset = assets.find((item) => item.id === id)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  if (!active) {
    asset.status = 'INACTIVE'
    asset.monthlyDepreciation = null

    return { success: true, data: asset, message: '' }
  }

  asset.monthlyDepreciation = monthlyDepreciationOf(asset)
  asset.status =
    asset.monthlyDepreciation === null ? 'INCONSISTENT' : 'DEPRECIATING'

  return { success: true, data: asset, message: '' }
}

// O grupo de bens equivalentes não tem histórico próprio: ele agrupa. Pode ser
// excluído, desde que nenhum bem esteja nele
export const deleteAssetGroup = async ({ id }: { id: string }) => {
  const group = groups.find((item) => item.id === id)

  if (!group) {
    return { success: false, data: null, message: 'Grupo não encontrado' }
  }

  const used = assets.filter((asset) => asset.groupId === id)

  if (used.length) {
    return {
      success: false,
      data: null,
      message: `Este grupo tem ${used.length} bem(ns). Tire os bens do grupo antes de excluir`,
    }
  }

  const index = groups.findIndex((item) => item.id === id)

  groups.splice(index, 1)

  return { success: true, data: null, message: '' }
}

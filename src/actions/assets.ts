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

// Os patrimônios de exemplo, compartilhados com o rateio do setor
import { assets, groups } from './assets-data'
import { allocatedUnitCost } from './sector-allocation-data'

// Flag de demonstração: sem ela, as actions não leem nem gravam o exemplo
import { DEMO_DATA, demoOff } from '@/lib/demo'

export const getAssets = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
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
  if (!DEMO_DATA) return demoOff()
  const asset = assets.find((item) => item.id === id)

  if (!asset) {
    return { success: false, data: null, message: 'Patrimônio não encontrado' }
  }

  // O custo da configuração acompanha o rateio manual do setor (BC-3.1)
  const data: Asset = {
    ...asset,
    setups: asset.setups.map((setup) => ({
      ...setup,
      unitCost:
        setup.unitCost === null
          ? null
          : allocatedUnitCost(setup.id, setup.unitCost),
    })),
  }

  return { success: true, data, message: '' }
}

export const getAssetGroups = async () => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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
  if (!DEMO_DATA) return demoOff()
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

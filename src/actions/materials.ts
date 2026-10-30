'use server'

// Cadastro de materiais (recurso do PRO): as rotas /material da API
// (docs/backend/contrato-api.md, módulo 1, parte B). Custo e preço em
// centavos. Quem não tem a permissão de valores não recebe custo nem preço:
// aqui eles viram nulo, e a tela mostra "-".

// Types
import type {
  Material,
  MaterialFiscal,
  MaterialUnit,
  MaterialAdvanced,
  MaterialVariation,
} from '@/app/(app-sidebar)/configuracoes/produtos/materiais/types'
import type {
  PriceRule,
  PricingItem,
} from '@/app/(app-sidebar)/precificacao/types'

// Actions
import {
  getItem,
  putItemNew,
  createItemNew,
  updateItemNew,
} from '@/actions/_cruds'

// A lista vem em páginas de até 100 (teto da API); a tela agrupa tudo por
// setor, então a action junta as páginas. O limite é uma proteção: acima
// dele a tela precisa de busca própria
const PAGE_SIZE = 100
const MAX_PAGES = 30

type ApiVariation = {
  id: string
  brand: string
  color: string
  cost?: number | null
  price?: number | null
}

type ApiMaterial = Omit<
  Material,
  'cost' | 'price' | 'variations' | 'advanced'
> & {
  cost?: number | null
  price?: number | null
  variations?: ApiVariation[]
  advanced?: MaterialAdvanced | null
  fiscal?: MaterialFiscal | null
}

const toVariation = (variation: ApiVariation): MaterialVariation => ({
  id: variation.id,
  brand: variation.brand,
  color: variation.color,
  cost: variation.cost ?? null,
  price: variation.price ?? null,
})

const toMaterial = (material: ApiMaterial): Material => ({
  id: material.id,
  code: material.code,
  name: material.name,
  sectorId: material.sectorId,
  sector: material.sector,
  subcategory: material.subcategory,
  unit: material.unit,
  directSale: material.directSale,
  productionMaterial: material.productionMaterial,
  priceRule: material.priceRule,
  cost: material.cost ?? null,
  price: material.price ?? null,
  variations: (material.variations || []).map(toVariation),
  active: material.active,
  advanced: material.advanced || undefined,
  fiscal: material.fiscal || {},
  grammage: material.grammage ?? null,
  sheetFormat: material.sheetFormat ?? null,
  usableWidth: material.usableWidth ?? null,
  usableHeight: material.usableHeight ?? null,
})

export const getMaterials = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim()
  const params = {
    limit: String(PAGE_SIZE),
    active: filters?.status === 'inativos' ? 'false' : 'true',
    ...(search ? { search } : {}),
    ...(filters?.sectorId ? { sectorId: filters.sectorId } : {}),
  }

  const data: Material[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getItem({
      route: '/material',
      params: { ...params, page: String(page) },
    })
    if (!res.success) {
      return {
        success: false,
        data: [] as Material[],
        message: res.message,
        planError: res.planError,
      }
    }
    data.push(...((res.data?.data || []) as ApiMaterial[]).map(toMaterial))
    if (page >= (res.data?.lastPage || 1)) break
  }

  return { success: true, data, message: '' }
}

type MaterialValues = {
  name: string
  sectorId: string
  subcategory: string
  unit: MaterialUnit
  // Nulo = sem custo informado
  cost: number | null
  directSale: boolean
  productionMaterial: boolean
  advanced?: MaterialAdvanced
  // Só na forma folha (Papéis, GR-0); fora dela a API recusa
  grammage?: number | null
  sheetFormat?: Material['sheetFormat']
  usableWidth?: number | null
  usableHeight?: number | null
}

export const createMaterial = async (values: MaterialValues) => {
  const res = await createItemNew({ route: '/material', data: values })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toMaterial(res.data), message: '' }
}

export const updateMaterial = async ({
  id,
  advanced,
  ...values
}: Partial<MaterialValues> & { id: string }) => {
  const res = await updateItemNew({
    route: `/material/${id}`,
    // Sem o bloco avançado, o servidor apaga a configuração: é o que a tela
    // pede quando a pessoa fecha "Configuração avançada"
    data: { ...values, advanced: advanced ?? null },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toMaterial(res.data), message: '' }
}

// Ao criar variações, o preço do material deixa de valer: a venda passa a
// exigir a escolha da variação (MT-3). O custo nasce repetido e pode ser
// alterado linha a linha (MT-4). Devolve quantas combinações foram criadas
export const createMaterialVariations = async ({
  materialId,
  brands,
  colors,
  cost,
  price,
}: {
  materialId: string
  brands: string[]
  colors: string[]
  cost: number | null
  price: number | null
}) => {
  const res = await createItemNew({
    route: `/material/${materialId}/variation`,
    data: { brands, colors, cost, price },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: Number(res.data?.created || 0), message: '' }
}

export const updateMaterialVariation = async ({
  materialId,
  variationId,
  cost,
  price,
}: {
  materialId: string
  variationId: string
  cost: number | null
  price: number | null
}) => {
  const res = await updateItemNew({
    route: `/material/${materialId}/variation/${variationId}`,
    data: { cost, price },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toVariation(res.data), message: '' }
}

// A regra e o preço do material, ou da variação quando houver (DC-6, PR-2).
// No preço variável vai o lucro informado, em décimos de ponto: o servidor
// refaz a conta e recusa o preço que não confere
export const updateMaterialPrice = async ({
  materialId,
  variationId,
  rule,
  price,
  desiredMargin,
}: {
  materialId: string
  variationId?: string
  rule: PriceRule
  price: number
  desiredMargin?: number
}) => {
  const res = await updateItemNew({
    route: `/material/${materialId}/price`,
    data: {
      rule,
      price,
      ...(variationId ? { variationId } : {}),
      ...(rule === 'VARIABLE' ? { desiredMargin } : {}),
    },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: res.data as PricingItem, message: '' }
}

// "Onde é usado": os produtos e processos cuja composição usa o material
export type MaterialUsage = {
  kind: 'PRODUCT' | 'PROCESS'
  id: string
  name: string
  stage: string
}

export const getMaterialUsage = async ({
  materialId,
}: {
  materialId: string
}) => {
  const res = await getItem({ route: `/material/${materialId}/usage` })
  if (!res.success) {
    return { success: false, data: [] as MaterialUsage[], message: res.message }
  }
  return {
    success: true,
    data: (res.data?.data || []) as MaterialUsage[],
    message: '',
  }
}

// Material usado em composição ou venda tem histórico: é INATIVADO, não
// excluído. Ao inativar, o servidor o tira das composições na mesma
// transação e devolve em `removedFrom` quantas linhas mudaram
export const setMaterialActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const res = await updateItemNew({
    route: `/material/${id}/toggle-status`,
    data: { active },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return {
    success: true,
    data: {
      ...toMaterial(res.data),
      removedFrom: Number(res.data?.removedFrom || 0),
    },
    message: '',
  }
}

/* ---------------------------------------------------------------------------
 * Importar lista de materiais com conciliação (IMP-1, área 4). A planilha
 * que vem do SketchUp, da marcenaria ou do fornecedor entra aqui, e cada
 * linha é conciliada com o material cadastrado: o nome que já bate entra
 * como atualização; o que a pessoa vinculou à mão fica guardado como de-para
 * e, da segunda vez, o sistema já sabe. O que não existe é cadastrado na
 * hora.
 * ------------------------------------------------------------------------- */

export type ImportRow = {
  name: string
  unit: string
  sector?: string
  cost: number | null
}

export type ImportStatus = 'NEW' | 'MATCH' | 'LINKED' | 'INVALID'

export type ImportPreviewRow = ImportRow & {
  line: number
  status: ImportStatus
  // O material com que a linha foi conciliada (MATCH pelo nome, LINKED pelo
  // de-para aprendido)
  materialId: string | null
  materialName: string | null
  unitKey: MaterialUnit | null
  // O motivo da linha inválida, ou o aviso da linha nova sem setor
  problem?: string
}

export const previewMaterialImport = async ({
  rows,
}: {
  rows: ImportRow[]
}) => {
  const res = await createItemNew({
    route: '/material/import/preview',
    data: { rows },
  })
  if (!res.success) {
    return {
      success: false,
      data: [] as ImportPreviewRow[],
      message: res.message || 'Erro ao conciliar a lista',
    }
  }
  return {
    success: true,
    data: (res.data?.data || []) as ImportPreviewRow[],
    message: '',
  }
}

// Os dados fiscais do material de venda direta (PO, 14/10/2026): o módulo
// Nota Fiscal e `nota_fiscal:config:edit`. Os campos vazios não vão: na
// nota, saem do padrão do emissor
export const updateMaterialFiscal = async ({
  materialId,
  fiscal,
}: {
  materialId: string
  fiscal: MaterialFiscal
}) => {
  const data = Object.fromEntries(
    Object.entries(fiscal)
      .map(([key, value]) => [key, (value ?? '').trim()])
      .filter(([, value]) => value),
  )
  const res = await putItemNew({
    route: `/material/${encodeURIComponent(materialId)}/fiscal`,
    data,
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toMaterial(res.data), message: '' }
}

export const importMaterials = async ({
  rows,
}: {
  // A linha já conciliada: `materialId` é a decisão da pessoa (ou a do
  // sistema), e vazio cadastra material novo
  rows: (ImportRow & { materialId: string | null })[]
}) => {
  const res = await createItemNew({ route: '/material/import', data: { rows } })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return {
    success: true,
    data: {
      created: Number(res.data?.created || 0),
      updated: Number(res.data?.updated || 0),
      ignored: Number(res.data?.ignored || 0),
    },
    message: '',
  }
}

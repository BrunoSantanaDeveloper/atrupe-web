'use server'

// O material de venda direta como item do orçamento (ORG-1, Fase 4.4): a
// busca de venda direta e as rotas do item na API. O item vem no detalhe do
// orçamento com origin MATERIAL e o bloco `material`; o preço é o do
// cadastro do material (ou da variação), calculado no servidor.

// Types
import type { DirectSaleMaterial } from './quotation-composition'

// Actions
import { getItem, createItemNew, updateItemNew } from '@/actions/_cruds'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const UNIT_LABEL: Record<string, string> = {
  HR: 'h',
  M2: 'm²',
  M: 'm',
  KM: 'km',
  UN: 'un',
  KG: 'kg',
  LT: 'l',
}

/** A unidade do material como a tela mostra. */
export const materialUnitLabel = async (unit?: string | null) =>
  unit ? UNIT_LABEL[unit] || unit.toLowerCase() : 'un'

// A busca pagina em 100; a lista de venda direta raramente passa disso
const PAGE_SIZE = 100
const MAX_PAGES = 10

type ApiMaterial = {
  id: string
  code: string
  name: string
  sector: string
  unit: string
  // Só com values:values:view
  price?: number | null
  variations: {
    id: string
    brand: string
    color: string
    price?: number | null
  }[]
}

/**
 * Os materiais de venda direta e ativos. Sem a base de custos no plano, a
 * API devolve lista vazia (não 403). Sem a permissão de valores, o preço não
 * vem: o servidor calcula o valor do item de qualquer forma.
 */
export const getDirectSaleMaterials = async () => {
  const data: DirectSaleMaterial[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/material',
      params: {
        directSale: 'true',
        active: 'true',
        page: String(page),
        limit: String(PAGE_SIZE),
      },
    })
    if (!res.success) {
      return {
        success: false,
        data,
        message: res.message || 'Não foi possível buscar os materiais',
      }
    }
    const rows: ApiMaterial[] = Array.isArray(res.data?.data)
      ? res.data.data
      : []
    for (const material of rows) {
      data.push({
        id: material.id,
        code: material.code,
        name: material.name,
        sector: material.sector,
        unit: UNIT_LABEL[material.unit] || material.unit.toLowerCase(),
        price: material.price ?? null,
        variations: material.variations.map((variation) => ({
          id: variation.id,
          name: [variation.brand, variation.color].filter(Boolean).join(' · '),
          price: variation.price ?? null,
        })),
      })
    }
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return { success: true, data, message: '' }
}

export const addMaterialItem = async ({
  quotationId,
  materialId,
  variationId = null,
  quantity,
}: {
  quotationId: string
  materialId: string
  variationId?: string | null
  quantity: number
}) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${quotationId}/add-material`,
    data: {
      materialId,
      ...(variationId ? { variationId } : {}),
      quantity,
    },
  })
  return {
    success: res.success,
    data: res.success ? res.data : null,
    message: res.success ? '' : res.message || 'Não foi possível incluir',
  }
}

export const updateMaterialItem = async ({
  itemId,
  variationId,
  quantity,
}: {
  itemId: string
  variationId?: string | null
  quantity: number
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/sale/quotation/update-material/${itemId}`,
    data: {
      ...(variationId !== undefined ? { variationId } : {}),
      quantity,
    },
  })
  return {
    success: res.success,
    data: res.success ? res.data : null,
    message: res.success ? '' : res.message || 'Não foi possível salvar',
  }
}

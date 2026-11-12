'use server'

// Variações simples do produto (PV-6, já no START) e preço por faixa de
// quantidade (FQ-1 a FQ-4): as rotas /product/:id/variation e
// /product/:id/price-tier da API (docs/backend/contrato-api.md, módulo 1).
// Preços em centavos por unidade comercial.

// Types
import type { PriceTier } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
import { getItem, putItemNew } from '@/actions/_cruds'

export type ProductVariationItem = {
  id: string
  name: string
  // Nulo = vale o preço do produto. Quem não vê valores pode receber sem
  unitPrice: number | null
  hasOwnAssembly?: boolean
  hasOwnTiers?: boolean
  // O papel da variação (GR-0): a contagem de folhas lê a folha dele
  paper?: { id: string; name: string } | null
}

type ApiVariation = Omit<ProductVariationItem, 'unitPrice'> & {
  unitPrice?: number | null
}

const toVariation = (item: ApiVariation): ProductVariationItem => ({
  ...item,
  unitPrice: item.unitPrice ?? null,
})

export const getProductVariations = async ({
  productId,
}: {
  productId: string
}) => {
  const res = await getItem({ route: `/product/${productId}/variation` })
  if (!res.success) {
    return {
      success: false,
      data: [] as ProductVariationItem[],
      message: res.message,
    }
  }
  return {
    success: true,
    data: ((res.data?.data || []) as ApiVariation[]).map(toVariation),
    message: '',
  }
}

// Substitui a lista: as que vêm com id mantêm o que têm; as que ficam de fora
// saem. O preço só é gravado de quem tem a permissão de valores
export const saveProductVariations = async ({
  productId,
  variations,
}: {
  productId: string
  variations: {
    id?: string
    name: string
    unitPrice: number | null
    // Indefinido = não mexe; nulo = sem papel
    paperId?: string | null
  }[]
}) => {
  const res = await putItemNew({
    route: `/product/${productId}/variation`,
    // Só os campos que a API aceita: a linha da tela traz mais
    data: {
      variations: variations.map(({ id, name, unitPrice, paperId }) => ({
        ...(id ? { id } : {}),
        name,
        unitPrice,
        ...(paperId !== undefined ? { paperId } : {}),
      })),
    },
  })
  if (!res.success) {
    return {
      success: false,
      data: [] as ProductVariationItem[],
      message: res.message,
    }
  }
  return {
    success: true,
    data: ((res.data?.data || []) as ApiVariation[]).map(toVariation),
    message: '',
  }
}

// A tabela do produto ou de uma variação. A variação sem tabela própria
// devolve a do produto, com `inherited`
export const getPriceTiers = async ({
  productId,
  variationId,
}: {
  productId: string
  variationId?: string
}) => {
  const res = await getItem({
    route: `/product/${productId}/price-tier`,
    params: variationId ? { variationId } : undefined,
  })
  if (!res.success) {
    return {
      success: false,
      data: [] as PriceTier[],
      inherited: false,
      message: res.message,
    }
  }
  return {
    success: true,
    data: ((res.data?.tiers || []) as PriceTier[]).filter(
      (tier) => typeof tier.unitPrice === 'number',
    ),
    inherited: !!res.data?.inherited,
    message: '',
  }
}

export const setPriceTiers = async ({
  productId,
  tiers,
  variationId,
  inherit,
}: {
  productId: string
  tiers: PriceTier[]
  // Na variação: grava a tabela dela, ou volta à do produto (FQ-4)
  variationId?: string
  inherit?: boolean
}) => {
  const res = await putItemNew({
    route: `/product/${productId}/price-tier`,
    data: {
      tiers: tiers.map(({ from, unitPrice }) => ({ from, unitPrice })),
      ...(variationId ? { variationId } : {}),
      ...(inherit ? { inherit } : {}),
    },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: null, message: '' }
}

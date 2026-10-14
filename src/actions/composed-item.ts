'use server'

// O item montado na hora (ORC-11, Fase 4.5) pela API: o rascunho de
// composição ligado ao orçamento, incluir e refazer o item e "salvar como
// produto". As etapas usam as ações da composição do produto
// (src/actions/assembly.ts) com o id do rascunho. Medidas da tela em metros;
// a API recebe milímetros. O preço do item é calculado no servidor; o custo
// nunca vem (ORC-7).

// Types
import type {
  AssemblyMeasure,
  ComposedItemView,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
import { getAssembly } from '@/actions/assembly'
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Utils
import { draftHostOf, parseDraftHost } from '@/lib/composed-draft'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false,
  data,
  message: message || 'Não foi possível concluir.',
})

const toMm = (meters: number) => Math.round(meters * 1_000_000) / 1000

const measureBody = (measure?: Partial<AssemblyMeasure>) => ({
  ...(measure?.quantity ? { quantity: Math.round(measure.quantity) } : {}),
  ...(measure?.width ? { width: toMm(measure.width) } : {}),
  ...(measure?.height ? { height: toMm(measure.height) } : {}),
})

/** O rascunho novo; devolve o id que o editor usa como "produto". */
export const createDraftAssembly = async ({
  quotationId,
  name,
  measure,
}: {
  quotationId: string
  name?: string
  measure?: AssemblyMeasure
}) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${quotationId}/composed-draft`,
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...measureBody(measure),
    },
  })
  if (!res.success) return fail(res.message, null as string | null)
  return ok<string | null>(draftHostOf(quotationId, res.data.id))
}

/** Nome e medida do rascunho. */
export const updateDraftAssembly = async ({
  productId,
  values,
}: {
  productId: string
  values: { name?: string; measure?: AssemblyMeasure }
}) => {
  const draft = parseDraftHost(productId)
  if (!draft) return fail('Item não encontrado', null)
  const res: ApiResult = await updateItemNew({
    route: `/sale/quotation/${draft.quotationId}/composed-draft/${draft.draftId}`,
    data: {
      ...(values.name?.trim() ? { name: values.name.trim() } : {}),
      ...measureBody(values.measure),
    },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

/**
 * O que o vendedor vê ao montar: as etapas e o preço de venda de cada
 * recurso, na medida pedida. O preço só vem para quem vê valores.
 */
export const getComposedItemView = async ({
  productId,
  measure,
}: {
  productId: string
  measure?: AssemblyMeasure
}) => {
  const res = await getAssembly({ productId, measure })
  if (!res.success || !res.data) {
    return fail(res.message, null as ComposedItemView | null)
  }
  const computed = res.data
  const view: ComposedItemView = {
    productId,
    name: computed.name,
    measure: computed.measure,
    stages: computed.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      sector: block.sector,
      dependsOn: block.dependsOn,
      processId: block.processId,
      partProductId: block.partProductId ?? null,
      partFlow: block.partFlow,
      sale: block.sale,
      setupMinutes: block.setupMinutes + block.partSetupMinutes,
      lines: [...block.partLines, ...block.lines].map((line) => ({
        id: line.id,
        name: line.name,
        kind: line.kind,
        resource: line.mode === 'LIST' ? null : line.selected?.name || null,
        quantity: line.quantity,
        unit: line.selected?.unit || line.options[0]?.unit || '',
        sale: line.sale,
      })),
    })),
    total: computed.suggestedPrice,
  }
  return ok<ComposedItemView | null>(view)
}

type ItemValues = {
  name: string
  description: string
  quantity: number
  // Em metros, como a tela
  width: number
  height: number
}

/** Inclui o item montado: o servidor calcula o retrato e o preço. */
export const addComposedItem = async ({
  quotationId,
  draftId,
  ...values
}: ItemValues & { quotationId: string; draftId: string }) => {
  const draft = parseDraftHost(draftId)
  if (!draft) return fail('Item não encontrado', null)
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${quotationId}/add-composed`,
    data: {
      draftId: draft.draftId,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      quantity: Math.max(1, Math.round(values.quantity)),
      ...measureBody({ width: values.width, height: values.height }),
    },
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

/** Refaz o item com o rascunho de agora (nome, descritivo, medida). */
export const updateComposedItem = async ({
  itemId,
  ...values
}: ItemValues & { itemId: string; quotationId?: string }) => {
  const res: ApiResult = await updateItemNew({
    route: `/sale/quotation/update-composed/${itemId}`,
    data: {
      name: values.name.trim(),
      description: values.description ?? '',
      quantity: Math.max(1, Math.round(values.quantity)),
      ...measureBody({ width: values.width, height: values.height }),
    },
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

/**
 * "Salvar como produto": o produto nasce com a composição "Em edição" e sem
 * código; o código sai quando a composição for liberada para venda.
 */
export const saveDraftAsProduct = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  const draft = parseDraftHost(productId)
  if (!draft) return fail('Item não encontrado', null as string | null)
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${draft.quotationId}/composed-draft/${draft.draftId}/save-as-product`,
    data: { ...(name?.trim() ? { name: name.trim() } : {}) },
  })
  return res.success
    ? ok<string | null>(res.data?.productId ?? null)
    : fail(res.message, null as string | null)
}

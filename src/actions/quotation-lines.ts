'use server'

// As linhas acrescentadas dentro do item do orçamento (ORC-5): as rotas
// /sale/quotation/:id/item/:itemId/line da API (contrato, módulo 2). A tela
// mede em metros; a API, em milímetros. Sem a permissão de valores, o preço
// não vem (ORC-7) e o terceirizado grava o preço sugerido.

// Actions
import { createItemNew, deleteItemNew } from '@/actions/_cruds'

type Measure = { quantity: number; width: number; height: number }

export type ItemLineInput =
  | {
      kind: 'PROCESS'
      processId: string
      followsBase: boolean
      measure?: Measure
      fields?: { fieldId: string; value: number }[]
    }
  | {
      kind: 'PART'
      productId: string
      followsBase?: boolean
      measure?: Measure
    }
  | {
      kind: 'LOOSE'
      description: string
      supplier?: string
      cost: number
      price?: number
    }

export type LinePreview = {
  price?: number
  tags: string[]
  followsBaseDefault: boolean | null
  instructions: { stage: string; text: string }[]
  suggestedPrice?: number | null
  markup?: number | null
}

export type LineItemTotals = { id: string; linesTotal?: number; total?: number }

type Result<T> = { success: boolean; data: T; message: string }

const toMm = (meters: number) => Math.round(meters * 1000)

const bodyOf = (line: ItemLineInput) =>
  line.kind !== 'LOOSE' && line.measure
    ? {
        ...line,
        measure: {
          quantity: line.measure.quantity,
          width: toMm(line.measure.width),
          height: toMm(line.measure.height),
        },
      }
    : line

const routeOf = (quotationId: string, itemId: string) =>
  `/sale/quotation/${quotationId}/item/${itemId}/line`

export const previewItemLine = async ({
  quotationId,
  itemId,
  line,
}: {
  quotationId: string
  itemId: string
  line: ItemLineInput
}): Promise<Result<LinePreview | null>> => {
  const res = await createItemNew({
    route: `${routeOf(quotationId, itemId)}/preview`,
    data: bodyOf(line),
  })
  return res.success
    ? { success: true, data: res.data as LinePreview, message: '' }
    : { success: false, data: null, message: res.message || '' }
}

export const addItemLine = async ({
  quotationId,
  itemId,
  line,
}: {
  quotationId: string
  itemId: string
  line: ItemLineInput
}): Promise<Result<{ item: LineItemTotals } | null>> => {
  const res = await createItemNew({
    route: routeOf(quotationId, itemId),
    data: bodyOf(line),
  })
  return res.success
    ? {
        success: true,
        data: res.data as { item: LineItemTotals },
        message: '',
      }
    : {
        success: false,
        data: null,
        message: res.message || 'Não foi possível acrescentar.',
      }
}

export const removeItemLine = async ({
  quotationId,
  itemId,
  lineId,
}: {
  quotationId: string
  itemId: string
  lineId: string
}): Promise<Result<null>> => {
  const res = await deleteItemNew({
    route: `${routeOf(quotationId, itemId)}/${lineId}`,
  })
  return {
    success: !!res.success,
    data: null,
    message: res.success ? '' : res.message || 'Erro ao retirar',
  }
}

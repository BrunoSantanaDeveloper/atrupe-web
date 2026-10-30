'use server'

// O serviço terceirizado avulso como item do orçamento (T-6, 24/10/2026)

import { createItemNew, getItem, updateItemNew } from '@/actions/_cruds'

const routeOf = (quotationId: string) =>
  `/sale/quotation/${quotationId}/add-outsourced`

/** O preço sugerido (custo + acréscimo sobre o custo), em centavos. */
export async function previewOutsourcedItem({
  quotationId,
  cost,
}: {
  quotationId: string
  cost: number
}) {
  return createItemNew({
    route: `${routeOf(quotationId)}/preview`,
    data: { cost },
  })
}

type OutsourcedBody = {
  name: string
  supplierId: string
  quantity: number
  cost: number
  price?: number
}

export async function addOutsourcedItem({
  quotationId,
  data,
}: {
  quotationId: string
  data: OutsourcedBody
}) {
  return createItemNew({ route: routeOf(quotationId), data })
}

// Editar o terceirizado lançado (Lite 4, 29/10/2026; patch 21 do backend).
// Custo e preço unitários só chegam para quem vê valores
export async function getOutsourcedItem({
  quotationId,
  itemId,
}: {
  quotationId: string
  itemId: string
}) {
  return getItem({
    route: `/sale/quotation/${quotationId}/outsourced/${itemId}`,
  }) as Promise<{
    success: boolean
    message: string
    data?: Omit<OutsourcedBody, 'cost'> & {
      supplierName: string
      cost?: number
    }
  }>
}

export async function updateOutsourcedItem({
  quotationId,
  itemId,
  data,
}: {
  quotationId: string
  itemId: string
  data: OutsourcedBody
}) {
  return updateItemNew({
    route: `/sale/quotation/${quotationId}/outsourced/${itemId}`,
    data,
  })
}

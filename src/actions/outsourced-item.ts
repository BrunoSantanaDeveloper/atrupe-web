'use server'

// O serviço terceirizado avulso como item do orçamento (T-6, 24/10/2026)

import { createItemNew } from '@/actions/_cruds'

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

export async function addOutsourcedItem({
  quotationId,
  data,
}: {
  quotationId: string
  data: {
    name: string
    supplierId: string
    quantity: number
    cost: number
    price?: number
  }
}) {
  return createItemNew({ route: routeOf(quotationId), data })
}

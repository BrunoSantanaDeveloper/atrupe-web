'use server'

// A impressão da gráfica rápida no LITE (12/11/2026): sangria variável e
// folhas de acerto. Rotas /product/:id/print-settings e
// /product/:id/print-count da API (recurso paper_register). Medidas em mm,
// sem custo.

import { getItem, putItemNew, createItemNew } from '@/actions/_cruds'

export type BleedSource = 'ITEM' | 'PRODUCT' | 'SECTOR' | 'DEFAULT'

export type PrintSettings = {
  // Nulo = herda do setor
  bleedMm: number | null
  setupSheets: number | null
  sector: { bleedMm: number | null; setupSheets: number | null }
  effective: {
    bleedMm: number
    bleedSource: BleedSource
    setupSheets: number
  }
}

/** O que o item do orçamento guarda: a sangria só dele. */
export type PrintSpec = {
  bleedMm?: number | null
}

export type PrintCount = {
  paperName: string
  label: string | null
  impressions: number
  piecesPerSheet: number | null
  sheets: number | null
  setupSheets: number
  totalSheets: number | null
  bleedMm: number
  bleedSource: BleedSource
  warning: string | null
}

export type PrintPreview = {
  bleed: { mm: number; source: BleedSource }
  setupSheets: number
  counts: PrintCount[]
}

export const getPrintSettings = async (productId: string) => {
  const res = await getItem({ route: `/product/${productId}/print-settings` })
  return {
    success: res.success,
    data: res.success ? (res.data as PrintSettings) : null,
    message: res.message,
  }
}

export const savePrintSettings = async (
  productId: string,
  data: { bleedMm?: number | null; setupSheets?: number | null },
) => {
  const res = await putItemNew({
    route: `/product/${productId}/print-settings`,
    data,
  })
  return {
    success: res.success,
    data: res.success ? (res.data as PrintSettings) : null,
    message: res.message,
  }
}

export const getPrintCount = async (
  productId: string,
  body: {
    variationId?: string | null
    width?: number | null
    height?: number | null
    quantity: number
    printSpec?: PrintSpec | null
  },
) => {
  const res = await createItemNew({
    route: `/product/${productId}/print-count`,
    data: body,
  })
  return {
    success: res.success,
    data: res.success ? (res.data as PrintPreview) : null,
    message: res.message,
  }
}

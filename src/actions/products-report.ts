'use server'

import apiInstance from '@/lib/api'
import type { ProductsSoldData } from '@/app/(app-sidebar)/relatorios/produtos/types'
import type { ProductsReportPdfData } from '@/app/(app-sidebar)/relatorios/produtos/pdf-types'

interface ProductsReportFilters {
  sellerId?: string
  originId?: string
  clientId?: string
  serieId?: string
  startDate?: string
  endDate?: string
}

const BASE_ROUTE = '/report/products-sold'

export async function getProductsSold(
  filters?: ProductsReportFilters,
): Promise<ProductsSoldData> {
  const api = await apiInstance()
  try {
    const res = await api.get(BASE_ROUTE, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching products sold:', error)
    return { products: [], totalValue: 0 }
  }
}

export async function getProductsSoldPdfData(
  filters?: ProductsReportFilters,
): Promise<ProductsReportPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/pdf-data`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching products report PDF data:', error)
    return null
  }
}

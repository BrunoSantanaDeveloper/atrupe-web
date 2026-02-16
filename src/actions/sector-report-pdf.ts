'use server'

import apiInstance from '@/lib/api'
import type { SectorReportPdfData } from '@/app/(app-sidebar)/relatorios/resultado-por-setor/pdf-types'

interface SectorReportFilters {
  startDate?: string
  endDate?: string
}

export async function getSectorReportPdfData(
  filters?: SectorReportFilters,
): Promise<SectorReportPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/sector-results/pdf-data', {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching sector report PDF data:', error)
    return null
  }
}

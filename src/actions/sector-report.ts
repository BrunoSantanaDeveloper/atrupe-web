'use server'

import apiInstance from '@/lib/api'
import type { SectorReportData } from '@/app/(app-sidebar)/relatorios/resultado-por-setor/types'

interface SectorReportFilters {
  startDate?: string
  endDate?: string
}

export async function getSectorResults(
  filters?: SectorReportFilters,
): Promise<SectorReportData> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/sector-results', { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching sector results:', error)
    return { sectors: [], generalTotal: 0 }
  }
}

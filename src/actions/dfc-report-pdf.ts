'use server'

import apiInstance from '@/lib/api'

// Types
import type { DfcReportPdfData } from '@/app/(app-sidebar)/relatorios/dfc/pdf-types'

interface DfcPdfFilters {
  startDate?: string
  endDate?: string
  regime?: string
}

export async function getDfcReportPdfData(
  filters?: DfcPdfFilters,
): Promise<DfcReportPdfData> {
  const api = await apiInstance()
  const res = await api.get('/report/dfc/pdf-data', {
    params: filters,
  })
  return res.data
}

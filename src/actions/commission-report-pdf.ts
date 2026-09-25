'use server'

import apiInstance from '@/lib/api'
import type { CommissionPdfData } from '@/app/(app-sidebar)/relatorios/comissoes/pdf-types'
import type { CommissionType } from '@/app/(app-sidebar)/relatorios/comissoes/types'

interface CommissionPdfFilters {
  commissionType?: CommissionType
  startDate?: string
  endDate?: string
  receivedStartDate?: string
  receivedEndDate?: string
  sellerId?: string
}

export async function getCommissionPdfData(
  filters?: CommissionPdfFilters,
): Promise<CommissionPdfData | null> {
  const api = await apiInstance()
  try {
    // Fetch table data grouped by seller with high limit to get all records
    const tableRes = await api.get('/report/commission/table', {
      params: {
        ...filters,
        groupBy: 'vendedor',
        limit: 9999,
      },
    })

    // Fetch company info from sales pdf-data (reuse same endpoint for company data)
    const companyRes = await api.get('/report/sales/pdf-data', {
      params: {
        startDate: filters?.startDate ?? filters?.receivedStartDate,
        endDate: filters?.endDate ?? filters?.receivedEndDate,
      },
    })

    const tableData = tableRes.data
    const company = companyRes.data?.company || {}

    // Calculate totals
    let totalSaleValue = 0
    let totalReceivedValue = 0

    const groups = (tableData.groups || []).map(
      (g: {
        vendedorId: string
        vendedorName: string
        count: number
        saleTotal: number
        receivedTotal: number
        records: CommissionPdfData['groups'][0]['records']
      }) => {
        totalSaleValue += g.saleTotal
        totalReceivedValue += g.receivedTotal
        return {
          vendedorId: g.vendedorId,
          vendedorName: g.vendedorName,
          count: g.count,
          saleTotal: g.saleTotal,
          receivedTotal: g.receivedTotal,
          records: g.records,
        }
      },
    )

    return {
      company,
      totalSaleValue,
      totalReceivedValue,
      groups,
    }
  } catch (error) {
    console.error('Error fetching commission PDF data:', error)
    return null
  }
}

'use client'

import { useMemo } from 'react'

// Components
import { ProductsTable } from './ProductsTable'
import { Topbar } from '@/components/common/Topbar'
import { ProductsReportPrintButton } from './print/ProductsReportPrintButton'
// Mesmos filtros do relatório de vendas (vendedor, origem, cliente, série e
// período) — a consulta por trás é a mesma, então a barra é reaproveitada.
import { FiltersBar } from '../../vendas/components/FiltersBar'

// Lib
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ProductsReport({ searchParams }: SearchParamsType) {
  // Sem datas na URL, vale o período padrão (mês atual)
  const effectiveSearchParams = useMemo(() => {
    if (searchParams?.startDate && searchParams?.endDate) {
      return searchParams
    }

    const period = (searchParams?.period || 'current_month') as PeriodType
    const dates = calculatePeriodDates(period)

    if (!dates) return searchParams

    return {
      ...searchParams,
      startDate: formatDateToISO(dates.startDate),
      endDate: formatDateToISO(dates.endDate),
    }
  }, [searchParams])

  return (
    <div className="space-y-5">
      <Topbar
        title="Relatório de produtos"
        primaryCta={<ProductsReportPrintButton />}
      />

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Table */}
      <ProductsTable searchParams={effectiveSearchParams} />
    </div>
  )
}

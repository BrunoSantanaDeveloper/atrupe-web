'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { FinancialChart } from './FinancialChart'
import { FinancialTable } from './FinancialTable'
import { FinancialReportPrintButton } from './print/FinancialReportPrintButton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

export function FinancialReport({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const urlParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<FinancialTab>(
    (urlParams.get('tab') as FinancialTab) || 'receitas',
  )

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as FinancialTab)
    const params = new URLSearchParams(urlParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <Topbar title="Financeiro" primaryCta={<FinancialReportPrintButton />} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} tab={activeTab} />

      {/* Chart */}
      <FinancialChart searchParams={searchParams} tab={activeTab} />

      {/* Table */}
      <FinancialTable searchParams={searchParams} tab={activeTab} />
    </div>
  )
}

'use client'

import { useState } from 'react'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { FinancialChart } from './FinancialChart'
import { FinancialTable } from './FinancialTable'
import { FinancialReportPrintButton } from './print/FinancialReportPrintButton'
import { AdvancedReportDialog } from './print/AdvancedReportDialog'
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
    // Reset filters that have different options per tab
    params.set('status', 'received')
    params.set('orderBy', tab === 'despesas' ? 'dueDate' : 'receivedDate')
    params.set('page', '1')
    params.delete('clientId')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <Topbar
        title="Financeiro"
        primaryCta={<AdvancedReportDialog activeTab={activeTab} />}
        secondaryCta={<FinancialReportPrintButton />}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <FiltersBar searchParams={searchParams} tab={activeTab} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} tab={activeTab} />

      {/* Chart */}
      <FinancialChart searchParams={searchParams} tab={activeTab} />

      {/* Table */}
      <FinancialTable searchParams={searchParams} tab={activeTab} />
    </div>
  )
}

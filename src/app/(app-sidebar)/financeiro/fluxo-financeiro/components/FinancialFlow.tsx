'use client'

// React
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

// UI
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { TopActions } from './TopActions'
import { Topbar } from '@/components/common/Topbar'
import { TransactionsTotalsCard } from './TransactionsTotals'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { FinancialFlowData } from './FinancialFlowTable/FinancialFlowData'
import { FinancialFlowFilter } from './FinancialFlowTable/FinancialFlowFilter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getData } from '@/actions/_cruds'

// Utils
import { cn } from '@/lib/utils'

interface Props extends SearchParamsType {}

export function FinancialFlow({ searchParams }: Props) {
  const [showTotals, setShowTotals] = useState(false)
  const router = useRouter()

  const hasUrlParams = searchParams?.startDate && searchParams?.endDate

  const { data: overdueData } = useQuery({
    queryKey: ['financial-flow-overdue-last-7-days'],
    queryFn: () => getData({ route: '/financial/flow/overdue/last-7-days' }),
  })

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Define o período padrão na URL se não houver parâmetros
  useEffect(() => {
    if (!hasUrlParams && overdueData?.data) {
      const params = new URLSearchParams(searchParams as Record<string, string>)

      const today = new Date()
      today.setHours(12, 0, 0, 0)
      const sevenDaysFromNow = new Date(
        today.getTime() + 7 * 24 * 60 * 60 * 1000,
      )

      let startDate = today

      if (overdueData.data.hasOverdue) {
        const oldestOverdueDate = new Date(overdueData.data.oldestOverdueDate)
        oldestOverdueDate.setHours(12, 0, 0, 0)
        startDate = oldestOverdueDate
      }

      params.set('startDate', formatDateToISO(startDate))
      params.set('endDate', formatDateToISO(sevenDaysFromNow))
      router.replace(`?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdueData, hasUrlParams])

  return (
    <div className="space-y-5">
      <Topbar
        title="Fluxo financeiro"
        badge={{
          text:
            searchParams.dateType === 'paidDate'
              ? 'Data de pagamento'
              : 'Data de vencimento',
          variant:
            searchParams.dateType === 'paidDate'
              ? 'successLight'
              : 'warningLight',
        }}
        primaryCta={
          <TopActions
            showTotals={showTotals}
            setShowTotals={setShowTotals}
            searchParams={searchParams}
          />
        }
      />
      <div className="space-y-2.5">
        <Card>
          {/* FIlter */}
          <TableFiltersHeader searchParams={searchParams}>
            <FinancialFlowFilter searchParams={searchParams} />
          </TableFiltersHeader>

          {/* Totals */}
          <CardContent
            className={cn(
              'transition-all duration-300 pb-0',
              showTotals
                ? 'opacity-100 max-h-[300px] mb-4'
                : 'opacity-0 max-h-0 overflow-hidden',
            )}
          >
            <Separator />
            <TransactionsTotalsCard searchParams={searchParams} />
          </CardContent>
        </Card>
        {/* Table */}
        <Card>
          <FinancialFlowData
            searchParams={searchParams}
            showTotals={showTotals}
          />
        </Card>
      </div>
    </div>
  )
}

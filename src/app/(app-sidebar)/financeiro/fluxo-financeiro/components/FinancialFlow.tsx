'use client'

// React
import { useState } from 'react'

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

// Utils
import { cn } from '@/lib/utils'

interface Props extends SearchParamsType {}

export function FinancialFlow({ searchParams }: Props) {
  const [showTotals, setShowTotals] = useState(false)

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
          <TableFiltersHeader searchParams={searchParams}>
            <FinancialFlowFilter searchParams={searchParams} />
          </TableFiltersHeader>
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

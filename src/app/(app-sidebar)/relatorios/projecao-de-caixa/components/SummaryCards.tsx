'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Icons
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
} from '@tabler/icons-react'

// Actions
import { getCashFlowSummary } from '@/actions/cash-flow-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SummaryCards({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-summary', searchParams],
    queryFn: () =>
      getCashFlowSummary({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  const cards: {
    icon: typeof IconTrendingUp
    variant: FeaturedIconProps['variant']
    label: string
    value: string
  }[] = [
    {
      icon: IconTrendingUp,
      variant: 'successLight',
      label: 'Receitas Previstas',
      value: formatCurrencyToBrl(data?.expectedRevenue || 0),
    },
    {
      icon: IconTrendingDown,
      variant: 'errorLight',
      label: 'Despesas Previstas',
      value: formatCurrencyToBrl(data?.expectedExpenses || 0),
    },
    {
      icon: IconWallet,
      variant: 'neutralLight',
      label: 'Saldo de Caixa Previsto',
      value: formatCurrencyToBrl(data?.expectedBalance || 0),
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 flex items-center gap-3 rounded-xl">
              <Skeleton className="h-11 w-11 rounded-[10px] shrink-0" />
              <div className="flex flex-col min-w-0">
                <Skeleton className="h-4 w-28 mb-0.5" />
                <Skeleton className="h-6 w-24" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-6 flex items-center gap-3 rounded-xl">
          <FeaturedIcon size="md" variant={card.variant} Icon={card.icon} />
          <div className="flex flex-col min-w-0">
            <span className="type-kpi-label truncate">{card.label}</span>
            <span className="type-kpi-value">{card.value}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

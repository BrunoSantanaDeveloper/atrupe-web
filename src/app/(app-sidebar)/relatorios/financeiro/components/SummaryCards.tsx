'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconCircleCheck,
  IconClockCheck,
  IconClockHour4,
  IconAlertCircle,
} from '@tabler/icons-react'

// Actions
import { getFinancialSummary } from '@/actions/financial-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

interface SummaryCardsProps extends SearchParamsType {
  tab: FinancialTab
}

export function SummaryCards({ searchParams, tab }: SummaryCardsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-summary', searchParams, tab],
    queryFn: () => getFinancialSummary({ tab }),
  })

  const cards = [
    {
      icon: IconCircleCheck,
      variant: 'successLight' as const,
      label: `${tab === 'receitas' ? 'Recebidos' : 'Pagos'} (${data?.receivedCount || 0})`,
      value: formatCurrencyToBrl(data?.received || 0),
    },
    {
      icon: IconClockCheck,
      variant: 'blueLight' as const,
      label: `Confirmadas (${data?.confirmedCount || 0})`,
      value: formatCurrencyToBrl(data?.confirmed || 0),
    },
    {
      icon: IconClockHour4,
      variant: 'warningLight' as const,
      label: `A ${tab === 'receitas' ? 'receber' : 'pagar'} (${data?.toReceiveCount || 0})`,
      value: formatCurrencyToBrl(data?.toReceive || 0),
    },
    {
      icon: IconAlertCircle,
      variant: 'errorLight' as const,
      label: `Vencidas (${data?.overdueCount || 0})`,
      value: formatCurrencyToBrl(data?.overdue || 0),
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-24 h-5" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-4 flex items-center gap-3 rounded-xl">
          <FeaturedIcon size="md" variant={card.variant} Icon={card.icon} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 truncate">{card.label}</span>
            <span className="text-lg font-semibold text-gray-900">
              {card.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

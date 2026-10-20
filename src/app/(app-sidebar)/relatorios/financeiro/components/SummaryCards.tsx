'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
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
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { Icon } from '@/components/ui/icon'

interface SummaryCardsProps extends SearchParamsType {
  tab: FinancialTab
}

export function SummaryCards({ searchParams, tab }: SummaryCardsProps) {
  const { canProvision } = usePlanFeatures()

  const { data, isLoading } = useQuery({
    queryKey: [
      'financial-summary',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.clientId,
      tab,
    ],
    queryFn: () =>
      getFinancialSummary({
        tab,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        clientId: searchParams?.clientId as string,
      }),
  })

  const cards = [
    {
      icon: IconCircleCheck,
      label: `${tab === 'receitas' ? 'Recebidos' : 'Pagos'} (${data?.receivedCount || 0})`,
      value: formatCurrencyToBrl(data?.received || 0),
    },
    {
      icon: IconClockCheck,
      label: `Confirmadas (${data?.confirmedCount || 0})`,
      value: formatCurrencyToBrl(data?.confirmed || 0),
    },
    {
      icon: IconClockHour4,
      label: `A ${tab === 'receitas' ? 'receber' : 'pagar'} (${data?.toReceiveCount || 0})`,
      value: formatCurrencyToBrl(data?.toReceive || 0),
    },
    {
      icon: IconAlertCircle,
      label: `Vencidas (${data?.overdueCount || 0})`,
      value: formatCurrencyToBrl(data?.overdue || 0),
    },
  ] as const

  const visibleCards = canProvision() ? cards : cards.filter((_, i) => i !== 1)

  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-4',
          visibleCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        )}
      >
        {Array.from({ length: canProvision() ? 4 : 3 }, (_, i) => (
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
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-4',
        visibleCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
      )}
    >
      {visibleCards.map((card, index) => (
        <Card key={index} className="p-6 flex items-center gap-3 rounded-xl">
          <Icon icon={card.icon} size="md" className="text-gray-600" />
          <div className="flex flex-col min-w-0">
            <span className="type-kpi-label truncate">{card.label}</span>
            <span className="type-kpi-value">{card.value}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

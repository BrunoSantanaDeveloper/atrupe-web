'use client'

// React
import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconCoin,
  IconCircleX,
  IconClockHour4,
  IconClockCheck,
  IconCircleCheck,
  IconReceiptDollar,
} from '@tabler/icons-react'

// Actions
import { getSalesReportSummary } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

interface SummaryCardsProps extends SearchParamsType {}

export function SummaryCards({ searchParams }: SummaryCardsProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: [
      'sales-summary',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getSalesReportSummary({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 flex items-center gap-3 rounded-xl">
              <Skeleton className="h-11 w-11 rounded-[10px]" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-6 w-24" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const cards = [
    {
      icon: IconCircleCheck,
      label: `Aprovadas (${summary.approvedCount})`,
      value: formatCurrencyToBrl(summary.approvedTotal),
    },
    {
      icon: IconClockHour4,
      label: `Aguardando (${summary.noResponseCount})`,
      value: formatCurrencyToBrl(summary.noResponseTotal),
    },
    {
      icon: IconCircleX,
      label: `Não aprovadas / Canceladas (${(summary.rejectedCount || 0) + (summary.expiredCount || 0) + (summary.canceledCount || 0)})`,
      value: formatCurrencyToBrl(
        (summary.rejectedTotal || 0) +
          (summary.expiredTotal || 0) +
          (summary.canceledTotal || 0),
      ),
    },
    {
      icon: IconCoin,
      label: 'Ticket médio O.S',
      value: formatCurrencyToBrl(summary.averageTicket),
    },
    {
      icon: IconReceiptDollar,
      label: 'Comissão',
      value: formatCurrencyToBrl(summary.commission),
    },
    {
      icon: IconClockCheck,
      label: 'Aprovação média',
      value: summary.approvalTime,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
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

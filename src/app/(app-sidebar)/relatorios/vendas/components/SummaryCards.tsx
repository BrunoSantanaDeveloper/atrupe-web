'use client'

// React
import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

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

interface SummaryCardsProps extends SearchParamsType {}

export function SummaryCards({ searchParams }: SummaryCardsProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['sales-summary', searchParams],
    queryFn: () =>
      getSalesReportSummary({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
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
            <Card key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
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
      variant: 'successLight',
      label: `Aprovadas (${summary.approvedCount})`,
      value: formatCurrencyToBrl(summary.approvedTotal),
    },
    {
      icon: IconClockHour4,
      variant: 'warningLight',
      label: `Aguardando (${summary.noResponseTotal})`,
      value: formatCurrencyToBrl(summary.noResponseTotal),
    },
    {
      icon: IconCircleX,
      variant: 'errorLight',
      label: `Não aprovadas (${summary.rejectedCount})`,
      value: formatCurrencyToBrl(summary.rejectedTotal),
    },
    {
      icon: IconCoin,
      variant: 'neutralLight',
      label: 'Ticket médio O.S',
      value: formatCurrencyToBrl(summary.averageTicket),
    },
    {
      icon: IconReceiptDollar,
      variant: 'neutralLight',
      label: 'Comissão',
      value: formatCurrencyToBrl(summary.commission),
    },
    {
      icon: IconClockCheck,
      variant: 'neutralLight',
      label: 'Aprovação média',
      value: summary.approvalTime,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-6 flex items-center gap-3 rounded-xl">
          <FeaturedIcon
            size="md"
            variant={card.variant as FeaturedIconProps['variant']}
            Icon={card.icon}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray truncate">{card.label}</span>
            <span className="text-lg font-semibold text-gray-900">
              {card.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

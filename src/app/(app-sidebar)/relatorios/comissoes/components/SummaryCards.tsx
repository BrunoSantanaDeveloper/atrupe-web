'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { IconCircleCheck, IconCoin, IconReceipt } from '@tabler/icons-react'

// Actions
import { getCommissionSummary } from '@/actions/commission-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CommissionType } from '../types'

export function SummaryCards({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: [
      'commission-summary',
      searchParams?.commissionType,
      searchParams?.startDate,
      searchParams?.endDate,
    ],
    queryFn: () =>
      getCommissionSummary({
        commissionType: searchParams?.commissionType as CommissionType,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  const cards = [
    {
      icon: IconCircleCheck,
      variant: 'successLight',
      label: 'Vendas do período',
      value: formatCurrencyToBrl(data?.salesTotal || 0),
    },
    {
      icon: IconCoin,
      variant: 'neutralLight',
      label: 'Recebido',
      value: formatCurrencyToBrl(data?.receivedTotal || 0),
    },
    {
      icon: IconReceipt,
      variant: 'neutralLight',
      label: 'Comissão',
      value: formatCurrencyToBrl(data?.commissionTotal || 0),
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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

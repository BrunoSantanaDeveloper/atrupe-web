'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { IconArrowUp, IconArrowDown, IconCash } from '@tabler/icons-react'

// Actions
import { getDfcSummary } from '@/actions/dfc-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SummaryCards({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: [
      'dfc-summary',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.regime,
    ],
    queryFn: () =>
      getDfcSummary({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        regime:
          (searchParams?.regime as 'realizado' | 'competencia') || undefined,
      }),
  })

  const cards = [
    {
      icon: IconArrowUp,
      variant: 'successLight',
      label: 'Receitas Totais',
      value: formatCurrencyToBrl(data?.totalRevenue || 0),
    },
    {
      icon: IconArrowDown,
      variant: 'errorLight',
      label: 'Despesas Totais',
      value: formatCurrencyToBrl(data?.totalExpenses || 0),
      isNegative: true,
    },
    {
      icon: IconCash,
      variant: 'blueLight',
      label: 'Fluxo de Caixa Final',
      value: formatCurrencyToBrl(data?.finalCashFlow || 0),
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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
          <FeaturedIcon
            size="md"
            variant={card.variant as FeaturedIconProps['variant']}
            Icon={card.icon}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray truncate">{card.label}</span>
            <span
              className={`text-lg font-semibold ${
                card.isNegative ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {card.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

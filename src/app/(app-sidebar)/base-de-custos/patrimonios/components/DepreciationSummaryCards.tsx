'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Types
import type { DepreciationTotals } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Icons
import {
  IconCoins,
  IconHourglass,
  IconTrendingDown,
  IconBuildingWarehouse,
} from '@tabler/icons-react'

interface Props {
  totals?: DepreciationTotals
  isLoading: boolean
}

export function DepreciationSummaryCards({ totals, isLoading }: Props) {
  const cards = [
    {
      icon: IconCoins,
      variant: 'neutralLight',
      label: 'Valor total investido',
      value: formatCurrencyToBrl(totals?.invested),
    },
    {
      icon: IconTrendingDown,
      variant: 'blueLight',
      label: 'Valor já depreciado',
      value: formatCurrencyToBrl(totals?.depreciated),
    },
    {
      icon: IconHourglass,
      variant: 'indigoLight',
      label: 'Valor restante a depreciar',
      value: formatCurrencyToBrl(totals?.remaining),
    },
    {
      icon: IconTrendingDown,
      variant: 'successLight',
      label: 'Depreciação mensal atual',
      value: formatCurrencyToBrl(totals?.monthlyDepreciation),
    },
    {
      icon: IconBuildingWarehouse,
      variant: 'neutralLight',
      label: 'Patrimônios ativos',
      value: totals?.activeAssets ?? 0,
    },
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="p-6 flex items-center gap-3 rounded-xl"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-11 w-11 rounded-[10px] shrink-0" />
              <div className="flex flex-col min-w-0">
                <Skeleton className="h-4 w-28 mb-0.5" />
                <Skeleton className="h-6 w-24" />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
import { Icon } from '@/components/ui/icon'

interface Props {
  totals?: DepreciationTotals
  isLoading: boolean
}

export function DepreciationSummaryCards({ totals, isLoading }: Props) {
  const cards = [
    {
      icon: IconCoins,
      label: 'Valor total investido',
      value: formatCurrencyToBrl(totals?.invested),
    },
    {
      icon: IconTrendingDown,
      label: 'Valor já depreciado',
      value: formatCurrencyToBrl(totals?.depreciated),
    },
    {
      icon: IconHourglass,
      label: 'Valor restante a depreciar',
      value: formatCurrencyToBrl(totals?.remaining),
    },
    {
      icon: IconTrendingDown,
      label: 'Depreciação mensal atual',
      value: formatCurrencyToBrl(totals?.monthlyDepreciation),
    },
    {
      icon: IconBuildingWarehouse,
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
              <Icon icon={card.icon} size="md" className="text-gray-600" />
              <div className="flex flex-col min-w-0">
                <span className="type-kpi-label truncate">{card.label}</span>
                <span className="type-kpi-value">{card.value}</span>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

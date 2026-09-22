'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Types
import type { DistributionTotals } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Icons
import {
  IconBuilding,
  IconArrowsSplit2,
  IconCircleDashed,
  IconBuildingFactory,
} from '@tabler/icons-react'

interface Props {
  totals?: DistributionTotals
  isLoading: boolean
}

export function DistributionSummaryCards({ totals, isLoading }: Props) {
  const cards = [
    {
      icon: IconBuilding,
      variant: 'neutralLight',
      label: 'Custo administrativo',
      value: formatCurrencyToBrl(totals?.administrativeCost),
    },
    {
      icon: IconArrowsSplit2,
      variant: 'blueLight',
      label: 'Distribuído aos setores',
      value: formatCurrencyToBrl(totals?.distributedCost),
    },
    {
      icon: IconCircleDashed,
      variant: 'neutralLight',
      label: 'Não distribuído',
      value: formatCurrencyToBrl(totals?.notDistributedCost),
    },
    {
      icon: IconBuildingFactory,
      variant: 'successLight',
      label: 'Setores que recebem',
      value: totals?.receivingSectors ?? 0,
    },
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

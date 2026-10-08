'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
import { Icon } from '@/components/ui/icon'

interface Props {
  totals?: DistributionTotals
  isLoading: boolean
}

export function DistributionSummaryCards({ totals, isLoading }: Props) {
  const cards = [
    {
      icon: IconBuilding,
      label: 'Custo administrativo',
      value: formatCurrencyToBrl(totals?.administrativeCost),
    },
    {
      icon: IconArrowsSplit2,
      label: 'Distribuído aos setores',
      value: formatCurrencyToBrl(totals?.distributedCost),
    },
    {
      icon: IconCircleDashed,
      label: 'Não distribuído',
      value: formatCurrencyToBrl(totals?.notDistributedCost),
    },
    {
      icon: IconBuildingFactory,
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

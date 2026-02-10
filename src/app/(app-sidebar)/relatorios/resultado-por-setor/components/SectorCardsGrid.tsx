'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconClipboard,
  IconCpu,
  IconShirt,
  IconSparkles,
  IconTruck,
  IconPrinter,
  IconPhoto,
  IconTool,
  IconLayout,
  IconPencil,
  IconSettings,
  IconShield,
  IconStack2,
  IconGridDots,
} from '@tabler/icons-react'

// Actions
import { getSectorResults } from '@/actions/sector-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { SectorResult } from '../types'

const ICON_MAP: Record<string, typeof IconClipboard> = {
  clipboard: IconClipboard,
  cpu: IconCpu,
  shirt: IconShirt,
  sparkles: IconSparkles,
  truck: IconTruck,
  printer: IconPrinter,
  photo: IconPhoto,
  tool: IconTool,
  layout: IconLayout,
  pencil: IconPencil,
  settings: IconSettings,
  shield: IconShield,
  layers: IconStack2,
}

function SectorCard({ sector }: { sector: SectorResult }) {
  const Icon = ICON_MAP[sector.icon] || IconGridDots

  return (
    <Card className="p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <FeaturedIcon
          size="md"
          variant={'neutralLight' as FeaturedIconProps['variant']}
          Icon={Icon}
        />
        <span className="font-semibold text-gray-900">{sector.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray">Resultado</span>
        <span className="text-base font-semibold text-success-700">
          {formatCurrencyToBrl(sector.value)}
        </span>
      </div>
    </Card>
  )
}

function GeneralCard({ total }: { total: number }) {
  return (
    <Card className="p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <FeaturedIcon
          size="md"
          variant={'primaryLight' as FeaturedIconProps['variant']}
          Icon={IconGridDots}
        />
        <span className="font-semibold text-gray-900">Geral</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray">Resultado</span>
        <span className="text-lg font-semibold text-success-700">
          {formatCurrencyToBrl(total)}
        </span>
      </div>
    </Card>
  )
}

export function SectorCardsGrid({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: ['sector-results', searchParams],
    queryFn: () => getSectorResults(),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.sectors.map((sector) => (
        <SectorCard key={sector.id} sector={sector} />
      ))}
      <GeneralCard total={data.generalTotal} />
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { sectorIcons } from '@/consts/sectors'
import { IconLayoutGrid } from '@tabler/icons-react'

// Actions
import { getSectorResults } from '@/actions/sector-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SectorResult } from '../types'
import type { SearchParamsType } from '@/types/coreTypes'
import { Separator } from '@/components/ui/separator'

function SectorCard({ sector }: { sector: SectorResult }) {
  const sectorConfig = sectorIcons[sector.icon]
  const Icon = sectorConfig?.icon

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
          {Icon ? (
            <Icon className="h-6 w-6 text-gray-600" />
          ) : (
            <IconLayoutGrid className="h-6 w-6 " />
          )}
        </div>
        <span className="font-semibold text-gray-900">{sector.name}</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between mt-8">
        <span className="text-sm text-gray">Resultado</span>
        <span className="text-sm text-success-700">
          {formatCurrencyToBrl(sector.value)}
        </span>
      </div>
    </Card>
  )
}

function GeneralCard({ total }: { total: number }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        {/* TODO: Usar FeaturedIcon */}
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-600">
          <IconLayoutGrid className="h-6 w-6 text-gray-100" />
        </div>
        <span className="font-semibold text-gray-900">Geral</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between mt-8">
        <span className="text-sm font-semibold text-gray-700">Resultado</span>
        <span className="text-lg font-semibold text-success-700">
          {formatCurrencyToBrl(total)}
        </span>
      </div>
    </Card>
  )
}

export function SectorCardsGrid({ searchParams }: SearchParamsType) {
  const period = (searchParams?.period as PeriodType) || 'current_month'
  const hasExplicitDates = searchParams?.startDate && searchParams?.endDate

  const filters = (() => {
    if (hasExplicitDates) {
      return {
        startDate: searchParams.startDate as string,
        endDate: searchParams.endDate as string,
      }
    }
    const dates = calculatePeriodDates(period)
    if (dates) {
      return {
        startDate: formatDateToISO(dates.startDate),
        endDate: formatDateToISO(dates.endDate),
      }
    }
    return {}
  })()

  const { data, isLoading } = useQuery({
    queryKey: ['sector-results', filters],
    queryFn: () => getSectorResults(filters),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Separator />
                <div className="flex items-center justify-between mt-8">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </Card>
            ))}
        </div>
        <div>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Separator />
            <div className="flex items-center justify-between mt-8">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.sectors.map((sector) => (
          <SectorCard key={sector.id} sector={sector} />
        ))}
      </div>
      <div>
        <div className="md:sticky md:top-4">
          <GeneralCard total={data.generalTotal} />
        </div>
      </div>
    </div>
  )
}

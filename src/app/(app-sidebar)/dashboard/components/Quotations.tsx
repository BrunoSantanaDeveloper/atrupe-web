'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { PermissionGate } from '@/components/common/PermissionGate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { getDashboardSalesSummary } from '@/actions/dashboard'

import {
  IconCheck,
  IconCircleX,
  IconClockHour4,
  IconCoin,
  IconUrgent,
} from '@tabler/icons-react'
import { Icon, ICON_SIZE } from '@/components/ui/icon'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface DashboardQuotationsProps {
  filters: DashboardFilters
}

export function DashboardQuotations({ filters }: DashboardQuotationsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-quotations-summary', filters],
    queryFn: () => getDashboardSalesSummary(filters),
  })

  const rejectedCount = (data?.rejectedCount ?? 0) + (data?.canceledCount ?? 0)

  const items = [
    {
      label: 'Aguardando',
      value: data?.noResponseCount || 0,
      icon: IconClockHour4,
    },
    {
      label: 'Vencidos',
      value: data?.expiredCount || 0,
      icon: IconUrgent,
    },
    {
      label: 'Aprovados',
      value: data?.approvedCount || 0,
      icon: IconCheck,
    },
    {
      label: 'Não aprovados',
      value: rejectedCount,
      icon: IconCircleX,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3 items-center">
          <Icon icon={IconCoin} size="md" className="text-gray-600" />
          <CardTitle>Orçamentos</CardTitle>
        </div>
        <PermissionGate permissions={['sale:quotation:view']}>
          <Button asChild type="button" size="sm" variant="neutralOutline">
            <Link href="/vendas/orcamentos">Ver orçamentos</Link>
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-8">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
              ))
            : items.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon size={ICON_SIZE.md} className="text-gray" />
                  <span className="type-kpi-label">{item.label}</span>
                  <span className="type-kpi-value">{item.value}</span>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

import { getDashboardSalesSummary } from '@/actions/dashboard'

import { useDashboardValues } from './DashboardValuesContext'

import {
  IconCircleCheck,
  IconCircleX,
  IconClockCheck,
  IconCoin,
  IconReceiptDollar,
} from '@tabler/icons-react'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface SalesOverviewProps {
  filters: DashboardFilters
}

export function SalesOverview({ filters }: SalesOverviewProps) {
  const { formatValue } = useDashboardValues()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-sales-summary', filters],
    queryFn: () => getDashboardSalesSummary(filters),
  })

  const lostCount =
    (data?.rejectedCount ?? 0) +
    (data?.expiredCount ?? 0) +
    (data?.canceledCount ?? 0)
  const lostTotal =
    (data?.rejectedTotal ?? 0) +
    (data?.expiredTotal ?? 0) +
    (data?.canceledTotal ?? 0)

  const cards = [
    {
      label: 'Vendas aprovadas',
      value: formatValue(data?.approvedTotal || 0),
      detail: `${data?.approvedCount || 0} aprovadas`,
      icon: IconCircleCheck,
      variant: 'successLight',
    },
    {
      label: 'Aguardando resposta',
      value: formatValue(data?.noResponseTotal || 0),
      detail: `${data?.noResponseCount || 0} orcamentos`,
      icon: IconClockCheck,
      variant: 'warningLight',
    },
    {
      label: 'Nao aprovadas',
      value: formatValue(lostTotal),
      detail: `${lostCount} registros`,
      icon: IconCircleX,
      variant: 'errorLight',
    },
    {
      label: 'Ticket medio',
      value: formatValue(data?.averageTicket || 0),
      detail: `Aprovacao media ${data?.approvalTime || '0d 0h'}`,
      icon: IconCoin,
      variant: 'neutralLight',
    },
    {
      label: 'Comissao estimada',
      value: formatValue(data?.commission || 0),
      detail: 'Sobre vendas aprovadas',
      icon: IconReceiptDollar,
      variant: 'neutralLight',
    },
  ] as const

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Resumo de vendas
        </CardTitle>
        <PermissionGate
          requireAll
          permissions={['reports:sales:view', 'values:values:view']}
        >
          <Button asChild type="button" size="sm" variant="neutralOutline">
            <Link
              href={`/relatorios/vendas?startDate=${filters.startDate}&endDate=${filters.endDate}`}
            >
              Ver relatorio
            </Link>
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-[10px]" />
                  <div className="min-w-0 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            : cards.map((card) => (
                <div key={card.label} className="flex items-center gap-3">
                  <FeaturedIcon
                    size="md"
                    variant={card.variant as FeaturedIconProps['variant']}
                    Icon={card.icon}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray truncate">{card.label}</p>
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray truncate">{card.detail}</p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}

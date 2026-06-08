'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

import { getDashboardFinancialOverview } from '@/actions/dashboard'

import { formatCurrencyToBrl } from '@/lib/utils'

import {
  IconAlertCircle,
  IconCash,
  IconClockHour4,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface FinancialOverviewProps {
  filters: DashboardFilters
}

export function FinancialOverview({ filters }: FinancialOverviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-financial-overview', filters],
    queryFn: () => getDashboardFinancialOverview(filters),
  })

  const revenues = data?.revenues
  const expenses = data?.expenses
  const totals = data?.totals

  const realizedRevenue =
    totals?.receivables.totalPaid ?? revenues?.received ?? 0
  const realizedExpense = totals?.payables.totalPaid ?? expenses?.received ?? 0
  const expectedRevenue = totals?.receivables.expected ?? 0
  const expectedExpense = totals?.payables.expected ?? 0
  const pendingRevenue = Math.max(expectedRevenue - realizedRevenue, 0)
  const pendingExpense = Math.max(expectedExpense - realizedExpense, 0)
  const realizedBalance = realizedRevenue - realizedExpense
  const projectedBalance = expectedRevenue - expectedExpense
  const overdueTotal = (revenues?.overdue ?? 0) + (expenses?.overdue ?? 0)
  const overdueCount =
    (revenues?.overdueCount ?? 0) + (expenses?.overdueCount ?? 0)

  const cards = [
    {
      label: 'Receita realizada',
      value: formatCurrencyToBrl(realizedRevenue),
      detail: `${revenues?.receivedCount ?? 0} recebimentos`,
      icon: IconTrendingUp,
      variant: 'successLight',
    },
    {
      label: 'Despesa realizada',
      value: formatCurrencyToBrl(realizedExpense),
      detail: `${expenses?.receivedCount ?? 0} pagamentos`,
      icon: IconTrendingDown,
      variant: 'errorLight',
    },
    {
      label: 'Saldo realizado',
      value: formatCurrencyToBrl(realizedBalance),
      detail: `Projetado ${formatCurrencyToBrl(projectedBalance)}`,
      icon: IconCash,
      variant: realizedBalance >= 0 ? 'successLight' : 'errorLight',
    },
    {
      label: 'A realizar',
      value: formatCurrencyToBrl(pendingRevenue - pendingExpense),
      detail: `${formatCurrencyToBrl(pendingRevenue)} a receber`,
      icon: IconClockHour4,
      variant: 'warningLight',
    },
    {
      label: 'Vencidos',
      value: formatCurrencyToBrl(overdueTotal),
      detail: `${overdueCount} parcelas`,
      icon: IconAlertCircle,
      variant: 'errorLight',
    },
  ] as const

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Resumo financeiro
        </CardTitle>
        <PermissionGate
          requireAll
          permissions={['financial:flow:view', 'values:values:view']}
        >
          <Button asChild type="button" size="sm" variant="neutralOutline">
            <Link
              href={`/financeiro/fluxo-financeiro?startDate=${filters.startDate}&endDate=${filters.endDate}`}
            >
              Ver fluxo
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

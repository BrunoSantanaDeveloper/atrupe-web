'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

import { getDashboardFinancialOverview } from '@/actions/dashboard'

import { useDashboardValues } from './DashboardValuesContext'

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
  const { formatValue } = useDashboardValues()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-financial-overview', filters],
    queryFn: () => getDashboardFinancialOverview(filters),
  })

  const receivables = data?.totals?.receivables
  const payables = data?.totals?.payables

  const realizedRevenue = receivables?.totalPaid ?? 0
  const realizedExpense = payables?.totalPaid ?? 0
  const expectedRevenue = receivables?.expected ?? 0
  const expectedExpense = payables?.expected ?? 0

  // "A realizar" vem somado parcela a parcela pelo backend. O fallback
  // reproduz o cálculo antigo (previsto - pago do conjunto), que deixava
  // resíduo de toda parcela quitada por valor diferente do previsto;
  // serve só enquanto a API não estiver atualizada.
  const pendingRevenue =
    receivables?.open ?? Math.max(expectedRevenue - realizedRevenue, 0)
  const pendingExpense =
    payables?.open ?? Math.max(expectedExpense - realizedExpense, 0)

  const realizedBalance = realizedRevenue - realizedExpense
  // Projetado = o que já se realizou mais o que ainda está em aberto.
  // Usar `expected - expected` contava de novo a diferença das parcelas
  // quitadas por valor menor que o previsto.
  const projectedBalance = realizedBalance + pendingRevenue - pendingExpense

  const receivedCount = receivables?.paidCount ?? 0
  const paidCount = payables?.paidCount ?? 0
  const overdueTotal = (receivables?.overdue ?? 0) + (payables?.overdue ?? 0)
  const overdueCount =
    (receivables?.overdueCount ?? 0) + (payables?.overdueCount ?? 0)

  const cards = [
    {
      label: 'Receita realizada',
      value: formatValue(realizedRevenue),
      detail: `${receivedCount} recebimentos`,
      icon: IconTrendingUp,
      variant: 'successLight',
    },
    {
      label: 'Despesa realizada',
      value: formatValue(realizedExpense),
      detail: `${paidCount} pagamentos`,
      icon: IconTrendingDown,
      variant: 'errorLight',
    },
    {
      label: 'Saldo realizado',
      value: formatValue(realizedBalance),
      detail: `Projetado ${formatValue(projectedBalance)}`,
      icon: IconCash,
      variant: realizedBalance >= 0 ? 'successLight' : 'errorLight',
    },
    {
      label: 'A realizar',
      value: formatValue(pendingRevenue - pendingExpense),
      detail: `${formatValue(pendingRevenue)} a receber`,
      icon: IconClockHour4,
      variant: 'warningLight',
    },
    {
      label: 'Vencidos',
      value: formatValue(overdueTotal),
      detail: `${overdueCount} parcelas no período`,
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

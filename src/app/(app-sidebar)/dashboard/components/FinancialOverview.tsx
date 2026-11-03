'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Icon } from '@/components/ui/icon'

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

  // Realizado é o que foi pago no período (data de pagamento); a realizar e
  // vencidos são o que vence no período (vencimento).
  const paid = data?.byPaidDate
  const due = data?.byDueDate

  const realizedRevenue = paid?.receivables?.totalPaid ?? 0
  const realizedExpense = paid?.payables?.totalPaid ?? 0
  const expectedRevenue = due?.receivables?.expected ?? 0
  const expectedExpense = due?.payables?.expected ?? 0

  // "A realizar" vem somado parcela a parcela pelo backend. O fallback
  // reproduz o cálculo antigo (previsto - pago do conjunto), que deixava
  // resíduo de toda parcela quitada por valor diferente do previsto;
  // serve só enquanto a API não estiver atualizada.
  const pendingRevenue =
    due?.receivables?.open ??
    Math.max(expectedRevenue - (due?.receivables?.totalPaid ?? 0), 0)
  const pendingExpense =
    due?.payables?.open ??
    Math.max(expectedExpense - (due?.payables?.totalPaid ?? 0), 0)

  const realizedBalance = realizedRevenue - realizedExpense
  // Projetado = o que já se realizou mais o que ainda está em aberto.
  // Usar `expected - expected` contava de novo a diferença das parcelas
  // quitadas por valor menor que o previsto.
  const projectedBalance = realizedBalance + pendingRevenue - pendingExpense

  const receivedCount = paid?.receivables?.paidCount ?? 0
  const paidCount = paid?.payables?.paidCount ?? 0
  const overdueTotal =
    (due?.receivables?.overdue ?? 0) + (due?.payables?.overdue ?? 0)
  const overdueCount =
    (due?.receivables?.overdueCount ?? 0) + (due?.payables?.overdueCount ?? 0)

  const cards = [
    {
      label: 'Receita realizada',
      value: formatValue(realizedRevenue),
      detail: `${receivedCount} recebimentos`,
      icon: IconTrendingUp,
    },
    {
      label: 'Despesa realizada',
      value: formatValue(realizedExpense),
      detail: `${paidCount} pagamentos`,
      icon: IconTrendingDown,
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
    },
    {
      label: 'Vencidos',
      value: formatValue(overdueTotal),
      detail: `${overdueCount} parcelas no período`,
      icon: IconAlertCircle,
    },
  ] as const

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Resumo financeiro</CardTitle>
        <PermissionGate
          requireAll
          permissions={['financial:flow:view', 'values:values:view']}
        >
          <Button asChild type="button" size="sm" variant="neutralOutline">
            {/* Abre na data de pagamento, a mesma do realizado. */}
            <Link
              href={`/financeiro/fluxo-financeiro?startDate=${filters.startDate}&endDate=${filters.endDate}&dateType=paidDate`}
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
                  <Icon icon={card.icon} size="md" className="text-gray-600" />
                  <div className="min-w-0">
                    <p className="type-kpi-label truncate">{card.label}</p>
                    <p className="type-kpi-value truncate">{card.value}</p>
                    <p className="text-xs text-gray truncate">{card.detail}</p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}

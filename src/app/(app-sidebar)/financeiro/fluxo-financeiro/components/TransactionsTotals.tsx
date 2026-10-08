'use client'

// Icons
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconCash, IconCashBanknoteOff } from '@tabler/icons-react'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'

// Components
import { Skeleton } from '@/components/ui/skeleton'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import { getDataOld } from '@/actions/_cruds'

type TotalsType = {
  receivables: {
    expected: number
    totalPaid: number
    // Soma parcela a parcela do que ainda esta em aberto. Opcional porque
    // versoes anteriores da API nao devolviam o campo.
    open?: number
  }
  payables: {
    expected: number
    totalPaid: number
    open?: number
  }
}

interface Props extends SearchParamsType {}

export function TransactionsTotalsCard({ searchParams }: Props) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['financial-flow-totals', searchParams],
    queryFn: () =>
      getDataOld({ route: 'finFlowTotalsRoute', filters: searchParams }),
  })

  const totals: TotalsType = data || {
    receivables: {
      expected: 0,
      totalPaid: 0,
      open: 0,
    },
    payables: {
      expected: 0,
      totalPaid: 0,
      open: 0,
    },
  }

  // "A receber" / "A pagar" vem somado parcela a parcela pelo backend.
  // O fallback reproduz o calculo antigo (previsto - pago do conjunto),
  // que deixava residuo de toda parcela quitada por valor diferente do
  // previsto; serve so enquanto a API nao estiver atualizada.
  const receivablesOpen =
    totals.receivables.open ??
    totals.receivables.expected - totals.receivables.totalPaid
  const payablesOpen =
    totals.payables.open ?? totals.payables.expected - totals.payables.totalPaid

  const byPaidDate = searchParams?.dateType === 'paidDate'

  if (isLoading) {
    return (
      <div className="px-6 pt-6 flex flex-wrap gap-4">
        <div className="flex flex-col flex-[1_400px] gap-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-[1_400px] gap-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-6 flex flex-wrap gap-4">
      <div className="flex flex-col flex-[1_400px] gap-5">
        <div className="flex items-center gap-3">
          <FeaturedIcon size="sm" Icon={IconCashBanknoteOff} tone="error" />
          <span className="font-semibold text-gray-700">Não realizado</span>
          <span className="text-xs text-gray">
            {byPaidDate
              ? 'sem pagamento no período'
              : 'vence no período e está em aberto'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="type-kpi-label">A receber</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(receivablesOpen)}
            </p>
          </div>
          <div>
            <p className="type-kpi-label">A pagar</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(payablesOpen)}
            </p>
          </div>
          <div>
            <p className="type-kpi-label">Saldo</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(receivablesOpen - payablesOpen)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-[1_400px] gap-5">
        <div className="flex items-center gap-3">
          <FeaturedIcon size="sm" Icon={IconCash} tone="success" />
          <span className="font-semibold text-gray-700">Realizado</span>
          <span className="text-xs text-gray">
            {byPaidDate
              ? 'movimentado no período'
              : 'de títulos que vencem no período'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="type-kpi-label">Recebido</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(totals.receivables.totalPaid)}
            </p>
          </div>
          <div>
            <p className="type-kpi-label">Pago</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(totals.payables.totalPaid)}
            </p>
          </div>
          <div>
            <p className="type-kpi-label">Saldo</p>
            <p className="type-kpi-value">
              {formatCurrencyToBrl(
                totals.receivables.totalPaid - totals.payables.totalPaid,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

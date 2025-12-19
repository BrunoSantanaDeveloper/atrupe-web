'use client'

// Icons
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconThumbUp, IconThumbDown } from '@tabler/icons-react'

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
  }
  payables: {
    expected: number
    totalPaid: number
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
    },
    payables: {
      expected: 0,
      totalPaid: 0,
    },
  }

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
          <FeaturedIcon size="sm" Icon={IconThumbDown} variant="errorLight" />
          <span className="font-semibold text-gray-700">Não realizado</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray">A receber</p>
            <p className="text-lG font-medium text-gray-600">
              {formatCurrencyToBrl(
                totals.receivables.expected - totals.receivables.totalPaid,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray">A pagar</p>
            <p className="text-lG font-medium text-gray-600">
              {formatCurrencyToBrl(
                totals.payables.expected - totals.payables.totalPaid,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray">Saldo</p>
            <p className="text-lG font-medium">
              {formatCurrencyToBrl(
                totals.receivables.expected -
                  totals.receivables.totalPaid -
                  (totals.payables.expected - totals.payables.totalPaid),
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-[1_400px] gap-5">
        <div className="flex items-center gap-3">
          <FeaturedIcon size="sm" Icon={IconThumbUp} variant="successLight" />
          <span className="font-semibold text-gray-700">Realizado</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray">Recebido</p>
            <p className="text-lG font-medium text-gray-600">
              {formatCurrencyToBrl(totals.receivables.totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray">Pago</p>
            <p className="text-lG font-medium text-gray-600">
              {formatCurrencyToBrl(totals.payables.totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray">Saldo</p>
            <p className="text-lG font-medium">
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

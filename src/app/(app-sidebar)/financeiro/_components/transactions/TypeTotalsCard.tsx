'use client'

// Os totais de Contas a receber e de Contas a pagar (LITE part3, item 2):
// os do Fluxo financeiro, só do lado da tela. Montado só quando "Mostrar
// totais" é ligado.

// Third-party
import { useQuery } from '@tanstack/react-query'

// Components
import { Skeleton } from '@/components/ui/skeleton'

// Utils
import { getDataOld } from '@/actions/_cruds'
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

type Side = { expected: number; totalPaid: number; open?: number }

interface Props extends SearchParamsType {
  type: 'receivable' | 'payable'
}

export function TypeTotalsCard({ type, searchParams }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-flow-totals', type, searchParams],
    queryFn: () =>
      getDataOld({
        route: 'finFlowTotalsRoute',
        filters: { ...searchParams, type },
      }),
  })

  const side: Side = (type === 'receivable'
    ? data?.receivables
    : data?.payables) || { expected: 0, totalPaid: 0, open: 0 }
  const open = side.open ?? side.expected - side.totalPaid
  const receivable = type === 'receivable'

  const items = [
    {
      label: receivable ? 'Previsto a receber' : 'Previsto a pagar',
      value: side.expected,
    },
    { label: receivable ? 'Recebido' : 'Pago', value: side.totalPaid },
    { label: receivable ? 'A receber' : 'A pagar', value: open },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-6 pt-6 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <p className="type-kpi-label">{item.label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <p className="type-kpi-value">{formatCurrencyToBrl(item.value)}</p>
          )}
        </div>
      ))}
    </div>
  )
}

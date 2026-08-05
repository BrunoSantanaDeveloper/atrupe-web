'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { IconScale } from '@tabler/icons-react'

// Actions
import { getFinancialSummary } from '@/actions/financial-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  clientId: string
  startDate: string
  endDate: string
}

// As queryKeys/queryFn abaixo espelham as usadas pelo SummaryCards, então o
// react-query deduplica as requisições (sem chamada de rede extra).
export function ClientBalanceCards({ clientId, startDate, endDate }: Props) {
  const { data: receitas, isLoading: loadingReceitas } = useQuery({
    queryKey: ['financial-summary', startDate, endDate, clientId, 'receitas'],
    queryFn: () =>
      getFinancialSummary({ tab: 'receitas', startDate, endDate, clientId }),
  })

  const { data: despesas, isLoading: loadingDespesas } = useQuery({
    queryKey: ['financial-summary', startDate, endDate, clientId, 'despesas'],
    queryFn: () =>
      getFinancialSummary({ tab: 'despesas', startDate, endDate, clientId }),
  })

  const isLoading = loadingReceitas || loadingDespesas

  // Saldos consistentes com os valores exibidos nos cards do SummaryCards:
  // realizado = Recebidos − Pagos; previsto = A receber − A pagar.
  const saldoRealizado = (receitas?.received || 0) - (despesas?.received || 0)
  const saldoPrevisto = (receitas?.toReceive || 0) - (despesas?.toReceive || 0)

  const cards = [
    { label: 'Saldo realizado (Recebido − Pago)', value: saldoRealizado },
    { label: 'Saldo previsto (A receber − A pagar)', value: saldoPrevisto },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} className="p-6 flex items-center gap-3 rounded-xl">
            <Skeleton className="h-11 w-11 rounded-[10px] shrink-0" />
            <div className="flex flex-col min-w-0">
              <Skeleton className="h-4 w-40 mb-0.5" />
              <Skeleton className="h-6 w-24" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card) => {
        const variant: FeaturedIconProps['variant'] =
          card.value < 0 ? 'errorLight' : 'successLight'

        return (
          <Card
            key={card.label}
            className="p-6 flex items-center gap-3 rounded-xl"
          >
            <FeaturedIcon size="md" variant={variant} Icon={IconScale} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray truncate">{card.label}</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrencyToBrl(card.value)}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

'use client'

// Perdas por motivo (CRM fase 1, 24/10/2026): quanto deixou de ser vendido no
// período e por quê. Rejeições de orçamento de um lado, cancelamentos de
// ordem do outro. Reusa a barra de ranking; o nome traz a quantidade.

// React
import { useQuery } from '@tanstack/react-query'

// Components
import { RankingBarChart } from './RankingBarChart'

// Actions
import { getLossesByReason } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { LossByReasonData } from '../types'

interface LossesByReasonChartsProps extends SearchParamsType {}

const toRanking = (items: LossByReasonData[]) =>
  items.map((item) => ({
    name: `${item.reason} (${item.count})`,
    value: item.value,
  }))

export function LossesByReasonCharts({
  searchParams,
}: LossesByReasonChartsProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      'sales-losses-by-reason',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getLossesByReason({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RankingBarChart
        title="Orçamentos rejeitados por motivo"
        nameLabel="Motivo (quantidade)"
        items={toRanking(data?.rejections || [])}
        isLoading={isLoading}
      />
      <RankingBarChart
        title="Vendas canceladas por motivo"
        nameLabel="Motivo (quantidade)"
        items={toRanking(data?.cancellations || [])}
        isLoading={isLoading}
      />
    </div>
  )
}

'use client'

// React
import { useQuery } from '@tanstack/react-query'

// Components
import { RankingBarChart } from './RankingBarChart'

// Actions
import { getTopClients } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface TopClientsChartProps extends SearchParamsType {}

export function TopClientsChart({ searchParams }: TopClientsChartProps) {
  const { data: topClients = [], isLoading } = useQuery({
    queryKey: [
      'sales-top-clients',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getTopClients({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <RankingBarChart
      title="Melhores clientes"
      nameLabel="Cliente"
      items={topClients}
      isLoading={isLoading}
    />
  )
}

'use client'

// React
import { useQuery } from '@tanstack/react-query'

// Components
import { RankingBarChart } from './RankingBarChart'

// Actions
import { getTopProducts } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface TopProductsChartProps extends SearchParamsType {}

export function TopProductsChart({ searchParams }: TopProductsChartProps) {
  const { data: topProducts = [], isLoading } = useQuery({
    queryKey: [
      'sales-top-products',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getTopProducts({
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
      title="Produtos mais vendidos"
      nameLabel="Produto"
      items={topProducts}
      isLoading={isLoading}
    />
  )
}

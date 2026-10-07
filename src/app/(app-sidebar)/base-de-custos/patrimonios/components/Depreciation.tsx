'use client'

// React / Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

// Components
import { DepreciationData } from './DepreciationData'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { DepreciationSummaryCards } from './DepreciationSummaryCards'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import {
  getDepreciationAssets,
  getDepreciationCounts,
  getDepreciationTotals,
} from '@/actions/cost-base'

// Hooks / Store / Consts
import { assetStatusTabs } from '@/consts/cost-base'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import { IconBuildingWarehouse } from '@tabler/icons-react'

export function Depreciation({ searchParams }: SearchParamsType) {
  const status = (searchParams?.status as string) || 'ativos'

  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    staleTime: Infinity,
    queryKey: ['depreciation-totals'],
    queryFn: () => getDepreciationTotals(),
  })

  const { data: counts } = useQuery({
    staleTime: Infinity,
    queryKey: ['depreciation-counts'],
    queryFn: () => getDepreciationCounts(),
  })

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Trocar a situação mantém a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['depreciation-assets', searchParams],
    queryFn: () => getDepreciationAssets({ filters: searchParams }),
  })

  const assets = data?.data || []
  const hasAnyAsset = (totals?.data?.activeAssets ?? 0) > 0

  return (
    <div className="space-y-5">
      <DepreciationSummaryCards
        totals={totals?.data}
        isLoading={isLoadingTotals}
      />
      <Card>
        <CardHeader>
          <CardTitle>Relatório de depreciação</CardTitle>
          <CardDescription>
            De onde vem a depreciação que entra no custo dos setores. A edição
            acontece no cadastro do patrimônio.
          </CardDescription>
          <Tabs value={status} className="overflow-x-auto pt-4">
            <TabsList>
              {assetStatusTabs.map((tab) => (
                <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                  <Link href={`/base-de-custos/patrimonios?status=${tab.tab}`}>
                    {tab.label}
                    <Badge variant="neutralLight" className="ml-2">
                      {counts?.data?.[tab.tab] ?? 0}
                    </Badge>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        {isLoadingTotals ? (
          <TableSkeleton cols={9} rows={8} />
        ) : !hasAnyAsset ? (
          <ListDataTotalEmpty
            icon={IconBuildingWarehouse}
            title="Nenhum patrimônio cadastrado"
            description="Cadastre máquinas, móveis e veículos para acompanhar a depreciação."
          />
        ) : (
          <FetchingRegion isFetching={isPlaceholderData}>
            {isLoading || assets.length ? (
              <DepreciationData assets={assets} isLoading={isLoading} />
            ) : (
              <FilteredDataEmpty description="Nenhum patrimônio nesta situação." />
            )}
          </FetchingRegion>
        )}
      </Card>
    </div>
  )
}

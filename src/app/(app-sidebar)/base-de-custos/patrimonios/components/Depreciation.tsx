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
import { LoadError } from '../../components/LoadError'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { DepreciationSummaryCards } from './DepreciationSummaryCards'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AssetStatusFilter } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Actions
import { getDepreciationTotals } from '@/actions/cost-base'
import { getAssets, getAssetQuantity } from '@/actions/asset'

// Hooks / Store / Consts
import { assetStatusTabs } from '@/consts/cost-base'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import { IconBuildingWarehouse } from '@tabler/icons-react'

// As abas daqui não se repetem: "Ativos" é o bem que deprecia ou já
// depreciou, e revisão e inconsistência têm aba própria. No cadastro (/asset)
// essa situação é `em-depreciacao`; a `ativos` de lá junta tudo o que não
// está inativo
const STATUS_OF_TAB: { [tab: string]: Exclude<AssetStatusFilter, 'ativos'> } = {
  ativos: 'em-depreciacao',
  'em-revisao': 'em-revisao',
  inconsistencias: 'inconsistencias',
  inativos: 'inativos',
}

export function Depreciation({ searchParams }: SearchParamsType) {
  const requested = searchParams?.status || 'ativos'
  const tab = STATUS_OF_TAB[requested] ? requested : 'ativos'
  const status = STATUS_OF_TAB[tab]

  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    staleTime: Infinity,
    queryKey: ['depreciation-totals'],
    queryFn: () => getDepreciationTotals(),
  })

  // A lista e as contagens são as do cadastro de patrimônios (P-23). As
  // chaves começam por `assets` para o cadastro invalidar junto ao gravar
  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    staleTime: Infinity,
    queryKey: ['assets', 'quantity'],
    queryFn: () => getAssetQuantity(),
  })

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Trocar a situação mantém a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['assets', 'cost-base', status],
    queryFn: () => getAssets({ filters: { status } }),
  })

  const assets = data?.data || []
  // Os totais só contam os ativos: com as contagens, a empresa que só tem
  // bem inativo ainda chega à aba dos inativos
  const hasAnyAsset =
    (totals?.data?.activeAssets ?? 0) > 0 ||
    Object.values(counts?.data ?? {}).some((count) => count > 0)
  const failed = [totals, data].find((response) => response?.success === false)

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
          <Tabs value={tab} className="overflow-x-auto pt-4">
            <TabsList>
              {assetStatusTabs.map((item) => (
                <TabsTrigger key={item.tab} value={item.tab} asChild>
                  <Link href={`/base-de-custos/patrimonios?status=${item.tab}`}>
                    {item.label}
                    <Badge variant="neutralLight" className="ml-2">
                      {counts?.data?.[STATUS_OF_TAB[item.tab]] ?? 0}
                    </Badge>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        {/* As contagens também decidem se há patrimônio: sem elas, quem só
            tem bem inativo veria o vazio antes da lista */}
        {isLoadingTotals || isLoadingCounts ? (
          <TableSkeleton cols={9} rows={8} />
        ) : failed ? (
          <LoadError message={failed.message} />
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

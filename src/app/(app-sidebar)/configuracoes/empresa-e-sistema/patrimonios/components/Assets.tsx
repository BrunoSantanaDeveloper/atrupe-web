'use client'

// React / Next
import Link from 'next/link'
import { Fragment } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import Image from 'next/image'
import { NewAssetModal } from './NewAsset'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AssetKind } from '../types'

// Actions
import { getAssets, getAssetGroups } from '@/actions/assets'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  assetKindObj,
  assetUnitShort,
  assetLifeStatusObj,
} from '@/consts/assets'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconSearch,
  IconLayersLinked,
  IconBuildingWarehouse,
} from '@tabler/icons-react'

const sectors = [
  'Administração',
  'Impressão',
  'Produção',
  'Criação',
  'CNC',
  'Frota',
  'Gráfica',
  'Marcenaria',
].map((sector) => ({ value: sector, label: sector }))

const kindOrder: AssetKind[] = ['MACHINES', 'FURNITURE', 'VEHICLES']

// Sem depreciação calculada mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function Assets({ searchParams }: SearchParamsType) {
  const { data: groupsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['asset-groups'],
    queryFn: () => getAssetGroups(),
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['assets', searchParams],
    queryFn: () => getAssets({ filters: searchParams }),
  })

  const assets = data?.data || []
  const groups = (groupsData?.data || []).map((group) => ({
    value: group.id,
    label: group.name,
  }))

  const grouped = kindOrder
    .map((kind) => ({
      kind,
      assets: assets.filter((asset) => asset.kind === kind),
    }))
    .filter((item) => item.assets.length)

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Patrimônios"
          previousPage="/configuracoes/empresa-e-sistema"
          supportText="Máquinas, equipamentos, móveis e veículos da empresa"
          primaryCta={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="neutralOutline"
                LeftIcon={IconLayersLinked}
                asChild
              >
                <Link href="/configuracoes/empresa-e-sistema/patrimonios/grupos">
                  Grupos de bens
                </Link>
              </Button>
              <PermissionGate permissions={['cost:base:edit']}>
                <NewAssetModal sectors={sectors} groups={groups} />
              </PermissionGate>
            </div>
          }
        />
        <Card>
          {isLoading ? (
            <TableSkeleton cols={7} rows={8} />
          ) : !assets.length ? (
            searchParams?.search ? (
              <FilteredDataEmpty description="Nenhum patrimônio encontrado." />
            ) : (
              <ListDataTotalEmpty
                icon={IconBuildingWarehouse}
                title="Sem patrimônios cadastrados"
                description="Cadastre seu primeiro patrimônio"
              />
            )
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[940px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[26%] min-w-[200px]">
                        Patrimônio
                      </TableHead>
                      <TableHead className="w-[14%]">Setor</TableHead>
                      <TableHead className="w-[12%]">Unidade</TableHead>
                      <TableHead className="w-[14%] text-right">
                        Produtividade
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Depreciação mensal
                      </TableHead>
                      <TableHead className="w-[14%]">Status</TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grouped.map(({ kind, assets: kindAssets }) => (
                      <Fragment key={kind}>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={7}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {assetKindObj[kind]}
                              </span>
                              <Badge variant="neutralLight">
                                {kindAssets.length}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        {kindAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {asset.imageUrl && (
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      fill
                                      unoptimized
                                      src={asset.imageUrl}
                                      alt={asset.name}
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-sm text-gray">
                                    {asset.detailed
                                      ? 'Cadastro detalhado'
                                      : 'Cadastro simplificado'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{asset.sector}</TableCell>
                            <TableCell>
                              {asset.unit ? assetUnitShort[asset.unit] : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {asset.monthlyProductivity === null || !asset.unit
                                ? '-'
                                : `${asset.monthlyProductivity} ${assetUnitShort[asset.unit]}/mês`}
                            </TableCell>
                            <TableCell numeric>
                              {formatValue(asset.monthlyDepreciation)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                status
                                variant={
                                  assetLifeStatusObj[asset.status].variant
                                }
                              >
                                {assetLifeStatusObj[asset.status].text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <ActionButton
                                  Icon={IconSearch}
                                  tooltip={`Abrir ${asset.name}`}
                                  link={`/configuracoes/empresa-e-sistema/patrimonios/${asset.id}`}
                                />
                                <NewAssetModal
                                  asset={asset}
                                  sectors={sectors}
                                  groups={groups}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                {assets.length}{' '}
                {assets.length === 1 ? 'patrimônio' : 'patrimônios'}
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}

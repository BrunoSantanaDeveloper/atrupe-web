'use client'
import { useState } from 'react'

// UI component Imports
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Component Imports
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { ProductsGroupData } from './ProductsGroupData'
import { TabNavType, Topbar } from '@/components/common/Topbar'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Icon Imports
import { IconPackageOff } from '@tabler/icons-react'

// Component Imports
import {
  NewProductGroup,
  NewProductGroupTriggerButton,
} from './NewProductGroup'
import { PermissionGate } from '@/components/common/PermissionGate'

export function ProductsGroup({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-group-totals'],
    queryFn: () =>
      getDataOld({
        route: 'productGroupTotalsRoute',
        filters: { kind: 'PRODUCT' },
      }),
  })

  const totals: { [key: string]: number } = {
    ativos: data?.ACTIVES,
    inativos: data?.INACTIVES,
    todos: data?.TOTAL,
  }
  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVE',
      tab: 'ativos',
      label: 'Ativos',
      count: totals?.ativos,
    },
    {
      value: 'INACTIVE',
      tab: 'inativos',
      label: 'Inativos',
      count: totals?.inativos,
    },
  ]

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  return (
    <PermissionGate permissions={['product_settings:products:view']}>
      <div className="space-y-5">
        <Topbar
          title="Grupos de produtos"
          tabs={tabs}
          activeTab={searchParams?.status || 'ativos'}
          paramName="status"
          previousPage="/configuracoes/produtos"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:create']}>
              <NewProductGroupTriggerButton
                onOpenChange={() => {
                  setOpenDialog('new-group')
                }}
              />
            </PermissionGate>
          }
        />
        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Sem grupos de produtos para o status: ${statusLabel}`}
                  icon={IconPackageOff}
                />
              ) : (
                <>
                  <ProductsGroupData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconPackageOff}
                title="Sem grupos de produtos cadastrados"
                description="Cadastre seu primeiro grupo de produtos"
                cta={
                  <NewProductGroupTriggerButton
                    onOpenChange={() => setOpenDialog('new-group')}
                  />
                }
              />
            )}
          </Card>
        </div>
        <NewProductGroup
          editMode
          open={openDialog === 'edit-group'}
          onOpenChange={() => setOpenDialog('')}
        />
        <NewProductGroup
          open={openDialog === 'new-group'}
          onOpenChange={() => setOpenDialog('')}
        />
      </div>
    </PermissionGate>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// UI
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { ProductsData } from './ProductsTable/ProductsData'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { ProductsFilter } from './ProductsTable/ProductsFilter'
import { NewProduct, NewProductTriggerButton } from './NewProduct'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPackageOff, IconFolders } from '@tabler/icons-react'

export function Products({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')
  const router = useRouter()
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-totals'],
    queryFn: () => getDataOld({ route: 'productTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    ativos: data?.ACTIVE,
    inativos: data?.INACTIVE,
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
    <PermissionGate permissions={['product_settings:materials_products:view']}>
      <div className="space-y-5">
        <Topbar
          title="Produtos"
          tabs={tabs}
          activeTab={searchParams?.status || 'ativos'}
          paramName="status"
          primaryCta={
            <>
              <Button
                type="button"
                variant="neutralOutline"
                className="bg-transparent"
                LeftIcon={IconFolders}
                onClick={() => {
                  router.push('/configuracoes/produtos/grupo-de-produtos')
                }}
              >
                Grupos de produtos
              </Button>
              <PermissionGate
                permissions={['product_settings:materials_products:create']}
              >
                <NewProductTriggerButton
                  onOpenChange={() => {
                    setOpenDialog('new-product')
                  }}
                />
              </PermissionGate>
            </>
          }
        />
        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Sem produtos para o status: ${statusLabel}`}
                  icon={IconPackageOff}
                />
              ) : (
                <>
                  <TableFiltersHeader searchParams={searchParams}>
                    <ProductsFilter searchParams={searchParams} />
                  </TableFiltersHeader>
                  <ProductsData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconPackageOff}
                title="Sem produtos cadastrados"
                description="Cadastre seu primeiro produto"
                cta={
                  <NewProduct
                    open={openDialog === 'new-product'}
                    onOpenChange={() => setOpenDialog('')}
                  />
                }
              />
            )}
          </Card>
        </div>
        <NewProduct
          open={openDialog === 'new-product'}
          onOpenChange={() => setOpenDialog('')}
        />
      </div>
    </PermissionGate>
  )
}

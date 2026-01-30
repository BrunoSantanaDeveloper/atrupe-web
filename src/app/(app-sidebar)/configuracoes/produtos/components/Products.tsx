'use client'

import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { ProductsData } from './ProductsTable/ProductsData'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { ProductsFilter } from './ProductsTable/ProductsFilter'
import { NewProduct, NewProductTriggerButton } from './NewProduct'
import { ProductFiscalDataDialog } from './ProductFiscalData'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { ActionButton } from '@/components/common/ActionButton'

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
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedProductName, setSelectedProductName] = useState<string>('')
  const { hasAllPermissions } = usePermissions()
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
    <PermissionGate permissions={['product_settings:products:view']}>
      <div className="space-y-5">
        <Topbar
          title="Produtos"
          tabs={tabs}
          activeTab={searchParams?.status || 'ativos'}
          paramName="status"
          primaryCta={
            <TooltipProvider>
              <ActionButton
                tooltip="Grupos de produtos"
                size="iconMd"
                variant="neutralOutline"
                Icon={IconFolders}
                link="/configuracoes/produtos/grupo-de-produtos"
              />
              <PermissionGate
                permissions={['product_settings:products:create']}
              >
                <NewProductTriggerButton
                  onOpenChange={() => {
                    setOpenDialog('new-product')
                  }}
                />
              </PermissionGate>
            </TooltipProvider>
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
                    onSuccess={(product) => {
                      if (hasAllPermissions(['invoice_settings:nf:view'])) {
                        setTimeout(() => {
                          setSelectedProductId(product.id)
                          setSelectedProductName(product.name)
                          setOpenDialog('fiscal-data')
                        }, 500)
                      }
                    }}
                  />
                }
              />
            )}
          </Card>
        </div>
        <NewProduct
          open={openDialog === 'new-product'}
          onOpenChange={() => setOpenDialog('')}
          onSuccess={(product) => {
            if (hasAllPermissions(['invoice_settings:nf:view'])) {
              setTimeout(() => {
                setSelectedProductId(product.id)
                setSelectedProductName(product.name)
                setOpenDialog('fiscal-data')
              }, 500)
            }
          }}
        />
        <ProductFiscalDataDialog
          open={openDialog === 'fiscal-data'}
          productId={selectedProductId}
          productName={selectedProductName}
          onOpenChange={(open) => {
            if (!open) {
              setOpenDialog('')
              setSelectedProductId('')
              setSelectedProductName('')
            }
          }}
        />
      </div>
    </PermissionGate>
  )
}

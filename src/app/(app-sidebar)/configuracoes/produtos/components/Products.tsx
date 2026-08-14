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
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { ActionButton } from '@/components/common/ActionButton'
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { ProductListType } from '@/types/settings/products'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Libs
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPackageOff, IconFolders } from '@tabler/icons-react'

function getProductUnitKind(product: ProductListType) {
  return product.items?.[0]?.unitKind || 'UNITY'
}

function getVisualCurrencyValue(product: ProductListType, value: number) {
  return convertRawToUnitCost(getProductUnitKind(product), value || 0) / 100
}

const PRODUCT_EXPORT_COLUMNS: ExportColumn<ProductListType>[] = [
  {
    header: 'Produto',
    key: 'name',
  },
  {
    header: 'Codigo',
    key: 'code',
  },
  {
    header: 'Status',
    getValue: (product) => (product.isActive ? 'Ativo' : 'Inativo'),
  },
  {
    header: 'Grupo',
    getValue: (product) => product.category?.name,
  },
  {
    header: 'Setor',
    key: 'sectorName',
  },
  {
    header: 'Unidade',
    getValue: (product) => getProductUnitKind(product),
  },
  {
    header: 'Preco de venda',
    type: 'currency',
    getValue: (product) => getVisualCurrencyValue(product, product.unitCost),
  },
  {
    header: 'Valor total',
    type: 'currency',
    getValue: (product) => getVisualCurrencyValue(product, product.salePrice),
  },
]

// Colunas exclusivas do módulo de Nota Fiscal — só exportadas quando contratado
const PRODUCT_FISCAL_EXPORT_COLUMNS: ExportColumn<ProductListType>[] = [
  {
    header: 'NCM',
    getValue: (product) => product.fiscalData?.ncm,
  },
  {
    header: 'CEST',
    getValue: (product) => product.fiscalData?.cest,
  },
  {
    header: 'CFOP interno',
    getValue: (product) => product.fiscalData?.cfopInState,
  },
  {
    header: 'CFOP externo',
    getValue: (product) => product.fiscalData?.cfopOutState,
  },
  {
    header: 'ICMS CST',
    getValue: (product) => product.fiscalData?.icmsCst,
  },
  {
    header: 'PIS CST',
    getValue: (product) => product.fiscalData?.pisCst,
  },
  {
    header: 'COFINS CST',
    getValue: (product) => product.fiscalData?.cofinsCst,
  },
  {
    header: 'Codigo servico',
    getValue: (product) => product.fiscalData?.codigoServico,
  },
  {
    header: 'Aliquota ISS',
    type: 'percent',
    getValue: (product) => product.fiscalData?.aliquotaIss,
  },
  {
    header: 'Discriminacao',
    getValue: (product) => product.fiscalData?.discriminacao,
  },
]

export function Products({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedProductName, setSelectedProductName] = useState<string>('')
  const { hasAllPermissions } = usePermissions()
  const { hasFiscalModule } = usePlanFeatures()

  const canConfigureProductFiscalData =
    hasFiscalModule() && hasAllPermissions(['nota_fiscal:config:edit'])

  const exportColumns = hasFiscalModule()
    ? [...PRODUCT_EXPORT_COLUMNS, ...PRODUCT_FISCAL_EXPORT_COLUMNS]
    : PRODUCT_EXPORT_COLUMNS

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

  const getExportProducts = async () => {
    const exportStatus =
      tabs.find((tab) => tab.tab === searchParams.status)?.value || ''
    const filters = { ...searchParams, status: exportStatus }
    const result = await getData({ route: '/product/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as ProductListType[]
  }

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
              <PermissionGate
                permissions={['product_settings:products:export']}
              >
                <ExportDataButton
                  columns={exportColumns}
                  fileName="produtos"
                  getData={getExportProducts}
                  sheetName="Produtos"
                  emptyMessage="Nenhum produto disponivel para exportacao"
                />
              </PermissionGate>
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
                      if (canConfigureProductFiscalData) {
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
            if (canConfigureProductFiscalData) {
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

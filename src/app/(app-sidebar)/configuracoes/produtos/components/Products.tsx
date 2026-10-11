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
import { FEATURES } from '@/consts/features'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { FiscalPendenciasAlert } from './FiscalPendenciasAlert'
import { ActionButton } from '@/components/common/ActionButton'
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { ProductListType } from '@/types/settings/products'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'
import { toast } from 'sonner'
import { getLibrary, importFromLibrary } from '@/actions/product-assembly'
import { LibraryDialog } from '../[id]/composicao/components/AssemblyDialogs'
import type { LibraryEntry } from '../[id]/composicao/assembly'

// Libs
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'
import { DEMO_DATA } from '@/lib/demo'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPackageOff, IconFolders, IconBooks } from '@tabler/icons-react'

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
    header: 'Código',
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
    // unitCost é o preço de venda por unidade de medida (R$/m², R$/hora), o
    // mesmo da coluna "Preço de venda" da tela: o nome "Custo unitário" do
    // EC-28 fazia o cliente ler a própria tabela de preços como custo (CC-2)
    header: 'Preço de venda',
    type: 'currency',
    getValue: (product) => getVisualCurrencyValue(product, product.unitCost),
  },
  {
    // salePrice é o total da medida padrão, em centavos: não passa pela
    // conversão de unidade, que o multiplicava por 1.000.000 (EC-28)
    header: 'Valor total',
    type: 'currency',
    getValue: (product) => (product.salePrice || 0) / 100,
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
    header: 'Código do serviço',
    getValue: (product) => product.fiscalData?.codigoServico,
  },
  {
    header: 'Alíquota ISS',
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
  // A biblioteca de produtos (IP-7) vive aqui, na lista (03/10/2026): a
  // pessoa escolhe um produto de referência, cadastra o seu a partir dele e
  // a composição entra para ser revisada, um por vez
  const [libraryPick, setLibraryPick] = useState<LibraryEntry | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedProductName, setSelectedProductName] = useState<string>('')
  const { hasAllPermissions } = usePermissions()
  const { hasFiscalModule, hasFeature } = usePlanFeatures()

  const canConfigureProductFiscalData =
    hasFiscalModule() && hasAllPermissions(['nota_fiscal:config:edit'])
  // No PRO o produto recém-criado reabre na aba Composição (CP-16). A
  // composição e a biblioteca ainda rodam sobre dados de exemplo: só com a
  // flag de demonstração
  const canCompose = DEMO_DATA && hasFeature(FEATURES.COSTS.COST_BASE)
  const { data: libraryRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-library'],
    queryFn: () => getLibrary(),
    enabled: canCompose,
  })

  const openAfterCreate = (product: { id: string; name: string }) => {
    setTimeout(() => {
      setSelectedProductId(product.id)
      setSelectedProductName(product.name)
      setOpenDialog(canCompose ? 'compose-product' : 'fiscal-data')
    }, 500)
  }

  // EC-26: sem a permissão "Valores", a planilha sai sem as colunas de preço
  const canSeeValues = hasAllPermissions(['values:values:view'])

  const baseColumns = canSeeValues
    ? PRODUCT_EXPORT_COLUMNS
    : PRODUCT_EXPORT_COLUMNS.filter((column) => column.type !== 'currency')

  const exportColumns = hasFiscalModule()
    ? [...baseColumns, ...PRODUCT_FISCAL_EXPORT_COLUMNS]
    : baseColumns

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
                  emptyMessage="Nenhum produto disponível para exportação"
                />
              </PermissionGate>
              <ActionButton
                tooltip="Grupos de produtos"
                size="iconMd"
                variant="neutralOutline"
                Icon={IconFolders}
                link="/configuracoes/produtos/grupo-de-produtos"
              />
              {canCompose && (
                <PermissionGate
                  permissions={['product_settings:products:create']}
                >
                  <ActionButton
                    tooltip="Biblioteca de produtos"
                    size="iconMd"
                    variant="neutralOutline"
                    Icon={IconBooks}
                    onClick={() => setOpenDialog('library')}
                  />
                </PermissionGate>
              )}
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
        <LibraryDialog
          open={openDialog === 'library'}
          entries={libraryRes?.data || []}
          hasStages={false}
          onOpenChange={() => setOpenDialog('')}
          onImport={(libraryId) => {
            const entry = (libraryRes?.data || []).find(
              (item) => item.id === libraryId,
            )
            if (!entry) return
            setLibraryPick(entry)
            setOpenDialog('library-product')
          }}
        />
        {/* O produto nasce do item da biblioteca: nome e descritivo vêm
            preenchidos; ao salvar, a composição de referência entra e o
            produto abre na aba Composição para ser revisado */}
        <NewProduct
          open={openDialog === 'library-product'}
          initialValues={
            libraryPick
              ? {
                  name: libraryPick.name,
                  technicalDescription: libraryPick.description,
                }
              : undefined
          }
          onOpenChange={() => {
            setOpenDialog('')
            setLibraryPick(null)
          }}
          onSuccess={async (product) => {
            if (!libraryPick || !product?.id) return
            const res = await importFromLibrary({
              productId: product.id,
              libraryId: libraryPick.id,
            })
            if (!res.success) toast.error(res.message)
            else
              toast.success(
                'Composição de referência importada. Revise materiais, tempos e valores antes de liberar para venda.',
              )
            setLibraryPick(null)
            openAfterCreate(product)
          }}
        />
        <FiscalPendenciasAlert />

        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhum produto para o status: ${statusLabel}`}
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
                title="Nenhum produto cadastrado"
                description="Cadastre seu primeiro produto"
                cta={
                  <NewProduct
                    open={openDialog === 'new-product'}
                    onOpenChange={() => setOpenDialog('')}
                    onSuccess={(product) => {
                      if (canCompose || canConfigureProductFiscalData) {
                        openAfterCreate(product)
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
            if (canCompose || canConfigureProductFiscalData) {
              openAfterCreate(product)
            }
          }}
        />
        <NewProduct
          open={openDialog === 'compose-product'}
          editMode
          productId={selectedProductId}
          initialTab="composition"
          onOpenChange={(open) => {
            if (!open) {
              setOpenDialog('')
              setSelectedProductId('')
              setSelectedProductName('')
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

'use client'

// React
import { useState } from 'react'

// Components
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { NewProduct, NewProductTriggerButton } from '../NewProduct'
import { ProductFiscalDataDialog } from '../ProductFiscalData'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { ProductListType } from '@/types/settings/products'
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Third-party
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function ProductsData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedProductName, setSelectedProductName] = useState<string>('')

  const { hasAllPermissions } = usePermissions()

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-list', searchParams],
    queryFn: () => getDataOld({ route: 'productRoute', filters }),
  })

  const products: ProductListType[] = data?.data || []
  const hasData = products.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Produto</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>P.V.</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product?.id}>
                  <TableCell>
                    <p className="font-medium">{product?.name}</p>
                    <p className="text-gray">{product?.code}</p>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <Badge variant="neutralLight">{product?.sectorName}</Badge>
                  </TableCell>
                  <TableCell className="text-success-700">
                    {(() => {
                      const unitKind = product?.items?.[0]?.unitKind || 'UNITY'
                      const visualUnitCost = convertRawToUnitCost(
                        unitKind,
                        product?.unitCost || 0,
                      )
                      return formatCurrencyToBrl(visualUnitCost)
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <PermissionGate
                          permissions={['product_settings:products:edit']}
                        >
                          <NewProductTriggerButton
                            editMode
                            onOpenChange={() => {
                              setOpenDialog('edit-product')
                              setSelectedProductId(product?.id)
                            }}
                          />
                        </PermissionGate>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <FilteredDataEmpty
            title="Produto não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre um novo produto"
            cta={
              <NewProductTriggerButton
                onOpenChange={() => setOpenDialog('new-product')}
              />
            }
          />
        )}
      </CardContent>

      <NewProduct
        open={openDialog === 'new-product'}
        onOpenChange={() => setOpenDialog('')}
        onSuccess={(product) => {
          const hasPermission = hasAllPermissions(['invoice_settings:nf:view'])

          if (hasPermission) {
            // Increased timeout to ensure NewProduct modal is fully closed and state is settled
            setTimeout(() => {
              setSelectedProductId(product.id)
              setSelectedProductName(product.name)
              setOpenDialog('fiscal-data')
            }, 500)
          }
        }}
      />
      <NewProduct
        open={openDialog === 'edit-product'}
        editMode
        productId={selectedProductId}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog('')
            setSelectedProductId('')
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
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
    </>
  )
}

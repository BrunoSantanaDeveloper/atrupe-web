'use client'

// React
import { useState } from 'react'

// Components
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { NewProduct, NewProductTriggerButton } from '../NewProduct'
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

// Third-party
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function ProductsData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')

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
                    {formatCurrencyToBrl(product?.salePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <PermissionGate
                          permissions={[
                            'product_settings:materials_products:edit',
                          ]}
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

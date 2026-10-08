'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

// Actions
import { getProductsSold } from '@/actions/products-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatQuantity, formatUnit } from '../utils'

export function ProductsTable({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: ['products-sold', searchParams],
    queryFn: () =>
      getProductsSold({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  const products = data?.products ?? []
  const totalValue = data?.totalValue ?? 0

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <span className="font-medium">Produtos vendidos</span>
        <Badge variant="neutralLight" className="font-medium">
          {products.length}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd. vendida</TableHead>
                <TableHead>Un. comercial</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : products.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd. vendida</TableHead>
                <TableHead>Un. comercial</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={`${product.productId}-${product.unit}`}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right text-gray-600 text-nowrap">
                    {formatQuantity(product.quantity)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatUnit(product.unit)}
                  </TableCell>
                  <TableCell className="text-right text-success-700 text-nowrap">
                    {formatCurrencyToBrl(product.value)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 border-t border-gray-200">
                <TableCell colSpan={3} className="font-semibold">
                  Total dos produtos no período
                </TableCell>
                <TableCell className="text-right font-semibold text-nowrap">
                  {formatCurrencyToBrl(totalValue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="p-6">
            <FilteredDataEmpty
              title="Nenhum produto vendido"
              description="Não encontramos produtos vendidos no período selecionado."
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

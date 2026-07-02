'use client'

// Next
import { notFound } from 'next/navigation'

// React
import { useState } from 'react'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { OrderItems } from './OrderItems'
import { OrderFinancial } from './Financial'
import { OrderActions } from './OrderActions'
import { Topbar } from '@/components/common/Topbar'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { QuotationSummary } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/Summary'
import { QuotationDelivery } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/Delivery'
import { QuotationPaymentConditions } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/PaymentConditions'
import { EditOrderInfoDialog } from './OrderActions/EditOrderInfo'

// Lib
import { cn } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Types
import { OrderType } from '@/types/sales/order'

// Actions
import { getItemOld } from '@/actions/_cruds'

// Consts
import { ordersStatusObj } from '@/consts/orders'

import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  id: string
}

export function Order({ id }: Props) {
  const [editOrderOpen, setEditOrderOpen] = useState(false)
  const previousUrl = '/vendas/ordens-de-servico' // TODO : incluir parametros de busca anteriores se houver

  // const isMutating = useIsMutating()
  // const isFetching = useIsFetching()

  const { data, isLoading, error } = useQuery<OrderType>({
    staleTime: Infinity,
    queryKey: ['order-data', id],
    queryFn: () => getItemOld({ route: 'orderRoute', id }),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Topbar title="Ordem de serviço" previousPage={previousUrl} />
        <div className="pt-2">
          <div
            className={cn(
              buttonVariants({ variant: 'neutralLight' }),
              'h-[74px] w-48 px-6 gap-3 shadow justify-start bg-white rounded-lg border border-gray-200 ',
            )}
          >
            <Skeleton className="size-[38px] rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Card className="w-full pb-[2px]">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <TableSkeleton cols={6} rows={3} />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error || !data) notFound()

  return (
    <PermissionGate permissions={['sale:order:view']}>
      <div
        className={cn(
          'space-y-5',
          // (isMutating || isFetching) && 'pointer-events-none',
        )}
      >
        <Topbar
          title={`Ordem de serviço #${data?.quotation?.serie?.quotation || ''}-${data?.quotation?.serie?.code || ''}`}
          supportText={data?.quotation?.client?.name || ''}
          previousPage={previousUrl}
          badge={ordersStatusObj[data?.status]}
        />
        <div className="space-y-3">
          <OrderActions data={data} />
          <QuotationSummary
            data={data?.quotation}
            onEditClick={() => setEditOrderOpen(true)}
            editDisabled={data?.status === 'CANCELED'}
          />
          <EditOrderInfoDialog
            data={data}
            open={editOrderOpen}
            onOpenChange={setEditOrderOpen}
          />
          <OrderItems data={data} />
          <QuotationDelivery quotationData={data?.quotation} />
          <QuotationPaymentConditions quotationData={data?.quotation} />
          <OrderFinancial data={data} />
        </div>
      </div>
    </PermissionGate>
  )
}

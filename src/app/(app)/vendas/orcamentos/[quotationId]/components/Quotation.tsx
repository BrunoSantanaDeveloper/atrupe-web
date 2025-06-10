'use client'

// Next
import Link from 'next/link'
import { notFound } from 'next/navigation'

// UI
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { QuotationSummary } from './Summary'
import { QuotationDelivery } from './Delivery'
import { QuotationItems } from './QuotationItems'
import { Topbar } from '@/components/common/Topbar'
import { QuotationActions } from './QuotationActions'
import { QuotationPaymentConditions } from './PaymentConditions'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Lib
import { cn } from '@/lib/utils'

// Third-party
import { useQuery, useIsMutating, useIsFetching } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { getItemOld } from '@/actions/_cruds'

// Icons
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconReportMoney, IconExternalLink } from '@tabler/icons-react'

// Consts
import { quotationsStatusObj } from '@/consts/quotations'
import { QuotationProvider } from '@/contexts/quotationContext'

// Hooks
import { usePreviousUrl } from '@/hooks/usePreviousUrl'

interface Props {
  id: string
}

export function Quotation({ id }: Props) {
  const isMutating = useIsMutating()
  const isFetching = useIsFetching()
  const previousUrl = usePreviousUrl('/vendas/orcamentos')

  const { data, isLoading, error } = useQuery<QuotationType>({
    staleTime: Infinity,
    queryKey: ['quotation-data', id],
    queryFn: () => getItemOld({ route: 'quotationRoute', id }),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Topbar title="Orçamento" previousPage={previousUrl} />
        <div className="pt-2">
          <div className="inline-flex items-center h-[70px] w-42 px-6 gap-3 shadow justify-start bg-white rounded-lg border border-gray-200 ">
            <Skeleton className="size-[38px] rounded-full" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[40px]" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="size-[38px] ml-auto" />
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
              <Skeleton className="size-[40px]" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="size-[38px] ml-auto" />
            </div>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[40px]" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="size-[38px] ml-auto" />
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error || !data) notFound()

  if (data.status === 'APPROVED') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="max-w-[352px] text-center space-y-6">
          <div>
            <FeaturedIcon
              Icon={IconReportMoney}
              size="xl"
              variant="borderedLight"
              rounded
            />
            <p className="font-semibold text-lg mt-4 mb-1">
              Orçamento aprovado
            </p>
            <p className="text-sm text-gray">
              Este orçamento já foi aprovado. Para acompanhar o andamento,
              acesse a ordem de serviço
            </p>
          </div>
          {data?.orderId && (
            <Button type="button" asChild RightIcon={IconExternalLink}>
              <Link href={`/vendas/ordens-de-servico/${data?.orderId}`}>
                Ver ordem de serviço
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PermissionGate permissions={['sale:quotation:view']}>
      <div
        className={cn(
          'relative space-y-5',
          (isMutating > 0 || isFetching > 0) &&
            'pointer-events-none opacity-50',
        )}
      >
        <Topbar
          title={`Orçamento #${data?.serie?.quotation || ''}-${data?.serie?.code || ''}`}
          supportText={data?.client?.name || ''}
          previousPage={previousUrl}
          badge={
            quotationsStatusObj[data?.status] || {
              text: 'Desconhecido',
              variant: 'neutralLight',
            }
          }
          label={data?.quickSale ? 'Venda Rápida' : ''}
        />
        <div className="space-y-3">
          <QuotationActions data={data} />
          <QuotationSummary data={data} />
          <QuotationProvider>
            <QuotationItems data={data} />
          </QuotationProvider>
          <QuotationDelivery quotationData={data} />
          <QuotationPaymentConditions quotationData={data} />
        </div>
        {isMutating > 0 || isFetching > 0 ? (
          <Spinner classname="absolute top-1/2 left-1/2 size-10 -ml-5" />
        ) : null}
      </div>
    </PermissionGate>
  )
}

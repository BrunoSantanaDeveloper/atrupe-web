'use client'

// Next
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useSession } from 'next-auth/react'

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { QuotationSummary } from './Summary'
import { QuotationDelivery } from './Delivery'
import { QuotationItems } from './QuotationItems'
import { Topbar } from '@/components/common/Topbar'
import { QuotationActions } from './QuotationActions'
import { QuotationTopbar } from './QuotationTopbar'
import { CreditBanner } from './CreditBanner'
import { PaymentHoldBanner } from './PaymentHoldBanner'
import { FollowUp } from './FollowUp'
import { AlertBanner } from '@/components/ui/alert-banner'
import { QuickSaleQuotation } from './QuickSaleQuotation'
import { QuotationPaymentConditions } from './PaymentConditions'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Lib
import { cn } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { getItemOld } from '@/actions/_cruds'

// Icons
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  IconReportMoney,
  IconExternalLink,
  IconMessageCircleOff,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Consts
import { QuotationProvider } from '@/contexts/quotationContext'

interface Props {
  id: string
}

export const QUOTATION_DATA_QUERY_KEY = 'quotation-data'

export function Quotation({ id }: Props) {
  const previousUrl = '/vendas/orcamentos' // TODO : incluir parametros de busca anteriores se houver
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin

  // const isMutating = useIsMutating()
  // const isFetching = useIsFetching()

  const { data, isLoading, error } = useQuery<QuotationType>({
    staleTime: Infinity,
    queryKey: [QUOTATION_DATA_QUERY_KEY, id],
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

  // A venda rápida tem arranjo próprio: recebimento no lugar das condições de
  // pagamento, e a situação no caixa depois que ela sai (Fase 7.3)
  // O recebimento é da série (VR-5, 26/10/2026): a série que fatura na frente
  // de caixa troca as condições de pagamento pelo Cobrar / Enviar ao caixa,
  // na venda rápida ou no orçamento comum
  if (
    data.paymentConditions?.billing === 'ON_CHECKOUT' ||
    data.paymentConditions?.billing === 'ON_SALE'
  ) {
    return <QuickSaleQuotation data={data} previousUrl={previousUrl} />
  }

  if (data.status === 'APPROVED' && !isAdmin) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="max-w-[352px] text-center space-y-6">
          <div>
            <FeaturedIcon Icon={IconReportMoney} size="lg" tone="brand" />
            <p className="font-semibold text-lg mt-4 mb-1">
              Orçamento aprovado
            </p>
            <p className="text-sm text-gray">
              Este orçamento já foi aprovado. Para acompanhar o andamento,
              acesse a ordem de serviço
            </p>
          </div>
          {data?.orderId && (
            <Button type="button" asChild>
              <Link href={`/vendas/ordens-de-servico/${data?.orderId}`}>
                Ver ordem de serviço
                <IconExternalLink
                  aria-hidden
                  size={ICON_SIZE.md}
                  className="ml-auto"
                />
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Se for "Sem lançamento" (Cortesia por exemplo), não exibir condições de pagamento
  if (data.status === 'APPROVED' && isAdmin) {
    return (
      <PermissionGate permissions={['sale:quotation:view']}>
        <div className="relative space-y-5">
          <QuotationTopbar data={data} previousUrl={previousUrl} />
          <Card className="w-full">
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FeaturedIcon Icon={IconReportMoney} size="md" tone="brand" />
                <div>
                  <p className="font-semibold text-base text-gray-700">
                    Orçamento aprovado
                  </p>
                  <p className="text-sm text-gray">
                    A ordem de serviço já foi criada para esta venda.
                  </p>
                </div>
              </div>
              {data?.orderId && (
                <Button type="button" asChild>
                  <Link href={`/vendas/ordens-de-servico/${data?.orderId}`}>
                    Ver ordem de serviço
                    <IconExternalLink
                      aria-hidden
                      size={ICON_SIZE.md}
                      className="ml-auto"
                    />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
          <QuotationSummary data={data} />
        </div>
      </PermissionGate>
    )
  }

  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'

  return (
    <PermissionGate permissions={['sale:quotation:view']}>
      <div
        className={cn(
          'relative space-y-5',
          // (isMutating > 0 || isFetching > 0) &&
          //   'pointer-events-none opacity-50',
        )}
      >
        <QuotationTopbar data={data} previousUrl={previousUrl} />
        <div className="space-y-3">
          {/* O motivo da rejeição fica à vista (CRM fase 1) */}
          {data?.status === 'REJECTED' && data?.rejectionReason ? (
            <AlertBanner
              variant="error"
              icon={IconMessageCircleOff}
              className="rounded-lg border"
              title={`Rejeitado: ${data.rejectionReason.reason}`}
            />
          ) : null}
          {/* A venda pendente diz o que espera; o crédito já foi conferido
              na aprovação com pendência (PA-4) */}
          {data?.status === 'PENDING_PAYMENT' ? (
            <PaymentHoldBanner data={data} />
          ) : (
            <CreditBanner data={data} />
          )}
          <QuotationActions data={data} />
          <FollowUp data={data} />
          <QuotationSummary data={data} />
          <QuotationProvider>
            <QuotationItems data={data} />
          </QuotationProvider>
          <QuotationDelivery quotationData={data} />
          {!isNoInvoice && <QuotationPaymentConditions quotationData={data} />}
        </div>
        {/* {isMutating > 0 || isFetching > 0 ? (
          <Spinner classname="absolute top-1/2 left-1/2 size-10 -ml-5" />
        ) : null} */}
      </div>
    </PermissionGate>
  )
}

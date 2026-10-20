'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { DuplicateQuotationButton } from '@/components/common/DuplicateQuotationButton'
import { CancelOrderButton } from './CancelOrderButton'
import { OrderHistoryDialog } from '../OrderHistory/OrderHistoryDialog'
import { InvoiceTypeSelectModal } from '@/app/(app-sidebar)/nota-fiscal/emitir/components/InvoiceTypeSelectModal'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { OrderListType, OrderType } from '@/types/sales/order'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getData, getItem } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { toast } from 'sonner'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ordersStatusObj } from '@/consts/orders'

// Icons
import {
  IconPrinter,
  IconSearch,
  IconHistory,
  IconFileInvoice,
} from '@tabler/icons-react'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { buildPdfFileName } from '@/components/common/PrintQuotation/buildPdfFileName'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useNotifyPlanErrorOnce } from '@/hooks/usePlanErrorToast'
import {
  FiscalEnvironmentBadge,
  resolveFiscalEnvironment,
  useFiscalEnvironmentConfig,
} from '@/components/common/fiscal/FiscalEnvironmentBadge'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export function OrdersData({ searchParams, tabs, searchDescription }: Props) {
  const [rowData, setRowData] = useState<OrderType | null>(null)
  const [openPrintDialog, setOpenPrintDialog] = useState(false)
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [openInvoiceTypeModal, setOpenInvoiceTypeModal] = useState(false)
  const [loadingProdPDF, setLoadingProdPDF] = useState([''])

  // Hook para controle de features
  const { hasFeature } = usePlanFeatures()
  const showCurrentPhase = hasFeature('service_order_current_phase')

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  const filters = { ...searchParams, status }

  const handleGenerateProductionPDF = async (order: OrderType) => {
    const formData = {
      showImages: true,
      showDimensions: true,
      showUnitValue: true,
      showFinalValue: true,
      showTotalValue: true,
      showPaymentDelivery: true,
      showItemsDetails: true,
    }

    setLoadingProdPDF([...loadingProdPDF, order.id])

    try {
      const result = await getItem({
        route: `sale/quotation/${order?.quotation?.id}/pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData = result.data

      const [{ pdf }, { GeneratePdf }] = await Promise.all([
        import('@react-pdf/renderer'),

        import('@/components/common/PrintQuotation/GeneratePdf'),
      ])

      const blob = await pdf(
        <GeneratePdf
          data={pdfData}
          type="production"
          printOptions={formData}
        />,
      ).toBlob()

      const fileName = buildPdfFileName(pdfData, 'production')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erro ao gerar ficha de produção')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setLoadingProdPDF([])
    }
  }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['order-list', searchParams],
    queryFn: () => getData({ route: '/sale/order', filters }),
  })
  // Filtrada pelo cliente, a lista é a aba Ordens de serviço do cadastro,
  // recurso de plano: o servidor recusa sem ele.
  useNotifyPlanErrorOnce(data)

  const orderArray: OrderListType[] = data?.data || []
  const hasData = orderArray.length

  // Calcular colSpan baseado no número de colunas
  const totalColumns = showCurrentPhase ? 5 : 4

  const hasFiscalModule = hasFeature('nota_fiscal')
  const { data: fiscalConfig } = useFiscalEnvironmentConfig()
  const activeEnvironment = {
    nfe: resolveFiscalEnvironment(fiscalConfig, 'NFE') === 'PRODUCAO' ? 1 : 2,
    nfse: resolveFiscalEnvironment(fiscalConfig, 'NFSE') === 'PRODUCAO' ? 1 : 2,
    nfce: resolveFiscalEnvironment(fiscalConfig, 'NFCE') === 'PRODUCAO' ? 1 : 2,
  }

  return (
    <>
      <CardContent>
        {hasFiscalModule && (
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <FiscalEnvironmentBadge documentType="NFE" showDocumentType />
            <FiscalEnvironmentBadge documentType="NFSE" showDocumentType />
            <FiscalEnvironmentBadge documentType="NFCE" showDocumentType />
          </div>
        )}
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="max-w-96">Referência</TableHead>
                    <PermissionGate permissions={['values:values:view']}>
                      <TableHead>Valor</TableHead>
                    </PermissionGate>
                    <TableHead>Vendedor</TableHead>
                    {showCurrentPhase && <TableHead>Fase atual</TableHead>}
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeletonRows cols={totalColumns} />
                  ) : (
                    orderArray.map((group) => (
                      <Fragment key={group.date}>
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={totalColumns}
                            className="text-gray font-medium text-xs py-3"
                          >
                            {formatToWeekDate(group?.date)}
                          </TableCell>
                        </TableRow>
                        {group?.orders?.length
                          ? group?.orders.map((order) => {
                              const link = `/vendas/ordens-de-servico/${order?.id}`
                              const quotation = order?.quotation
                              const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${quotation?.description}`
                              const authorizedNfe = order?.nfes?.find(
                                (nfe) =>
                                  nfe.status === 'AUTHORIZED' &&
                                  nfe.ambiente === activeEnvironment.nfe,
                              )
                              const issuedNfce = order?.nfces?.find(
                                (nfce) =>
                                  ['AUTHORIZED', 'CONTINGENCY'].includes(
                                    nfce.status,
                                  ) && nfce.ambiente === activeEnvironment.nfce,
                              )
                              const issuedNfse = order?.nfses?.find(
                                (nfse) =>
                                  nfse.status === 'AUTHORIZED' &&
                                  nfse.ambiente === activeEnvironment.nfse,
                              )
                              const otherEnvironmentDocuments = [
                                order?.nfes?.some(
                                  (nfe) =>
                                    nfe.status === 'AUTHORIZED' &&
                                    nfe.ambiente !== activeEnvironment.nfe,
                                ) && 'NF-e',
                                order?.nfces?.some(
                                  (nfce) =>
                                    ['AUTHORIZED', 'CONTINGENCY'].includes(
                                      nfce.status,
                                    ) &&
                                    nfce.ambiente !== activeEnvironment.nfce,
                                ) && 'NFC-e',
                                order?.nfses?.some(
                                  (nfse) =>
                                    nfse.status === 'AUTHORIZED' &&
                                    nfse.ambiente !== activeEnvironment.nfse,
                                ) && 'NFS-e',
                              ].filter(Boolean) as string[]

                              return (
                                <TableRow
                                  key={order?.id}
                                  className="text-nowrap"
                                >
                                  <TableCell className="max-w-96">
                                    <p className="font-medium">
                                      {quotation?.client?.name ||
                                        'Cliente não informado'}
                                    </p>
                                    <Link
                                      href={link}
                                      className="text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                                    >
                                      <p className="truncate">{description}</p>
                                    </Link>
                                    {otherEnvironmentDocuments.length > 0 && (
                                      <Badge
                                        variant="neutralLight"
                                        className="mt-1"
                                      >
                                        {otherEnvironmentDocuments.join(', ')}{' '}
                                        emitida em outro ambiente
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <PermissionGate
                                    permissions={['values:values:view']}
                                  >
                                    <TableCell className="text-success-700 text-nowrap">
                                      {formatCurrencyToBrl(
                                        (() => {
                                          // Cálculo igual ao PaymentConditions.tsx
                                          const itemsValue =
                                            quotation?.totalValue || 0
                                          const deliveryValue =
                                            quotation?.deliveryInfo?.value ?? 0
                                          const payment =
                                            quotation?.quotationPayment
                                          const commissionValue =
                                            payment?.commission?.type === 'ADD'
                                              ? (payment?.commission
                                                  ?.totalCommission ?? 0)
                                              : 0
                                          const installmentsAdditionalFee =
                                            payment?.quotationInstallment?.reduce(
                                              (
                                                acc: number,
                                                inst: {
                                                  additionalFee?: number
                                                },
                                              ) =>
                                                acc +
                                                (inst?.additionalFee ?? 0),
                                              0,
                                            ) ?? 0
                                          const downPaymentAdditionalFee =
                                            payment?.downPaymentAdditionalFee ??
                                            0
                                          const totalAdditionalFee =
                                            installmentsAdditionalFee +
                                            downPaymentAdditionalFee
                                          const discountTotal =
                                            payment?.discountTotal ?? 0

                                          return (
                                            itemsValue +
                                            deliveryValue +
                                            commissionValue +
                                            totalAdditionalFee -
                                            discountTotal
                                          )
                                        })(),
                                      )}
                                    </TableCell>
                                  </PermissionGate>
                                  <TableCell className="text-gray-600">
                                    {quotation?.seller?.name}
                                  </TableCell>
                                  {showCurrentPhase && (
                                    <TableCell>
                                      {order?.status ? (
                                        <Badge
                                          status
                                          variant={
                                            ordersStatusObj[order?.status]
                                              ?.variant
                                          }
                                        >
                                          {ordersStatusObj[order?.status]?.text}
                                        </Badge>
                                      ) : (
                                        '-'
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <TooltipProvider>
                                        <PermissionGate
                                          permissions={['sale:order:view']}
                                        >
                                          <ActionButton
                                            link={link}
                                            Icon={IconSearch}
                                            tooltip="Visualizar venda"
                                          />
                                        </PermissionGate>
                                        <PermissionGate
                                          permissions={['sale:order:view']}
                                        >
                                          <ActionButton
                                            Icon={IconPrinter}
                                            tooltip="Via do cliente"
                                            onClick={() => {
                                              setRowData(order)
                                              setOpenPrintDialog(true)
                                            }}
                                          />
                                        </PermissionGate>
                                        <PermissionGate
                                          permissions={['sale:order:view']}
                                        >
                                          <ActionButton
                                            Icon={IconPrinter}
                                            tooltip="Ficha de produção"
                                            isLoading={loadingProdPDF.includes(
                                              order?.id,
                                            )}
                                            onClick={() =>
                                              handleGenerateProductionPDF(order)
                                            }
                                          />
                                        </PermissionGate>
                                        <PermissionGate
                                          permissions={[
                                            'sale:quotation:create',
                                          ]}
                                        >
                                          <DuplicateQuotationButton
                                            quotationId={order?.quotation?.id}
                                            clientId={quotation?.client?.id}
                                            clientName={quotation?.client?.name}
                                            description={quotation?.description}
                                            tooltip="Duplicar orçamento"
                                          />
                                        </PermissionGate>
                                        {hasFiscalModule &&
                                          order?.status !== 'CANCELED' && (
                                            <PermissionGate
                                              permissions={['sale:order:view']}
                                            >
                                              {authorizedNfe ? (
                                                <ActionButton
                                                  Icon={IconFileInvoice}
                                                  tooltip={`DANFE NF-e ${authorizedNfe.numero}/${authorizedNfe.serie}`}
                                                  onClick={() => {
                                                    if (
                                                      authorizedNfe.danfeUrl
                                                    ) {
                                                      window.open(
                                                        authorizedNfe.danfeUrl,
                                                        '_blank',
                                                      )
                                                    }
                                                  }}
                                                />
                                              ) : issuedNfce ? (
                                                <ActionButton
                                                  Icon={IconFileInvoice}
                                                  tooltip={`DANFE NFC-e ${issuedNfce.numero}/${issuedNfce.serie}`}
                                                  onClick={() => {
                                                    if (issuedNfce.danfeUrl) {
                                                      window.open(
                                                        issuedNfce.danfeUrl,
                                                        '_blank',
                                                      )
                                                    }
                                                  }}
                                                />
                                              ) : issuedNfse ? (
                                                <ActionButton
                                                  Icon={IconFileInvoice}
                                                  tooltip={`PDF NFS-e ${issuedNfse.numero}/${issuedNfse.serie}`}
                                                  onClick={() => {
                                                    if (issuedNfse.pdfUrl) {
                                                      window.open(
                                                        issuedNfse.pdfUrl,
                                                        '_blank',
                                                      )
                                                    }
                                                  }}
                                                />
                                              ) : (
                                                <ActionButton
                                                  Icon={IconFileInvoice}
                                                  tooltip="Emitir nota fiscal"
                                                  onClick={() => {
                                                    setRowData(order)
                                                    setOpenInvoiceTypeModal(
                                                      true,
                                                    )
                                                  }}
                                                />
                                              )}
                                            </PermissionGate>
                                          )}
                                        <PermissionGate
                                          permissions={['sale:order:view']}
                                        >
                                          <ActionButton
                                            Icon={IconHistory}
                                            tooltip="Histórico"
                                            onClick={() => {
                                              setRowData(order)
                                              setOpenHistoryDialog(true)
                                            }}
                                          />
                                        </PermissionGate>
                                        {order?.status !== 'CANCELED' && (
                                          <PermissionGate
                                            permissions={['sale:order:edit']}
                                          >
                                            <CancelOrderButton order={order} />
                                          </PermissionGate>
                                        )}
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          : null}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
              {rowData && (
                <>
                  <PrintQuotationDialog
                    type="order"
                    quotationId={rowData?.quotation?.id}
                    open={openPrintDialog}
                    onOpenChange={setOpenPrintDialog}
                  />
                  <OrderHistoryDialog
                    open={openHistoryDialog}
                    setOpen={setOpenHistoryDialog}
                    order={rowData}
                  />
                  <InvoiceTypeSelectModal
                    open={openInvoiceTypeModal}
                    onOpenChange={setOpenInvoiceTypeModal}
                    orderId={rowData.id}
                  />
                </>
              )}
            </>
          ) : (
            <FilteredDataEmpty
              title="Ordem de serviço não encontrada"
              description={
                searchDescription ||
                'Sua busca não encontrou nenhum resultado. Tente novamente ou crie uma nova ordem de serviço'
              }
              // cta={<NewQuotationModal />}
            />
          )}
        </FetchingRegion>
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
            isLoading={isLoading}
          />
        </CardFooter>
      ) : null}
    </>
  )
}

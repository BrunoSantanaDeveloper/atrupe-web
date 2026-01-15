'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { DuplicateQuotationButton } from '@/components/common/DuplicateQuotationButton'
import { CancelOrderButton } from './CancelOrderButton'
import { EmitNfeDialog } from './EmitNfeDialog'
import { EmitNfseButton } from './EmitNfseButton'
import { OrderHistoryDialog } from '../OrderHistory/OrderHistoryDialog'

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
import { getDataOld, getItem } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { useQuery } from '@tanstack/react-query'
import { ordersStatusObj } from '@/consts/orders'

// Icons
import {
  IconPrinter,
  IconSearch,
  IconHistory,
  IconFileInvoice,
} from '@tabler/icons-react'
import { GeneratePdf } from '@/components/common/PrintQuotation/GeneratePdf'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export function OrdersData({ searchParams, tabs, searchDescription }: Props) {
  const [rowData, setRowData] = useState<OrderType | null>(null)
  const [openPrintDialog, setOpenPrintDialog] = useState(false)
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [openNfeDialog, setOpenNfeDialog] = useState(false)
  const [loadingProdPDF, setLoadingProdPDF] = useState([''])

  // Hook para controle de features
  const { canManageSalesOrders } = usePlanFeatures()
  const showCurrentPhase = canManageSalesOrders()

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  const filters = { ...searchParams, status }

  const handleGenerateProductionPDF = async (order: OrderType) => {
    const formData = {
      showImages: true,
      showDimensions: true,
      showUnitValue: true,
      showDiscounts: true,
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

      const blob = await pdf(
        <GeneratePdf
          data={pdfData}
          type="production"
          printOptions={formData}
        />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar ficha de produção')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setLoadingProdPDF([])
    }
  }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['order-list', searchParams],
    queryFn: () => getDataOld({ route: 'orderRoute', filters }),
  })

  const orderArray: OrderListType[] = data?.data || []
  const hasData = orderArray.length

  // Calcular colSpan baseado no número de colunas
  const totalColumns = showCurrentPhase ? 5 : 4

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={totalColumns} />
        ) : hasData ? (
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
                {orderArray.map((group) => (
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

                          return (
                            <TableRow key={order?.id} className="text-nowrap">
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
                              </TableCell>
                              <PermissionGate
                                permissions={['values:values:view']}
                              >
                                <TableCell className="text-success-700 text-nowrap">
                                  {formatCurrencyToBrl(quotation?.totalValue)}
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
                                        ordersStatusObj[order?.status]?.variant
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
                                      permissions={['sale:quotation:create']}
                                    >
                                      <DuplicateQuotationButton
                                        quotationId={order?.quotation?.id}
                                        clientId={quotation?.client?.id}
                                        clientName={quotation?.client?.name}
                                        description={quotation?.description}
                                        tooltip="Duplicar orçamento"
                                      />
                                    </PermissionGate>
                                    {order?.status !== 'CANCELED' && (
                                      <PermissionGate
                                        permissions={['sale:order:view']}
                                      >
                                        {order?.nfes?.[0]?.status ===
                                        'AUTHORIZED' ? (
                                          <ActionButton
                                            Icon={IconFileInvoice}
                                            tooltip={`DANFE ${order.nfes[0].numero}/${order.nfes[0].serie}`}
                                            onClick={() => {
                                              if (order.nfes?.[0]?.danfeUrl) {
                                                window.open(
                                                  order.nfes[0].danfeUrl,
                                                  '_blank',
                                                )
                                              }
                                            }}
                                          />
                                        ) : (
                                          <ActionButton
                                            Icon={IconFileInvoice}
                                            tooltip="Emitir NF-e"
                                            onClick={() => {
                                              setRowData(order)
                                              setOpenNfeDialog(true)
                                            }}
                                          />
                                        )}
                                      </PermissionGate>
                                    )}
                                    {order?.status !== 'CANCELED' && (
                                      <PermissionGate
                                        permissions={['sale:order:view']}
                                      >
                                        <EmitNfseButton
                                          orderId={order?.id}
                                          orderStatus={order?.status}
                                        />
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
                                        permissions={['sale:order:delete']}
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
                ))}
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
                <EmitNfeDialog
                  open={openNfeDialog}
                  setOpen={setOpenNfeDialog}
                  orderId={rowData?.id}
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
      </CardContent>
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

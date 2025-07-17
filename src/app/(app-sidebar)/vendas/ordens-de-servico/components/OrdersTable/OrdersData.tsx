'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
// import { NewQuotationModal } from '../../../orcamentos/components/NewQuotation'
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
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { OrderListType, OrderType } from '@/types/sales/order'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl, truncateString } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'
import { ordersStatusObj } from '@/consts/orders'

// Icons
import { IconPrinter, IconSearch } from '@tabler/icons-react'
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

  // Hook para controle de features
  const { getSalesOrdersType } = usePlanFeatures()
  const salesOrdersType = getSalesOrdersType()
  const showCurrentPhase = salesOrdersType === 'full'

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  const filters = { ...searchParams, status }

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
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
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
                          const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${truncateString(80, quotation?.description)}`
                          return (
                            <TableRow key={order?.id}>
                              <TableCell>
                                <p className="font-medium">
                                  {quotation?.client?.name ||
                                    'Cliente não informado'}
                                </p>
                                <Link
                                  href={link}
                                  className="text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                                >
                                  {description}
                                </Link>
                              </TableCell>
                              <TableCell className="text-success-700 text-nowrap">
                                {formatCurrencyToBrl(quotation?.totalValue)}
                              </TableCell>
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
                                        tooltip="Imprimir"
                                        onClick={() => {
                                          setRowData(order)
                                          setOpenPrintDialog(true)
                                        }}
                                      />
                                    </PermissionGate>
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
              <PrintQuotationDialog
                type="order"
                quotationId={rowData?.quotation?.id}
                open={openPrintDialog}
                onOpenChange={setOpenPrintDialog}
              />
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

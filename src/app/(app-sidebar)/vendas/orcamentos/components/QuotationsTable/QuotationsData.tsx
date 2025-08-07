'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Component Imports
import { NewQuotationModal, NewQuotationTriggerButton } from '../NewQuotation'
import { QuotationTagDropdown } from './QuotationTagDropdown'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
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
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'
import type {
  QuotationType,
  ListQuotationsDataType,
} from '@/types/sales/quotation'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { truncateString, formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate, formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Consts
import { quotationsStatusObj } from '@/consts/quotations'

// Icons
import { IconPencil, IconPrinter } from '@tabler/icons-react'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export function QuotationsData({
  searchParams,
  tabs,
  searchDescription,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false)
  const [rowData, setRowData] = useState<QuotationType | null>(null)
  const [openPrintDialog, setOpenPrintDialog] = useState(false)

  const { canManageBudgetStatus } = usePlanFeatures()
  const showStatusColumn = canManageBudgetStatus()
  const isAllTab = searchParams?.status === 'todos'

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-list', searchParams],
    queryFn: () => getDataOld({ route: 'quotationRoute', filters }),
  })

  const { data: tagsList } = useQuotationTag()

  const quotationArray: ListQuotationsDataType[] = data?.data || []
  const hasData = quotationArray.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  {isAllTab && <TableHead>Fase atual</TableHead>}
                  {showStatusColumn && <TableHead>Status</TableHead>}
                  <TableHead>Concluído em</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotationArray.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={showStatusColumn ? 7 : 6}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {formatToWeekDate(group?.date)}
                      </TableCell>
                    </TableRow>
                    {group?.quotations?.length
                      ? group?.quotations.map((quotation) => {
                          const link = `/vendas/orcamentos/${quotation?.id}`
                          const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${truncateString(80, quotation?.description)}`
                          return (
                            <TableRow key={quotation?.id}>
                              <TableCell>
                                <p className="font-medium">
                                  {quotation?.client?.name ||
                                    'Cliente não informado'}
                                </p>
                                <Link
                                  href={link}
                                  className="text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                                >
                                  {description} {quotation?.quickSale && '⚡'}
                                </Link>
                              </TableCell>
                              <TableCell className="text-success-700 text-nowrap">
                                {/* TODO : Valor da entrega não tá vindo */}
                                {formatCurrencyToBrl(
                                  quotation?.totalValue ||
                                    0 + quotation?.deliveryInfo?.value ||
                                    0,
                                )}
                              </TableCell>
                              {isAllTab && (
                                <TableCell>
                                  {quotation?.status ? (
                                    <Badge
                                      status
                                      variant={
                                        quotationsStatusObj[quotation?.status]
                                          ?.variant || 'neutralLight'
                                      }
                                    >
                                      {quotationsStatusObj[quotation?.status]
                                        ?.text || 'Desconhecido'}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              )}
                              {showStatusColumn && (
                                <TableCell>
                                  <QuotationTagDropdown
                                    quotation={quotation}
                                    tagsList={tagsList || []}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="text-gray-600">
                                {formatToLocaleDate(quotation?.finishedAt)}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatToLocaleDate(quotation?.dueDate)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={['sale:quotation:view']}
                                    >
                                      <ActionButton
                                        Icon={IconPrinter}
                                        tooltip="Imprimir"
                                        onClick={() => {
                                          setRowData(quotation)
                                          setOpenPrintDialog(true)
                                        }}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:quotation:edit']}
                                    >
                                      <ActionButton
                                        link={link}
                                        Icon={IconPencil}
                                        tooltip="Editar"
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
                type="quotation"
                quotationId={rowData?.id}
                open={openPrintDialog}
                onOpenChange={setOpenPrintDialog}
              />
            )}
          </>
        ) : (
          <FilteredDataEmpty
            title="Orçamento não encontrado"
            description={
              searchDescription ||
              'Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo orçamento'
            }
            cta={
              <PermissionGate permissions={['sale:quotation:create']}>
                <NewQuotationTriggerButton onOpenChange={setOpenDialog} />
              </PermissionGate>
            }
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            // lastPage={data?.lastPage}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
          />
        </CardFooter>
      ) : null}
      <NewQuotationModal
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open)
        }}
      />
    </>
  )
}

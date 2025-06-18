'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { ViewCheckoutDialog } from '../Actions/ViewCheckout'
import { CloseCheckoutDialog } from '../Actions/CloseCheckout'
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
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'
import type {
  CheckoutType,
  ListCheckoutDataType,
} from '@/types/financial/checkout'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl, truncateString } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Consts
import { checkoutStatusObj } from '@/consts/checkout'

// Icons
import {
  IconSearch,
  IconMessage,
  IconUserPlus,
  IconThumbDown,
  IconRefreshDot,
} from '@tabler/icons-react'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  id: string
}

export function CheckoutData({ searchParams, tabs, id }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<CheckoutType>()

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['pdv-list', id, searchParams],
    queryFn: () => getDataOld({ route: 'checkoutListRoute', filters }),
  })

  const checkoutArray: ListCheckoutDataType[] = data?.data || []
  const hasData = checkoutArray.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Referência</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkoutArray.map((group) => (
                <Fragment key={group.date}>
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={7}
                      className="text-gray font-medium text-xs py-3"
                    >
                      {formatToWeekDate(group?.date)}
                    </TableCell>
                  </TableRow>
                  {group?.registers?.length
                    ? group?.registers.map((register) => {
                        const link = `/caixa/${register?.id}`
                        const description = `${truncateString(80, register?.description)}`

                        return (
                          <TableRow key={register?.id}>
                            <TableCell>
                              <p className="font-medium">
                                {register?.company || '-'}
                              </p>
                              <Link
                                href={link}
                                className="text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                              >
                                {description}
                              </Link>
                            </TableCell>
                            <TableCell className="text-success-700">
                              {formatCurrencyToBrl(register?.value)}
                            </TableCell>
                            <TableCell>
                              {register?.status ? (
                                <Badge
                                  status
                                  variant={
                                    checkoutStatusObj[register?.status]?.variant
                                  }
                                >
                                  {checkoutStatusObj[register?.status]?.text}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(register?.openValue)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(register?.inflow)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(register?.outflow)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <PermissionGate
                                    permissions={['financial:checkout:view']}
                                  >
                                    <ActionButton
                                      Icon={IconSearch}
                                      tooltip="Visualizar"
                                      onClick={() => {
                                        setRowData(register)
                                        setOpenDialog('view')
                                      }}
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={['financial:checkout:edit']}
                                  >
                                    <ActionButton
                                      Icon={IconRefreshDot}
                                      tooltip="Editar parcelas"
                                      onClick={() => {
                                        setRowData(register)
                                        setOpenDialog('edit-installments')
                                      }}
                                    />
                                    <ActionButton
                                      Icon={IconMessage}
                                      tooltip={
                                        register?.notes
                                          ? 'Possui observação'
                                          : 'Observações'
                                      }
                                      onClick={() => {
                                        setRowData(register)
                                        setOpenDialog('notes')
                                      }}
                                      badge={
                                        register?.notes
                                          ? 'warningLight'
                                          : undefined
                                      }
                                    />
                                    <ActionButton
                                      Icon={IconUserPlus}
                                      tooltip="Informar cliente"
                                      onClick={() => {
                                        setRowData(register)
                                        setOpenDialog('set-client')
                                      }}
                                    />
                                    <ActionButton
                                      Icon={IconThumbDown}
                                      tooltip="Pagamento"
                                      onClick={() => {
                                        setRowData(register)
                                        setOpenDialog('payment')
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
        ) : (
          <FilteredDataEmpty
            title="Caixa não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou abra um novo caixa"
            // cta={<OpenCashModal />}
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
      <ViewCheckoutDialog
        open={openDialog === 'view'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
      {/* <TransacionNotesDialog
        open={openDialog === 'notes'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      /> */}
      <CloseCheckoutDialog
        open={openDialog === 'close'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
      {/* <TransactionDetailsDialog
        open={openDialog === 'transaction'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
        type={'receivable'}
      /> */}
      {/* <EditInstallments
        open={openDialog === 'edit-installments'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      /> */}
    </>
  )
}

'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Component Imports
import { ViewCashDialog } from '../Actions/ViewCash'
import { EditCashDialog } from '../Actions/EditCash'
import { CloseCashDialog } from '../Actions/CloseCash'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

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
import type {
  CashControlType,
  ListCashControlDataType,
} from '@/types/financial/cashControl'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Consts
import { bankIcons, cashControlStatusObj } from '@/consts/cashControl'

// Icons
import {
  IconPencil,
  IconSearch,
  IconPrinter,
  IconCircleCheck,
} from '@tabler/icons-react'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconAtrupeLogo } from '@/assets/icons/CustomIcons'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function CashControlData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<CashControlType>()

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cash-control-list', searchParams],
    queryFn: () => getDataOld({ route: 'cashControlRoute', filters }),
  })

  const cashControlArray: ListCashControlDataType[] = data?.data || []
  const hasData = cashControlArray.length

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
                <TableHead>Retroativo</TableHead>
                <TableHead>Movimentações</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashControlArray.map((group) => (
                <Fragment key={group.date}>
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={7}
                      className="text-gray font-medium text-xs py-3"
                    >
                      {formatToWeekDate(group?.date)}
                    </TableCell>
                  </TableRow>
                  {group?.cashRegisters?.length
                    ? group?.cashRegisters.map((item) => {
                        const link = `/caixa/${item?.id}`
                        const canChange = item?.status !== 'CLOSED'

                        return (
                          <TableRow key={item?.id}>
                            <TableCell className="flex gap-3">
                              <FeaturedIcon
                                Icon={
                                  bankIcons[item?.bank?.icon] || IconAtrupeLogo
                                }
                                variant="neutralLight"
                                rounded
                              />
                              <div>
                                <p className="font-medium">
                                  {item?.bankAccountName || '-'}
                                </p>
                                <Link
                                  href={link}
                                  className="text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                                >
                                  {item?.bank?.code} - {item?.bank?.name}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell
                              className={cn(
                                item?.value < 0
                                  ? 'text-error-700'
                                  : 'text-success-700',
                              )}
                            >
                              {formatCurrencyToBrl(item?.value)}
                            </TableCell>
                            <TableCell>
                              {item?.status ? (
                                <Badge
                                  status
                                  variant={
                                    cashControlStatusObj[item?.status]?.variant
                                  }
                                >
                                  {cashControlStatusObj[item?.status]?.text}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(item?.openingBalance)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(item?.retroactive)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrencyToBrl(item?.transactionsAmount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  {canChange ? (
                                    <PermissionGate
                                      permissions={[
                                        'financial:cash_control:edit',
                                      ]}
                                    >
                                      <>
                                        <ActionButton
                                          Icon={IconCircleCheck}
                                          tooltip="Fechar caixa"
                                          onClick={() => {
                                            setOpenDialog('close')
                                            setRowData(item)
                                          }}
                                        />
                                        <ActionButton
                                          Icon={IconPencil}
                                          tooltip="Editar caixa"
                                          onClick={() => {
                                            setOpenDialog('edit')
                                            setRowData(item)
                                          }}
                                        />
                                      </>
                                    </PermissionGate>
                                  ) : (
                                    <PermissionGate
                                      permissions={[
                                        'financial:cash_control:view',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconSearch}
                                        tooltip="Visualizar"
                                        onClick={() => {
                                          setOpenDialog('view')
                                          setRowData(item)
                                        }}
                                      />
                                    </PermissionGate>
                                  )}
                                  <PermissionGate
                                    permissions={[
                                      'financial:cash_control:view',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconPrinter}
                                      tooltip="Imprimir"
                                      onClick={() => {
                                        window.open('/impressao', '_blank')
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
      <ViewCashDialog
        open={openDialog === 'view'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
      <EditCashDialog
        open={openDialog === 'edit'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
      <CloseCashDialog
        open={openDialog === 'close'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
    </>
  )
}

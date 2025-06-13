'use client'

// React
import { Fragment, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { Card, CardFooter, CardContent } from '@/components/ui/card'
import { TablePagination } from '@/components/common/TablePagination'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { DeleteAlertDialog } from './Actions/Delete'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconTrash, IconPencil, IconSquarePlus } from '@tabler/icons-react'

// Types
import type {
  CancelReasonType,
  ListCancelReasonType,
} from '@/types/settings/cancelReason'

export function Main({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<CancelReasonType>()
  const [type, setType] = useState<ListCancelReasonType['type']>('REJECTION')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cancel-reason-list', searchParams],
    queryFn: () => getDataOld({ route: 'cancelReasonRoute' }),
  })

  const reasons: ListCancelReasonType[] = data?.data || []

  return (
    <PermissionGate permissions={['sales_settings:rejection_reasons:view']}>
      <div className="space-y-5">
        <Topbar
          title="Motivos de rejeição e cancelamento"
          previousPage="/configuracoes/vendas"
        />
        <div className="space-y-2">
          <Card>
            {isLoading ? (
              <TableSkeleton cols={6} />
            ) : (
              <>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Motivo</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reasons.map((group) => (
                        <Fragment key={group.type}>
                          <TableRow className="bg-gray-100">
                            <TableCell className="text-gray font-medium text-xs py-0">
                              {group?.type === 'CANCELLATION'
                                ? 'Cancelamento de venda'
                                : 'Rejeição de orçamento'}
                            </TableCell>
                            <TableCell className="flex justify-end py-0">
                              <TooltipProvider>
                                <PermissionGate
                                  permissions={[
                                    'sales_settings:rejection_reasons:create',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconSquarePlus}
                                    tooltip="Novo motivo"
                                    onClick={() => {
                                      setOpenDialog('new')
                                      setType(group?.type)
                                    }}
                                  />
                                </PermissionGate>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                          {group?.reasons?.length ? (
                            group?.reasons.map((item) => (
                              <TableRow key={item?.id}>
                                <TableCell className="font-medium">
                                  {item?.reason}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <TooltipProvider>
                                      <PermissionGate
                                        permissions={[
                                          'sales_settings:rejection_reasons:edit',
                                        ]}
                                      >
                                        <ActionButton
                                          Icon={IconPencil}
                                          tooltip="Editar motivo"
                                          onClick={() => {
                                            setOpenDialog('edit')
                                            setRowData(item)
                                          }}
                                        />
                                      </PermissionGate>
                                      <PermissionGate
                                        permissions={[
                                          'sales_settings:rejection_reasons:delete',
                                        ]}
                                      >
                                        <ActionButton
                                          Icon={IconTrash}
                                          tooltip="Excluir"
                                          onClick={() => {
                                            setOpenDialog('delete')
                                            setRowData(item)
                                          }}
                                        />
                                      </PermissionGate>
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                className="text-gray text-center"
                              >
                                Nenhum motivo
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <TablePagination
                    searchParams={searchParams}
                    lastPage={data?.lastPage || 1}
                  />
                </CardFooter>
                <NewItemDialog
                  type={type}
                  open={openDialog === 'new'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                />
                <NewItemDialog
                  editMode
                  type={type}
                  open={openDialog === 'edit'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                />
                <DeleteAlertDialog
                  type={type}
                  open={openDialog === 'delete'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                />
              </>
            )}
          </Card>
        </div>
      </div>
    </PermissionGate>
  )
}

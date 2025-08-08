'use client'

// React Imports
import { useState } from 'react'

// UI component Imports
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

// Component Imports
import { NewBankAccountDialog } from './NewBankAccount'
import { DisableBankAccount } from '../DisableBankAccount'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'
import type { BankAccountsType } from '@/types/financial/bank'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Icon
import { IconPencil, IconTrash } from '@tabler/icons-react'

interface Props extends SearchParamsType {}

export function BankAccountsData({ searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<BankAccountsType>()
  const { canCreateBankAccount, canDeleteBankAccount } = usePlanFeatures()

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['bank-account-list', searchParams],
    queryFn: () => getDataOld({ route: 'bankAccountRoute', filters }),
  })

  const bankAccounts: BankAccountsType[] = data?.data || []
  const hasData = bankAccounts.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={5} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Conta bancária</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Controle de caixa</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((item) => (
                  <TableRow key={item?.id}>
                    <TableCell className="font-medium">{item?.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {item?.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        status
                        variant={
                          item?.cashControl ? 'successLight' : 'neutralLight'
                        }
                      >
                        {item?.cashControl ? 'Habilitado' : 'Desabilitado'}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge
                        status
                        variant={
                          item?.isActive ? 'successLight' : 'warningLight'
                        }
                      >
                        {item?.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <PermissionGate
                            permissions={[
                              'financial_settings:bank_accounts:edit',
                            ]}
                          >
                            <ActionButton
                              Icon={IconPencil}
                              tooltip="Editar"
                              onClick={() => {
                                setRowData(item)
                                setOpenDialog('edit')
                              }}
                            />
                          </PermissionGate>
                          {canDeleteBankAccount() && (
                            <PermissionGate
                              permissions={[
                                'financial_settings:bank_accounts:delete',
                              ]}
                            >
                              <ActionButton
                                Icon={IconTrash}
                                tooltip="Excluir conta"
                                onClick={() => {
                                  setRowData(item)
                                  setOpenDialog('delete')
                                }}
                              />
                            </PermissionGate>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {canDeleteBankAccount() && (
              <DisableBankAccount
                open={openDialog === 'delete'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
            )}
            <NewBankAccountDialog
              open={openDialog === 'edit'}
              setOpen={setOpenDialog}
              rowData={rowData}
              searchParams={searchParams}
              editMode
            />
          </>
        ) : (
          <ListDataTotalEmpty
            title="Nenhuma conta bancária"
            description={
              canCreateBankAccount()
                ? 'Cadastre sua primeira conta'
                : 'Nenhuma conta bancária cadastrada'
            }
            cta={
              canCreateBankAccount() ? (
                <NewBankAccountDialog searchParams={searchParams} />
              ) : undefined
            }
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

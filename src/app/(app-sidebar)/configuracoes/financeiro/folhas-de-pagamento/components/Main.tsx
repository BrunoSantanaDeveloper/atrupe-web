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
import { Card, CardFooter, CardContent } from '@/components/ui/card'

// Components
import { NewItemDialog } from './NewItem'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFilter } from './TableFilter'
import { ManageItemsDialog } from './ManageItems'
import { Topbar } from '@/components/common/Topbar'
import { UserInfo } from '@/components/common/UserInfo'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

// Types
import type {
  ListPayrollSetupType,
  PayrollSetupItemType,
} from '@/types/settings/payroll'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getData, updateItemNew } from '@/actions/_cruds'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconMinus, IconPencil, IconPlus } from '@tabler/icons-react'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { toast } from 'sonner'

// O custo final do item é o acréscimo menos o desconto, como na tela
// "Custos Funcionários" do legado: item que só desconta do colaborador não
// custa para a empresa
const itemFinalCost = (item: PayrollSetupItemType) => {
  if (!item?.isSet) return 0

  return item.type === 'INCREASE' ? item.amount : 0
}

const employeeCost = (employee: ListPayrollSetupType) =>
  (employee?.items || []).reduce(
    (total, item) => total + itemFinalCost(item),
    0,
  )

export function Main({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<PayrollSetupItemType>()
  const [isLoadingAction, setIsLoadingAction] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-config-list', searchParams],
    queryFn: () =>
      getData({
        route: '/financial/payroll-setup',
        filters: searchParams,
      }),
  })

  const payrollData: ListPayrollSetupType[] = data?.data || []
  const hasData = payrollData.length

  const handleToggleSetItem = async (item: PayrollSetupItemType) => {
    const { id, isSet } = item

    const newIsSet = !isSet

    const data = { isSet: newIsSet } as { isSet: boolean; amount?: number }

    if (!newIsSet) {
      data.amount = 0
    }

    setIsLoadingAction(id)

    const res = await updateItemNew({
      route: `/financial/payroll-setup/${id}`,
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()

    if (newIsSet) {
      setRowData(item)
      setOpenDialog('edit')
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsLoadingAction('')
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Folha de pagamento"
        previousPage="/configuracoes/financeiro"
        secondaryCta={
          <PermissionGate permissions={['financial_settings:payroll:edit']}>
            <ManageItemsDialog />
          </PermissionGate>
        }
        primaryCta={
          <PermissionGate permissions={['financial_settings:payroll:create']}>
            <NewItemDialog />
          </PermissionGate>
        }
      />
      <div className="space-y-2">
        <Card>
          <TableFiltersHeader searchParams={searchParams}>
            <TableFilter searchParams={searchParams} />
          </TableFiltersHeader>
          {isLoading ? (
            <TableSkeleton cols={5} />
          ) : !hasData ? (
            <FilteredDataEmpty
              cta={
                <PermissionGate
                  permissions={['financial_settings:payroll:create']}
                >
                  <NewItemDialog />
                </PermissionGate>
              }
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-full">
                        Referência do custo
                      </TableHead>
                      <TableHead>Acréscimo</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead className="text-right">Custo final</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData.map((employee) => (
                      <Fragment key={employee?.id}>
                        <TableRow className="bg-gray-100">
                          <TableCell colSpan={3}>
                            <UserInfo
                              name={employee?.name}
                              description={employee?.roleName}
                              imageUrl={employee?.avatarUrl}
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrencyToBrl(employeeCost(employee))}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        {employee?.items.map((item) => (
                          <TableRow key={item?.id}>
                            <TableCell className="text-gray-600">
                              {item?.name || '-'}
                            </TableCell>
                            <TableCell className="text-success-600">
                              {item?.type === 'INCREASE' && item?.isSet
                                ? formatCurrencyToBrl(item?.amount)
                                : '-'}
                            </TableCell>
                            <TableCell className="text-error-600">
                              {item?.type === 'DISCOUNT' && item?.isSet
                                ? formatCurrencyToBrl(item?.amount)
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {item?.isSet
                                ? formatCurrencyToBrl(itemFinalCost(item))
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <PermissionGate
                                    permissions={[
                                      'financial_settings:payroll:edit',
                                    ]}
                                  >
                                    {item?.isSet && (
                                      <ActionButton
                                        tooltip="Editar"
                                        variant="neutralGhost"
                                        Icon={IconPencil}
                                        disabled={isLoadingAction === item?.id}
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('edit')
                                        }}
                                      />
                                    )}
                                    <ActionButton
                                      tooltip={
                                        item?.isSet ? 'Remover' : 'Adicionar'
                                      }
                                      variant="neutralGhost"
                                      Icon={item?.isSet ? IconMinus : IconPlus}
                                      isLoading={isLoadingAction === item?.id}
                                      onClick={() => {
                                        handleToggleSetItem(item)
                                      }}
                                    />
                                  </PermissionGate>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              {isLoading || hasData ? (
                <CardFooter>
                  <TablePagination
                    searchParams={searchParams}
                    lastPage={data?.lastPage}
                  />
                </CardFooter>
              ) : null}
              <NewItemDialog
                open={openDialog === 'edit'}
                editMode
                setOpen={setOpenDialog}
                rowData={rowData}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

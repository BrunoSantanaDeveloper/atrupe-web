'use client'

// React
import { useState, Fragment } from 'react'

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

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { NewPaymentCondition } from '../NewPaymentCondition'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type {
  PaymentConditionsType,
  ListPaymentConditionsType,
} from '@/types/settings/paymentCondition'
import { SearchParamsType } from '@/types/coreTypes'

// Actions
import { deleteItemNew, getData } from '@/actions/_cruds'

// Third-party
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icon
import { IconCircleX, IconPencil } from '@tabler/icons-react'

interface Props extends SearchParamsType {}

export function PaymentConditionsData({ searchParams }: Props) {
  const [rowData, setRowData] = useState<PaymentConditionsType>()
  const [openDialog, setOpenDialog] = useState('')

  const queryClient = useQueryClient()

  const alertDialog = useAlertDialog()

  const filters = { ...searchParams, grouped: 'true' }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payment-condition-list', searchParams],
    queryFn: () => getData({ route: '/payment-condition', filters }),
  })

  const paymentConditions: ListPaymentConditionsType[] = data?.data || []
  const hasData = paymentConditions?.length

  // Desativar condição
  const mutation = useMutation({
    mutationFn: (id: string) =>
      deleteItemNew({ route: `/payment-condition/${id}` }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleDisablePaymentCondition = async (id: string) => {
    await alertDialog.open({
      title: `Deseja inativar a condição de pagamento?`,
      description: '',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      confirmLabel: 'Inativar',
      onConfirm: async () => {
        await mutation.mutateAsync(id)
      },
      toastMsg: {
        loading: `Aguarde...`,
        success: `Condição de pagamento inativada com sucesso.`,
        error: `Erro ao inativar condição de pagamento`,
      },
    })
  }

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Forma de pagamento</TableHead>
                  <TableHead>Parcelamentos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentConditions.map((group) => (
                  <Fragment key={group?.paymentMethod?.id}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={5}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {group?.paymentMethod?.name}
                      </TableCell>
                    </TableRow>
                    {group?.conditions?.length
                      ? group?.conditions?.map((condition) => (
                          <TableRow key={condition?.id}>
                            <TableCell className="font-medium">
                              {condition?.name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {condition?.acceptInstallments
                                ? `${condition?.minInstallments || 1}x ${condition?.maxInstallments ? `a ${condition?.maxInstallments}x` : ''}`
                                : 'À vista'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                status
                                variant={
                                  condition?.isActive
                                    ? 'successLight'
                                    : 'warningLight'
                                }
                              >
                                {condition?.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <PermissionGate
                                    permissions={[
                                      'financial_settings:payment_methods:edit',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconPencil}
                                      tooltip="Editar"
                                      onClick={() => {
                                        setRowData(condition)
                                        setOpenDialog('edit')
                                      }}
                                    />
                                    <ActionButton
                                      Icon={IconCircleX}
                                      tooltip="Desativar"
                                      onClick={() => {
                                        handleDisablePaymentCondition(
                                          condition?.id || '',
                                        )
                                      }}
                                    />
                                  </PermissionGate>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
            <NewPaymentCondition
              editMode
              open={openDialog === 'edit'}
              setOpen={setOpenDialog}
              rowData={rowData}
            />
          </>
        ) : (
          <ListDataTotalEmpty
            title="Nenhuma condição de pagamento"
            description="Cadastre sua primeira condição de pagamento"
            cta={
              // O mesmo gate do botão do topo (EC-21): só com "Cria"
              <PermissionGate
                permissions={['financial_settings:payment_methods:create']}
              >
                <NewPaymentCondition />
              </PermissionGate>
            }
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage || 1}
          />
        </CardFooter>
      ) : null}
    </>
  )
}

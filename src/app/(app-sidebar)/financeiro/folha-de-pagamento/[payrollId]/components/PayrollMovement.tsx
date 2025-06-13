'use client'

// React
import { useState } from 'react'

// UI
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
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

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { PaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Payment'
import { CompensateDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Compensate'
import { ViewPaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/ViewPayment'
import { TransactionHistoryDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/History'
import { TransactionDetailsDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/TransactionDetails'

// Icons
import { IconSearch, IconWallet, IconHistory } from '@tabler/icons-react'

// Types
import {
  PayrollDetailType,
  PayrollMovementType,
} from '@/types/financial/payroll'
import type {
  TransactionListType,
  InstallmentType,
} from '@/types/financial/financialFlow'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { financialFlowStatusObj } from '@/consts/financial'

// Consts
import { transactionStatus } from '@/consts/receivables'

interface Props {
  data: PayrollDetailType
}

export function PayrollMovement({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<TransactionListType>()
  const [installment, setInstallment] = useState<InstallmentType>()

  const movementList = data?.movements || []
  const hasData = movementList.length

  // Converte PayrollMovementType para TransactionListType
  const convertToTransactionData = (
    movement: PayrollMovementType,
  ): TransactionListType => {
    return {
      id: movement.id,
      type: 'payable' as const,
      totalValue: movement.amount,
      totalPaid: movement.status === 'COMPLETED' ? movement.amount : 0,
      description: movement.reference,
      supplier: {
        id: data?.employee?.id || '',
        name: data?.employee?.name || '',
      },
      installmentsQuantity: 1,
      currentInstallment: {
        id: movement.id,
        installmentNumber: 1,
        status: movement.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        paymentMethod: { id: '', name: 'N/A' },
        bank: { id: '', name: 'N/A' },
        bankAccount: { id: '', name: 'N/A' },
        value: movement.amount,
        amount: movement.amount,
        additionalFee: 0,
        dueDate: new Date(movement.dueDate),
        paidValue: movement.status === 'COMPLETED' ? movement.amount : 0,
        paymentDate: movement.completedDate
          ? new Date(movement.completedDate)
          : undefined,
      },
      notes: '',
      status: movement.status === 'COMPLETED' ? 'PAID' : 'PENDING',
    } as TransactionListType
  }

  // Converte PayrollMovementType para InstallmentType
  const convertToInstallmentData = (
    movement: PayrollMovementType,
  ): InstallmentType => {
    return {
      id: movement.id,
      installmentNumber: 1,
      status: movement.status === 'COMPLETED' ? 'PAID' : 'PENDING',
      paymentMethod: { id: '', name: 'N/A' },
      bank: { id: '', name: 'N/A' },
      bankAccount: { id: '', name: 'N/A' },
      value: movement.amount,
      amount: movement.amount,
      additionalFee: 0,
      dueDate: new Date(movement.dueDate),
      paidValue: movement.status === 'COMPLETED' ? movement.amount : 0,
      paymentDate: movement.completedDate
        ? new Date(movement.completedDate)
        : undefined,
    } as InstallmentType
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={IconWallet} />
            <CardTitle className="text-gray-700 font-semibold text-base">
              Movimentação do salário
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="min-w-[200px]">Referência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-b">
              {hasData ? (
                movementList.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.reference}</div>
                        <div className="text-sm text-gray-600">
                          163 - Folha 11/24 - Salário
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={financialFlowStatusObj[item.status].variant}
                          status
                        >
                          {financialFlowStatusObj[item.status].text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrencyToBrl(item.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.dueDate || '00/00/0000'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-600">-</div>
                        <div className="text-sm text-gray-600">-</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrencyToBrl(item.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <PermissionGate
                              permissions={['financial:payroll:view']}
                            >
                              <ActionButton
                                Icon={IconSearch}
                                tooltip="Detalhes da movimentação"
                                onClick={() => {
                                  setRowData(convertToTransactionData(item))
                                  setOpenDialog('transaction')
                                }}
                              />
                            </PermissionGate>

                            <PermissionGate
                              permissions={['financial:payroll:view']}
                            >
                              <ActionButton
                                Icon={IconHistory}
                                tooltip="Histórico"
                                onClick={() => {
                                  setRowData(convertToTransactionData(item))
                                  setOpenDialog('history')
                                }}
                              />
                            </PermissionGate>

                            <PermissionGate
                              permissions={['financial:payroll:edit']}
                            >
                              <ActionButton
                                Icon={
                                  transactionStatus[
                                    convertToInstallmentData(item)?.status ||
                                      'UNKNOWN'
                                  ]?.icon
                                }
                                tooltip={
                                  transactionStatus[
                                    convertToInstallmentData(item)?.status ||
                                      'UNKNOWN'
                                  ]?.tooltip
                                }
                                variant={
                                  transactionStatus[
                                    convertToInstallmentData(item)?.status ||
                                      'UNKNOWN'
                                  ]?.button
                                }
                                onClick={() => {
                                  const currentInstallment =
                                    convertToInstallmentData(item)

                                  if (currentInstallment?.status === 'CANCELED')
                                    return

                                  setRowData(convertToTransactionData(item))
                                  setInstallment(currentInstallment)

                                  switch (currentInstallment?.status) {
                                    case 'PENDING':
                                      setOpenDialog('payment')
                                      break
                                    case 'PROVISIONED':
                                      setOpenDialog('compensate')
                                      break
                                    case 'PAID':
                                      setOpenDialog('view')
                                      break
                                    case 'OVERDUE':
                                      setOpenDialog('payment')
                                      break
                                    default:
                                      setOpenDialog('')
                                      break
                                  }
                                }}
                                disabled={data?.status === 'CLOSED'}
                              />
                            </PermissionGate>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-600">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs do fluxo financeiro */}
      <TransactionDetailsDialog
        open={openDialog === 'transaction'}
        setOpen={setOpenDialog}
        rowData={rowData}
        type="payable"
      />
      <TransactionHistoryDialog
        open={openDialog === 'history'}
        setOpen={setOpenDialog}
        rowData={rowData}
      />
      <PaymentDialog
        open={openDialog === 'payment'}
        setOpen={setOpenDialog}
        rowData={installment}
        type="payable"
      />
      <CompensateDialog
        open={openDialog === 'compensate'}
        setOpen={setOpenDialog}
        rowData={installment}
        type="payable"
      />
      <ViewPaymentDialog
        open={openDialog === 'view'}
        setOpen={setOpenDialog}
        rowData={installment}
        type="payable"
      />
    </>
  )
}

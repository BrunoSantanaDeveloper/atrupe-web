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
import { PayrollDetailType } from '@/types/financial/payroll'
import type {
  TransactionListType,
  InstallmentType,
} from '@/types/financial/financialFlow'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { financialFlowStatusObj } from '@/consts/financial'

// Consts
import { transactionStatus } from '@/consts/receivables'

interface PayrollTransaction {
  type: 'payable' | 'receivable'
  id: string
  totalValue: number
  totalPaid: number
  description: string
  employee?: {
    id: string
    name: string
  }
  subCategory: null
  nature: null
  installmentsQuantity: number
  period: string
  notes: string
  status: string
  currentInstallment?: InstallmentType
}

interface Props {
  data: PayrollDetailType
}

export function PayrollMovement({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<PayrollTransaction>()
  const [installment, setInstallment] = useState<InstallmentType>()

  const transactionList = (data?.financialTransactions ||
    []) as PayrollTransaction[]
  const hasData = transactionList.length

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
        <CardContent>
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
                transactionList.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-gray-600">
                          {item.employee?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            financialFlowStatusObj[
                              item.currentInstallment?.status || item.status
                            ]?.variant || 'neutral'
                          }
                          status
                        >
                          {financialFlowStatusObj[
                            item.currentInstallment?.status || item.status
                          ]?.text ||
                            item.currentInstallment?.status ||
                            item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrencyToBrl(
                            item.currentInstallment?.value || item.totalValue,
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.currentInstallment?.dueDate
                            ? new Date(
                                item.currentInstallment.dueDate,
                              ).toLocaleDateString('pt-BR')
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-600">
                          {item.currentInstallment?.status === 'PAID'
                            ? formatCurrencyToBrl(
                                item.currentInstallment?.paidValue || 0,
                              )
                            : '-'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.currentInstallment?.paymentDate
                            ? new Date(
                                item.currentInstallment.paymentDate,
                              ).toLocaleDateString('pt-BR')
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {item.currentInstallment?.status === 'PENDING'
                            ? formatCurrencyToBrl(
                                (item.currentInstallment?.value ||
                                  item.totalValue) -
                                  (item.currentInstallment?.paidValue || 0),
                              )
                            : '-'}
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
                                  setRowData(item)
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
                                  setRowData(item)
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
                                    item?.currentInstallment?.status ||
                                      'PENDING'
                                  ]?.icon
                                }
                                tooltip={
                                  transactionStatus[
                                    item?.currentInstallment?.status ||
                                      'PENDING'
                                  ]?.tooltip
                                }
                                variant={
                                  transactionStatus[
                                    item?.currentInstallment?.status ||
                                      'PENDING'
                                  ]?.button
                                }
                                onClick={() => {
                                  setRowData(item)
                                  setInstallment(item.currentInstallment)

                                  switch (item?.currentInstallment?.status) {
                                    case 'PENDING':
                                      setOpenDialog('payment')
                                      break
                                    case 'PAID':
                                      setOpenDialog('view')
                                      break
                                    default:
                                      setOpenDialog('view')
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
        rowData={rowData as TransactionListType}
        type="payable"
      />
      <TransactionHistoryDialog
        open={openDialog === 'history'}
        setOpen={setOpenDialog}
        rowData={rowData as TransactionListType}
      />
      <PaymentDialog
        open={openDialog === 'payment'}
        setOpen={setOpenDialog}
        rowData={installment}
        transactionData={rowData as TransactionListType}
        type="payable"
      />
      <CompensateDialog
        open={openDialog === 'compensate'}
        setOpen={setOpenDialog}
        rowData={installment}
        transactionData={rowData as TransactionListType}
        type="payable"
      />
      <ViewPaymentDialog
        open={openDialog === 'view'}
        setOpen={setOpenDialog}
        rowData={installment}
        transactionData={rowData as TransactionListType}
        type="payable"
      />
    </>
  )
}

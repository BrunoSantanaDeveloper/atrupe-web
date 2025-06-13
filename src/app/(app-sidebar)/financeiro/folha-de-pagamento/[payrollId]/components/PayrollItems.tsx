'use client'

// React
import { useState } from 'react'

// UI
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { PayrollPdf } from './PayrollPdf'
import { NewItemDialog } from './NewItem'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { PaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Payment'
import { TransactionDetailsDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/TransactionDetails'

// Icons
import {
  IconCash,
  IconPencil,
  IconSearch,
  IconThumbUp,
  IconPrinter,
  IconCirclePlus,
  IconLayoutGrid,
} from '@tabler/icons-react'

// Types
import type {
  PayrollPdfType,
  PayrollItemType,
  PayrollDetailType,
} from '@/types/financial/payroll'

// Libs
import { pdf } from '@react-pdf/renderer'
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDateTime } from '@/lib/formatDate'

// Consts
import { payrollItemTypeObj } from '@/consts/payroll'

interface Props {
  data: PayrollDetailType
}

export function PayrollItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<PayrollItemType>()
  const [isAdvance, setIsAdvance] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)

  const handleGeneratePDF = async (payrollData: PayrollDetailType) => {
    setIsLoadingPDF(true)
    try {
      const blob = await pdf(
        <PayrollPdf data={payrollData as unknown as PayrollPdfType} />, // TODO: Remover o as unknown as PayrollPdfType
      ).toBlob()

      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsLoadingPDF(false)
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Itens
              </CardTitle>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {formatCurrencyToBrl(data?.balance || 0)}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Salário a pagar
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Referência</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Lançado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-b">
              {data?.items?.map((item: PayrollItemType) => {
                const typeConfig = payrollItemTypeObj[item.type]
                const isAdvance = item.type === 'ADVANCE'

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.type === 'ADVANCE' ? (
                        <div>
                          <p className="font-medium">{data?.employee?.name}</p>
                          <p className="text-sm text-gray-600">
                            Folha {data?.month.toString().padStart(2, '0')}/
                            {data?.year.toString().slice(-2)} -{' '}
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        <p className="font-medium">{item.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant}>
                        {typeConfig.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrencyToBrl(item.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatToLocaleDateTime(item.paidAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          {isAdvance && (
                            <>
                              <ActionButton
                                Icon={IconThumbUp}
                                tooltip="Pagamento"
                                variant="successGhost"
                                onClick={() => {
                                  setRowData(item)
                                  setIsAdvance(isAdvance)
                                  setOpenDialog('payment')
                                }}
                                disabled={data?.status === 'CLOSED'}
                              />
                              <ActionButton
                                Icon={IconSearch}
                                tooltip="Ver movimentação"
                                onClick={() => {
                                  setRowData(item)
                                  setIsAdvance(true)
                                  setOpenDialog('transaction')
                                }}
                                disabled={data?.status === 'CLOSED'}
                              />
                              <ActionButton
                                Icon={IconPrinter}
                                tooltip="Imprimir"
                                onClick={() => handleGeneratePDF(data)}
                                disabled={data?.status === 'CLOSED'}
                                isLoading={isLoadingPDF}
                              />
                            </>
                          )}
                          <ActionButton
                            Icon={IconPencil}
                            tooltip="Editar item"
                            onClick={() => {
                              setRowData(item)
                              setIsAdvance(isAdvance)
                              setOpenDialog('newItem')
                            }}
                            disabled={data?.status === 'CLOSED'}
                          />
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between p-0">
          <PermissionGate permissions={['financial:payroll:edit']}>
            <Button
              type="button"
              variant="none"
              className="flex justify-center items-center h-full gap-3 py-8 flex-1"
              onClick={() => {
                setRowData(undefined)
                setIsAdvance(false)
                setOpenDialog('newItem')
              }}
              disabled={data?.status === 'CLOSED'}
            >
              <FeaturedIcon
                variant={data?.status === 'CLOSED' ? 'neutralLight' : 'light'}
                Icon={IconCirclePlus}
                rounded
              />
              <p className="text-sm text-gray-600 font-medium">
                Adicionar item
              </p>
            </Button>
          </PermissionGate>
          <div className="w-px bg-gray-200"></div>
          <PermissionGate permissions={['financial:payroll:edit']}>
            <Button
              type="button"
              variant="none"
              className="flex justify-center items-center h-full gap-3 py-8 flex-1"
              onClick={() => {
                setRowData(undefined)
                setIsAdvance(true)
                setOpenDialog('newItem')
              }}
              disabled={data?.status === 'CLOSED'}
            >
              <FeaturedIcon
                variant={
                  data?.status === 'CLOSED' ? 'neutralLight' : 'orangeLight'
                }
                Icon={IconCash}
                rounded
              />
              <p className="text-sm text-gray-600 font-medium">
                Adiantamento de salário
              </p>
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <NewItemDialog
        open={openDialog === 'newItem'}
        setOpen={setOpenDialog}
        payrollId={data?.id}
        rowData={rowData}
        isAdvance={isAdvance}
      />

      <PaymentDialog
        open={openDialog === 'payment'}
        setOpen={setOpenDialog}
        type="payable"
        rowData={undefined} // TODO: Corrigir
      />

      <TransactionDetailsDialog
        open={openDialog === 'transaction'}
        setOpen={setOpenDialog}
        type="payable"
        rowData={rowData?.payables}
      />
    </>
  )
}

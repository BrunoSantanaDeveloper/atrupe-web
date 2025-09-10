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

// Icons
import {
  IconEye,
  IconCash,
  IconEyeOff,
  IconPencil,
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
import { getItem } from '@/actions/_cruds'
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
  const [showValues, setShowValues] = useState(true)

  const handleGeneratePDF = async (itemId: string) => {
    setIsLoadingPDF(true)
    try {
      // Buscar dados do PDF da API
      const result = await getItem({
        route: `/financial/salary-sheets/item/${itemId}/advance-pdf-data`,
      })

      console.log(result)

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: PayrollPdfType = result.data
      const blob = await pdf(
        <PayrollPdf data={pdfData} type="advance" />,
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
            <div className="flex gap-3 items-center">
              <TooltipProvider>
                <ActionButton
                  Icon={showValues ? IconEyeOff : IconEye}
                  tooltip={showValues ? 'Ocultar valores' : 'Ver valores'}
                  onClick={() => {
                    setShowValues(!showValues)
                  }}
                  className="hidden"
                />
              </TooltipProvider>
              <div className="text-right">
                <div className="text-lg font-semibold min-w-28">
                  {showValues
                    ? formatCurrencyToBrl(data?.balance || 0)
                    : '***********'}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Salário a pagar
                </div>
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
                      <p className="font-medium">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant}>
                        {typeConfig.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className={
                          item.type === 'INCREASE'
                            ? 'text-success-700'
                            : 'text-error-700'
                        }
                      >
                        {showValues
                          ? formatCurrencyToBrl(item.amount)
                          : '********'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatToLocaleDateTime(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          {isAdvance && (
                            <ActionButton
                              Icon={IconPrinter}
                              tooltip="Imprimir"
                              onClick={() => handleGeneratePDF(item.id)}
                              isLoading={isLoadingPDF}
                            />
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
              className="flex justify-center items-center h-full gap-3 py-8 flex-1 rounded-none"
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
              className="flex justify-center items-center h-full gap-3 py-8 flex-1 rounded-none"
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
    </>
  )
}

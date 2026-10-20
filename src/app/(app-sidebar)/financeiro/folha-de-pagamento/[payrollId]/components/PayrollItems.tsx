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
import { NewItemDialog } from './NewItem'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import {
  IconEye,
  IconCash,
  IconEyeOff,
  IconTrash,
  IconPencil,
  IconPlus,
  IconLayoutGrid,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Types
import type {
  PayrollPdfType,
  PayrollItemType,
  PayrollDetailType,
} from '@/types/financial/payroll'

// Libs
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
import { getItem, deleteItemNew, createItemNew } from '@/actions/_cruds'
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDateTime } from '@/lib/formatDate'

// Consts
import { payrollItemTypeObj } from '@/consts/payroll'

// Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  data: PayrollDetailType
}

export function PayrollItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<PayrollItemType>()
  const [isAdvance, setIsAdvance] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const [showValues, setShowValues] = useState(true)
  const { open: openAlertDialog } = useAlertDialog()
  const queryClient = useQueryClient()

  const handleGeneratePDF = async (itemId: string) => {
    setIsLoadingPDF(true)
    try {
      // Buscar dados do PDF da API
      const result = await getItem({
        route: `/financial/payroll/item/${itemId}/advance-pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: PayrollPdfType = result.data
      const [{ pdf }, { PayrollPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PayrollPdf'),
      ])

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

  const handleDeleteItem = async (item: PayrollItemType) => {
    await openAlertDialog({
      title: 'Excluir item da folha?',
      description: `Deseja excluir "${item.description}"? ${item.type === 'ADVANCE' ? 'A despesa financeira do adiantamento também será removida.' : 'A despesa de salário será recalculada.'}`,
      confirmLabel: 'Excluir',
      Icon: IconAlertTriangle,
      iconTone: 'error',
      onConfirm: async () => {
        const result = await deleteItemNew({
          route: `/financial/payroll/item/${item.id}`,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: 'Excluindo item...',
        success: 'Item excluído com sucesso!',
        error: 'Erro ao excluir item',
      },
    })
  }

  const handleCancelAdvance = async (item: PayrollItemType) => {
    await openAlertDialog({
      title: 'Cancelar adiantamento?',
      description: `Deseja cancelar "${item.description}"? O pagamento será estornado e o item removido da folha.`,
      confirmLabel: 'Cancelar adiantamento',
      Icon: IconAlertTriangle,
      iconTone: 'error',
      onConfirm: async () => {
        const result = await createItemNew({
          route: `/financial/payroll/item/${item.id}/cancel-advance`,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: 'Cancelando adiantamento...',
        success: 'Adiantamento cancelado e estornado com sucesso!',
        error: 'Erro ao cancelar adiantamento',
      },
    })
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <FeaturedIcon tone="neutral" Icon={IconLayoutGrid} />
              <CardTitle>Itens</CardTitle>
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
                const isAdvancePaid =
                  isAdvance && item.payable?.status === 'PAID'

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
                              gesto="imprimir"
                              tooltip="Imprimir"
                              onClick={() => handleGeneratePDF(item.id)}
                              isLoading={isLoadingPDF}
                            />
                          )}
                          <PermissionGate
                            permissions={['financial:payroll:edit']}
                          >
                            <ActionButton
                              Icon={IconPencil}
                              tooltip={
                                isAdvancePaid
                                  ? 'Adiantamento já pago'
                                  : 'Editar item'
                              }
                              onClick={() => {
                                setRowData(item)
                                setIsAdvance(isAdvance)
                                setOpenDialog('newItem')
                              }}
                              disabled={
                                data?.status === 'CLOSED' || isAdvancePaid
                              }
                            />
                          </PermissionGate>
                          {isAdvancePaid ? (
                            <PermissionGate
                              permissions={['financial:payroll:edit']}
                            >
                              <ActionButton
                                gesto="cancelar"
                                tooltip="Cancelar adiantamento e estornar pagamento"
                                onClick={() => handleCancelAdvance(item)}
                                disabled={data?.status === 'CLOSED'}
                              />
                            </PermissionGate>
                          ) : (
                            <PermissionGate
                              permissions={['financial:payroll:edit']}
                            >
                              <ActionButton
                                Icon={IconTrash}
                                tooltip="Excluir item"
                                onClick={() => handleDeleteItem(item)}
                                disabled={data?.status === 'CLOSED'}
                              />
                            </PermissionGate>
                          )}
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
                tone={data?.status === 'CLOSED' ? 'neutral' : 'brand'}
                Icon={IconPlus}
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
                tone={data?.status === 'CLOSED' ? 'neutral' : 'warning'}
                Icon={IconCash}
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

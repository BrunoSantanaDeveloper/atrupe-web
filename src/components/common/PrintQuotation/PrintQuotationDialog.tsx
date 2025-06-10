/* eslint-disable @typescript-eslint/no-explicit-any */

// React
import { useState } from 'react'

// UI component
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Component
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { GeneratePdf } from './GeneratePdf'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

// Form Imports
import { useForm } from 'react-hook-form'

// Utils
import { validateQuotationTotals, formatCurrencyToBrl } from '@/lib/utils'

// Icon
import {
  IconCircleCheck,
  IconPrinter,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Store
import { getItemOld } from '@/actions/_cruds'

const defaultValues = {
  showDimensions: true,
  showUnitValue: true,
  showDiscounts: true,
  showFinalValue: true,
  showTotalValue: true,
  showPaymentDelivery: true,
  showItemsDetails: true,
}

export type PrintOptionsType = typeof defaultValues

interface Props {
  type: 'quotation' | 'order' | 'production'
  quotationId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ValidationData {
  isValid: boolean
  inconsistencies: Record<string, any>
  correctedTotals: Record<string, any>
}

interface PendingPrintData {
  quotationData: Record<string, any>
  formData: PrintOptionsType
}

export function PrintQuotationDialog({
  type,
  open,
  quotationId,
  onOpenChange,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInconsistencyAlert, setShowInconsistencyAlert] = useState(false)
  const [inconsistencyData, setInconsistencyData] =
    useState<ValidationData | null>(null)
  const [pendingPrintData, setPendingPrintData] =
    useState<PendingPrintData | null>(null)

  const form = useForm<PrintOptionsType>({
    defaultValues,
  })

  const { handleSubmit } = form

  const generatePDF = async (
    quotationData: Record<string, any>,
    formData: PrintOptionsType,
  ) => {
    const blob = await pdf(
      <GeneratePdf
        data={quotationData as any}
        printOptions={formData}
        type={type}
      />,
    ).toBlob()

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const onSubmit = async (formData: PrintOptionsType) => {
    try {
      setIsLoading(true)
      const quotationData = await getItemOld({
        route: 'quotationRoute',
        id: `${quotationId}/pdf-data`,
      })

      // Validar se há inconsistências nos totais
      const validation = validateQuotationTotals(quotationData.items, {
        subtotal: quotationData.total?.subtotal,
        totalDiscount: quotationData.total?.totalDiscount,
        finalTotal: quotationData.total?.finalTotal,
      })

      if (!validation.isValid) {
        // Se há inconsistências, mostrar o alert
        setInconsistencyData(validation)
        setPendingPrintData({ quotationData, formData })
        setShowInconsistencyAlert(true)
        setIsLoading(false)
        return
      }

      // Se não há inconsistências, gerar o PDF normalmente
      await generatePDF(quotationData, formData)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao imprimir orçamento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueWithInconsistencies = async () => {
    if (!pendingPrintData) return

    try {
      setIsLoading(true)
      setShowInconsistencyAlert(false)

      await generatePDF(
        pendingPrintData.quotationData,
        pendingPrintData.formData,
      )

      toast.warning('PDF gerado com inconsistências nos totais')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao imprimir orçamento')
    } finally {
      setIsLoading(false)
      setPendingPrintData(null)
      setInconsistencyData(null)
    }
  }

  const handleCancelPrint = () => {
    setShowInconsistencyAlert(false)
    setPendingPrintData(null)
    setInconsistencyData(null)
    setIsLoading(false)
  }

  const renderInconsistencyDetails = () => {
    if (!inconsistencyData?.inconsistencies) return null

    const { inconsistencies } = inconsistencyData
    const details = []

    if (inconsistencies.subtotal) {
      details.push(
        `Subtotal: esperado ${formatCurrencyToBrl(inconsistencies.subtotal.expected)} mas calculado ${formatCurrencyToBrl(inconsistencies.subtotal.calculated)}`,
      )
    }

    if (inconsistencies.totalDiscount) {
      details.push(
        `Desconto Total: esperado ${formatCurrencyToBrl(inconsistencies.totalDiscount.expected)} mas calculado ${formatCurrencyToBrl(inconsistencies.totalDiscount.calculated)}`,
      )
    }

    if (inconsistencies.finalTotal) {
      details.push(
        `Total Final: esperado ${formatCurrencyToBrl(inconsistencies.finalTotal.expected)} mas calculado ${formatCurrencyToBrl(inconsistencies.finalTotal.calculated)}`,
      )
    }

    return details
  }

  return (
    <>
      <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconPrinter} />
                <span>Opções de impressão</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Imprimir orçamento
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form id="print-quotation" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <p className="font-semibold text-gray-700">
                    Exibição dos itens da venda
                  </p>
                  <FormCheckbox<PrintOptionsType>
                    name="showDimensions"
                    label="Exibir medidas"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showUnitValue"
                    label="Exibir valor unitário"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showDiscounts"
                    label="Exibir descontos"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showFinalValue"
                    label="Exibir valor final"
                  />
                </div>
                <Separator className="my-5" />
                <div className="space-y-4">
                  <p className="font-semibold text-gray-700">
                    Outras informações da venda
                  </p>
                  <FormCheckbox<PrintOptionsType>
                    name="showTotalValue"
                    label="Exibir valores totais"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showPaymentDelivery"
                    label="Exibir especificação de pagamento e entrega"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showItemsDetails"
                    label="Exibir detalhamento dos itens de venda"
                  />
                </div>
              </form>
            </Form>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="print-quotation"
              RightIcon={IconCircleCheck}
              isLoading={isLoading}
            >
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showInconsistencyAlert}
        onOpenChange={setShowInconsistencyAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <FeaturedIcon
                variant="warningOutline"
                Icon={IconAlertTriangle}
                size="xl"
              />
              <AlertDialogTitle>
                Inconsistências Detectadas nos Totais
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Foram detectadas inconsistências nos cálculos dos totais do
              orçamento:
              <div className="mt-3 space-y-2">
                {renderInconsistencyDetails()?.map((detail, index) => (
                  <div
                    key={index}
                    className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400"
                  >
                    • {detail}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                O PDF será gerado com os valores corretos calculados
                automaticamente. Deseja continuar?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPrint}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinueWithInconsistencies}
              isLoading={isLoading}
            >
              Continuar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

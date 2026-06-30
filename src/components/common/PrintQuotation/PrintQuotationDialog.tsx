/* eslint-disable @typescript-eslint/no-explicit-any */

// React
import { useState } from 'react'

// Components
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
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { pdf } from '@react-pdf/renderer'
import { GeneratePdf } from './GeneratePdf'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

// Form
import { useForm } from 'react-hook-form'

// Utils
import {
  formatCurrencyToBrl,
  validateQuotationTotals,
  adaptNewItemsToOldFormat,
} from '@/lib/utils'

// Icon
import {
  IconPrinter,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Store
import { getItem } from '@/actions/_cruds'

export type PrintOptionsType = {
  showImages: boolean
  showDimensions: boolean
  showUnitValue: boolean
  showDiscounts: boolean
  showFinalValue: boolean
  showTotalValue: boolean
  showPaymentDelivery: boolean
  showItemsDetails: boolean
  showSignature: boolean
}

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

  const { canShowQuotationItemDetails } = usePlanFeatures()
  const { hasPermission } = usePermissions()
  const hasValuesPermission = hasPermission('values:values:view')

  const form = useForm<PrintOptionsType>({
    defaultValues: {
      showImages: true,
      showDimensions: true,
      showUnitValue: hasValuesPermission,
      showDiscounts: hasValuesPermission,
      showFinalValue: hasValuesPermission,
      showTotalValue: hasValuesPermission,
      showPaymentDelivery: true,
      showItemsDetails: canShowQuotationItemDetails(),
      showSignature: true,
    },
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

    const sanitize = (s: string) =>
      s
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .trim()
    const prefix = type === 'quotation' ? 'ORC' : 'OS'
    const seriesCode = quotationData?.quotation?.seriesCode ?? ''
    const number = quotationData?.quotation?.number ?? ''
    const clientName = sanitize(quotationData?.client?.name ?? '')
    const osCode = `${seriesCode}-${number}`
    const fileName = `${prefix}-${osCode}${clientName ? `_${clientName}` : ''}.pdf`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onSubmit = async (formData: PrintOptionsType) => {
    try {
      setIsLoading(true)
      const res = await getItem({
        route: `/sale/quotation/${quotationId}/pdf-data`,
      })

      if (!res.success) {
        toast.error(res.message)
        return
      }

      const quotationData = res.data

      // Verificar se quotationItems existe
      if (
        !quotationData.quotationItems ||
        !Array.isArray(quotationData.quotationItems)
      ) {
        console.error(
          '❌ quotationItems não encontrado ou não é um array:',
          quotationData,
        )
        toast.error('Dados do orçamento inválidos')
        return
      }

      // Validar se há inconsistências nos totais
      // Nota: totalDiscount e finalTotal não são validados pois o backend
      // aplica o desconto das condições de pagamento, enquanto o frontend
      // calcula apenas baseado nos descontos dos itens
      const adaptedItems = adaptNewItemsToOldFormat(
        quotationData.quotationItems,
      )

      const validation = validateQuotationTotals(adaptedItems, {
        subtotal: quotationData.total?.subtotal,
        // totalDiscount e finalTotal não são comparados - representam coisas diferentes agora
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
                    name="showImages"
                    label="Exibir imagens"
                  />
                  <FormCheckbox<PrintOptionsType>
                    name="showDimensions"
                    label="Exibir medidas"
                  />
                  {hasValuesPermission && (
                    <>
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
                        label="Exibir valor final do item"
                      />
                    </>
                  )}
                </div>
                <Separator className="my-5" />
                <div className="space-y-4">
                  <p className="font-semibold text-gray-700">
                    Outras informações da venda
                  </p>
                  {hasValuesPermission && (
                    <FormCheckbox<PrintOptionsType>
                      name="showTotalValue"
                      label="Exibir valores totais da proposta"
                    />
                  )}
                  <FormCheckbox<PrintOptionsType>
                    name="showPaymentDelivery"
                    label="Exibir especificações de pagamento e entrega"
                  />
                  {canShowQuotationItemDetails() && (
                    <FormCheckbox<PrintOptionsType>
                      name="showItemsDetails"
                      label="Exibir detalhamento dos itens de venda"
                    />
                  )}
                  <FormCheckbox<PrintOptionsType>
                    name="showSignature"
                    label="Exibir assinatura"
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

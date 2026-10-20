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
// EC-3: o @react-pdf/renderer NÃO entra aqui no topo. Os componentes dele
// chegam como undefined na renderização do servidor e derrubam a página
// inteira com "Element type is invalid". A biblioteca e o documento são
// carregados dentro do clique, em generatePDF
import { buildPdfFileName } from './buildPdfFileName'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormRadio } from '@/components/common/form/FormRadio'

// Form
import { useForm } from 'react-hook-form'

// Utils
import {
  formatCurrencyToBrl,
  validateQuotationTotals,
  adaptNewItemsToOldFormat,
} from '@/lib/utils'

// Icon
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

// Store
import { getItem } from '@/actions/_cruds'

// O nível de detalhe da proposta (IP-12, decisão de 05/10/2026): o padrão é
// "detalhado com valores"; sem valores é a ficha de produção. Quem imprime
// pode trocar; o nível com valores só existe para quem vê valores (SEG-6)
export type ProposalDetailLevel = 'resumo' | 'lista' | 'valores'

export const PROPOSAL_DETAIL_LEVELS: {
  value: ProposalDetailLevel
  label: string
  help: string
}[] = [
  {
    value: 'resumo',
    label: 'Sem detalhes',
    help: 'Nome do item, descritivo técnico e preço final.',
  },
  {
    value: 'lista',
    label: 'Detalhado sem valores',
    help: 'O que compõe cada item, sem preço por parte.',
  },
  {
    value: 'valores',
    label: 'Detalhado com valores',
    help: 'O que compõe cada item, com o preço de cada parte.',
  },
]

export type PrintOptionsType = {
  showImages: boolean
  showDimensions: boolean
  showUnitValue: boolean
  showFinalValue: boolean
  showTotalValue: boolean
  showPaymentDelivery: boolean
  showItemsDetails: boolean
  // Os valores de cada parte no detalhamento; ausente, vale true (as outras
  // telas que imprimem não escolhem nível)
  showDetailValues?: boolean
  showSignature?: boolean
  // O nível escolhido no diálogo; vira showItemsDetails + showDetailValues
  detailLevel?: ProposalDetailLevel
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

  // Os níveis que este plano e esta permissão permitem
  const canDetail = canShowQuotationItemDetails()
  const levels = PROPOSAL_DETAIL_LEVELS.filter(
    (level) =>
      level.value === 'resumo' ||
      (canDetail && (level.value !== 'valores' || hasValuesPermission)),
  )
  const defaultLevel: ProposalDetailLevel = !canDetail
    ? 'resumo'
    : hasValuesPermission
      ? 'valores'
      : 'lista'

  const form = useForm<PrintOptionsType>({
    defaultValues: {
      showImages: true,
      showDimensions: true,
      showUnitValue: hasValuesPermission,
      showFinalValue: hasValuesPermission,
      showTotalValue: hasValuesPermission,
      showPaymentDelivery: true,
      showItemsDetails: canDetail,
      showDetailValues: hasValuesPermission,
      showSignature: true,
      detailLevel: defaultLevel,
    },
  })

  const { handleSubmit } = form

  const generatePDF = async (
    quotationData: Record<string, any>,
    formData: PrintOptionsType,
  ) => {
    const [{ pdf }, { GeneratePdf }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./GeneratePdf'),
    ])

    const blob = await pdf(
      <GeneratePdf
        data={quotationData as any}
        printOptions={formData}
        type={type}
      />,
    ).toBlob()

    const fileName = buildPdfFileName(quotationData, type)

    const url = URL.createObjectURL(blob)

    // Abre a prévia em nova aba dentro de uma página própria, com uma barra
    // de download que garante o nome correto do arquivo. Isso é necessário
    // porque o visualizador de PDF nativo do navegador usa o ID do blob como
    // nome (não é possível renomeá-lo por segurança).
    const preview = window.open('', '_blank')

    // Pop-up bloqueado: cai para abrir o PDF direto.
    if (!preview) {
      window.open(url, '_blank')
      return
    }

    preview.document.write(
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" />' +
        '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
        '<title></title><style>' +
        '*{box-sizing:border-box}html,body{margin:0;height:100%}' +
        'body{display:flex;flex-direction:column;background:#525659;' +
        'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
        '.bar{display:flex;align-items:center;gap:12px;padding:10px 16px;' +
        'background:#323639;color:#fff;flex:0 0 auto}' +
        '.bar .name{font-size:14px;font-weight:500;white-space:nowrap;' +
        'overflow:hidden;text-overflow:ellipsis}' +
        '.bar button{margin-left:auto;display:inline-flex;align-items:center;' +
        'gap:6px;background:#2f6feb;color:#fff;border:0;border-radius:6px;' +
        'padding:8px 16px;font-size:14px;font-weight:500;cursor:pointer}' +
        '.bar button:hover{background:#1f5ed6}' +
        'iframe{flex:1 1 auto;border:0;width:100%}' +
        '</style></head><body>' +
        '<div class="bar"><span class="name" id="fname"></span>' +
        '<button id="dl" type="button">Baixar PDF</button></div>' +
        '<iframe id="frame" title="Pré-visualização do PDF"></iframe>' +
        '</body></html>',
    )
    preview.document.close()

    // Preenche nome/título via textContent (nunca interpolado no HTML acima),
    // evitando qualquer injeção a partir do nome do cliente.
    preview.document.title = fileName
    const nameEl = preview.document.getElementById('fname')
    if (nameEl) nameEl.textContent = fileName
    const frameEl = preview.document.getElementById(
      'frame',
    ) as HTMLIFrameElement | null
    if (frameEl) frameEl.src = url
    const dlBtn = preview.document.getElementById('dl')
    dlBtn?.addEventListener('click', () => {
      const a = preview.document.createElement('a')
      a.href = url
      a.download = fileName
      preview.document.body.appendChild(a)
      a.click()
      preview.document.body.removeChild(a)
    })
  }

  const onSubmit = async (rawData: PrintOptionsType) => {
    // O nível de detalhe vira as duas chaves que o PDF lê
    const level = rawData.detailLevel || defaultLevel
    const formData: PrintOptionsType = {
      ...rawData,
      showItemsDetails: level !== 'resumo',
      showDetailValues: level === 'valores' && hasValuesPermission,
    }
    try {
      setIsLoading(true)
      // O servidor também confere o nível pela permissão e pelo plano
      const res = await getItem({
        route: `/sale/quotation/${quotationId}/pdf-data`,
        params: { detailLevel: level },
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
                  <FormCheckbox<PrintOptionsType>
                    name="showSignature"
                    label="Exibir assinatura digital"
                  />
                </div>
                <Separator className="my-5" />
                {/* O nível de detalhe (IP-12): padrão "detalhado com valores"
                    para quem vê valores. O detalhamento usa o nome de venda
                    de cada parte, nunca nomes internos */}
                <div className="space-y-4">
                  <p className="font-semibold text-gray-700">
                    Nível de detalhe dos itens
                  </p>
                  {levels.length > 1 ? (
                    <FormRadio<PrintOptionsType>
                      name="detailLevel"
                      className="[&_[role=radiogroup]]:flex-col [&_[role=radiogroup]]:items-start [&_[role=radiogroup]]:gap-3"
                      items={levels.map((level) => ({
                        value: level.value,
                        label: `${level.label} · ${level.help}`,
                      }))}
                    />
                  ) : (
                    <p className="text-sm text-gray">
                      Sem detalhes: nome do item, descritivo técnico e preço
                      final. O detalhamento dos itens faz parte de outro plano.
                    </p>
                  )}
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
              <FeaturedIcon tone="warning" Icon={IconAlertTriangle} size="lg" />
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

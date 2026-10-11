'use client'

// Concluir o orçamento (checkout). Decisão de 05/10/2026: concluir SEM
// condição de pagamento pode, com um aviso do que falta; aprovar, não
// (ApproveQuotation). O legado concluía direto, sem aviso, até com item em
// R$ 0,00; aqui o aviso aparece antes e o vendedor decide.

// React
import { useState } from 'react'

// UI
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
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Type
import { QuotationType } from '@/types/sales/quotation'

// Action
import { createItemNew } from '@/actions/_cruds'
import { getComposedItems } from '@/actions/quotation-composition'

// Hooks
import { useInactiveQuotationItems } from '@/hooks/queries/useInactiveQuotationItems'

// Lib
import { cn } from '@/lib/utils'

// Icons
import {
  IconLoader2,
  IconCircleCheck,
  IconAlertTriangle,
  IconPrinter,
} from '@tabler/icons-react'
import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'
import { PaymentConditionsDialog } from './PaymentConditions'
import {
  calculatePaymentTotals,
  calculateScheduledTotal,
} from './PaymentConditions/utils'

const alertDefaultValues = {
  title: '',
  description: '',
}

interface Props {
  data: QuotationType
  canFinish: boolean
}

export function FinishQuotation({ data, canFinish }: Props) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [openWarning, setOpenWarning] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [openPrint, setOpenPrint] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [alertDialog, setAlertDialog] = useState(alertDefaultValues)

  const queryClient = useQueryClient()

  // Item de composição sem nenhuma etapa não bloqueia a conclusão (MS-12,
  // 05/10/2026): é a saída do dia a dia, e o aviso fica no item
  const { data: composedRes } = useQuery({
    queryKey: ['composed-items', data?.id],
    queryFn: () => getComposedItems({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const composedAttention = !!composedRes?.data?.some((item) => item.attention)

  // Produto inativado depois de lançado (PAD-7): concluir pode, aprovar não
  const { inactiveItems } = useInactiveQuotationItems(data)

  const hasInstallments = data?.paymentConditions?.installmentQty > 0
  const hasPaymentCondition = !!data?.paymentConditions?.paymentCondition?.id

  // Se for "Sem lançamento" (Cortesia por exemplo), não verificar se existem condições de pagamento
  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'

  // A conta tem que ser a mesma do modal de condições de pagamento. Antes o
  // esperado vinha de `data.totalValue` (sem desconto) e era comparado só com a
  // soma das parcelas (sem a entrada): qualquer orçamento com entrada ou
  // desconto acusava divergência e nunca concluía direto.
  const { finalValue: expectedTotalValue } = calculatePaymentTotals(data)
  const scheduledTotal = calculateScheduledTotal(data)

  // Tolerância de 1 centavo para erros de arredondamento
  const hasValueDivergence =
    hasInstallments && Math.abs(expectedTotalValue - scheduledTotal) > 1

  const paymentMissing =
    !isNoInvoice && !(hasInstallments && hasPaymentCondition)

  // O que falta, dito antes de concluir
  const missing: string[] = []
  if (paymentMissing) {
    missing.push(
      'Condição de pagamento não informada. Dá para concluir assim, mas a aprovação vai exigir a condição.',
    )
  }
  if (composedAttention) {
    missing.push(
      'Há um item sem etapas (exige atenção). O orçamento segue, mas monte a composição depois para o custo e a produção.',
    )
  }
  if (inactiveItems.length) {
    missing.push(
      `Produto inativado em: ${inactiveItems.map((item) => item.description).join(', ')}. Troque ou retire o item antes de aprovar.`,
    )
  }

  const handleClose = () => {
    setOpen(false)
  }

  const finish = async () => {
    setOpenWarning(false)
    setLoading(true)
    setOpen(true)
    setAlertDialog({
      title: 'Validando orçamento...',
      description: 'Aguarde...',
    })

    const result = await createItemNew({
      route: `/sale/quotation/${data.id}/finish`,
    })

    setLoading(false)

    if (!result.success) {
      setAlertDialog({
        title: 'Orçamento não passou pelo checkout',
        description: result.message,
      })
      return
    }

    setAlertDialog(alertDefaultValues)
    setOpen(false)
    setOpenSuccess(true)
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
  }

  const handleFinish = () => {
    // Parcelas que não fecham com o total: isso precisa ser acertado nas
    // condições de pagamento antes de concluir
    if (hasValueDivergence) {
      setOpenPayment(true)
      return
    }
    if (missing.length) {
      setOpenWarning(true)
      return
    }
    finish()
  }

  if (!canFinish) return null

  return (
    <>
      <CustomButton
        icon={IconCircleCheck}
        title="Concluir orçamento"
        iconVariant="lightBlueBorderedLight"
        onClick={handleFinish}
      />

      {/* O aviso do que falta, antes de concluir */}
      <AlertDialog open={openWarning} onOpenChange={setOpenWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              rounded
              size="lg"
              variant="warningBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Concluir mesmo assim?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left">
                {missing.map((text) => (
                  <p
                    key={text}
                    className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-wrap">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {paymentMissing && (
              <Button
                type="button"
                variant="neutralOutline"
                onClick={() => {
                  setOpenWarning(false)
                  setOpenPayment(true)
                }}
              >
                Informar condição de pagamento
              </Button>
            )}
            <AlertDialogAction onClick={finish} RightIcon={IconCircleCheck}>
              Concluir mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* As condições de pagamento, quando o vendedor escolhe informar (ou
          quando as parcelas não fecham) e, ao salvar, conclui */}
      <PaymentConditionsDialog
        quotationData={data}
        open={openPayment}
        onOpenChange={setOpenPayment}
        hideTrigger
        onFinish={finish}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-96">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={loading ? IconLoader2 : IconAlertTriangle}
              rounded
              size="lg"
              variant={
                loading ? 'neutralBorderedLight' : 'warningBorderedLight'
              }
              className={cn('mx-auto mb-2', loading && 'animate-spin')}
            />
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!loading && (
              <AlertDialogCancel onClick={handleClose}>
                Fechar
              </AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <AlertDialogContent className="max-w-96">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconCircleCheck}
              rounded
              size="lg"
              variant="successBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Orçamento concluído</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentMissing
                ? 'O orçamento passou pelo checkout sem condição de pagamento. Informe a condição antes de aprovar.'
                : 'O orçamento passou pelo checkout, o que deseja fazer agora?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Fechar</AlertDialogCancel>
            <Button
              type="button"
              RightIcon={IconPrinter}
              onClick={() => setOpenPrint(true)}
            >
              Imprimir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PrintQuotationDialog
        type="quotation"
        quotationId={data?.id}
        open={openPrint}
        onOpenChange={setOpenPrint}
      />
    </>
  )
}

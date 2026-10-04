'use client'

// React
import { useState } from 'react'

// UI
import {
  AlertDialog,
  AlertDialogTitle,
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
  const [openPrint, setOpenPrint] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [alertDialog, setAlertDialog] = useState(alertDefaultValues)

  const queryClient = useQueryClient()

  // Item de composição sem nenhuma etapa impede concluir (ORC-11, MS-12)
  const { data: composedRes } = useQuery({
    queryKey: ['composed-items', data?.id],
    queryFn: () => getComposedItems({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const composedAttention = !!composedRes?.data?.some((item) => item.attention)

  // Se tiver pendente de configurar as condições de pagamento, abrir o modal direto antes de concluir
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

  const handleClose = () => {
    setOpen(false)
  }

  const handleFinish = async () => {
    if (composedAttention) {
      setOpen(true)
      setAlertDialog({
        title: 'Item exige atenção',
        description:
          'Há um item de composição sem nenhuma etapa. Monte as etapas ou exclua o item antes de concluir o orçamento.',
      })
      return
    }

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

  const canFinishDirectly =
    (isNoInvoice || (hasInstallments && hasPaymentCondition)) &&
    !hasValueDivergence

  return (
    <>
      {canFinish ? (
        canFinishDirectly ? (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <CustomButton
              icon={IconCircleCheck}
              title="Concluir orçamento"
              iconVariant="lightBlueBorderedLight"
              onClick={handleFinish}
            />
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
                <AlertDialogDescription /* className={cn(validated && 'sr-only')} */
                >
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
        ) : (
          <PaymentConditionsDialog
            quotationData={data}
            onFinish={handleFinish}
          />
        )
      ) : null}
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
              O orçamento passou pelo checkout, o que deseja fazer agora?
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

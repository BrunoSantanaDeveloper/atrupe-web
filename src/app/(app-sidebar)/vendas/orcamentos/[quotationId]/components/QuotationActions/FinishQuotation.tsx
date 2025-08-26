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
import { useQueryClient } from '@tanstack/react-query'

// Type
import { QuotationType } from '@/types/sales/quotation'

// Action
import { createItemNew } from '@/actions/_cruds'

// Lib
import { cn } from '@/lib/utils'

// Icons
import {
  IconLoader2,
  IconArrowRight,
  IconCircleCheck,
  IconAlertTriangle,
  IconProgressCheck,
} from '@tabler/icons-react'
import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'
import { PaymentConditionsDialog } from './PaymentConditions'

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

  // Se tiver pendente de configurar as condições de pagamento, abrir o modal direto antes de concluir
  const hasPaymentCondition = !!data?.paymentConditions?.paymentCondition

  // Se for "Sem lançamento" (Cortesia por exemplo), não verificar se existem condições de pagamento
  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'

  const handleClose = () => {
    setOpen(false)
  }

  const handleFinish = async () => {
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

  return (
    <>
      {canFinish ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          {hasPaymentCondition || isNoInvoice ? (
            <CustomButton
              icon={IconProgressCheck}
              title="Concluir orçamento"
              iconVariant="lightBlueBorderedLight"
              onClick={handleFinish}
            />
          ) : (
            <PaymentConditionsDialog
              quotationData={data}
              onFinish={handleFinish}
            />
          )}
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
              RightIcon={IconArrowRight}
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

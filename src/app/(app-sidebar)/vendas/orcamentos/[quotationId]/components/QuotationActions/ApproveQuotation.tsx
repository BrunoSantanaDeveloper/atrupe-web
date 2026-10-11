'use client'

// Aprovar o orçamento (vira ordem de serviço). Duas travas, com mensagem
// clara (decisões de 05/10/2026):
// - a condição de pagamento é obrigatória para aprovar (e, enquanto o /finish
//   recusar orçamento sem parcelas, também para concluir: FinishQuotation);
// - um item cujo produto foi inativado (PAD-7) trava a aprovação até ser
//   trocado ou retirado.

// React
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// UI
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
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { PaymentConditionsDialog } from './PaymentConditions'

// Third-party
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Hooks
import { useInactiveQuotationItems } from '@/hooks/queries/useInactiveQuotationItems'

// Icons
import {
  IconBan,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'

interface Props {
  data: QuotationType
}

function dateInputToSaoPauloIso(date: string) {
  return new Date(`${date}T00:00:00-03:00`).toISOString()
}

export function ApproveQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [openBlocked, setOpenBlocked] = useState<'payment' | 'inactive' | null>(
    null,
  )
  const [approvedAt, setApprovedAt] = useState('')

  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session } = useSession()

  const isAdmin = session?.user?.isAdmin

  const hasInstallments = data?.paymentConditions?.installmentQty > 0
  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'
  const hasPaymentCondition =
    isNoInvoice ||
    (hasInstallments && !!data?.paymentConditions?.paymentCondition?.id)

  const { inactiveItems } = useInactiveQuotationItems(data)

  const handleTriggerClick = () => {
    if (inactiveItems.length) {
      setOpenBlocked('inactive')
      return
    }
    if (!hasPaymentCondition) {
      setOpenBlocked('payment')
      return
    }
    setApprovedAt('')
    setOpen(true)
  }

  const handlePaymentConditionsSaved = () => {
    setApprovedAt('')
    setOpen(true)
  }

  const handleApprove = async () => {
    const body =
      isAdmin && approvedAt
        ? { approvedAt: dateInputToSaoPauloIso(approvedAt) }
        : undefined
    const res = await createItemNew({
      route: `/sale/quotation/${data.id}/approve`,
      data: body,
    })
    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Orçamento aprovado')

    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['order-data'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['order-totals'] })
    queryClient.invalidateQueries({ queryKey: ['order-list'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })

    const orderId = res?.data?.id

    if (orderId) {
      setTimeout(() => {
        router.replace(`/vendas/ordens-de-servico/${orderId}`)
      }, 100)
    }
  }

  return (
    <>
      <CustomButton
        icon={IconCircleCheck}
        title="Aprovar orçamento"
        iconVariant="successLight"
        onClick={handleTriggerClick}
      />

      {/* A trava, com o motivo dito */}
      <AlertDialog
        open={openBlocked !== null}
        onOpenChange={(value) => !value && setOpenBlocked(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={openBlocked === 'inactive' ? IconBan : IconAlertTriangle}
              rounded
              size="lg"
              variant={
                openBlocked === 'inactive'
                  ? 'errorBorderedLight'
                  : 'warningBorderedLight'
              }
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>
              {openBlocked === 'inactive'
                ? 'Este orçamento não pode ser aprovado'
                : 'Informe a condição de pagamento para aprovar'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left">
                {openBlocked === 'inactive' ? (
                  <>
                    <p>
                      {inactiveItems.length === 1
                        ? 'O produto deste item foi inativado:'
                        : 'Os produtos destes itens foram inativados:'}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {inactiveItems.map((item) => (
                        <li key={item.id}>{item.description}</li>
                      ))}
                    </ul>
                    <p>
                      Troque ou retire o item em Itens para aprovar. Aprovado, o
                      orçamento viraria uma ordem de serviço com um produto que
                      a empresa não vende mais.
                    </p>
                  </>
                ) : (
                  <p>
                    A ordem de serviço nasce com as parcelas e a forma de
                    pagamento, então elas precisam estar informadas antes.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {openBlocked === 'inactive' ? 'Fechar' : 'Cancelar'}
            </AlertDialogCancel>
            {openBlocked === 'payment' && (
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                onClick={() => {
                  setOpenBlocked(null)
                  setOpenPayment(true)
                }}
              >
                Informar condição de pagamento
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentConditionsDialog
        quotationData={data}
        open={openPayment}
        onOpenChange={setOpenPayment}
        hideTrigger
        onFinish={handlePaymentConditionsSaved}
        submitLabel="Salvar e continuar"
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              rounded
              size="lg"
              variant="warningBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Deseja aprovar este orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao aprovar, este trabalho mudará de status e passará a ficar
              disponível na aba Ordens de Serviço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              RightIcon={IconCircleCheck}
            >
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

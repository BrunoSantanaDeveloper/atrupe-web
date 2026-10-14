'use client'

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

// Icons
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'

interface Props {
  data: QuotationType
}

function dateInputToSaoPauloIso(date: string) {
  return new Date(`${date}T00:00:00-03:00`).toISOString()
}

export function ApproveQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)
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

  const handleTriggerClick = () => {
    if (!hasPaymentCondition) {
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
      {!hasPaymentCondition && (
        <PaymentConditionsDialog
          quotationData={data}
          onFinish={handlePaymentConditionsSaved}
          actionIcon={IconCircleCheck}
          actionTitle="Aprovar orçamento"
          actionIconVariant="successLight"
          submitLabel="Salvar e continuar"
        />
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        {hasPaymentCondition && (
          <CustomButton
            icon={IconCircleCheck}
            title="Aprovar orçamento"
            iconVariant="successLight"
            onClick={handleTriggerClick}
          />
        )}
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

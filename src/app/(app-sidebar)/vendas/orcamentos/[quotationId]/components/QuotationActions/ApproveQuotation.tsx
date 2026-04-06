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

// Third-party
import { useQueryClient } from '@tanstack/react-query'

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

export function ApproveQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const router = useRouter()

  const hasInstallments = data?.paymentConditions?.installmentQty > 0
  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'
  const hasPaymentCondition = hasInstallments || isNoInvoice

  const handleTriggerClick = () => {
    if (!hasPaymentCondition) {
      toast.error(
        'Configure a condição de pagamento antes de aprovar o orçamento.',
      )
      return
    }
    setOpen(true)
  }

  const handleApprove = async () => {
    const res = await createItemNew({
      route: `/sale/quotation/${data.id}/approve`,
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <CustomButton
        icon={IconCircleCheck}
        title="Aprovar orçamento"
        iconVariant="successLight"
        onClick={handleTriggerClick}
      />
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
            Ao aprovar o orçamento, ele será convertido em uma ordem de serviço.
            <br />
            <br />
            Você será redirecionado para a nova ordem de serviço, e poderá
            acessá-la novamente no menu &quot;Ordens de Serviço&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            RightIcon={IconCircleCheck}
          >
            Aprovar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

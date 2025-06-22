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
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItem } from '@/actions/_cruds'

// Icons
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

interface Props {
  data: QuotationType
}

export function ApproveQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'quotationRoute',
        customPath: `/${data.id}/approve`,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-data'] })
      queryClient.invalidateQueries({ queryKey: ['order-data'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
      queryClient.invalidateQueries({ queryKey: ['order-totals'] })
      queryClient.invalidateQueries({ queryKey: ['order-list'] })

      setTimeout(() => {
        router.replace(`/vendas/ordens-de-servico/${data.id}`)
      }, 100)
    },
  })

  const handleApprove = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Orçamento aprovado'
      },
      error:
        // 'Erro ao aprovar orçamento. Certifique-se de que as condições de pagamento estão configuradas corretamente.',
        'Erro ao aprovar orçamento.',
    })
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton
            icon={IconCircleCheck}
            title="Aprovar orçamento"
            iconVariant="successLight"
          />
        </AlertDialogTrigger>
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
              Ao aprovar o orçamento, ele será convertido em uma ordem de
              serviço.
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
    </>
  )
}

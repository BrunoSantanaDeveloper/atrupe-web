'use client'

// React
import { useState } from 'react'

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
import { createItemNew } from '@/actions/_cruds'

// Icons
import {
  IconArrowBackUp,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'

interface Props {
  data: QuotationType
}

export function OpenQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  // A venda pendente (PA-8): voltar para digitação cancela o título
  const pending = data?.status === 'PENDING_PAYMENT'

  // A recusa do servidor diz o caminho (ex.: a entrada já recebida)
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await createItemNew({
        route: `/sale/quotation/${data.id}/open`,
      })
      if (!res.success) throw new Error(res.message)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    },
  })

  const handleOpen = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return pending ? 'Venda voltou para digitação' : 'Orçamento reaberto'
      },
      error: (error: Error) => error.message || 'Ocorreu um erro',
    })
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton
            icon={IconArrowBackUp}
            title={pending ? 'Voltar para digitação' : 'Reabrir orçamento'}
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>
              {pending
                ? 'Voltar a venda para digitação?'
                : 'Deseja reabrir este orçamento?'}
            </AlertDialogTitle>
            {pending ? (
              <AlertDialogDescription>
                A venda sai de Pendente para ser editada, e o título ⚠️
                Pendência do financeiro é cancelado. Para aprovar de novo,
                conclua e aprove: a pendência volta com os valores novos.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription className="sr-only">
                Confirme se deseja reabrir o orçamento.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleOpen} RightIcon={IconCircleCheck}>
              {pending ? 'Voltar para digitação' : 'Reabrir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

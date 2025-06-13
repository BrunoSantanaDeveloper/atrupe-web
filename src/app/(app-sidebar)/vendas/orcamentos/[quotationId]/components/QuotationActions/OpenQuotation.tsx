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
import { createItem } from '@/actions/_cruds'

// Icons
import {
  IconArrowBackUp,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

interface Props {
  data: QuotationType
}

export function OpenQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'quotationRoute',
        customPath: `/${data.id}/open`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleOpen = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Orçamento reaberto'
      },
      error: 'Ocorreu um erro',
    })
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton icon={IconArrowBackUp} title="Reabrir orçamento" />
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
            <AlertDialogTitle>Deseja reabrir este orçamento?</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Confirme se deseja reabrir o orçamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleOpen} RightIcon={IconCircleCheck}>
              Reabrir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

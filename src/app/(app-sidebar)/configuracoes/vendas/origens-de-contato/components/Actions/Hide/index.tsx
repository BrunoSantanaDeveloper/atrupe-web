'use client'

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

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconEyeOff } from '@tabler/icons-react'

// Action
import { createItemNew } from '@/actions/_cruds'

// Types
import type { IContactSource } from '@/hooks/queries/useContactSources'

interface Props {
  open: boolean
  rowData?: IContactSource
  setOpen: (value: string) => void
}

export function HideAlertDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      createItemNew({ route: `/contact-source/${rowData?.id}/hide` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-sources-list'] })
    },
  })

  const handleHide = async () => {
    if (!rowData) return

    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => `"${rowData.name}" ocultada com sucesso`,
      error: (err) => err?.message || 'Ocorreu um erro',
    })
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'openAlert' : '')
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconEyeOff}
            size="lg"
            tone="neutral"
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>
            Ocultar &quot;{rowData?.name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta origem não aparecerá mais nas opções da sua empresa. Você pode
            restaurá-la pelas configurações.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleHide} RightIcon={IconCircleCheck}>
            Ocultar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

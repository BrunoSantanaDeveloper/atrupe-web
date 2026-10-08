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
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

// Action
import { deleteItem } from '@/actions/_cruds'

// Types
import type { IContactSource } from '@/hooks/queries/useContactSources'

interface Props {
  open: boolean
  rowData?: IContactSource
  setOpen: (value: string) => void
}

export function DeleteAlertDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteItem('contactSourceRoute', rowData?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-sources-list'] })
    },
  })

  const handleDelete = async () => {
    if (!rowData) return

    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => 'Sucesso!',
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
            Icon={IconExclamationCircle}
            size="lg"
            tone="error"
            className="mx-auto mb-2 flex"
          />
          <AlertDialogTitle>Deseja remover esta origem?</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {rowData?.name}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} RightIcon={IconCircleCheck}>
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

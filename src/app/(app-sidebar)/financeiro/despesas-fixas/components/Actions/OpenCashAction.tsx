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
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'

// Type
import type { SearchParamsType } from '@/types/coreTypes'

// Action
import { updateItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
}

export function OpenCashAlertDialog({ open, setOpen }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => updateItem('receivableRoute', id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleOpenCashAction = async () => {
    return

    toast.promise(mutation.mutateAsync('id do caixa'), {
      loading: 'Aguarde...',
      success: () => {
        return 'Sucesso!'
      },
      error: 'Ocorreu um erro',
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setOpen('')
      return
    }
    setOpen('openAlert')
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>
              Abrir este caixa na data de hoje?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Abrir caixa para...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOpenCashAction}
              RightIcon={IconCircleCheck}
            >
              Abrir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

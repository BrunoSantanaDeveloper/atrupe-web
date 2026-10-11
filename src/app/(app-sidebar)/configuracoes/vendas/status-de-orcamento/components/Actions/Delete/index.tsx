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

// Type
import type { QuotationStatusType } from '@/types/settings/quotationStatus'

// Action
import { deleteItemNew } from '@/actions/_cruds'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: QuotationStatusType
}
export function DeleteAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const mutation = useMutation({
    mutationFn: () => deleteItemNew({ route: `/sale/status/${rowData?.id}` }),
    onSuccess: (res) => {
      if (res.success) queryClient.invalidateQueries()
    },
  })

  const handleDeleteReason = async () => {
    if (!rowData) return

    const loadingToast = toast.loading('Aguarde...')
    const res = await mutation.mutateAsync().catch(() => null)
    toast.dismiss(loadingToast)

    if (!res?.success) {
      notifyActionError(res, 'Ocorreu um erro')
      return
    }

    toast.success('Sucesso!')
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
              Icon={IconExclamationCircle}
              rounded
              size="lg"
              variant="errorBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Deseja remover status?</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {'motivo'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReason}
              RightIcon={IconCircleCheck}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

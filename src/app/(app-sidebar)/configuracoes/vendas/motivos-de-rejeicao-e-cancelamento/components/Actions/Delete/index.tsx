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
import { SearchParamsType } from '@/types/coreTypes'
import {
  CancelReasonType,
  ListCancelReasonType,
} from '@/types/settings/cancelReason'

// Action
import { deleteItemNew } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

interface Props extends SearchParamsType {
  type: ListCancelReasonType['type']
  open: boolean
  rowData?: CancelReasonType
  setOpen: (value: string) => void
}
export function DeleteAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const mutation = useMutation({
    mutationFn: () => deleteItemNew({ route: `/cancel-reason/${rowData?.id}` }),
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

    toast.success('Motivo removido')
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setOpen('')
      return
    }
    setOpen('openAlert')
  }

  return (
    <PermissionGate permissions={['sales_settings:rejection_reasons:delete']}>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconExclamationCircle}
              size="lg"
              tone="error"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>Deseja remover motivo?</AlertDialogTitle>
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
    </PermissionGate>
  )
}

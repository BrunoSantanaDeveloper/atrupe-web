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
import { deleteItem } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props extends SearchParamsType {
  type: ListCancelReasonType['type']
  open: boolean
  rowData?: CancelReasonType
  setOpen: (value: string) => void
}
export function DeleteAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteItem('cancelReasonRoute', rowData?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleDeleteReason = async () => {
    if (!rowData) return

    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Sucesso!'
      },
      error: 'Ocorreu um erro',
    })
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

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
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

// Type
import type { SearchParamsType } from '@/types/coreTypes'
import type { SellerProfileEmployeesType } from '@/types/settings/sellerProfile'

// Action
import { deleteItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: SellerProfileEmployeesType
}
export function DeleteSellerDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      deleteItem('sellerProfileEmployeeRoute', rowData?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleDelete = async () => {
    if (!rowData) return

    toast.promise(mutation.mutateAsync(), {
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
    setOpen('removeSeller')
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertTriangle}
            size="lg"
            tone="warning"
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>Deseja remover vendedor?</AlertDialogTitle>
          <AlertDialogDescription className="sr-only"></AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            RightIcon={IconCircleCheck}
            className={buttonVariants({ variant: 'error' })}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

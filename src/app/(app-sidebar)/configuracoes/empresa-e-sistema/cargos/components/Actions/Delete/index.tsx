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
import { PermissionGate } from '@/components/common/PermissionGate'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

// Type
import { SearchParamsType } from '@/types/coreTypes'
import type { RoleType } from '@/types/settings/role'

// Action
import { deleteItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  rowData?: RoleType
  setOpen: (value: string) => void
}
export function DeleteAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteItem('roleRoute', rowData?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleDelete = async () => {
    if (mutation.isPending || !rowData) return

    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Sucesso!'
      },
      error: 'Ocorreu um erro',
    })
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'delete' : '')
  }

  return (
    <PermissionGate permissions={['company_settings:roles:delete']}>
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
            <AlertDialogTitle>
              {rowData?.employees?.length
                ? `${rowData?.employees?.length} ${
                    rowData?.employees?.length > 1
                      ? 'colaboradores estão'
                      : 'colaborador está'
                  } com este cargo`
                : 'Deseja excluir este cargo?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {rowData?.employees?.length
                ? 'Ao excluir este cargo, todos os colaboradores serão desvinculados do cargo. Esta ação não pode ser desfeita.'
                : 'Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              RightIcon={IconCircleCheck}
              className={buttonVariants({ variant: 'error' })}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}

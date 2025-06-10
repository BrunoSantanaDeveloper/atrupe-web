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
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { BankAccountsType } from '@/types/financial/bank'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen: (value: string) => void
  rowData?: BankAccountsType
}

export function DisableBankAccount({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteItem('bankAccountRoute', rowData?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Conta bancária excluída!')
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const handleDisableAccount = async () => {
    if (!rowData) return

    await mutation.mutateAsync()
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'delete' : '')
  }

  return (
    <PermissionGate permissions={['financial_settings:bank_accounts:delete']}>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta bancária</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma a exclusão da conta bancária?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'error' })}
              onClick={handleDisableAccount}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}

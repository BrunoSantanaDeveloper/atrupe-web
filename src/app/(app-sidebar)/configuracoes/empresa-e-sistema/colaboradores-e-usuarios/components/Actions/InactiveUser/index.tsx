'use client'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

// UI
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { UserType } from '@/types/settings/employee'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { updateItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  rowData?: UserType
  onChange: (value: boolean) => void
}
export function InactiveUserAlertDialog(props: Props) {
  const { rowData, onChange } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: { isActive: boolean }) =>
      updateItem('userRoute', rowData?.id || '', body),
    onSuccess: () => {
      queryClient.invalidateQueries()
      // toast.success('Status alterado.')
      onChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const handleDisable = async () => {
    if (!rowData) return

    const activate = rowData?.isActive

    const body = {
      isActive: !activate,
    }

    await mutation.mutateAsync(body)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={rowData?.isActive ? 'error' : 'default'}>
          {rowData?.isActive ? 'Inativar' : 'Ativar'}
        </Button>
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
          <AlertDialogTitle>
            Deseja {rowData?.isActive ? 'inativar' : 'ativar'} este usuário?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {rowData?.isActive
              ? `Ao inativar ${rowData?.name || 'este usuário'}, ele não poderá mais acessar o sistema.`
              : `Ao ativar ${rowData?.name || 'este usuário'}, o colaborador será ativado e poderá acessar o sistema.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDisable}
            isLoading={mutation.isPending}
          >
            {rowData?.isActive ? 'Inativar' : 'Ativar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

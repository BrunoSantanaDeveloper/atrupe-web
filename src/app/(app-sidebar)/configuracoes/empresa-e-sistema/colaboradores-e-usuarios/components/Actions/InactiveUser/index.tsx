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
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

interface Props extends SearchParamsType {
  rowData?: UserType
  onChange: (value: boolean) => void
}
export function InactiveUserAlertDialog(props: Props) {
  const { rowData, onChange } = props

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const mutation = useMutation({
    mutationFn: (body: { isActive: boolean }) =>
      updateItemNew({ route: `/user/${rowData?.id}`, data: body }),
    onSuccess: (res) => {
      if (!res.success) {
        // Reativar acima da cota do plano: o servidor recusa com
        // PLAN_LIMIT_REACHED, e o diálogo da cota substitui o do usuário.
        // Antes, o helper antigo perdia a mensagem ("Ocorreu um erro.").
        if (res.planError?.code === 'PLAN_LIMIT_REACHED') {
          onChange(false)
          queryClient.invalidateQueries({ queryKey: ['employees-totals'] })
        }
        notifyActionError(res, 'Ocorreu um erro.')
        return
      }
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
          <AlertDialogCancel>Voltar</AlertDialogCancel>
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

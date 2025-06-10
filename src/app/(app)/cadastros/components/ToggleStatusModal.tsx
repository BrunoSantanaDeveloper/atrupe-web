/* import { updateItem } from '@/actions/_cruds'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Props {
  type: 'inactive' | 'active'
  open: boolean
  setOpen: () => void
  id: string
  entityType: 'client' | 'supplier'
  onSuccess?: () => void
}

export function ToggleStatusModal(props: Props) {
  const { open, setOpen, id, onSuccess, type, entityType } = props
  const entity = entityType === 'client' ? 'Cliente' : 'Fornecedor'

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      updateItem(
        entityType === 'client' ? 'clientRoute' : 'supplierRoute',
        id,
        {
          status: type !== 'inactive' ? 'INACTIVE' : 'ACTIVE',
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: entityType === 'client' ? ['client-list'] : ['supplier-list'],
      })
      onSuccess?.()
    },
  })

  const handleToggleStatus = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return `${entity} ${type === 'inactive' ? 'inativado' : 'ativado'} com sucesso`
      },
      error: `Erro ao ${type === 'inactive' ? 'inativar' : 'ativar'} ${entity.toLowerCase()}`,
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertTriangle}
            rounded
            size="lg"
            variant={
              type === 'inactive'
                ? 'orangeBorderedLight'
                : 'successBorderedLight'
            }
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>
            Deseja {type === 'inactive' ? `Inativar` : `Ativar`} este {entity}?
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggleStatus}
            className={buttonVariants({
              variant: type === 'inactive' ? 'error' : 'success',
            })}
            RightIcon={IconCircleCheck}
          >
            {type === 'inactive' ? 'Inativar' : 'Ativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
 */

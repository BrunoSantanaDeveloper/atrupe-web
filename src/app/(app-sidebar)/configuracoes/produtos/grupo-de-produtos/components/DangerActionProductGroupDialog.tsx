import { updateItemNew } from '@/actions/_cruds'
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
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Props {
  type: 'inactive' | 'active'
  open: boolean
  setOpen: () => void
  groupId: string
  onSuccess?: () => void
}

export function DangerActionProductGroupDialog(props: Props) {
  const { open, setOpen, groupId, onSuccess, type } = props

  const queryClient = useQueryClient()

  const handleInactive = async () => {
    const res = await updateItemNew({
      route: `/category/${groupId}`,
      data: { isActive: type !== 'inactive' },
    })

    if (!res.success) {
      toast.error(
        res.message ||
          `Erro ao ${type === 'inactive' ? 'inativar grupo' : 'ativar grupo'}`,
      )
      return
    }

    toast.success(
      `Grupo ${type === 'inactive' ? 'inativado com sucesso' : 'ativado com sucesso'}`,
    )

    queryClient.invalidateQueries({
      queryKey: ['productGroup', groupId],
    })
    queryClient.invalidateQueries({ queryKey: ['product-group-list', {}] })
    onSuccess?.()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertTriangle}
            rounded
            size="lg"
            variant="orangeBorderedLight"
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>
            Deseja {type === 'inactive' ? 'inativar' : 'ativar'} este grupo?
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInactive}
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

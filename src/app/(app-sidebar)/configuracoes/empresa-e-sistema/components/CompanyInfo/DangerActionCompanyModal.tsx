import { updateItemNew } from '@/actions/_cruds'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  companyId: string
  title: string
  description?: string
  onSuccess?: () => void
}

export function DangerActionCompanyModal(props: Props) {
  const { open, setOpen, companyId, title, description, onSuccess, type } =
    props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      updateItemNew({
        route: `/company/${companyId}`,
        data: {
          isActive: type !== 'inactive',
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies-data'] })
      await queryClient.invalidateQueries({ queryKey: ['company-list'] })
      onSuccess?.()
    },
  })

  const handleInactive = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return `Empresa ${type === 'inactive' ? 'inativada' : 'ativada'} com sucesso`
      },
      error: `Erro ao ${type === 'inactive' ? 'inativar' : 'ativar'} empresa`,
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertTriangle}
            size="lg"
            tone="warning"
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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

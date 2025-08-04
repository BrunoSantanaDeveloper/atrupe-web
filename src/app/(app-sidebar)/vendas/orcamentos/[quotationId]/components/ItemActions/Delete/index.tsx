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

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

// Actions
import { deleteItem } from '@/actions/_cruds'

// Icons
import { IconAlertCircle } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
}

export function DeleteItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      deleteItem('quotationRoute', `remove-product/${rowData?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    },
  })

  const handleRemove = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      error: 'Erro ao remover item',
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'delete' : '')
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertCircle}
            rounded
            size="lg"
            variant="errorBorderedLight"
            className="mx-auto mb-2"
          />
          <AlertDialogTitle>Excluir item</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className={buttonVariants({ variant: 'error' })}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

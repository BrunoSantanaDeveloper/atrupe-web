'use client'

// UI
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'

// Types
import { SaleSeriesType } from '@/types/settings/saleSeries'

// Actions
import { deleteItem } from '@/actions/_cruds'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: SaleSeriesType
}
export function WipeTrainingDataAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteItem('saleSeriesRoute', `purge/${rowData?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Todos os dados referentes à série de venda foram apagados')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const handleWipeData = async () => {
    if (!rowData?.isTraining) return

    await mutation.mutateAsync()
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'wipe' : '')
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>
              Apagar os dados da série de venda?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todos os orçamentos, O.S e movimentações financeiras serão
              apagados.
              <br /> <br />
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="error"
              onClick={handleWipeData}
              isLoading={mutation.isPending}
              RightIcon={IconCircleCheck}
            >
              Apagar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

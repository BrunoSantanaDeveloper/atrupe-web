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
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

// Types
import { SaleSeriesType } from '@/types/settings/saleSeries'

// Actions
import { updateItem } from '@/actions/_cruds'

interface Props {
  rowData?: SaleSeriesType
  onChange: (value: boolean) => void
}
export function DisableSerieAlertDialog(props: Props) {
  const { rowData, onChange } = props

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: { isActive: boolean }) =>
      updateItem('saleSeriesRoute', rowData?.id || '', body),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Status alterado.')
      onChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const handleDisable = async () => {
    const activate = rowData?.isActive

    const body = {
      isActive: !activate,
    }

    await mutation.mutateAsync(body)
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant={rowData?.isActive ? 'error' : 'default'}
          >
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
              Deseja {rowData?.isActive ? 'inativar' : 'ativar'} esta série?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only"></AlertDialogDescription>
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
    </>
  )
}

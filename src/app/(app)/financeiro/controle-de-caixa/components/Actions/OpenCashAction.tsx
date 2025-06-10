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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'

// Type
import type { SearchParamsType } from '@/types/coreTypes'
import type { BankAccountsType } from '@/types/financial/bank'

// Action
import { createItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: BankAccountsType
}
export function OpenCashAlertDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const body = {
    openingDate: new Date(),
    bankAccountId: rowData?.id || '',
  }

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'cashControlRoute',
        customPath: '/open',
        data: body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleOpenCashAction = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Sucesso!'
      },
      error: 'Ocorreu um erro', // TODO : Adicionar erro: Erro ao abrir caixa Já existe um caixa para esta conta nesta data.
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setOpen('')
      return
    }
    setOpen('openAlert')
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
              Abrir este caixa na data de hoje?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Abrir caixa para...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOpenCashAction}
              RightIcon={IconCircleCheck}
            >
              Abrir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

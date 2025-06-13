// UI
import { Button } from '@/components/ui/button'
import { useAlertDialog } from '@/store/useAlertDialog'

// Actions
import { updateItem } from '@/actions/_cruds'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

interface Props {
  type?: 'receivable' | 'payable'
  rowData?: TransactionDetailsType['installments'][0]
  handleOpenChange: (open: boolean) => void
  transactionDialogOpen?: (open: boolean) => void
}

export function UnpayInstallment({
  type,
  rowData,
  handleOpenChange,
  transactionDialogOpen,
}: Props) {
  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()

  const mutationUndoPayment = useMutation({
    mutationFn: () =>
      updateItem(`${type}Route`, `unpay-installment/${rowData?.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
      transactionDialogOpen?.(false)
    },
  })

  const handleUndoPayment = async () => {
    await alertDialog.open({
      title: `Deseja desfazer o pagamento?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: 'error',
      confirmLabel: 'Desfazer pagamento',
      onConfirm: async () => {
        return await mutationUndoPayment.mutateAsync()
      },
      toastMsg: {
        loading: `Aguarde...`,
        success: `Pagamento desfeito com sucesso.`,
        error: `Erro ao desfazer pagamento`,
      },
    })
  }

  return (
    <Button type="button" variant="error" onClick={handleUndoPayment}>
      Desfazer pagamento
    </Button>
  )
}

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAlertDialog } from '@/store/useAlertDialog'

// Actions
import { updateItemNew } from '@/actions/_cruds'
import { useQueryClient } from '@tanstack/react-query'

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

  const handleUndoPayment = async () => {
    const confirmed = await alertDialog.open({
      title: `Deseja desfazer o pagamento?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: 'error',
      confirmLabel: 'Desfazer pagamento',
      toastMsg: undefined,
    })

    if (!confirmed) return

    const res = await updateItemNew({
      route: `/financial/${type}/unpay-installment/${rowData?.id}`,
      data: {},
    })

    if (!res?.success) {
      toast.error(res?.message || 'Erro ao desfazer pagamento')
      return
    }

    toast.success('Pagamento desfeito!')
    queryClient.invalidateQueries()

    queryClient.invalidateQueries()
    handleOpenChange(false)
    transactionDialogOpen?.(false)
  }

  return (
    <Button type="button" variant="error" onClick={handleUndoPayment}>
      Desfazer pagamento
    </Button>
  )
}

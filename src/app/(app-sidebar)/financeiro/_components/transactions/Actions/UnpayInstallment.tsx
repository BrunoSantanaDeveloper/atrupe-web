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
  triggerLoading?: () => void
}

export function UnpayInstallment({
  type,
  rowData,
  handleOpenChange,
  transactionDialogOpen,
  triggerLoading,
}: Props) {
  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()

  const typeText = type === 'payable' ? 'pagamento' : 'recebimento'

  const handleUndoPayment = async () => {
    const confirmed = await alertDialog.open({
      title: `Deseja desfazer o ${typeText}?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: 'error',
      confirmLabel: `Desfazer ${typeText}`,
      toastMsg: undefined,
    })

    if (!confirmed) return

    const res = await updateItemNew({
      route: `/financial/${type}/unpay-installment/${rowData?.id}`,
      data: {},
    })

    if (!res?.success) {
      toast.error(res?.message || `Erro ao desfazer ${typeText}`)
      return
    }

    triggerLoading?.()

    toast.success(`${typeText} desfeito!`)
    queryClient.invalidateQueries()

    queryClient.invalidateQueries()
    handleOpenChange(false)
    transactionDialogOpen?.(false)
  }

  return (
    <Button type="button" variant="error" onClick={handleUndoPayment}>
      Desfazer {typeText}
    </Button>
  )
}

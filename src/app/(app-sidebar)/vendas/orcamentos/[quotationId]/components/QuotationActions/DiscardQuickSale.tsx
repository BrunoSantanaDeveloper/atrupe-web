'use client'

// Descartar a venda rápida (11/11/2026). Ela não passa por Digitação,
// Aguardando e Rejeitado como o orçamento: ou é aprovada, ou o que foi
// digitado se perde. Por isso o "Rejeitar orçamento" dá lugar a este botão,
// que apaga a venda e volta para a lista.

// UI
import { toast } from 'sonner'

// Components
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { deleteItemNew } from '@/actions/_cruds'

// Hooks
import { useRouter } from '@/hooks/useRouter'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import { IconTrash } from '@tabler/icons-react'

interface Props {
  data: QuotationType
}

export function DiscardQuickSale({ data }: Props) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const alertDialog = useAlertDialog()

  const handleDiscard = async () => {
    const res = await deleteItemNew({ route: `/sale/quotation/${data.id}` })
    if (!res.success) {
      toast.error(res.message || 'Não foi possível descartar a venda.')
      return
    }
    toast.success('Venda descartada')
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    router.push('/vendas/orcamentos')
  }

  return (
    <CustomButton
      icon={IconTrash}
      title="Descartar venda"
      iconTone="error"
      onClick={() =>
        alertDialog.open({
          title: 'Descartar esta venda?',
          description:
            'A venda rápida e os itens lançados são apagados. Não dá para recuperar depois.',
          confirmLabel: 'Descartar',
          cancelLabel: 'Cancelar',
          confirmVariant: 'error',
          onConfirm: handleDiscard,
        })
      }
    />
  )
}

'use client'

// React
import { useMemo, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Type
import { OrderType } from '@/types/sales/order'

// Icons
import { IconX, IconAlertCircle } from '@tabler/icons-react'

// Actions
import { createItemNew } from '@/actions/_cruds'

import { useCancelReason } from '@/hooks/queries/useCancelReason'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props {
  data: OrderType
}

export function CancelOrder({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const queryClient = useQueryClient()
  const { canManageRejectionReasons } = usePlanFeatures()

  const alertDialog = useAlertDialog()

  const { data: reasonList } = useCancelReason('CANCELLATION')

  const options = useMemo(() => {
    if (!reasonList) return []
    return (
      reasonList?.find((item) => item.type === 'CANCELLATION')?.reasons || []
    )
  }, [reasonList])

  const handleCancel = async () => {
    // Se não informa motivo, cancela direto
    if (!canManageRejectionReasons()) {
      await alertDialog.open({
        title: 'Confirma cancelamento da venda?',
        iconVariant: 'errorBorderedLight',
        confirmLabel: 'Cancelar venda',
        confirmVariant: 'error',
        onConfirm: async () => {
          const res = await createItemNew({
            route: `/sale/order/${data.id}/cancel`,
          })

          if (res?.success && res?.data) {
            showKeptInstallmentsWarning(res.data)
          }

          queryClient.invalidateQueries()
        },
        toastMsg: {
          loading: 'Cancelando venda...',
          success: 'Venda cancelada!',
          error: 'Erro ao cancelar venda',
        },
      })
      return
    }

    if (!reason) {
      toast.info('Selecione um motivo')
      return
    }

    // Lógica normal (com motivo)
    const res = await createItemNew({
      route: `/sale/order/${data.id}/cancel`,
      data: { reasonId: reason },
    })
    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Venda cancelada')
    showKeptInstallmentsWarning(res.data)

    setOpen(false)
    setReason('')
    queryClient.invalidateQueries()
  }

  const showKeptInstallmentsWarning = (
    data: Record<string, unknown> | undefined,
  ) => {
    const keptInstallments = data?.keptInstallments as
      | {
          receivables?: number
          payables?: number
          total?: number
        }
      | undefined
    const summary = data?.summary as { totalInstallments?: number } | undefined

    const keptReceivables = keptInstallments?.receivables || 0
    const keptPayables = keptInstallments?.payables || 0
    const totalKept = keptInstallments?.total || 0
    const totalInstallments = summary?.totalInstallments || 0

    if (totalKept === 0) return

    const messages = []

    if (keptReceivables > 0) {
      messages.push(
        `${keptReceivables} ${keptReceivables === 1 ? 'parcela' : 'parcelas'} de recebimento já ${keptReceivables === 1 ? 'foi paga' : 'foram pagas'}`,
      )
    }

    if (keptPayables > 0) {
      messages.push(
        `${keptPayables} ${keptPayables === 1 ? 'parcela' : 'parcelas'} de pagamento já ${keptPayables === 1 ? 'foi paga' : 'foram pagas'}`,
      )
    }

    const warningMessage = `Das ${totalInstallments} ${totalInstallments === 1 ? 'parcela' : 'parcelas'} da venda, ${messages.join(' e ')} e ${totalKept === 1 ? 'deve' : 'devem'} ser ${totalKept === 1 ? 'cancelada' : 'canceladas'} manualmente.`

    alertDialog.open({
      title: 'Atenção: Parcelas não canceladas',
      description: warningMessage,
      iconVariant: 'warningBorderedLight',
      confirmLabel: 'Entendi',
      confirmVariant: 'default',
      timeout: 300000,
    })
  }

  // Se tiver permissão, mostra botão simples sem modal
  if (!canManageRejectionReasons()) {
    return (
      <CustomButton
        icon={IconX}
        title="Cancelar venda"
        iconVariant="errorLight"
        onClick={handleCancel}
      />
    )
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton
            icon={IconX}
            title="Cancelar venda"
            iconVariant="errorLight"
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertCircle}
              rounded
              size="lg"
              variant="errorBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Cancelar ordem de serviço</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Selecione um motivo e confirme se deseja cancelar o venda
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            <Label htmlFor={'cancelReason'}>Motivo</Label>
            <Select value={reason} onValueChange={(value) => setReason(value)}>
              <SelectTrigger id={'cancelReason'} autoFocus>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options?.length ? (
                    options?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.reason}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectLabel className="text-gray-400 cursor-not-allowed">
                      Vazio
                    </SelectLabel>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className={buttonVariants({ variant: 'error' })}
              disabled={!reason}
            >
              Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

'use client'

// React
import { useMemo, useState } from 'react'

// UI
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
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
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Icons
import { IconX, IconAlertCircle } from '@tabler/icons-react'
import { useCancelReason } from '@/hooks/queries/useCancelReason'
import Link from 'next/link'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useAlertDialog } from '@/store/useAlertDialog'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'
import { toast } from 'sonner'

interface Props {
  data: QuotationType
}

export function RejectQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const queryClient = useQueryClient()
  const { canManageRejectionReasons } = usePlanFeatures()
  const alertDialog = useAlertDialog()
  const { notifyActionError } = usePlanErrorToast()

  const { data: reasonList } = useCancelReason('REJECTION')

  // A venda pendente (PA-8): desistir cancela o título do financeiro
  const pendingNote =
    data?.status === 'PENDING_PAYMENT'
      ? ' O título ⚠️ Pendência do financeiro é cancelado junto.'
      : ''

  const options = useMemo(() => {
    if (!reasonList) return []
    return reasonList?.find((item) => item.type === 'REJECTION')?.reasons || []
  }, [reasonList])

  const handleReject = async () => {
    const requestObj: { route: string; data?: { reasonId: string } } = {
      route: `/sale/quotation/${data.id}/reject`,
      data: { reasonId: reason },
    }

    if (!reason) delete requestObj.data

    const res = await createItemNew(requestObj)

    if (!res.success) {
      // Rejeitar com motivo é recurso de plano: o servidor recusa sem ele.
      notifyActionError(res)
      return
    }

    toast.success('Orçamento rejeitado')
    setOpen(false)
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
  }

  // Sem o cadastro de motivos (START), o botão rejeitava com um clique, sem
  // confirmar: a confirmação faz o papel que o motivo faz nos outros planos
  // (29/10/2026)
  if (!canManageRejectionReasons()) {
    return (
      <CustomButton
        icon={IconX}
        title="Rejeitar orçamento"
        iconTone="error"
        onClick={() =>
          alertDialog.open({
            title: 'Rejeitar orçamento?',
            description: `O orçamento vai para Rejeitados. Ele não é apagado: dá para reabrir depois.${pendingNote}`,
            confirmLabel: 'Rejeitar',
            cancelLabel: 'Cancelar',
            confirmVariant: 'error',
            onConfirm: handleReject,
          })
        }
      />
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <CustomButton
          icon={IconX}
          title="Rejeitar orçamento"
          iconTone="error"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FeaturedIcon
            Icon={IconAlertCircle}
            size="lg"
            tone="error"
            className="mx-auto mb-2 flex"
          />
          <AlertDialogTitle>Rejeitar orçamento</AlertDialogTitle>
          {/* O motivo é obrigatório a partir do LITE (24/10/2026): é ele que
              alimenta o relatório de perdas por motivo */}
          <AlertDialogDescription>
            Informe por que o cliente não fechou. O motivo aparece no orçamento
            e no relatório de perdas.{pendingNote}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1">
          <Label htmlFor={'rejectReason'}>Motivo</Label>
          <Select value={reason} onValueChange={(value) => setReason(value)}>
            <SelectTrigger id={'rejectReason'} autoFocus>
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
          {reasonList && !options.length ? (
            <p className="text-sm text-gray pt-1">
              Nenhum motivo cadastrado.{' '}
              <Link
                href="/configuracoes/vendas/motivos-de-rejeicao-e-cancelamento"
                className="text-brand-700 underline"
              >
                Cadastre os motivos de rejeição
              </Link>{' '}
              para rejeitar.
            </p>
          ) : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            className={buttonVariants({ variant: 'error' })}
            disabled={!reason}
          >
            Rejeitar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

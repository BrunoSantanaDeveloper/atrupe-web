'use client'

// Icon Imports
import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

// UI component Imports
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
import { useQueryClient } from '@tanstack/react-query'

// Type
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

// Action
import { createItemNew } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: DeliveryScheduleType
}
export function BillServiceDialog({ open, rowData, setOpen }: Props) {
  const queryClient = useQueryClient()
  const quotationId = rowData?.order?.quotation?.id
  // Cliente bloqueado no limite de crédito não gera cobrança (24/10/2026)
  const { data: credit } = useQuotationCredit(
    quotationId,
    open && !!quotationId,
    'bill',
  )
  const blocked = !!credit?.applies && !!credit?.blockClient

  const handleBill = async () => {
    if (blocked) {
      toast.error('Este cliente está bloqueado no cadastro: não gera cobrança')
      return
    }

    const res = await createItemNew({
      route: `/sale/quotation/${quotationId}/bill`,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Serviço faturado')

    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'billing' : '')
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
              Realizar faturamento deste serviço?
            </AlertDialogTitle>
            <AlertDialogDescription className={blocked ? '' : 'sr-only'}>
              {blocked
                ? 'Este cliente está bloqueado no cadastro: o serviço não pode ser faturado até o desbloqueio, na aba Limite de crédito do cliente.'
                : 'Confirme se deseja realizar faturamento deste serviço.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBill}
              RightIcon={IconCircleCheck}
              disabled={blocked}
            >
              Faturar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

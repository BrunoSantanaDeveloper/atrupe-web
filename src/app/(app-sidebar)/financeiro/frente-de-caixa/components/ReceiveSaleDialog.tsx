'use client'

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Components
import {
  usePaymentSplit,
  PaymentSplitFields,
  PaymentSplitSummary,
} from './PaymentSplit'

// Types
import { saleRemaining, type PendingSale } from '../types'

// Actions
import { receiveSale } from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

interface Props {
  sale?: PendingSale
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function ReceiveSaleDialog({ sale, onDone, onOpenChange }: Props) {
  const [deliver, setDeliver] = useState(true)
  const [saving, setSaving] = useState(false)

  const remaining = sale ? saleRemaining(sale) : 0
  const split = usePaymentSplit(remaining)
  const { reset, received, missing } = split

  useEffect(() => {
    if (!sale) return

    reset(saleRemaining(sale))
    setDeliver(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale])

  const save = async () => {
    if (!sale) return

    setSaving(true)
    const res = await receiveSale(sale.id, split.parts(), deliver)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(
      deliver ? 'Recebido e entregue' : 'Recebido, aguardando retirada',
    )
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Receber {sale?.reference}</DialogTitle>
          <DialogDescription>
            {sale?.client} · falta receber {money(remaining)}
            {sale?.paid ? ` · sinal de ${money(sale.paid)} já pago` : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <PaymentSplitFields split={split} />
          <PaymentSplitSummary split={split} />

          {/* No balcão receber e entregar são o mesmo gesto — menos no sinal,
              em que o cliente paga e leva depois (FC-12) */}
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
            <Checkbox
              checked={deliver}
              onCheckedChange={(checked) => setDeliver(!!checked)}
            />
            <span>
              <span className="text-sm font-medium">Entregar agora</span>
              <span className="mt-0.5 block text-sm text-gray">
                Desmarque quando o cliente pagar o sinal e buscar depois: o
                trabalho vai para a lista de aguardando retirada.
              </span>
            </span>
          </label>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!received}
            onClick={save}
          >
            {missing > 0 ? 'Receber parcial' : 'Receber'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

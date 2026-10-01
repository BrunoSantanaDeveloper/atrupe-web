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
  RoundingOption,
  usePaymentSplit,
  PaymentSplitFields,
  PaymentSplitSummary,
} from './PaymentSplit'

// Types
import { saleRemaining, type PendingSale } from '../types'

// Actions
import { receiveSale } from '@/actions/cash-front'
import { getQuickSaleSettings } from '@/actions/quick-sale'

// Third-party
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

interface Props {
  sale?: PendingSale
  // Limite do arredondamento no balcão, do cadastro da frente de caixa
  roundingLimit?: number
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function ReceiveSaleDialog({
  sale,
  roundingLimit,
  onDone,
  onOpenChange,
}: Props) {
  const [deliver, setDeliver] = useState(true)
  const [waived, setWaived] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: session } = useSession()
  const { data: settingsRes } = useQuery({
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
  })
  const settings = settingsRes?.data

  const remaining = sale ? saleRemaining(sale) : 0
  const split = usePaymentSplit(remaining, roundingLimit)
  const { reset, received, missing, discount } = split

  useEffect(() => {
    if (!sale) return

    reset(saleRemaining(sale))
    setDeliver(true)
    setWaived(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale])

  // O sinal mínimo vale para a venda rápida que ainda não recebeu nada e
  // vai ficar para retirada (FC-6, FC-17). Quem tem permissão dispensa
  const downPayment =
    sale &&
    sale.kind === 'QUICK' &&
    sale.paid === 0 &&
    settings?.downPaymentRequired
      ? Math.ceil((sale.total * settings.downPaymentPercent) / 100)
      : 0
  const paying = Math.min(received, remaining)
  const belowDownPayment = !deliver && !waived && paying < downPayment
  // Entregar é com tudo pago: o restante do sinal é cobrado na retirada
  const deliverWithDebt = deliver && missing > 0
  const blocked = !received || belowDownPayment || deliverWithDebt

  const save = async () => {
    if (!sale || blocked) return

    setSaving(true)
    const res = await receiveSale(sale.id, split.parts(), deliver, discount)
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
          <RoundingOption split={split} />
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

          {downPayment > 0 && !deliver && (
            <div
              className={cn(
                'rounded-lg border p-4 text-sm',
                belowDownPayment
                  ? 'border-warning-300 bg-warning-50 text-warning-800'
                  : 'border-gray-200 text-gray',
              )}
            >
              <p className="font-medium">
                Sinal mínimo: {money(downPayment)} (
                {settings?.downPaymentPercent}%)
              </p>
              <p className="mt-0.5">
                {belowDownPayment
                  ? 'O trabalho só fica para retirada com a entrada mínima paga. O restante é cobrado quando o cliente buscar.'
                  : 'Entrada coberta. O restante é cobrado na retirada.'}
              </p>
              {session?.user?.isAdmin && (
                <label className="mt-3 flex items-center gap-2 font-medium text-gray-800">
                  <Checkbox
                    checked={waived}
                    onCheckedChange={(checked) => setWaived(!!checked)}
                  />
                  Dispensar o sinal nesta venda
                </label>
              )}
            </div>
          )}

          {deliverWithDebt && (
            <p className="text-sm text-warning-800">
              Para entregar, receba o restante. Se o cliente vai buscar depois,
              desmarque &quot;Entregar agora&quot;.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={blocked}
            onClick={save}
          >
            {missing > 0 ? 'Receber sinal' : 'Receber'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

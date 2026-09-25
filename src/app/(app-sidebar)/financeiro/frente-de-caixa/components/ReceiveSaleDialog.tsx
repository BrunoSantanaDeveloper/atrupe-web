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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Types
import {
  saleRemaining,
  paymentMethodLabel,
  type PaymentPart,
  type PendingSale,
  type PaymentMethod,
} from '../types'

// Actions
import { receiveSale } from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value / 100)

const methods: PaymentMethod[] = ['CASH', 'PIX', 'CARD']

// Taxa do cartão: o recebimento entra líquido, pela mesma regra que o
// financeiro já usa (FC-10). Vem da configuração da empresa.
const CARD_FEE = 0.04

interface Props {
  sale?: PendingSale
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function ReceiveSaleDialog({ sale, onDone, onOpenChange }: Props) {
  const [amounts, setAmounts] = useState<Record<PaymentMethod, number>>({
    CASH: 0,
    PIX: 0,
    CARD: 0,
  })
  const [deliver, setDeliver] = useState(true)
  const [saving, setSaving] = useState(false)

  const remaining = sale ? saleRemaining(sale) : 0

  useEffect(() => {
    if (!sale) return

    // O caso comum é receber tudo em dinheiro: já vem preenchido, e quem
    // divide o pagamento muda daí
    setAmounts({ CASH: saleRemaining(sale), PIX: 0, CARD: 0 })
    setDeliver(true)
  }, [sale])

  const received = methods.reduce((total, method) => total + amounts[method], 0)

  // No balcão, o cliente entrega uma nota maior: o troco é a diferença entre
  // o que ele deu em dinheiro e o que faltava depois das outras formas
  const change = Math.max(0, received - remaining)
  const missing = Math.max(0, remaining - received)

  const fee = Math.round(amounts.CARD * CARD_FEE)

  const save = async () => {
    if (!sale) return

    // O troco sai do dinheiro: o que entra no caixa é o valor da venda
    const parts: PaymentPart[] = methods
      .filter((method) => amounts[method] > 0)
      .map((method) => {
        const amount =
          method === 'CASH' ? amounts.CASH - change : amounts[method]

        return {
          method,
          amount,
          netAmount: method === 'CARD' ? amount - fee : amount,
        }
      })
      .filter((part) => part.amount > 0)

    setSaving(true)
    const res = await receiveSale(sale.id, parts, deliver)
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
          <div className="space-y-3">
            {methods.map((method) => (
              <div key={method} className="flex items-center gap-3">
                <label
                  htmlFor={`amount-${method}`}
                  className="w-28 text-sm font-medium"
                >
                  {paymentMethodLabel[method]}
                </label>
                <Input
                  id={`amount-${method}`}
                  type="number"
                  min={0}
                  step="0.01"
                  startAdornment={<span className="text-sm">R$</span>}
                  value={(amounts[method] / 100).toFixed(2)}
                  onChange={(event) =>
                    setAmounts((current) => ({
                      ...current,
                      [method]: Math.round(
                        Number(event.target.value || 0) * 100,
                      ),
                    }))
                  }
                />
              </div>
            ))}
            <p className="text-sm text-gray">
              Para dividir o pagamento, preencha mais de uma forma. Cada parte
              vai para a sua conta no fechamento.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray">Recebido</span>
              <span className="font-medium">{money(received)}</span>
            </div>
            {fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray">
                  Taxa do cartão ({(CARD_FEE * 100).toFixed(0)}%)
                </span>
                <span className="font-medium text-error-600">
                  − {money(fee)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-medium">
                {missing > 0 ? 'Ainda falta' : 'Troco'}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold',
                  missing > 0 ? 'text-error-600' : 'text-gray-900',
                )}
              >
                {money(missing > 0 ? missing : change)}
              </span>
            </div>
            {fee > 0 && (
              <p className="text-sm text-gray">
                O cartão entra líquido na conta, como no resto do financeiro.
              </p>
            )}
          </div>

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

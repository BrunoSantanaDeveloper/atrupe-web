'use client'

// Receber a venda no caixa, com o mesmo diálogo da baixa do Fluxo financeiro
// (Recebimento): mesmos campos, mesma ordem, mesmo rodapé. O que é do balcão
// — entregar agora ou deixar para retirada (FC-12), o sinal mínimo (FC-17) e
// o arredondamento (FC-18) — entra por baixo dos campos.

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Components
import {
  useCashReceipt,
  CashReceiptFields,
  CashReceiptBalance,
} from './PaymentSplit'

// Types
import { roundingFor, saleRemaining, type PendingSale } from '../types'

// Actions
import { receiveSale } from '@/actions/cash-front'
import { getQuickSaleSettings } from '@/actions/quick-sale'

// Third-party
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPrinter, IconCircleCheck } from '@tabler/icons-react'

// Utils
import { cn, formatMoney } from '@/lib/utils'

interface Props {
  sale?: PendingSale
  // Limite do arredondamento no balcão, do cadastro da frente de caixa
  roundingLimit?: number
  roundingType?: 'VALUE' | 'PERCENT'
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function ReceiveSaleDialog({
  sale,
  roundingLimit,
  roundingType,
  onDone,
  onOpenChange,
}: Props) {
  const [deliver, setDeliver] = useState(true)
  const [waived, setWaived] = useState(false)
  const [rounding, setRounding] = useState(false)
  const [saving, setSaving] = useState(false)

  // Dispensar o sinal é permissão própria (FC-15, PO 13/10/2026)
  const { hasPermission } = usePermissions()
  const canWaive = hasPermission('financial:pdv_down_payment:edit')
  const { data: settingsRes } = useQuery({
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
  })
  const settings = settingsRes?.data

  const remaining = sale ? saleRemaining(sale) : 0
  const receipt = useCashReceipt(remaining, {
    roundingLimit: roundingFor(roundingLimit, roundingType, sale?.total ?? 0),
    rounding,
  })
  const { form, received, missing, discount } = receipt

  useEffect(() => {
    if (!sale) return

    receipt.reset(saleRemaining(sale))
    setDeliver(true)
    setWaived(false)
    setRounding(false)
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
  // Pago e pronto, a retirada é só a entrega
  const blocked =
    (!received && remaining > 0) || belowDownPayment || deliverWithDebt

  const save = form.handleSubmit(async () => {
    if (!sale || blocked) return

    setSaving(true)
    const res = await receiveSale(
      sale.id,
      receipt.parts(),
      deliver,
      discount,
      waived,
      receipt.change,
    )
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(
      deliver
        ? 'Recebimento confirmado e entregue'
        : 'Recebimento confirmado, aguardando retirada',
    )
    onDone()
    onOpenChange(false)
  })

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <DialogTitle className="mb-1">
                {sale?.ready ? 'Retirada' : 'Recebimento'}
              </DialogTitle>
              <DialogDescription className="truncate">
                {sale?.client} - {sale?.reference}
                {sale?.paid
                  ? ` · sinal de ${formatMoney(sale.paid)} já pago`
                  : ''}
                {sale?.ready ? ' · trabalho pronto' : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="receive-sale"
              onSubmit={save}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <CashReceiptFields receipt={receipt} />
              <CashReceiptBalance
                receipt={receipt}
                onRoundingChange={setRounding}
              />

              {/* No balcão receber e entregar são o mesmo gesto — menos no
                  sinal, em que o cliente paga e leva depois (FC-12) */}
              <label className="flex w-full items-start gap-3 rounded-lg border border-gray-200 p-4">
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
                    'w-full rounded-lg border p-4 text-sm',
                    belowDownPayment
                      ? 'border-warning-300 bg-warning-50 text-warning-800'
                      : 'border-gray-200 text-gray',
                  )}
                >
                  <p className="font-medium">
                    Sinal mínimo: {formatMoney(downPayment)} (
                    {settings?.downPaymentPercent}%)
                  </p>
                  <p className="mt-0.5">
                    {belowDownPayment
                      ? 'O trabalho só fica para retirada com a entrada mínima paga. O restante é cobrado quando o cliente buscar.'
                      : 'Entrada coberta. O restante é cobrado na retirada.'}
                  </p>
                  {canWaive && (
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
                <p className="w-full text-sm text-warning-800">
                  Para entregar, receba o restante. Se o cliente vai buscar
                  depois, desmarque &quot;Entregar agora&quot;.
                </p>
              )}
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {/* O comprovante sai a pedido, não automático (FC-16) */}
            <Button
              type="button"
              variant="outline"
              LeftIcon={IconPrinter}
              onClick={() =>
                toast.info(
                  'O comprovante sai a pedido, depois de confirmar o recebimento.',
                )
              }
            >
              Comprovante
            </Button>
          </div>
          <div className="space-x-4">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="receive-sale"
              RightIcon={IconCircleCheck}
              isLoading={saving}
              disabled={blocked}
            >
              {missing > 0 ? 'Confirmar sinal' : 'Confirmar recebimento'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Textarea } from '@/components/ui/textarea'

// Types
import {
  cashOnHand,
  paymentMethodDestination,
  paymentMethodLabel,
  totalByMethod,
  type CashSession,
  type PaymentMethod,
} from '../types'

// Actions
import {
  openCashSession,
  addCashMovement,
  closeCashSession,
} from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

// Campo de dinheiro em reais, guardando centavos
function MoneyInput({
  id,
  label,
  value,
  onChange,
  autoFocus,
}: {
  id: string
  label: string
  value: number
  onChange: (cents: number) => void
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        autoFocus={autoFocus}
        startAdornment={<span className="text-sm">R$</span>}
        value={(value / 100).toFixed(2)}
        onChange={(event) =>
          onChange(Math.round(Number(event.target.value || 0) * 100))
        }
      />
    </div>
  )
}

interface BaseProps {
  open: boolean
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function OpenCashDialog({ open, onDone, onOpenChange }: BaseProps) {
  const [balance, setBalance] = useState(0)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await openCashSession(balance)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success('Caixa aberto')
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Abrir caixa</DialogTitle>
          <DialogDescription>
            O saldo inicial é o troco que já está na gaveta. Ele entra na
            conferência do fechamento.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <MoneyInput
            autoFocus
            id="opening"
            label="Saldo inicial em dinheiro"
            value={balance}
            onChange={setBalance}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" isLoading={saving} onClick={save}>
            Abrir caixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MovementProps extends BaseProps {
  kind: 'WITHDRAWAL' | 'SUPPLY'
}

export function CashMovementDialog({
  kind,
  open,
  onDone,
  onOpenChange,
}: MovementProps) {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const sangria = kind === 'WITHDRAWAL'

  useEffect(() => {
    if (!open) return

    setAmount(0)
    setReason('')
  }, [open])

  const save = async () => {
    setSaving(true)
    const res = await addCashMovement(kind, amount, reason)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(sangria ? 'Sangria registrada' : 'Suprimento registrado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{sangria ? 'Sangria' : 'Suprimento'}</DialogTitle>
          <DialogDescription>
            {sangria
              ? 'Retirada de dinheiro do caixa durante o expediente. Fica registrada com motivo e responsável.'
              : 'Entrada de dinheiro no caixa, normalmente para ter troco. Fica registrada com motivo e responsável.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <MoneyInput
            autoFocus
            id="amount"
            label="Valor"
            value={amount}
            onChange={setAmount}
          />
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-sm font-medium">
              Motivo
            </label>
            <Textarea
              id="reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                sangria
                  ? 'Ex.: acima do limite de dinheiro em gaveta'
                  : 'Ex.: reforço de troco, notas pequenas'
              }
            />
            <p className="text-sm text-gray">
              O motivo é obrigatório: é ele que explica a diferença quando o
              caixa é conferido.
            </p>
          </div>
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
            disabled={!amount || !reason.trim()}
            onClick={save}
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const methods: PaymentMethod[] = ['PIX', 'CARD']

interface CloseProps extends BaseProps {
  session: CashSession
}

export function CloseCashDialog({
  open,
  session,
  onDone,
  onOpenChange,
}: CloseProps) {
  const expected = cashOnHand(session)
  const blind = session.blindCount
  const [counted, setCounted] = useState(0)
  // Na contagem às cegas o operador digita o que contou e só então vê o que o
  // sistema esperava. Na conferência simples (padrão) o esperado já aparece e
  // o operador confirma ou corrige o valor contado (FC-7)
  const [revealed, setRevealed] = useState(!blind)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setCounted(blind ? 0 : expected)
    setRevealed(!blind)
  }, [open, blind, expected])

  const difference = counted - expected

  const save = async () => {
    setSaving(true)
    const res = await closeCashSession(counted)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Fechar o caixa</DialogTitle>
          <DialogDescription>
            {blind
              ? 'Conte o dinheiro da gaveta e informe o total. O valor esperado só aparece depois.'
              : 'Confira o dinheiro da gaveta: confirme o valor contado ou corrija se for diferente.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {/* Os valores do caixa só aparecem aqui, no fechamento: na tela
              principal ficariam à vista de quem passa pelo balcão */}
          <div className="space-y-2">
            <p className="text-sm font-medium">O que entrou no caixa</p>
            {methods.map((method) => (
              <div
                key={method}
                className="flex justify-between text-sm text-gray"
              >
                <span>
                  {paymentMethodLabel[method]} ·{' '}
                  {paymentMethodDestination[method]}
                </span>
                <span className="font-medium text-gray-700">
                  {money(totalByMethod(session, method))}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-gray">
              <span>
                Dinheiro · {paymentMethodDestination.CASH} (abertura{' '}
                {money(session.openingBalance)})
              </span>
              <span className="font-medium text-gray-700">
                {revealed ? money(expected) : 'após a contagem'}
              </span>
            </div>
          </div>

          <MoneyInput
            autoFocus
            id="counted"
            label="Dinheiro contado na gaveta"
            value={counted}
            onChange={(cents) => {
              setCounted(cents)
              if (blind) setRevealed(false)
            }}
          />

          {!revealed ? (
            <Button
              type="button"
              variant="neutralOutline"
              className="w-full"
              disabled={!counted}
              onClick={() => setRevealed(true)}
            >
              Conferir com o esperado
            </Button>
          ) : (
            // Esperado, contado e diferença sempre lado a lado: nenhuma
            // diferença fica escondida (FC-7)
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray">Esperado em dinheiro</span>
                <span className="font-medium">{money(expected)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray">Contado</span>
                <span className="font-medium">{money(counted)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="font-medium">
                  {difference === 0
                    ? 'Sem diferença'
                    : difference > 0
                      ? 'Sobra'
                      : 'Falta'}
                </span>
                <span
                  className={
                    difference === 0
                      ? 'font-semibold text-gray-900'
                      : difference > 0
                        ? 'font-semibold text-success-600'
                        : 'font-semibold text-error-600'
                  }
                >
                  {money(Math.abs(difference))}
                </span>
              </div>
              {difference !== 0 && (
                <p className="text-sm text-gray">
                  A diferença vai para Quebra de caixa, no nome de quem operou o
                  caixa.
                </p>
              )}
            </div>
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
            disabled={!revealed}
            onClick={save}
          >
            Fechar caixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

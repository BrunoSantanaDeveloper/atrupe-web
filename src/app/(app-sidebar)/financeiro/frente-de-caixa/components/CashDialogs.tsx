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
  type AwaitingPickup,
} from '../types'

// Actions
import {
  discardPickup,
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

// Fechar é contar o dinheiro e comparar com o esperado (FC-7). É aqui, e só
// aqui, que os valores do caixa aparecem (4.2): o que entrou por forma, o
// dinheiro esperado, o contado e a diferença, sempre lado a lado. O
// fechamento transfere para as contas do caixa principal, um movimento por
// forma; o dinheiro pode ficar em parte na gaveta, como troco de amanhã
export function CloseCashDialog({
  open,
  session,
  onDone,
  onOpenChange,
}: CloseProps) {
  const expected = cashOnHand(session)
  const blind = session.blindCount
  const tolerance = session.shortageTolerance
  const [counted, setCounted] = useState(0)
  const [keep, setKeep] = useState(0)
  // Na contagem às cegas o operador digita o que contou e só então vê o que o
  // sistema esperava. Na conferência simples (padrão) o esperado já aparece e
  // o operador confirma ou corrige o valor contado (FC-7)
  const [revealed, setRevealed] = useState(!blind)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setCounted(blind ? 0 : expected)
    setKeep(0)
    setRevealed(!blind)
  }, [open, blind, expected])

  const difference = counted - expected
  // Dentro da tolerância (se houver), a diferença aparece, mas não é lançada
  const withinTolerance =
    difference !== 0 && tolerance !== null && Math.abs(difference) <= tolerance
  const transfers = [
    {
      method: 'CASH' as const,
      amount: Math.max(0, counted - keep),
      note: keep > 0 ? `ficam ${money(keep)} na gaveta` : '',
    },
    { method: 'PIX' as const, amount: totalByMethod(session, 'PIX'), note: '' },
    {
      method: 'CARD' as const,
      amount: totalByMethod(session, 'CARD'),
      note: '',
    },
  ].filter((transfer) => transfer.amount > 0)

  const save = async () => {
    setSaving(true)
    const res = await closeCashSession(counted, keep)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Fechar o caixa nº {session.number}</DialogTitle>
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
                className="flex justify-between gap-4 text-sm text-gray"
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
            <div className="flex justify-between gap-4 text-sm text-gray">
              <span>
                Dinheiro esperado na gaveta (abertura{' '}
                {money(session.openingBalance)})
              </span>
              <span className="font-medium text-gray-700">
                {revealed ? money(expected) : 'após a contagem'}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <MoneyInput
              id="keep"
              label="Fica na gaveta para amanhã"
              value={keep}
              onChange={setKeep}
            />
          </div>

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
            <>
              {/* Esperado, contado e diferença sempre lado a lado: nenhuma
                  diferença fica escondida (FC-7) */}
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
                    {withinTolerance
                      ? `Dentro da tolerância de ${money(tolerance!)}: fica registrada, mas não é lançada como quebra.`
                      : 'A diferença vai para Quebra de caixa, no nome de quem operou o caixa.'}
                  </p>
                )}
              </div>

              {/* Para onde o dinheiro vai (4.2): um movimento por forma */}
              {transfers.length > 0 && (
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium">
                    O fechamento lança nas contas do caixa principal
                  </p>
                  {transfers.map((transfer) => (
                    <p
                      key={transfer.method}
                      className="flex justify-between gap-4 text-gray"
                    >
                      <span>
                        Fechamento FC nº {session.number} ·{' '}
                        {paymentMethodLabel[transfer.method].toLowerCase()} →{' '}
                        {paymentMethodDestination[transfer.method]}
                        {transfer.note ? ` (${transfer.note})` : ''}
                      </span>
                      <span className="font-medium text-gray-700">
                        {money(transfer.amount)}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </>
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
            disabled={!revealed || keep > counted}
            onClick={save}
          >
            Fechar caixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Descartar o trabalho não retirado (FC-19): encerra a venda e lança como
 * perda o que não foi pago, com o sinal abatendo. Pede justificativa
 * ------------------------------------------------------------------------- */

export function DiscardPickupDialog({
  pickup,
  onDone,
  onOpenChange,
}: {
  pickup?: AwaitingPickup
  onDone: () => void
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (pickup) setReason('')
  }, [pickup])

  const save = async () => {
    if (!pickup) return
    setSaving(true)
    const res = await discardPickup(pickup.id, reason)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(
      `Trabalho descartado · perda de ${money(res.data?.loss || 0)} registrada`,
    )
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!pickup} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Descartar {pickup?.reference}?</DialogTitle>
          <DialogDescription>
            {pickup?.client} · aguardando há {pickup?.daysWaiting}{' '}
            {pickup?.daysWaiting === 1 ? 'dia' : 'dias'}. A venda é encerrada e
            o que não foi pago, {money(pickup?.remaining || 0)}, é lançado como
            perda. O sinal já recebido fica, abatendo a perda.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-2">
          <label htmlFor="discard-reason" className="text-sm font-medium">
            Justificativa
          </label>
          <Textarea
            id="discard-reason"
            rows={3}
            autoFocus
            value={reason}
            placeholder="Ex.: cliente não respondeu às ligações desde agosto"
            onChange={(event) => setReason(event.target.value)}
          />
          <p className="text-sm text-gray">
            Fica registrado quem descartou, quando e por quê.
          </p>
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
            variant="error"
            isLoading={saving}
            disabled={!reason.trim()}
            onClick={save}
          >
            Descartar e lançar perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

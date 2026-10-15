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
import { Textarea } from '@/components/ui/textarea'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { SelectBasic } from '@/components/common/form/FormSelect'
import {
  MoneyInput,
  CashCountCheck,
  needsExplanation,
} from '../../_components/cash/CashCountCheck'

// Types
import {
  cashOnHand,
  paymentMethodDestination,
  paymentMethodLabel,
  totalByMethod,
  daysWaiting,
  type CashSession,
  type PendingSale,
  type PaymentMethod,
} from '../types'

// Actions
import {
  discardPickup,
  reverseSale,
  openCashSession,
  addCashMovement,
  closeCashSession,
} from '@/actions/cash-front'

import { getBankAccounts } from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconLock,
  IconLockOpen,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

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
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconLockOpen} />
            <div>
              <DialogTitle>Abrir caixa</DialogTitle>
              <DialogDescription>
                O saldo inicial é o troco que já está na gaveta. Ele entra na
                conferência do fechamento.
              </DialogDescription>
            </div>
          </div>
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
  const [accountId, setAccountId] = useState('')
  const [saving, setSaving] = useState(false)

  const sangria = kind === 'WITHDRAWAL'

  // Dinheiro que entra ou sai tem origem e destino: uma conta da empresa.
  // Padrão é a conta Caixa (a gaveta principal, o cofre)
  const { data: accountsRes } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['bank-accounts'],
    queryFn: () => getBankAccounts(),
  })
  const accounts = (accountsRes?.data || []).filter(
    (account) => account.isActive && account.kind !== 'CARD',
  )

  useEffect(() => {
    if (!open) return

    setAmount(0)
    setReason('')
    setAccountId('')
  }, [open])

  useEffect(() => {
    if (open && !accountId && accounts.length) {
      setAccountId(
        accounts.find((account) => account.kind === 'CASH')?.id ||
          accounts[0].id,
      )
    }
  }, [open, accountId, accounts])

  const save = async () => {
    const account = accounts.find((item) => item.id === accountId)
    setSaving(true)
    const res = await addCashMovement(kind, amount, reason, account?.id)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(sangria ? 'Sangria registrada' : 'Suprimento registrado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {/* O mesmo desenho de "Nova despesa" e "Nova receita" do Fluxo
                financeiro: sai em vermelho, entra em verde */}
            <FeaturedIcon
              variant={sangria ? 'error' : 'success'}
              Icon={sangria ? IconTrendingDown : IconTrendingUp}
            />
            <div>
              <DialogTitle>{sangria ? 'Sangria' : 'Suprimento'}</DialogTitle>
              <DialogDescription>
                {sangria
                  ? 'Dinheiro que sai do caixa durante o expediente e vai para uma conta da empresa. Não é despesa: é dinheiro mudando de lugar.'
                  : 'Dinheiro que entra no caixa, vindo de uma conta da empresa, normalmente para ter troco. Não é receita: é dinheiro mudando de lugar.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyInput
              autoFocus
              id="amount"
              label="Valor"
              value={amount}
              onChange={setAmount}
            />
            <SelectBasic
              name="movement-account"
              label={sangria ? 'Para onde vai' : 'De onde vem'}
              className="w-full"
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
              value={accountId}
              onChange={setAccountId}
            />
          </div>
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
            variant={sangria ? 'error' : 'success'}
            isLoading={saving}
            disabled={!amount || !reason.trim() || !accountId}
            onClick={save}
          >
            {sangria ? 'Registrar sangria' : 'Registrar suprimento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const methods: PaymentMethod[] = ['PIX', 'CARD']

interface CloseProps extends BaseProps {
  session: CashSession
  // As vendas do dia que foram para o fluxo financeiro: aparecem no
  // fechamento como registro, fora da soma do caixa (3.2)
  billed?: PendingSale[]
}

// Fechar é contar o dinheiro e comparar com o esperado (FC-7). É aqui, e só
// aqui, que os valores do caixa aparecem (4.2): o que entrou por forma, o
// dinheiro esperado, o contado e a diferença, sempre lado a lado. O
// fechamento transfere para as contas do caixa principal, um movimento por
// forma; o dinheiro pode ficar em parte na gaveta, como troco de amanhã
export function CloseCashDialog({
  open,
  session,
  billed = [],
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
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setCounted(blind ? 0 : expected)
    setKeep(0)
    setNote('')
    setRevealed(!blind)
  }, [open, blind, expected])

  // Fora da tolerância (ou sem ela), a diferença pede explicação, como no
  // fechamento do dia do controle de caixa
  const needsNote = needsExplanation(expected, counted, tolerance)
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
    const res = await closeCashSession(counted, keep, note)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconLock} />
            <div>
              <DialogTitle>Fechar o caixa nº {session.number}</DialogTitle>
              <DialogDescription>
                {blind
                  ? 'Conte o dinheiro da gaveta e informe o total. O valor esperado só aparece depois.'
                  : 'Confira o dinheiro da gaveta: confirme o valor contado ou corrija se for diferente.'}
              </DialogDescription>
            </div>
          </div>
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
              {/* A mesma conferência do controle de caixa (FC-7, 4.1) */}
              <CashCountCheck
                expected={expected}
                counted={counted}
                tolerance={tolerance}
              />
              <div className="space-y-2">
                <label htmlFor="close-note" className="text-sm font-medium">
                  {needsNote ? 'O que explica a diferença?' : 'Observação'}
                </label>
                <Textarea
                  id="close-note"
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              {/* Registro do dia, fora do caixa: saem com o fechamento e
                  ficam no relatório do dia (3.2) */}
              {billed.length > 0 && (
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium">
                    Faturadas pelo caixa para o cliente
                  </p>
                  {billed.map((sale) => (
                    <p
                      key={sale.id}
                      className="flex justify-between gap-4 text-gray"
                    >
                      <span>
                        {sale.reference} · {sale.client} ·{' '}
                        {sale.billing || 'Faturamento mensal'}
                      </span>
                      <span>{money(sale.total)}</span>
                    </p>
                  ))}
                  <p className="text-xs text-gray">
                    Chegaram como venda rápida e foram faturadas pelo caixa. Não
                    entram no caixa nem na conferência: já estão no fluxo
                    financeiro como títulos a receber. Saem daqui com o
                    fechamento e ficam no relatório do dia.
                  </p>
                </div>
              )}

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
            disabled={
              !revealed || keep > counted || (needsNote && !note.trim())
            }
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
 * Cancelar a venda com estorno (FC-13, ALT-7): o que foi pago volta pelas
 * formas em que entrou. Pede justificativa
 * ------------------------------------------------------------------------- */

export function ReverseSaleDialog({
  sale,
  onDone,
  onOpenChange,
}: {
  sale?: PendingSale
  onDone: () => void
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sale) setReason('')
  }, [sale])

  const save = async () => {
    if (!sale) return
    setSaving(true)
    const res = await reverseSale(sale.id, reason)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(
      sale.paid > 0
        ? 'Venda cancelada e estorno registrado'
        : 'Venda cancelada',
    )
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Cancelar {sale?.reference}?</DialogTitle>
          <DialogDescription>
            {sale && sale.paid > 0
              ? `O cliente já pagou ${money(sale.paid)}. O estorno sai pelas formas em que o valor entrou e fica registrado com a justificativa e com quem o fez.`
              : 'A venda sai da fila do caixa e a ordem de serviço é cancelada. O cancelamento fica registrado.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-2">
          <label htmlFor="reverse-reason" className="text-sm font-medium">
            Justificativa
          </label>
          <Textarea
            id="reverse-reason"
            rows={3}
            autoFocus
            value={reason}
            placeholder="Ex.: cliente desistiu"
            onChange={(event) => setReason(event.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="error"
            isLoading={saving}
            disabled={!reason.trim()}
            onClick={save}
          >
            Cancelar venda
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
  pickup?: PendingSale
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
            {pickup?.client} · aguardando há {pickup ? daysWaiting(pickup) : 0}{' '}
            {pickup && daysWaiting(pickup) === 1 ? 'dia' : 'dias'}. A venda é
            encerrada e o que não foi pago,{' '}
            {money(pickup ? Math.max(0, pickup.total - pickup.paid) : 0)}, é
            lançado como perda. O sinal já recebido fica, abatendo a perda.
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

'use client'

// Os gestos do controle de caixa (CX-3). Cada um é um diálogo curto; o que
// exige disciplina está aqui, e só aparece nas contas com controle ligado.

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
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import {
  COUNT_TOLERANCE,
  cashDayTotals,
  type CashDay,
  type BankAccount,
} from '../types'

// Actions
import {
  openCashDay,
  closeCashDay,
  reopenCashDay,
  addAdjustment,
  transferBetweenAccounts,
} from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value)
const brDate = (iso: string) => iso.split('-').reverse().join('/')
const today = () => new Date().toISOString().slice(0, 10)

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
  onChange: (value: number) => void
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        autoFocus={autoFocus}
        startAdornment={<span className="text-sm">R$</span>}
        value={value ? (value / 100).toFixed(2) : ''}
        placeholder="0,00"
        onChange={(event) =>
          onChange(Math.round(Number(event.target.value || 0) * 100))
        }
      />
    </div>
  )
}

type Base = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

function Shell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer: React.ReactNode
  wide?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={wide ? 'sm:max-w-[620px]' : 'sm:max-w-[480px]'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody className="space-y-4">{children}</DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Abrir caixa — hoje ou outra data
 * ------------------------------------------------------------------------- */

export function OpenDayDialog({
  open,
  onOpenChange,
  onDone,
  accounts,
  accountId: fixedAccount,
}: Base & { accounts: BankAccount[]; accountId?: string }) {
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(today())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setAccountId(fixedAccount || '')
      setDate(today())
    }
  }, [open, fixedAccount])

  const controlled = accounts.filter((account) => account.cashControl)

  const save = async () => {
    setSaving(true)
    const res = await openCashDay(accountId, date)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Caixa aberto')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title="Abrir caixa"
      description="A abertura é o saldo com que o caixa anterior desta conta fechou."
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!accountId || !date}
          onClick={save}
        >
          Abrir
        </Button>
      }
    >
      <SelectBasic
        name="open-account"
        label="Conta"
        placeholder="Escolha a conta"
        options={controlled.map((account) => ({
          value: account.id,
          label: account.name,
        }))}
        value={accountId}
        onChange={setAccountId}
      />
      <div className="space-y-2">
        <Label htmlFor="open-date">Dia</Label>
        <Input
          id="open-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <p className="text-sm text-gray">
        Só aparecem as contas com controle de caixa. As livres recebem e pagam
        sem abrir caixa.
      </p>
    </Shell>
  )
}

/* ---------------------------------------------------------------------------
 * Ajuste — com motivo, como a sangria (CX-3)
 * ------------------------------------------------------------------------- */

export function AdjustmentDialog({
  open,
  onOpenChange,
  onDone,
  day,
  account,
}: Base & { day?: CashDay; account?: BankAccount }) {
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setDirection('in')
      setAmount(0)
      setReason('')
    }
  }, [open])

  if (!day || !account) return null

  const save = async () => {
    setSaving(true)
    const res = await addAdjustment(
      day.id,
      direction === 'in' ? amount : -amount,
      reason,
    )
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Ajuste lançado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={`Ajuste · ${account.name}`}
      description={`Caixa de ${brDate(day.date)}. Para corrigir um lançamento, prefira estorná-lo: o ajuste é para o que não tem lançamento de origem.`}
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!amount || !reason.trim()}
          onClick={save}
        >
          Lançar ajuste
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['in', 'Entrada'],
            ['out', 'Saída'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={direction === value ? 'default' : 'neutralOutline'}
            onClick={() => setDirection(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <MoneyInput
        id="adjust-amount"
        label="Valor"
        value={amount}
        onChange={setAmount}
        autoFocus
      />
      <div className="space-y-2">
        <Label htmlFor="adjust-reason">Motivo</Label>
        <Textarea
          id="adjust-reason"
          placeholder="Ex.: troco que veio do caixa de ontem"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <p className="text-sm text-gray">
          O ajuste fica registrado com o motivo e com quem lançou.
        </p>
      </div>
    </Shell>
  )
}

/* ---------------------------------------------------------------------------
 * Fechar — a gaveta se conta às cegas; o banco confere o extrato (CX-3)
 * ------------------------------------------------------------------------- */

export function CloseDayDialog({
  open,
  onOpenChange,
  onDone,
  day,
  account,
}: Base & { day?: CashDay; account?: BankAccount }) {
  const [step, setStep] = useState<'inform' | 'check'>('inform')
  const [informed, setInformed] = useState(0)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('inform')
      setInformed(0)
      setNote('')
    }
  }, [open])

  if (!day || !account) return null

  const isCash = account.kind === 'CASH'
  const expected = cashDayTotals(day).balance
  const difference = informed - expected
  // Na gaveta, centavos dentro da tolerância não pedem explicação; no banco,
  // o extrato tem de bater ou ser explicado
  const needsNote = isCash
    ? Math.abs(difference) > COUNT_TOLERANCE
    : difference !== 0

  const save = async () => {
    setSaving(true)
    const res = await closeCashDay(day.id, informed, note)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Caixa fechado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={`Fechar ${account.name} · ${brDate(day.date)}`}
      description={
        isCash
          ? 'Conte o dinheiro e informe o total. O valor esperado aparece só depois — vendo antes, a contagem tende a bater sempre.'
          : 'Informe o saldo do extrato no fim do dia. Se não bater com o sistema, explique a diferença.'
      }
      wide
      footer={
        step === 'inform' ? (
          <Button
            type="button"
            disabled={!informed && informed !== 0}
            onClick={() => setStep('check')}
          >
            Conferir
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={saving}
            disabled={needsNote && !note.trim()}
            onClick={save}
          >
            Fechar caixa
          </Button>
        )
      }
    >
      {step === 'inform' ? (
        <MoneyInput
          id="close-informed"
          label={isCash ? 'Total contado na gaveta' : 'Saldo do extrato'}
          value={informed}
          onChange={setInformed}
          autoFocus
        />
      ) : (
        <>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray">
                {isCash ? 'Você contou' : 'Extrato'}
              </span>
              <span className="font-medium">{money(informed)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray">O sistema esperava</span>
              <span className="font-medium">{money(expected)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-medium">
                {difference === 0
                  ? 'Bateu'
                  : difference < 0
                    ? 'Falta'
                    : 'Sobra'}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold',
                  difference === 0
                    ? 'text-success-700'
                    : difference < 0
                      ? 'text-error-600'
                      : 'text-warning-700',
                )}
              >
                {money(Math.abs(difference))}
              </span>
            </div>
          </div>
          {difference !== 0 && (
            <p className="text-sm text-gray">
              {isCash
                ? 'A diferença vai para "Quebra de caixa", no nome de quem operou o caixa — não vira ajuste escondido.'
                : 'A diferença fica registrada no fechamento, com a explicação.'}
              {isCash && !needsNote
                ? ' Está dentro da tolerância, então não precisa explicar.'
                : ''}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="close-note">
              {needsNote ? 'O que explica a diferença?' : 'Observação'}
            </Label>
            <Textarea
              id="close-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => setStep('inform')}
          >
            {isCash ? 'Contar de novo' : 'Corrigir o saldo informado'}
          </Button>
        </>
      )}
    </Shell>
  )
}

/* ---------------------------------------------------------------------------
 * Reabrir — com justificativa, e a conferência do dia se perde (ALT-7)
 * ------------------------------------------------------------------------- */

export function ReopenDayDialog({
  open,
  onOpenChange,
  onDone,
  day,
  account,
}: Base & { day?: CashDay; account?: BankAccount }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  if (!day || !account) return null

  const save = async () => {
    setSaving(true)
    const res = await reopenCashDay(day.id, reason)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Caixa reaberto')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={`Reabrir ${account.name} · ${brDate(day.date)}`}
      description="O dia volta a aceitar lançamentos e a conferência feita no fechamento é desfeita: ele precisará ser conferido e fechado de novo."
      footer={
        <Button
          type="button"
          variant="error"
          isLoading={saving}
          disabled={!reason.trim()}
          onClick={save}
        >
          Reabrir
        </Button>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="reopen-reason">Por que reabrir?</Label>
        <Textarea
          id="reopen-reason"
          placeholder="Ex.: recebimento do dia lançado na conta errada"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <p className="text-sm text-gray">
        Para um lançamento esquecido, não é preciso reabrir: lance no caixa de
        hoje com a data certa, e ele aparece como retroativo neste dia.
      </p>
    </Shell>
  )
}

/* ---------------------------------------------------------------------------
 * Transferência — um par, saída e entrada ligadas (CX-2)
 * ------------------------------------------------------------------------- */

const transferMethods = [
  { value: 'Dinheiro', label: 'Dinheiro (depósito ou retirada)' },
  { value: 'PIX', label: 'PIX' },
  { value: 'TED', label: 'TED' },
]

export function TransferDialog({
  open,
  onOpenChange,
  onDone,
  accounts,
}: Base & { accounts: BankAccount[] }) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [method, setMethod] = useState('PIX')
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(today())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setFromId('')
      setToId('')
      setMethod('PIX')
      setAmount(0)
      setDate(today())
    }
  }, [open])

  const options = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} · ${money(account.balance)}`,
  }))

  const save = async () => {
    setSaving(true)
    const res = await transferBetweenAccounts({
      fromId,
      toId,
      method,
      amount,
      date,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Transferência lançada nas duas contas')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title="Transferência entre contas"
      description="Sai de uma conta e entra na outra no mesmo lançamento. Não é receita nem despesa: não mexe no resultado."
      wide
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!fromId || !toId || fromId === toId || amount <= 0}
          onClick={save}
        >
          Transferir
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectBasic
          name="transfer-from"
          label="De"
          placeholder="Conta de origem"
          options={options}
          value={fromId}
          onChange={setFromId}
        />
        <SelectBasic
          name="transfer-to"
          label="Para"
          placeholder="Conta de destino"
          options={options.filter((option) => option.value !== fromId)}
          value={toId}
          onChange={setToId}
        />
        <SelectBasic
          name="transfer-method"
          label="Como"
          options={transferMethods}
          value={method}
          onChange={setMethod}
        />
        <MoneyInput
          id="transfer-amount"
          label="Valor"
          value={amount}
          onChange={setAmount}
        />
        <div className="space-y-2">
          <Label htmlFor="transfer-date">Dia</Label>
          <Input
            id="transfer-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </div>
    </Shell>
  )
}

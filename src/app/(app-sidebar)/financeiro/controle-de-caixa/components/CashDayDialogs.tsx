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
import { AlertBanner } from '@/components/ui/alert-banner'
import { SelectBasic } from '@/components/common/form/FormSelect'
import {
  MoneyInput,
  CashCountCheck,
  needsExplanation,
} from '../../_components/cash/CashCountCheck'

// Types
import { cashDayTotals, type CashDay, type BankAccount } from '../types'

// Actions
import {
  openCashDay,
  closeCashDay,
  reopenCashDay,
  addAdjustment,
  transferBetweenAccounts,
} from '@/actions/cash-accounts'

// Hooks
import { useTransactionNature } from '@/hooks/queries/useTransactionNature'
import { useTransactionCategory } from '@/hooks/queries/useTransactionCategory'

// Third-party
import { toast } from 'sonner'

// Icons
import {
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { todayLocalIso } from '@/lib/formatDate'

const money = (value: number) => formatCurrencyToBrl(value)
const brDate = (iso: string) => iso.split('-').reverse().join('/')
// A data local: em UTC, depois das 21h o padrão já vinha com amanhã
const today = () => todayLocalIso()

type Base = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

// O mesmo cabeçalho dos diálogos do Fluxo financeiro e da frente de caixa:
// ícone destacado, título e descrição
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
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">{children}</DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
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
  const [natureId, setNatureId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)

  // O plano de contas do START: natureza e categoria, de receita para a
  // entrada e de despesa para a saída (CX-5)
  const { data: natures } = useTransactionNature(
    direction === 'in' ? 'receivable' : 'payable',
  )
  const { data: categories } = useTransactionCategory({ natureId })

  useEffect(() => {
    if (open) {
      setDirection('in')
      setAmount(0)
      setReason('')
      setNatureId('')
      setCategoryId('')
    }
  }, [open])

  useEffect(() => {
    setNatureId('')
    setCategoryId('')
  }, [direction])

  if (!day || !account) return null

  const save = async () => {
    setSaving(true)
    // A API grava natureza e categoria (CX-5), não o texto
    const res = await addAdjustment(
      day.id,
      direction === 'in' ? amount : -amount,
      reason,
      natureId,
      categoryId,
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
          disabled={!amount || !reason.trim() || !categoryId}
          onClick={save}
        >
          Lançar ajuste
        </Button>
      }
    >
      {/* O mesmo desenho de "Nova receita" e "Nova despesa" do Fluxo
          financeiro: o ajuste é uma receita ou uma despesa lançada direto no
          caixa, com plano de contas (CX-5) */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={direction === 'in' ? 'success' : 'neutralOutline'}
          LeftIcon={IconTrendingUp}
          onClick={() => setDirection('in')}
        >
          Entrada (receita)
        </Button>
        <Button
          type="button"
          variant={direction === 'out' ? 'error' : 'neutralOutline'}
          LeftIcon={IconTrendingDown}
          onClick={() => setDirection('out')}
        >
          Saída (despesa)
        </Button>
      </div>
      <MoneyInput
        id="adjust-amount"
        label="Valor"
        value={amount}
        onChange={setAmount}
        autoFocus
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectBasic
          name="adjust-nature"
          label="Natureza"
          placeholder="Escolha a natureza"
          options={(Array.isArray(natures) ? natures : []).map(
            (item: { id: string; description: string }) => ({
              value: item.id,
              label: item.description,
            }),
          )}
          value={natureId}
          onChange={(value) => {
            setNatureId(value)
            setCategoryId('')
          }}
        />
        <SelectBasic
          name="adjust-category"
          label="Categoria"
          placeholder={
            natureId ? 'Escolha a categoria' : 'Escolha a natureza antes'
          }
          options={(Array.isArray(categories) ? categories : []).map(
            (item: { id: string; description: string }) => ({
              value: item.id,
              label: item.description,
            }),
          )}
          value={categoryId}
          onChange={setCategoryId}
        />
      </div>
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
 * Fechar — a gaveta se conta (conferência simples ou às cegas, conforme o
 * cadastro da conta); o banco confere o extrato (CX-3, 4.1)
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

  const isCash = account?.kind === 'CASH'
  // Às cegas só na conta Caixa que pediu isso no cadastro; o padrão é a
  // conferência simples, com o esperado à vista e o contado já preenchido
  const blind = isCash && !!account?.blindCount
  const totals = day ? cashDayTotals(day) : null
  const expected = totals?.balance ?? 0
  // A gaveta não tem dinheiro negativo: com mais saídas que entradas
  // lançadas, a API recusa o fechamento. A janela diz isso logo, com a conta,
  // em vez de deixar contar e recusar no fim (correção do LITE, 11/11/2026)
  const negativeDrawer = isCash && expected < 0

  useEffect(() => {
    if (open) {
      setStep(blind ? 'inform' : 'check')
      setInformed(blind ? 0 : expected)
      setNote('')
    }
  }, [open, blind, expected])

  if (!day || !account) return null

  const tolerance = isCash ? account.shortageTolerance : null
  // Sem tolerância, toda diferença pede explicação e vira quebra; no banco,
  // o extrato tem de bater ou ser explicado
  const needsNote = needsExplanation(expected, informed, tolerance)

  const save = async () => {
    setSaving(true)
    const res = await closeCashDay(day.id, informed, note)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Caixa fechado')
    onDone()
    onOpenChange(false)
  }

  const informedField = (
    <MoneyInput
      id="close-informed"
      label={isCash ? 'Total contado na gaveta' : 'Saldo do extrato'}
      value={informed}
      onChange={setInformed}
      autoFocus
    />
  )

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={`Fechar ${account.name} · ${brDate(day.date)}`}
      description={
        isCash
          ? blind
            ? 'Conte o dinheiro e informe o total. O valor esperado aparece só depois da contagem.'
            : 'Confira o dinheiro da gaveta: confirme o valor contado ou corrija se for diferente.'
          : 'Informe o saldo do extrato no fim do dia. Se não bater com o sistema, explique a diferença.'
      }
      wide
      footer={
        step === 'inform' ? (
          <Button type="button" onClick={() => setStep('check')}>
            Conferir
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={saving}
            disabled={negativeDrawer || (needsNote && !note.trim())}
            onClick={save}
          >
            Fechar caixa
          </Button>
        )
      }
    >
      {negativeDrawer && totals ? (
        <AlertBanner
          variant="error"
          icon={IconAlertTriangle}
          className="rounded-lg border"
          title="Este caixa não fecha: pelos lançamentos, a gaveta ficaria negativa"
          description={
            <div className="space-y-1">
              <p>
                {totals.retroactive
                  ? `Saldo de abertura ${money(day.opening)} + entradas ${money(totals.entries)} − saídas ${money(totals.exits)} + retroativos ${money(totals.retroactive)} = ${money(expected)}.`
                  : `Saldo de abertura ${money(day.opening)} + entradas ${money(totals.entries)} − saídas ${money(totals.exits)} = ${money(expected)}.`}
              </p>
              <p>
                Não existe dinheiro negativo na gaveta: falta lançar alguma
                entrada (o saldo de abertura, um suprimento ou um recebimento)
                ou alguma saída foi lançada a mais ou na conta errada. Confira
                os lançamentos do dia e corrija; se o dinheiro existe mesmo,
                lance um ajuste de entrada com o motivo.
              </p>
            </div>
          }
        />
      ) : null}
      {step === 'inform' ? (
        informedField
      ) : (
        <>
          {!blind && informedField}
          {/* A mesma conferência da frente de caixa (4.1, FC-7) */}
          <CashCountCheck
            expected={expected}
            counted={informed}
            tolerance={tolerance}
            kind={isCash ? 'cash' : 'bank'}
          />
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
          {blind && (
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => setStep('inform')}
            >
              Contar de novo
            </Button>
          )}
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
  // A liquidação da operadora de cartão (FC-10): a operadora baixa o valor
  // cheio, o banco recebe o líquido e a diferença é a taxa de cartão
  const [fee, setFee] = useState(0)
  const [date, setDate] = useState(today())
  const [saving, setSaving] = useState(false)
  const fromCard =
    accounts.find((account) => account.id === fromId)?.kind === 'CARD'

  useEffect(() => {
    if (open) {
      setFromId('')
      setToId('')
      setMethod('PIX')
      setAmount(0)
      setFee(0)
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
      ...(fromCard && fee > 0 ? { fee } : {}),
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(
      fromCard && fee > 0
        ? `Liquidação lançada: ${money(amount - fee)} no destino e ${money(fee)} de taxa de cartão`
        : 'Transferência lançada nas duas contas',
    )
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
          disabled={
            !fromId ||
            !toId ||
            fromId === toId ||
            amount <= 0 ||
            (fromCard && fee >= amount)
          }
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
        {fromCard && (
          <div className="space-y-1">
            <MoneyInput
              id="transfer-fee"
              label="Taxa da operadora"
              value={fee}
              onChange={setFee}
            />
            <p className="text-sm text-gray">
              Caem {money(Math.max(0, amount - fee))} no destino; a taxa vai
              para a tarifa de cartão.
            </p>
          </div>
        )}
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

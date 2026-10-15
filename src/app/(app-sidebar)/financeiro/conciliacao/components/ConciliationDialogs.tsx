'use client'

// Os gestos da conciliação sobre a linha do extrato que sobrou (CX-6):
// lançar no sistema com o plano de contas, casar à mão com um lançamento e
// liquidar o cartão com o depósito da operadora.

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
import { SelectBasic } from '@/components/common/form/FormSelect'
import { MoneyInput } from '../../_components/cash/CashCountCheck'

// Types
import type { BankAccount } from '../../controle-de-caixa/types'

// Actions
import {
  matchLine,
  liquidateCard,
  createFromLine,
  type StatementLine,
  type SystemEntry,
} from '@/actions/conciliation'

// Hooks
import { useTransactionNature } from '@/hooks/queries/useTransactionNature'
import { useTransactionCategory } from '@/hooks/queries/useTransactionCategory'

// Third-party
import { toast } from 'sonner'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const money = (cents: number) => formatCurrencyToBrl(cents)
const brDate = (day: string) => day.split('-').reverse().join('/')

type Base = {
  line?: StatementLine
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

function Shell({
  open,
  title,
  description,
  onOpenChange,
  children,
  footer,
}: {
  open: boolean
  title: string
  description: string
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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

const describe = (line?: StatementLine) =>
  line
    ? `${brDate(line.date)} · ${line.memo || 'sem descrição'} · ${money(line.amount)}`
    : ''

/** A linha só no extrato vira lançamento; falta só o plano de contas (CX-6.6). */
export function CreateFromLineDialog({ line, onDone, onOpenChange }: Base) {
  const [natureId, setNatureId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const { data: natures } = useTransactionNature(
    (line?.amount ?? 0) > 0 ? 'receivable' : 'payable',
  )
  const { data: categories } = useTransactionCategory({ natureId })

  useEffect(() => {
    if (!line) return
    setNatureId('')
    setCategoryId('')
    setDescription(line.memo)
  }, [line])

  const save = async () => {
    if (!line) return
    setSaving(true)
    const res = await createFromLine(line.id, {
      natureId,
      categoryId,
      description,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Lançamento criado e conciliado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={!!line}
      onOpenChange={onOpenChange}
      title="Lançar no sistema"
      description={`${describe(line)}. Valor, data e conta já vêm do extrato: complete o plano de contas.`}
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!categoryId}
          onClick={save}
        >
          Lançar
        </Button>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="line-description">Descrição</Label>
        <Input
          id="line-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectBasic
          name="line-nature"
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
          name="line-category"
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
    </Shell>
  )
}

/** Casa à mão com um lançamento do mesmo valor que ainda não casou. */
export function MatchLineDialog({
  line,
  candidates,
  onDone,
  onOpenChange,
}: Base & { candidates: SystemEntry[] }) {
  const [targetId, setTargetId] = useState('')
  const [saving, setSaving] = useState(false)
  const options = candidates.filter((entry) => entry.amount === line?.amount)

  useEffect(() => {
    if (line) setTargetId('')
  }, [line])

  const save = async () => {
    if (!line) return
    setSaving(true)
    const res = await matchLine(line.id, targetId)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Linha casada')
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={!!line}
      onOpenChange={onOpenChange}
      title="Casar com um lançamento"
      description={describe(line)}
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!targetId}
          onClick={save}
        >
          Casar
        </Button>
      }
    >
      {options.length ? (
        <SelectBasic
          name="line-target"
          label="Lançamento do sistema, do mesmo valor"
          value={targetId}
          onChange={setTargetId}
          options={options.map((entry) => ({
            value: entry.id,
            label: `${brDate(entry.day)} · ${entry.description}`,
          }))}
        />
      ) : (
        <p className="text-sm text-gray">
          Nenhum lançamento do mesmo valor sem casar no período. Lance a linha
          no sistema ou ignore-a.
        </p>
      )}
    </Shell>
  )
}

/**
 * O depósito da operadora liquida as vendas no cartão (CX-6.7, FC-10): a
 * operadora baixa o valor das vendas, a conta recebe o depósito e a
 * diferença vai para a taxa de cartão.
 */
export function LiquidateCardDialog({
  line,
  cards,
  onDone,
  onOpenChange,
}: Base & { cards: BankAccount[] }) {
  const [cardId, setCardId] = useState('')
  const [gross, setGross] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!line) return
    setCardId(cards[0]?.id || '')
    setGross(line.amount)
  }, [line, cards])

  const fee = Math.max(0, gross - (line?.amount ?? 0))

  const save = async () => {
    if (!line) return
    setSaving(true)
    const res = await liquidateCard(line.id, { cardAccountId: cardId, gross })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(`Cartão liquidado · taxa de ${money(fee)}`)
    onDone()
    onOpenChange(false)
  }

  return (
    <Shell
      open={!!line}
      onOpenChange={onOpenChange}
      title="Liquidar o cartão"
      description={`${describe(line)}. Informe o valor das vendas que este depósito paga: a diferença vai para a taxa de cartão.`}
      footer={
        <Button
          type="button"
          isLoading={saving}
          disabled={!cardId || gross < (line?.amount ?? 0)}
          onClick={save}
        >
          Liquidar
        </Button>
      }
    >
      <SelectBasic
        name="line-card"
        label="Operadora"
        value={cardId}
        onChange={setCardId}
        options={cards.map((account) => ({
          value: account.id,
          label: `${account.name} · ${money(account.balance)} a receber`,
        }))}
      />
      <MoneyInput
        id="line-gross"
        label="Valor das vendas"
        value={gross}
        onChange={setGross}
      />
      <p className="text-sm text-gray">Taxa de cartão: {money(fee)}</p>
    </Shell>
  )
}

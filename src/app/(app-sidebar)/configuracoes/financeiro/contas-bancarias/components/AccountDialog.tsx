'use client'

// O cadastro da conta (CX-1, CX-2). Três perguntas, na ordem em que a pessoa
// pensa: que conta é, se ela quer controle nela, e o que ela recebe e paga.

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
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import {
  accountKindLabel,
  settleModeLabel,
  type SettleMode,
  type MethodRule,
  type AccountKind,
  type BankAccount,
} from '@/app/(app-sidebar)/financeiro/controle-de-caixa/types'

// Actions
import { saveBankAccount } from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconBuildingBank, IconCash } from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const banks = [
  { value: '000', label: 'Empresa (dinheiro)' },
  { value: '001', label: '001 · Banco do Brasil' },
  { value: '033', label: '033 · Santander' },
  { value: '077', label: '077 · Banco Inter' },
  { value: '104', label: '104 · Caixa Econômica' },
  { value: '237', label: '237 · Bradesco' },
  { value: '260', label: '260 · Nubank' },
  { value: '341', label: '341 · Itaú' },
  { value: '748', label: '748 · Sicredi' },
  { value: '756', label: '756 · Sicoob' },
]

const settleOptions = (Object.keys(settleModeLabel) as SettleMode[]).map(
  (value) => ({ value, label: settleModeLabel[value] }),
)

const kinds: {
  value: AccountKind
  icon: typeof IconCash
  text: string
}[] = [
  {
    value: 'CASH',
    icon: IconCash,
    text: 'Dinheiro em espécie: a gaveta, o cofre. O dia se fecha contando.',
  },
  {
    value: 'BANK',
    icon: IconBuildingBank,
    text: 'Conta corrente ou digital. O dia se fecha conferindo o extrato.',
  },
]

type Draft = Omit<
  BankAccount,
  'id' | 'balance' | 'hasHistory' | 'isActive' | 'bankIcon'
> & {
  id?: string
}

const empty = (methods: { id: string; name: string }[]): Draft => ({
  name: '',
  kind: 'BANK',
  bankCode: '',
  bankName: '',
  cashControl: false,
  openingBalance: 0,
  openingDate: new Date().toISOString().slice(0, 10),
  rules: methods.map((method) => ({
    methodId: method.id,
    methodName: method.name,
    acceptIncomes: false,
    incomeType: 'PAYSOFF',
    acceptPayments: false,
    paymentType: 'PAYSOFF',
    isDefault: false,
  })),
})

interface Props {
  open: boolean
  account?: BankAccount
  accounts: BankAccount[]
  methods: { id: string; name: string }[]
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AccountDialog({
  open,
  account,
  accounts,
  methods,
  onOpenChange,
  onSaved,
}: Props) {
  const [draft, setDraft] = useState<Draft>(empty(methods))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setDraft(account ? { ...account } : empty(methods))
  }, [open, account, methods])

  const isNew = !draft.id

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const setRule = (methodId: string, patch: Partial<MethodRule>) =>
    set(
      'rules',
      draft.rules.map((rule) =>
        rule.methodId === methodId ? { ...rule, ...patch } : rule,
      ),
    )

  // Qual outra conta é a padrão hoje para esta forma: marcar aqui tira de lá
  const currentDefault = (methodId: string) =>
    accounts.find(
      (item) =>
        item.id !== draft.id &&
        item.isActive &&
        item.rules.some((rule) => rule.methodId === methodId && rule.isDefault),
    )

  const save = async () => {
    setSaving(true)
    const res = await saveBankAccount(draft)
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(isNew ? 'Conta criada' : 'Conta atualizada')
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Nova conta' : draft.name}</DialogTitle>
          <DialogDescription>
            Onde o dinheiro da empresa fica: a gaveta, o cofre ou uma conta no
            banco.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-8">
          {/* 1. Que conta é */}
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {kinds.map(({ value, icon: Icon, text }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('kind', value)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-left',
                    draft.kind === value
                      ? 'border-brand-600 ring-1 ring-brand-600'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <Icon
                    size={22}
                    className={
                      draft.kind === value ? 'text-brand-700' : 'text-gray-400'
                    }
                  />
                  <span>
                    <span className="block font-semibold text-gray-800">
                      {accountKindLabel[value]}
                    </span>
                    <span className="block text-sm text-gray">{text}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-name">Nome da conta</Label>
                <Input
                  id="account-name"
                  placeholder={
                    draft.kind === 'CASH' ? 'Caixa do balcão' : 'Bradesco'
                  }
                  value={draft.name}
                  onChange={(event) => set('name', event.target.value)}
                />
              </div>
              {draft.kind === 'BANK' && (
                <SelectBasic
                  name="account-bank"
                  label="Banco"
                  placeholder="Escolha o banco"
                  options={banks.filter((bank) => bank.value !== '000')}
                  value={draft.bankCode}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      bankCode: value,
                      bankName:
                        banks.find((bank) => bank.value === value)?.label || '',
                    }))
                  }
                />
              )}
            </div>

            {isNew ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account-opening">Saldo inicial</Label>
                  <Input
                    id="account-opening"
                    type="number"
                    step="0.01"
                    startAdornment={<span className="text-sm">R$</span>}
                    value={(draft.openingBalance / 100).toFixed(2)}
                    onChange={(event) =>
                      set(
                        'openingBalance',
                        Math.round(Number(event.target.value || 0) * 100),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-opening-date">Em</Label>
                  <Input
                    id="account-opening-date"
                    type="date"
                    value={draft.openingDate}
                    onChange={(event) => set('openingDate', event.target.value)}
                  />
                </div>
                <p className="text-sm text-gray sm:col-span-2">
                  É o único saldo digitado. Daí em diante o saldo é sempre
                  calculado pelos lançamentos.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray">
                Saldo inicial de {formatCurrencyToBrl(draft.openingBalance)} em{' '}
                {draft.openingDate.split('-').reverse().join('/')}. Não se
                altera depois de criada: o saldo é calculado pelos lançamentos.
              </p>
            )}
          </section>

          {/* 2. Controle de caixa — por conta (CX-1) */}
          <section className="flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="font-semibold text-gray-800">Controle de caixa</p>
              <p className="mt-1 max-w-xl text-sm text-gray">
                {draft.cashControl
                  ? draft.kind === 'CASH'
                    ? 'Ligado: o caixa abre e fecha todo dia, o dinheiro é contado às cegas, ajuste pede motivo e o dia fechado fica travado.'
                    : 'Ligado: o caixa abre e fecha todo dia, o fechamento confere o extrato, ajuste pede motivo e o dia fechado fica travado.'
                  : 'Desligado: recebe e paga sem abrir nem fechar caixa. O saldo e o histórico continuam registrados.'}
              </p>
            </div>
            <Switch
              checked={draft.cashControl}
              onCheckedChange={(checked) => set('cashControl', checked)}
              aria-label="Controle de caixa"
            />
          </section>

          {/* 3. O que recebe e o que paga (CX-2) */}
          <section className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Formas de pagamento</p>
              <p className="text-sm text-gray">
                O que esta conta recebe e paga. <strong>Padrão</strong> é a
                conta que já vem marcada ao receber naquela forma — dá para
                trocar na hora.
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-success-700">Recebe</TableHead>
                    <TableHead />
                    <TableHead>Padrão</TableHead>
                    <TableHead className="text-error-700">Paga</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draft.rules.map((rule) => {
                    const other = currentDefault(rule.methodId)

                    return (
                      <TableRow key={rule.methodId}>
                        <TableCell className="font-medium text-gray-700">
                          {rule.methodName}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.acceptIncomes}
                            onCheckedChange={(checked) =>
                              setRule(rule.methodId, {
                                acceptIncomes: checked,
                                isDefault: checked ? rule.isDefault : false,
                              })
                            }
                            aria-label={`Recebe em ${rule.methodName}`}
                          />
                        </TableCell>
                        <TableCell className="min-w-[190px]">
                          {rule.acceptIncomes && (
                            <SelectBasic
                              name={`income-${rule.methodId}`}
                              label=""
                              options={settleOptions}
                              value={rule.incomeType}
                              onChange={(value) =>
                                setRule(rule.methodId, {
                                  incomeType: value as SettleMode,
                                })
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {rule.acceptIncomes && (
                            <label className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={rule.isDefault}
                                onCheckedChange={(checked) =>
                                  setRule(rule.methodId, {
                                    isDefault: !!checked,
                                  })
                                }
                              />
                              <span className="text-gray">
                                {rule.isDefault
                                  ? other
                                    ? `sai de ${other.name}`
                                    : 'padrão'
                                  : other
                                    ? `hoje: ${other.name}`
                                    : '—'}
                              </span>
                            </label>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.acceptPayments}
                            onCheckedChange={(checked) =>
                              setRule(rule.methodId, {
                                acceptPayments: checked,
                              })
                            }
                            aria-label={`Paga em ${rule.methodName}`}
                          />
                        </TableCell>
                        <TableCell className="min-w-[190px]">
                          {rule.acceptPayments && (
                            <SelectBasic
                              name={`payment-${rule.methodId}`}
                              label=""
                              options={settleOptions}
                              value={rule.paymentType}
                              onChange={(value) =>
                                setRule(rule.methodId, {
                                  paymentType: value as SettleMode,
                                })
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" isLoading={saving} onClick={save}>
            {isNew ? 'Criar conta' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

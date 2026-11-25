'use client'

// O cadastro da conta (CX-1, CX-2). Três perguntas, na ordem em que a pessoa
// pensa: que conta é, se ela quer controle nela, e o que ela recebe e paga.

// React
import { InfoHint } from '@/components/common/InfoHint'
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
import { BrlInput } from '@/components/common/BrlInput'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { SearchSelectBasic } from '@/components/common/form/SearchSelectBasic'

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
import { IconBuildingBank, IconCash, IconCreditCard } from '@tabler/icons-react'

// Hooks
import { useMoney } from '@/hooks/useMoney'
import { useBank } from '@/hooks/queries/useBank'

// Utils
import { cn } from '@/lib/utils'
import { todayLocalIso } from '@/lib/formatDate'

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
  {
    value: 'CARD',
    icon: IconCreditCard,
    text: 'O que a operadora ainda deve, pelo valor cheio. Não fecha o dia: confere na liquidação.',
  },
]

type Draft = Omit<
  BankAccount,
  'id' | 'balance' | 'hasHistory' | 'isActive' | 'bankIcon'
> & {
  id?: string
}

// Os bancos que aparecem com a lista aberta (Maicol, 25/11/2026): os
// principais. Os outros da lista do Banco Central ficam na busca
const MAIN_BANKS = [
  '001', // Banco do Brasil
  '004', // Banco do Nordeste
  '033', // Santander
  '041', // Banrisul
  '070', // BRB
  '077', // Inter
  '104', // Caixa
  '136', // Unicred
  '197', // Stone
  '208', // BTG Pactual
  '212', // Original
  '237', // Bradesco
  '260', // Nubank
  '290', // PagBank
  '323', // Mercado Pago
  '336', // C6 Bank
  '341', // Itaú
  '380', // PicPay
  '403', // Cora
  '422', // Safra
  '655', // Votorantim
  '748', // Sicredi
  '756', // Sicoob
]

const empty = (methods: { id: string; name: string }[]): Draft => ({
  name: '',
  kind: 'BANK',
  bankCode: '',
  bankName: '',
  cashControl: false,
  blindCount: false,
  shortageTolerance: null,
  openingBalance: 0,
  openingDate: todayLocalIso(),
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
  methods: { id: string; name: string }[]
  // As contas da empresa: a operadora escolhe a conta onde cai
  accounts?: BankAccount[]
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AccountDialog({
  open,
  account,
  methods,
  accounts = [],
  onOpenChange,
  onSaved,
}: Props) {
  // Onde a operadora pode depositar: as contas ativas que não são cartão
  const settlementOptions = accounts
    .filter(
      (item) =>
        item.isActive && item.kind !== 'CARD' && item.id !== account?.id,
    )
    .map((item) => ({ value: item.id, label: item.name }))
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const [draft, setDraft] = useState<Draft>(empty(methods))
  // Os bancos do cadastro: a lista oficial do Banco Central (Lista Lite
  // 24/11, item 9), com busca. Antes eram 10 bancos escritos aqui. A gaveta
  // (000) e a operadora de cartão (CARD) não são banco
  const { data: bankList } = useBank()
  const bankOptions = (bankList ?? [])
    .filter((bank) => /^\d+$/.test(bank.code) && bank.code !== '000')
    .sort((a, b) => Number(a.code) - Number(b.code))
    .map((bank) => ({ value: bank.code, label: `${bank.code} · ${bank.name}` }))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setDraft(account ? { ...account } : empty(methods))
  }, [open, account, methods])

  const isNew = !draft.id
  // O saldo inicial e a data dele se corrigem enquanto a conta não tem
  // nenhum lançamento (regra de 23/10/2026; a API só trava a data depois do
  // histórico, CX-2). Com lançamento, a correção é uma ação própria, com
  // permissão e justificativa, no servidor
  const canEditOpening = isNew || !account?.hasHistory

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const setRule = (methodId: string, patch: Partial<MethodRule>) =>
    set(
      'rules',
      draft.rules.map((rule) =>
        rule.methodId === methodId ? { ...rule, ...patch } : rule,
      ),
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
          <div className="flex items-center gap-4">
            <DialogTitle>{isNew ? 'Nova conta' : draft.name}</DialogTitle>
          </div>
          <DialogDescription>
            Onde o dinheiro da empresa fica: a gaveta, o cofre ou uma conta no
            banco.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-8">
          {/* 1. Que conta é */}
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
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
                    draft.kind === 'CASH'
                      ? 'Caixa do balcão'
                      : draft.kind === 'CARD'
                        ? 'Rede (cartões)'
                        : 'Bradesco'
                  }
                  value={draft.name}
                  onChange={(event) => set('name', event.target.value)}
                />
              </div>
              {draft.kind === 'CARD' && (
                <div className="space-y-2">
                  <Label htmlFor="account-operator">Operadora</Label>
                  <Input
                    id="account-operator"
                    placeholder="Rede, Cielo, Stone, Getnet"
                    value={draft.bankName}
                    onChange={(event) => set('bankName', event.target.value)}
                  />
                </div>
              )}
              {draft.kind === 'CARD' && (
                <div className="space-y-1.5">
                  <SelectBasic
                    name="account-settlement"
                    label="Conta onde cai"
                    labelSuffix={
                      <InfoHint title="Banco da operadora">
                        <p>
                          O banco onde a operadora de cartão deposita as vendas.
                        </p>
                        <p>
                          A conciliação dessa conta já sugere a operadora quando
                          o depósito cai (liquidação).
                        </p>
                      </InfoHint>
                    }
                    placeholder={
                      settlementOptions.length
                        ? 'Escolha a conta do banco'
                        : 'Cadastre antes a conta do banco'
                    }
                    options={[
                      { value: 'none', label: 'Não informada' },
                      ...settlementOptions,
                    ]}
                    value={draft.settlementAccountId || 'none'}
                    onChange={(value) =>
                      set(
                        'settlementAccountId',
                        value && value !== 'none' ? String(value) : null,
                      )
                    }
                  />
                </div>
              )}
              {draft.kind === 'BANK' && (
                <SearchSelectBasic
                  id="account-bank"
                  label="Banco"
                  placeholder="Busque pelo nome ou código"
                  options={bankOptions}
                  featured={MAIN_BANKS}
                  isLoading={!bankList}
                  value={draft.bankCode}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      bankCode: value,
                      bankName:
                        bankOptions.find((bank) => bank.value === value)
                          ?.label || '',
                    }))
                  }
                />
              )}
            </div>

            {canEditOpening ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="account-opening">Saldo inicial</Label>
                    <InfoHint title="Saldo inicial">
                      <p>É o único saldo digitado à mão, na data escolhida.</p>
                      <p>
                        Daí em diante o saldo da conta é sempre calculado pelos
                        lançamentos.
                      </p>
                    </InfoHint>
                  </div>
                  <BrlInput
                    id="account-opening"
                    value={draft.openingBalance}
                    onChange={(cents) => set('openingBalance', cents)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-opening-date">Data do saldo</Label>
                  <Input
                    id="account-opening-date"
                    type="date"
                    value={draft.openingDate}
                    onChange={(event) => set('openingDate', event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray">
                {/* A conta criada no cadastro da empresa vem sem data */}
                Saldo inicial de {money(draft.openingBalance)}
                {draft.openingDate
                  ? ` em ${draft.openingDate.split('-').reverse().join('/')}`
                  : ''}
                . A conta já tem lançamentos, então o saldo inicial não se
                altera por aqui: o saldo é calculado pelos lançamentos.
              </p>
            )}
          </section>

          {/* 2. Controle de caixa — por conta (CX-1). A operadora não fecha
              o dia (CX-3); a conta Caixa com controle escolhe a contagem às
              cegas e a tolerância da quebra (4.1) */}
          {draft.kind === 'CARD' ? (
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-800">Sem fechamento</p>
                <InfoHint title="Conta de operadora">
                  <p>
                    A conta da operadora de cartão não abre nem fecha caixa: o
                    dia mostra só o total que entrou, pelo valor cheio.
                  </p>
                  <p>
                    A conferência acontece na liquidação, quando o dinheiro cai
                    no banco já com a taxa descontada.
                  </p>
                </InfoHint>
              </div>
            </section>
          ) : (
            <section className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-semibold text-gray-800">
                    Controle de caixa
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-gray">
                    {draft.cashControl
                      ? draft.kind === 'CASH'
                        ? 'Ligado: o caixa abre e fecha todo dia, o dinheiro é contado no fechamento, ajuste pede motivo e o dia fechado fica travado.'
                        : 'Ligado: o caixa abre e fecha todo dia, o fechamento confere o extrato, ajuste pede motivo e o dia fechado fica travado.'
                      : 'Desligado: recebe e paga sem abrir nem fechar caixa. O saldo e o histórico continuam registrados.'}
                  </p>
                </div>
                <Switch
                  checked={draft.cashControl}
                  onCheckedChange={(checked) => set('cashControl', checked)}
                  aria-label="Controle de caixa"
                />
              </div>
              {draft.cashControl && draft.kind === 'CASH' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-800">
                          Contagem às cegas
                        </p>
                        <InfoHint title="Conferência às cegas">
                          <p>
                            Ligada, quem fecha o caixa digita o que contou sem
                            ver quanto era esperado. Isso evita ajustar a
                            contagem ao número da tela.
                          </p>
                          <p>
                            O padrão é a conferência simples, com o esperado à
                            vista.
                          </p>
                        </InfoHint>
                      </div>
                    </div>
                    <Switch
                      checked={draft.blindCount}
                      onCheckedChange={(checked) => set('blindCount', checked)}
                      aria-label="Contagem às cegas"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-800">
                          Tolerância da quebra
                        </p>
                        <InfoHint title="Tolerância">
                          <p>
                            Desligada, qualquer diferença no fechamento é
                            lançada como quebra de caixa.
                          </p>
                          <p>
                            Ligada, a diferença até o valor informado aparece no
                            fechamento, mas não é lançada.
                          </p>
                        </InfoHint>
                      </div>
                    </div>
                    <Switch
                      checked={draft.shortageTolerance !== null}
                      onCheckedChange={(checked) =>
                        set('shortageTolerance', checked ? 50 : null)
                      }
                      aria-label="Tolerância da quebra"
                    />
                  </div>
                  {draft.shortageTolerance !== null && (
                    <div className="max-w-[220px] space-y-2">
                      <Label htmlFor="account-tolerance">Até</Label>
                      <BrlInput
                        id="account-tolerance"
                        value={draft.shortageTolerance}
                        onChange={(cents) => set('shortageTolerance', cents)}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 3. O que recebe e o que paga (CX-2) */}
          <section className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-800">
                  Formas de pagamento
                </p>
                <InfoHint title="Formas de pagamento da conta">
                  <p>
                    As formas de pagamento que esta conta recebe e paga. O
                    dinheiro dessas formas cai aqui.
                  </p>
                  <p>
                    A conta nova vem com tudo desmarcado: marque as formas que
                    ela usa.
                  </p>
                </InfoHint>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-success-700">Recebe</TableHead>
                    <TableHead />
                    <TableHead className="text-error-700">Paga</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draft.rules.map((rule) => {
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
            {isNew ? 'Cadastrar conta' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

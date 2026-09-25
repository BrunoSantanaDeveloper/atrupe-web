'use client'

// PROVISÓRIO nos dados: a tela lê `src/actions/cash-accounts.ts`.
//
// Controle de caixa — regras CX-0 a CX-3 (área 12), com base no legado. A
// primeira pergunta da tela é "como está o dinheiro hoje, e tem algum caixa
// esquecido?"; o histórico vem depois.

// React
import { Fragment, useState } from 'react'

// Next
import Link from 'next/link'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { SelectBasic } from '@/components/common/form/FormSelect'
import {
  OpenDayDialog,
  CloseDayDialog,
  TransferDialog,
  ReopenDayDialog,
  AdjustmentDialog,
} from './CashDayDialogs'
import { CashDayDetail } from './CashDayDetail'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import {
  cashDayTotals,
  accountKindLabel,
  type CashDay,
  type BankAccount,
} from '../types'

// Actions
import { getCashControl } from '@/actions/cash-accounts'

// Third-party
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconEye,
  IconLock,
  IconCash,
  IconLockOpen,
  IconAdjustments,
  IconAlertTriangle,
  IconBuildingBank,
} from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value)
const brDate = (iso: string) => iso.split('-').reverse().join('/')
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
const hora = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

type Dialog =
  | { kind: 'open'; accountId?: string }
  | { kind: 'transfer' }
  | { kind: 'adjust' | 'close' | 'reopen' | 'detail'; day: CashDay }
  | null

type Tab = 'OPEN' | 'CLOSED' | 'ALL'

export function CashControl(_: SearchParamsType) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  // Reabrir um dia fechado é do administrador (ALT-7)
  const isAdmin = !!session?.user?.isAdmin

  const [dialog, setDialog] = useState<Dialog>(null)
  const [tab, setTab] = useState<Tab>('ALL')
  const [accountFilter, setAccountFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['cash-control'],
    queryFn: () => getCashControl(),
  })

  const accounts = data?.data?.accounts || []
  const days = data?.data?.days || []
  const today = data?.data?.today || ''

  const accountOf = (id: string) =>
    accounts.find((account) => account.id === id) as BankAccount

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cash-control'] }),
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }),
    ])

  // Caixas de dias anteriores ainda abertos: são eles que travam o dia de
  // hoje daquela conta (FC-14). O aviso vem antes do bloqueio
  const stuck = days.filter((day) => day.status === 'OPEN' && day.date < today)

  const filtered = days.filter(
    (day) =>
      (tab === 'ALL' || day.status === tab) &&
      (accountFilter === 'all' || day.accountId === accountFilter),
  )
  const dates = Array.from(new Set(filtered.map((day) => day.date)))

  const dialogDay =
    dialog && 'day' in dialog
      ? days.find((day) => day.id === dialog.day.id)
      : undefined
  const dialogAccount = dialogDay ? accountOf(dialogDay.accountId) : undefined

  const todayCard = (account: BankAccount) => {
    const Icon = account.kind === 'CASH' ? IconCash : IconBuildingBank
    const day = days.find(
      (item) => item.accountId === account.id && item.date === today,
    )
    const blockedBy = stuck.find((item) => item.accountId === account.id)
    const totals = day ? cashDayTotals(day) : undefined

    return (
      <Card
        key={account.id}
        className={cn(!account.cashControl && 'bg-gray-50 shadow-none')}
      >
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icon size={22} className="text-gray-500" />
              <div>
                <p className="font-semibold text-gray-800">{account.name}</p>
                <p className="text-xs text-gray">
                  {accountKindLabel[account.kind]}
                </p>
              </div>
            </div>
            {!account.cashControl ? (
              <Badge variant="neutralLight">Livre</Badge>
            ) : day?.status === 'OPEN' ? (
              <Badge variant="successLight">Aberto</Badge>
            ) : day?.status === 'CLOSED' ? (
              <Badge variant="neutralLight">Fechado</Badge>
            ) : (
              <Badge variant="warningLight">Sem caixa hoje</Badge>
            )}
          </div>

          <div>
            <p className="text-xs text-gray">Saldo</p>
            <p
              className={cn(
                'text-2xl font-semibold',
                account.balance < 0 ? 'text-error-600' : 'text-gray-900',
              )}
            >
              {money(account.balance)}
            </p>
            <p className="mt-1 text-xs text-gray">
              {!account.cashControl
                ? 'Recebe e paga sem abrir caixa'
                : day?.status === 'OPEN' && totals
                  ? `Aberto às ${hora(day.openedAt)} · entrou ${money(totals.entries)} · saiu ${money(totals.exits)}`
                  : day?.status === 'CLOSED'
                    ? `Fechado às ${hora(day.closedAt)} por ${day.closedBy}`
                    : blockedBy
                      ? `O caixa de ${brDate(blockedBy.date)} ainda está aberto`
                      : 'O caixa de hoje ainda não foi aberto'}
            </p>
            {totals && totals.pending !== 0 && (
              <p className="mt-1 text-xs text-gray">
                + {money(totals.pending)} previstos
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            {!account.cashControl ? (
              <Button type="button" variant="neutralOutline" size="sm" asChild>
                <Link href="/configuracoes/financeiro/contas-bancarias">
                  Ligar controle
                </Link>
              </Button>
            ) : day?.status === 'OPEN' ? (
              <PermissionGate permissions={['financial:cash_control:edit']}>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDialog({ kind: 'close', day })}
                >
                  Fechar caixa
                </Button>
                <Button
                  type="button"
                  variant="neutralOutline"
                  size="sm"
                  onClick={() => setDialog({ kind: 'adjust', day })}
                >
                  Ajuste
                </Button>
              </PermissionGate>
            ) : day?.status === 'CLOSED' ? (
              <Button
                type="button"
                variant="neutralOutline"
                size="sm"
                onClick={() => setDialog({ kind: 'detail', day })}
              >
                Ver o dia
              </Button>
            ) : blockedBy ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setDialog({ kind: 'close', day: blockedBy })}
              >
                Fechar {brDate(blockedBy.date)}
              </Button>
            ) : (
              <PermissionGate permissions={['financial:cash_control:create']}>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setDialog({ kind: 'open', accountId: account.id })
                  }
                >
                  Abrir caixa
                </Button>
              </PermissionGate>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  return (
    <PermissionGate
      permissions={['financial:cash_control:view']}
      fallback={<div>Você não tem permissão para acessar esta página.</div>}
    >
      <TooltipProvider>
        <div className="space-y-5">
          <Topbar
            review="new"
            title="Controle de caixa"
            supportText={`Hoje, ${longDate(today)}`}
            primaryCta={
              <PermissionGate permissions={['financial:cash_control:create']}>
                <Button
                  type="button"
                  onClick={() => setDialog({ kind: 'transfer' })}
                >
                  Transferência
                </Button>
              </PermissionGate>
            }
            secondaryCta={
              <PermissionGate permissions={['financial:cash_control:create']}>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => setDialog({ kind: 'open' })}
                >
                  Abrir caixa de outro dia
                </Button>
              </PermissionGate>
            }
          />

          {/* O aviso antes do bloqueio (FC-14) */}
          {stuck.map((day) => (
            <div
              key={day.id}
              className="flex flex-col gap-3 rounded-xl border border-warning-300 bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="mt-0.5 shrink-0 text-warning-600" />
                <p className="text-sm text-warning-800">
                  <strong>
                    O caixa de {brDate(day.date)} da{' '}
                    {accountOf(day.accountId)?.name} ficou aberto.
                  </strong>{' '}
                  Enquanto ele não for conferido e fechado, esta conta não abre
                  o dia de hoje. As outras contas não são afetadas.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => setDialog({ kind: 'close', day })}
              >
                Fechar agora
              </Button>
            </div>
          ))}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map(todayCard)}
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['ALL', 'Todos'],
                    ['OPEN', 'Abertos'],
                    ['CLOSED', 'Fechados'],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={tab === value ? 'default' : 'neutralOutline'}
                    onClick={() => setTab(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <SelectBasic
                name="account-filter"
                label="Conta"
                className="w-full sm:w-[220px]"
                options={[
                  { value: 'all', label: 'Todas as contas' },
                  ...accounts
                    .filter((account) => account.cashControl)
                    .map((account) => ({
                      value: account.id,
                      label: account.name,
                    })),
                ]}
                value={accountFilter}
                onChange={setAccountFilter}
              />
            </CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-full">Conta</TableHead>
                    <TableHead className="text-right">Abertura</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Retroativo</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dates.map((date) => (
                    <Fragment key={date}>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableCell
                          colSpan={7}
                          className="py-2 text-sm font-medium text-gray"
                        >
                          {date === today
                            ? 'Hoje'
                            : longDate(date).replace(/^./, (c) =>
                                c.toUpperCase(),
                              )}
                        </TableCell>
                      </TableRow>
                      {filtered
                        .filter((day) => day.date === date)
                        .map((day) => {
                          const account = accountOf(day.accountId)
                          const totals = cashDayTotals(day)

                          return (
                            <TableRow key={day.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {day.status === 'CLOSED' ? (
                                    <IconLock
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  ) : (
                                    <IconLockOpen
                                      size={16}
                                      className="text-success-600"
                                    />
                                  )}
                                  <span className="font-medium text-gray-800">
                                    {account?.name}
                                  </span>
                                  <span className="text-xs text-gray">
                                    nº {day.number}
                                  </span>
                                  {day.reopenings.length > 0 && (
                                    <Badge variant="warningLight">
                                      reaberto
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-gray">
                                {money(day.opening)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-success-700">
                                {money(totals.entries)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-error-600">
                                {totals.exits
                                  ? `− ${money(totals.exits)}`
                                  : money(0)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-gray">
                                {totals.retroactive
                                  ? money(totals.retroactive)
                                  : '—'}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'whitespace-nowrap text-right font-semibold',
                                  totals.balance < 0
                                    ? 'text-error-600'
                                    : 'text-gray-900',
                                )}
                              >
                                {money(totals.balance)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <ActionButton
                                    Icon={IconEye}
                                    variant="neutralGhost"
                                    tooltip="Ver o dia"
                                    onClick={() =>
                                      setDialog({ kind: 'detail', day })
                                    }
                                  />
                                  {day.status === 'OPEN' ? (
                                    <PermissionGate
                                      permissions={[
                                        'financial:cash_control:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconAdjustments}
                                        variant="neutralGhost"
                                        tooltip="Ajuste"
                                        onClick={() =>
                                          setDialog({ kind: 'adjust', day })
                                        }
                                      />
                                      <ActionButton
                                        Icon={IconLock}
                                        variant="neutralGhost"
                                        tooltip="Fechar caixa"
                                        onClick={() =>
                                          setDialog({ kind: 'close', day })
                                        }
                                      />
                                    </PermissionGate>
                                  ) : (
                                    isAdmin && (
                                      <ActionButton
                                        Icon={IconLockOpen}
                                        variant="neutralGhost"
                                        tooltip="Reabrir"
                                        onClick={() =>
                                          setDialog({ kind: 'reopen', day })
                                        }
                                      />
                                    )
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </Fragment>
                  ))}
                  {!dates.length && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-gray"
                      >
                        Nenhum caixa com esse filtro
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          <OpenDayDialog
            open={dialog?.kind === 'open'}
            accountId={dialog?.kind === 'open' ? dialog.accountId : undefined}
            accounts={accounts}
            onOpenChange={() => setDialog(null)}
            onDone={refresh}
          />
          <TransferDialog
            open={dialog?.kind === 'transfer'}
            accounts={accounts}
            onOpenChange={() => setDialog(null)}
            onDone={refresh}
          />
          <AdjustmentDialog
            open={dialog?.kind === 'adjust'}
            day={dialogDay}
            account={dialogAccount}
            onOpenChange={() => setDialog(null)}
            onDone={refresh}
          />
          <CloseDayDialog
            open={dialog?.kind === 'close'}
            day={dialogDay}
            account={dialogAccount}
            onOpenChange={() => setDialog(null)}
            onDone={refresh}
          />
          <ReopenDayDialog
            open={dialog?.kind === 'reopen'}
            day={dialogDay}
            account={dialogAccount}
            onOpenChange={() => setDialog(null)}
            onDone={refresh}
          />
          <CashDayDetail
            day={dialog?.kind === 'detail' ? dialogDay : undefined}
            account={dialogAccount}
            onOpenChange={() => setDialog(null)}
          />
        </div>
      </TooltipProvider>
    </PermissionGate>
  )
}

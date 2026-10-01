'use client'

// PROVISÓRIO nos dados: a tela lê `src/actions/cash-accounts.ts`.
//
// Controle de caixa — regras CX-0 a CX-3 (área 12), com base no legado. A
// primeira pergunta da tela é "como está o dinheiro hoje, e tem algum caixa
// esquecido?"; o histórico vem depois.

// React
import { Fragment, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
import { AccountIcon } from './AccountIcon'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import {
  cashDayTotals,
  accountKindLabel,
  type CashDay,
  type Movement,
  type BankAccount,
} from '../types'

// Actions
import { approveMovement, getCashControl } from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconEye,
  IconPencil,
  IconSearch,
  IconEyeOff,
  IconPrinter,
  IconArrowBackUp,
  IconCircleCheck,
  IconAlertTriangle,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'

// Consts
import { cashControlStatusObj } from '@/consts/cashControl'
import { cashTodayStatusObj } from '@/consts/cashAccounts'

// Utils
import { updateFilterParam } from '@/lib/filter-utils'
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
  // Os saldos ficam escondidos até alguém pedir, como no Fluxo financeiro:
  // valor grande à vista na tela é informação para quem passa por ela
  const [showTotals, setShowTotals] = useState(false)
  // Aba e filtro ficam na URL (design.md §5.1, §8)
  const router = useRouter()
  const params = useSearchParams()
  const statusParam = params.get('status')
  const tab: Tab =
    statusParam === 'OPEN' || statusParam === 'CLOSED' ? statusParam : 'ALL'
  const accountFilter = params.get('conta') || 'all'
  // Ordem do histórico, com o mesmo botão do Fluxo financeiro: do mais novo
  // para o mais antigo (padrão) ou o contrário, guardada na URL
  const sort = params.get('sort') === 'asc' ? 'asc' : 'desc'
  const setAccountFilter = (value: string) =>
    updateFilterParam('conta', value, { router, params })

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
  const dates = Array.from(new Set(filtered.map((day) => day.date))).sort(
    (a, b) => (sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a)),
  )

  // O caixa principal aprova o que recebe da frente de caixa (4.2)
  const approve = async (day: CashDay, movement: Movement) => {
    const res = await approveMovement(day.id, movement.id)
    if (!res.success) return toast.error(res.message)
    toast.success('Valor aprovado e somado ao saldo')
    await refresh()
  }
  const awaiting = (day?: CashDay) =>
    day?.movements.filter((item) => item.awaitingApproval) || []

  const dialogDay =
    dialog && 'day' in dialog
      ? days.find((day) => day.id === dialog.day.id)
      : undefined
  const dialogAccount = dialogDay ? accountOf(dialogDay.accountId) : undefined

  // Uma linha por conta, com a situação do dia e a ação que ela pede. Os
  // valores só aparecem com "Mostrar totais"
  const todayRow = (account: BankAccount) => {
    const day = days.find(
      (item) => item.accountId === account.id && item.date === today,
    )
    const blockedBy = stuck.find((item) => item.accountId === account.id)
    const totals = day ? cashDayTotals(day) : undefined

    return (
      <TableRow
        key={account.id}
        className={cn(!account.cashControl && 'bg-gray-25')}
      >
        <TableCell className="py-2.5">
          <div className="flex items-center gap-3">
            <AccountIcon icon={account.bankIcon} />
            <div>
              <p className="font-medium text-gray-800">{account.name}</p>
              <p className="text-xs text-gray">
                {accountKindLabel[account.kind]}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-2.5">
          {account.kind === 'CARD' ? (
            <Badge variant={cashTodayStatusObj.NO_CLOSE.variant}>
              {cashTodayStatusObj.NO_CLOSE.text}
            </Badge>
          ) : !account.cashControl ? (
            <Badge variant={cashTodayStatusObj.FREE.variant}>
              {cashTodayStatusObj.FREE.text}
            </Badge>
          ) : day ? (
            <Badge variant={cashControlStatusObj[day.status].variant}>
              {cashControlStatusObj[day.status].text}
            </Badge>
          ) : (
            <Badge variant={cashTodayStatusObj.NO_DAY.variant}>
              {cashTodayStatusObj.NO_DAY.text}
            </Badge>
          )}
          <p className="mt-1 text-xs text-gray">
            {account.kind === 'CARD'
              ? 'O que a operadora ainda deve, pelo valor cheio. Confere na liquidação'
              : !account.cashControl
                ? 'Recebe e paga sem abrir caixa'
                : awaiting(day).length
                  ? `${awaiting(day).length === 1 ? '1 valor' : `${awaiting(day).length} valores`} da frente de caixa aguardando aprovação`
                  : day?.status === 'OPEN'
                    ? `Aberto às ${hora(day.openedAt)}`
                    : day?.status === 'CLOSED'
                      ? `Fechado às ${hora(day.closedAt)} por ${day.closedBy}`
                      : blockedBy
                        ? `O caixa de ${brDate(blockedBy.date)} ainda está aberto`
                        : 'O caixa de hoje ainda não foi aberto'}
          </p>
        </TableCell>
        {showTotals && (
          <>
            <TableCell className="py-2.5 text-right text-sm">
              {day?.status === 'OPEN' && totals ? (
                <>
                  <span className="text-success-600">
                    + {money(totals.entries)}
                  </span>
                  <br />
                  <span className="text-error-600">
                    − {money(totals.exits)}
                  </span>
                </>
              ) : (
                <span className="text-gray">-</span>
              )}
            </TableCell>
            <TableCell className="py-2.5 text-right">
              <p
                className={cn(
                  'font-medium',
                  account.balance < 0 ? 'text-error-600' : 'text-gray-800',
                )}
              >
                {money(account.balance)}
              </p>
              {totals && totals.pending !== 0 && (
                <p className="text-xs text-gray">
                  + {money(totals.pending)} previstos
                </p>
              )}
            </TableCell>
          </>
        )}
        <TableCell className="py-2.5">
          <div className="flex justify-end gap-2">
            {account.kind === 'CARD' ? null : !account.cashControl ? (
              <Button type="button" variant="neutralOutline" size="sm" asChild>
                <Link href="/configuracoes/financeiro/contas-bancarias">
                  Ligar controle
                </Link>
              </Button>
            ) : day?.status === 'OPEN' ? (
              <PermissionGate permissions={['financial:cash_control:edit']}>
                {awaiting(day).length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setDialog({ kind: 'detail', day })}
                  >
                    Aprovar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="neutralOutline"
                  size="sm"
                  onClick={() => setDialog({ kind: 'adjust', day })}
                >
                  Ajuste
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDialog({ kind: 'close', day })}
                >
                  Fechar caixa
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
                onClick={() =>
                  setDialog(
                    awaiting(blockedBy).length
                      ? { kind: 'detail', day: blockedBy }
                      : { kind: 'close', day: blockedBy },
                  )
                }
              >
                {awaiting(blockedBy).length
                  ? `Aprovar e fechar ${brDate(blockedBy.date)}`
                  : `Fechar ${brDate(blockedBy.date)}`}
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
        </TableCell>
      </TableRow>
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
            // As abas do histórico ficam no cabeçalho, com o estado na URL
            // (design.md §5.1)
            paramName="status"
            activeTab={tab === 'ALL' ? 'all' : tab}
            tabs={[
              { value: 'all', tab: 'all', label: 'Todos', count: days.length },
              {
                value: 'OPEN',
                tab: 'OPEN',
                label: 'Abertos',
                count: days.filter((day) => day.status === 'OPEN').length,
              },
              {
                value: 'CLOSED',
                tab: 'CLOSED',
                label: 'Fechados',
                count: days.filter((day) => day.status === 'CLOSED').length,
              },
            ]}
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
              <div className="flex items-center gap-3">
                <PermissionGate permissions={['financial:cash_control:create']}>
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={() => setDialog({ kind: 'open' })}
                  >
                    Abrir caixa de outro dia
                  </Button>
                </PermissionGate>
                <ActionButton
                  size="iconMd"
                  variant="neutralOutline"
                  tooltip={showTotals ? 'Ocultar totais' : 'Mostrar totais'}
                  Icon={showTotals ? IconEyeOff : IconEye}
                  onClick={() => setShowTotals((current) => !current)}
                />
              </div>
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
                  {awaiting(day).length
                    ? ' Há valor da frente de caixa aguardando aprovação nele.'
                    : ''}
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

          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[34%]">Conta</TableHead>
                  <TableHead className="w-full">Hoje</TableHead>
                  {showTotals && (
                    <>
                      <TableHead className="text-right">Movimento</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </>
                  )}
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>{accounts.map(todayRow)}</TableBody>
            </Table>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
              <p className="text-sm text-gray">
                Histórico dos caixas por dia e por conta. O relatório de cada
                dia abre na lupa.
              </p>
              <div className="flex items-end gap-3">
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
                <ActionButton
                  size="iconMd"
                  variant="neutralOutline"
                  tooltip={
                    sort === 'asc'
                      ? 'Ordenação decrescente'
                      : 'Ordenação crescente'
                  }
                  Icon={sort === 'asc' ? IconSortDescending : IconSortAscending}
                  onClick={() =>
                    updateFilterParam('sort', sort === 'asc' ? 'desc' : 'asc', {
                      router,
                      params,
                    })
                  }
                />
              </div>
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
                                  <AccountIcon icon={account?.bankIcon} />
                                  <span className="whitespace-nowrap font-medium text-gray-800">
                                    {account?.name}
                                  </span>
                                  <span className="whitespace-nowrap text-xs text-gray">
                                    nº {day.number}
                                  </span>
                                  <Badge
                                    variant={
                                      cashControlStatusObj[day.status].variant
                                    }
                                  >
                                    {cashControlStatusObj[day.status].text}
                                  </Badge>
                                  {day.reopenings.length > 0 && (
                                    <Badge
                                      variant={
                                        cashTodayStatusObj.REOPENED.variant
                                      }
                                    >
                                      {cashTodayStatusObj.REOPENED.text}
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
                                    Icon={IconSearch}
                                    variant="neutralGhost"
                                    tooltip="Visualizar"
                                    onClick={() =>
                                      setDialog({ kind: 'detail', day })
                                    }
                                  />
                                  <ActionButton
                                    Icon={IconPrinter}
                                    variant="neutralGhost"
                                    tooltip="Imprimir"
                                    onClick={() => {
                                      // Abre o relatório do dia e imprime
                                      setDialog({ kind: 'detail', day })
                                      setTimeout(() => window.print(), 400)
                                    }}
                                  />
                                  {day.status === 'OPEN' ? (
                                    <PermissionGate
                                      permissions={[
                                        'financial:cash_control:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconPencil}
                                        variant="neutralGhost"
                                        tooltip="Lançar ajuste"
                                        onClick={() =>
                                          setDialog({ kind: 'adjust', day })
                                        }
                                      />
                                      <ActionButton
                                        Icon={IconCircleCheck}
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
                                        Icon={IconArrowBackUp}
                                        variant="neutralGhost"
                                        tooltip="Reabrir caixa"
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
            onApprove={(movement) => dialogDay && approve(dialogDay, movement)}
          />
        </div>
      </TooltipProvider>
    </PermissionGate>
  )
}

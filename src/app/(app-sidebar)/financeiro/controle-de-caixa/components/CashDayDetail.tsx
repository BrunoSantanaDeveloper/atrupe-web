'use client'

// O dia do caixa por dentro — o "Fechamento de caixa" do legado (CX-4 do
// levantamento), trazido para a tela em vez de existir só na impressão.

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Types
import {
  cashDayTotals,
  movementKindLabel,
  accountKindLabel,
  type CashDay,
  type Movement,
  type BankAccount,
} from '../types'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Consts
import { cashControlStatusObj } from '@/consts/cashControl'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value)
const brDate = (iso: string) => iso.split('-').reverse().join('/')
const hora = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

function Section({
  title,
  hint,
  items,
  showDate,
}: {
  title: string
  hint?: string
  items: Movement[]
  showDate?: boolean
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 border-b border-gray-200 pb-1">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {hint && <p className="text-xs text-gray">{hint}</p>}
      </div>
      {items.length ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="block text-gray-800">{item.description}</span>
                <span className="block text-xs text-gray">
                  {movementKindLabel[item.kind]} · {item.method}
                  {showDate ? ` · de ${brDate(item.operationDate)}` : ''}
                  {item.reason ? ` · ${item.reason}` : ''} · {item.responsible}
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 font-medium',
                  item.amount < 0 ? 'text-error-600' : 'text-success-700',
                )}
              >
                {item.amount < 0 ? '− ' : ''}
                {money(Math.abs(item.amount))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-1 text-sm text-gray">Nenhum lançamento</p>
      )}
    </section>
  )
}

export function CashDayDetail({
  day,
  account,
  onOpenChange,
}: {
  day?: CashDay
  account?: BankAccount
  onOpenChange: (open: boolean) => void
}) {
  if (!day || !account) return null

  const totals = cashDayTotals(day)
  const settled = day.movements.filter((item) => item.settled)
  const current = settled.filter((item) => !item.retroactive)
  const isClosed = day.status === 'CLOSED'
  const difference =
    isClosed && day.informed !== undefined
      ? day.movements
          .filter((item) => item.kind === 'SHORTAGE' || item.kind === 'OVERAGE')
          .reduce((sum, item) => sum + item.amount, 0)
      : 0

  const summary = [
    ['Abertura', day.opening],
    ['Entradas', totals.entries],
    ['Saídas', -totals.exits],
    ['Retroativo', totals.retroactive],
    ['Saldo', totals.balance],
  ] as const

  return (
    <Dialog open={!!day} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {account.name} · {brDate(day.date)}
            <Badge variant={cashControlStatusObj[day.status].variant}>
              {cashControlStatusObj[day.status].text}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Caixa nº {day.number} · {accountKindLabel[account.kind]} · aberto
            por {day.openedBy} às {hora(day.openedAt)}
            {isClosed
              ? ` · fechado por ${day.closedBy} às ${hora(day.closedAt)}`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {summary.map(([label, value]) => (
              <div
                key={label}
                className={cn(
                  'rounded-lg border border-gray-200 p-3',
                  label === 'Saldo' && 'border-brand-200 bg-brand-50',
                )}
              >
                <p className="text-xs text-gray">{label}</p>
                <p
                  className={cn(
                    'font-semibold',
                    value < 0 ? 'text-error-600' : 'text-gray-900',
                  )}
                >
                  {money(value)}
                </p>
              </div>
            ))}
          </div>

          {isClosed && day.informed !== undefined && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-800">
                {account.kind === 'CASH'
                  ? `Contagem: ${money(day.informed)}`
                  : `Extrato: ${money(day.informed)}`}
                {difference === 0
                  ? ' · bateu'
                  : ` · ${difference < 0 ? 'falta' : 'sobra'} de ${money(Math.abs(difference))}`}
              </p>
              {day.note && <p className="mt-1 text-gray">{day.note}</p>}
            </div>
          )}

          <Section
            title="Entradas compensadas"
            items={current.filter((item) => item.amount > 0)}
          />
          <Section
            title="Saídas compensadas"
            items={current.filter((item) => item.amount < 0)}
          />
          <Section
            title="Previstas"
            hint="provisionadas: ainda não caíram na conta, não entram no saldo"
            items={day.movements.filter((item) => !item.settled)}
          />
          <Section
            title="Retroativos"
            hint="lançados depois, com data de um dia já fechado"
            items={settled.filter((item) => item.retroactive)}
            showDate
          />

          {day.reopenings.length > 0 && (
            <section className="space-y-2">
              <p className="border-b border-gray-200 pb-1 text-sm font-semibold text-gray-700">
                Reaberturas
              </p>
              {day.reopenings.map((item) => (
                <p key={item.at} className="text-sm text-gray">
                  {new Date(item.at).toLocaleString('pt-BR')} · {item.by} ·{' '}
                  {item.reason}
                </p>
              ))}
            </section>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            LeftIcon={IconPrinter}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

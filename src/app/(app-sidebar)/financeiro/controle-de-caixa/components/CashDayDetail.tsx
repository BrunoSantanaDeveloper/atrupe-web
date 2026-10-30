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
  countDifference,
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
  onApprove,
}: {
  title: string
  hint?: string
  items: Movement[]
  showDate?: boolean
  // O dinheiro da frente de caixa chega pendente; quem é do caixa principal
  // confere e aprova (4.2)
  onApprove?: (movement: Movement) => void
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
                  {item.category ? ` · ${item.category}` : ''}
                  {item.reason ? ` · ${item.reason}` : ''} · {item.responsible}
                  {item.approvedBy ? ` · aprovado por ${item.approvedBy}` : ''}
                </span>
                {item.awaitingApproval && (
                  <Badge className="mt-1" variant="warningLight">
                    Aguardando aprovação
                  </Badge>
                )}
                {/* A quebra do fechamento como detalhe do pedido (4.1.3):
                    "R$ 845 recebidos, quebra de R$ 5 no nome de X" */}
                {item.breakage && (
                  <span className="mt-1 block text-xs text-warning-700">
                    {item.breakage.direction === 'SHORTAGE'
                      ? 'Faltou'
                      : 'Sobrou'}{' '}
                    {money(item.breakage.amount)} na contagem
                    {item.breakage.responsible
                      ? `, no nome de ${item.breakage.responsible}`
                      : ''}
                    . O valor a aprovar é o contado.
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    'font-medium',
                    item.amount < 0 ? 'text-error-600' : 'text-success-700',
                  )}
                >
                  {item.amount < 0 ? '− ' : ''}
                  {money(Math.abs(item.amount))}
                </span>
                {item.awaitingApproval && onApprove && (
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    onClick={() => onApprove(item)}
                  >
                    Aprovar
                  </Button>
                )}
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
  onApprove,
  onCloseDay,
}: {
  day?: CashDay
  account?: BankAccount
  onOpenChange: (open: boolean) => void
  onApprove?: (movement: Movement) => void
  // Fechar o dia daqui: é o fim do "Aprovar e fechar" do caixa de um dia
  // anterior, depois de aprovar o que veio da frente de caixa
  onCloseDay?: () => void
}) {
  if (!day || !account) return null

  const totals = cashDayTotals(day)
  const settled = day.movements.filter((item) => item.settled)
  const current = settled.filter((item) => !item.retroactive)
  const isClosed = day.status === 'CLOSED'
  // Esperado, contado e diferença, mesmo quando a quebra não foi lançada por
  // estar dentro da tolerância (4.1)
  const count = isClosed ? countDifference(day) : null
  const awaitingApproval = day.movements.some((item) => item.awaitingApproval)

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
          <div className="flex items-center gap-4">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {account.name} · {brDate(day.date)}
              <Badge variant={cashControlStatusObj[day.status].variant}>
                {cashControlStatusObj[day.status].text}
              </Badge>
            </DialogTitle>
          </div>
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

          {count && day.informed !== undefined && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <p>
                  <span className="block text-xs text-gray">Esperado</span>
                  <span className="font-medium text-gray-800">
                    {money(count.expected)}
                  </span>
                </p>
                <p>
                  <span className="block text-xs text-gray">
                    {account.kind === 'CASH' ? 'Contado' : 'Extrato'}
                  </span>
                  <span className="font-medium text-gray-800">
                    {money(day.informed)}
                  </span>
                </p>
                <p>
                  <span className="block text-xs text-gray">Diferença</span>
                  <span
                    className={cn(
                      'font-medium',
                      count.difference === 0
                        ? 'text-success-700'
                        : count.difference < 0
                          ? 'text-error-600'
                          : 'text-warning-700',
                    )}
                  >
                    {count.difference === 0
                      ? 'bateu'
                      : `${count.difference < 0 ? 'falta' : 'sobra'} de ${money(Math.abs(count.difference))}`}
                  </span>
                </p>
              </div>
              {count.difference !== 0 && account.kind === 'CASH' && (
                <p className="mt-2 text-gray">
                  {count.posted
                    ? 'Lançada como quebra de caixa, no nome de quem operou.'
                    : 'Dentro da tolerância: registrada, não lançada como quebra.'}
                </p>
              )}
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
            hint="provisionadas ou aguardando aprovação: não entram no saldo"
            items={day.movements.filter((item) => !item.settled)}
            onApprove={day.status === 'OPEN' ? onApprove : undefined}
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
          {day.status === 'OPEN' && onCloseDay && (
            <Button
              type="button"
              variant="neutralOutline"
              // Os valores aguardando aprovação, em "Previstas", vêm antes
              disabled={awaitingApproval}
              onClick={onCloseDay}
            >
              Fechar caixa
            </Button>
          )}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

// O item de locação no orçamento: o bem, a data de início e a de fim, e o
// total pelo número de dias (LC-4, LC-5). No START é só isto. No LITE entra a
// reserva (LC-8, ajustada em 16/11/2026): Digitação não reserva, Aguardando
// reserva até a proposta vencer, Aprovado confirma. A cobrança mensal
// recorrente (LC-12) também é do LITE.

import {
  IconAlertTriangle,
  IconCalendarCheck,
  IconCalendarOff,
  IconCalendarTime,
  IconInfoCircle,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePicker } from '@/components/common/date-picker'
import { cn } from '@/lib/utils'

import {
  RESERVATIONS,
  STATUS_LABEL,
  addDays,
  availabilityOf,
  daysBetween,
  formatBrl,
  formatDate,
  holds,
  planHas,
  priceOf,
  today,
  unitOfMode,
  type Plan,
  type QuotationStatus,
  type RentalProduct,
} from '../data'
import { PlanLock } from './PlanLock'

export interface RentalDraft {
  productId: string
  start?: Date
  end?: Date
  count: number
  status: QuotationStatus
  validUntil: Date
  monthly: boolean
}

export interface Installment {
  due: Date
  from: Date
  to: Date
  cents: number
}

// Cobrança mensal (LC-12): uma parcela a cada 30 dias de locação, com o
// valor dos dias daquele trecho
export const installmentsOf = (
  product: RentalProduct,
  draft: RentalDraft,
): Installment[] => {
  const days = daysBetween(draft.start, draft.end)
  if (!draft.start || !days) return []
  const price = priceOf(product, days, draft.count)
  const list: Installment[] = []
  for (let offset = 0; offset < days; offset += 30) {
    const block = Math.min(30, days - offset)
    const from = addDays(draft.start, offset)
    list.push({
      due: from,
      from,
      to: addDays(from, block - 1),
      cents: Math.round(price.perDayCents * block * draft.count),
    })
  }
  return list
}

const STATUS_BADGE: Record<
  QuotationStatus,
  'neutralLight' | 'warningLight' | 'successLight' | 'errorLight'
> = {
  DRAFT: 'neutralLight',
  WAITING: 'warningLight',
  APPROVED: 'successLight',
  EXPIRED: 'errorLight',
}

function Notice({
  tone,
  icon: Icon,
  title,
  children,
  action,
}: {
  tone: 'info' | 'success' | 'warning' | 'error'
  icon: React.ElementType
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    success: 'border-success-200 bg-success-50 text-success-700',
    warning: 'border-warning-200 bg-warning-50 text-warning-700',
    error: 'border-error-200 bg-error-50 text-error-700',
  }
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        tones[tone],
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <div className="text-sm text-gray-700">{children}</div>
      </div>
      {action}
    </div>
  )
}

export function RentalQuotationItem({
  plan,
  products,
  draft,
  onChange,
}: {
  plan: Plan
  products: RentalProduct[]
  draft: RentalDraft
  onChange: (draft: RentalDraft) => void
}) {
  const product =
    products.find((item) => item.id === draft.productId) || products[0]
  const patch = (changes: Partial<RentalDraft>) =>
    onChange({ ...draft, ...changes })

  const days = daysBetween(draft.start, draft.end)
  const price = priceOf(product, days, draft.count)
  const unit = unitOfMode(product.mode)
  const hasReserve = planHas(plan, 'LITE')

  const availability = availabilityOf(product, draft.start, draft.end)
  const blocked =
    hasReserve &&
    days > 0 &&
    (product.mode === 'INDIVIDUAL'
      ? availability.conflicts.length > 0
      : draft.count > availability.free)
  const editable = draft.status === 'DRAFT'
  const installments = draft.monthly ? installmentsOf(product, draft) : []

  const productReservations = RESERVATIONS.filter(
    (reservation) => reservation.productId === product.id,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Orçamento 41-T1</CardTitle>
                <Badge variant={STATUS_BADGE[draft.status]}>
                  {STATUS_LABEL[draft.status]}
                </Badge>
              </div>
              <CardDescription>
                Cliente: Loja Mundo Kids · validade da proposta até{' '}
                {formatDate(draft.validUntil)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.status === 'DRAFT' && (
                <Button
                  type="button"
                  disabled={blocked || !days}
                  onClick={() =>
                    patch({
                      status: 'WAITING',
                      validUntil: addDays(today(), 7),
                    })
                  }
                >
                  Enviar para o cliente
                </Button>
              )}
              {draft.status === 'WAITING' && (
                <>
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={() =>
                      patch({
                        status: 'EXPIRED',
                        validUntil: addDays(today(), -1),
                      })
                    }
                  >
                    Simular proposta vencida
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    onClick={() => patch({ status: 'APPROVED' })}
                  >
                    Aprovar
                  </Button>
                </>
              )}
              {draft.status === 'EXPIRED' && (
                <Button
                  type="button"
                  disabled={blocked}
                  onClick={() =>
                    patch({
                      status: 'WAITING',
                      validUntil: addDays(today(), 7),
                    })
                  }
                >
                  Renovar a validade
                </Button>
              )}
              {draft.status !== 'DRAFT' && (
                <Button
                  type="button"
                  variant="neutralGhost"
                  onClick={() => patch({ status: 'DRAFT' })}
                >
                  Voltar para digitação
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_120px]">
              <div className="space-y-1.5">
                <Label>Produto de locação</Label>
                <Select
                  value={product.id}
                  disabled={!editable}
                  onValueChange={(productId) => patch({ productId, count: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DatePicker
                label="Início"
                value={draft.start}
                disabled={!editable}
                onChange={(start) => patch({ start })}
              />
              <DatePicker
                label="Fim"
                value={draft.end}
                disabled={!editable}
                onChange={(end) => patch({ end })}
                calendarProps={{
                  disabled: draft.start ? { before: draft.start } : undefined,
                }}
              />
              {product.mode !== 'INDIVIDUAL' && (
                <div className="space-y-1.5">
                  <Label htmlFor="rental-count">
                    {product.mode === 'QUANTITY' ? 'Peças' : 'Cotas'}
                  </Label>
                  <Input
                    id="rental-count"
                    type="number"
                    min={1}
                    disabled={!editable}
                    value={draft.count}
                    onChange={(event) =>
                      patch({ count: Number(event.target.value) || 1 })
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                {days > 0 && price.period ? (
                  <>
                    <p>
                      <span className="font-semibold">
                        {days} {days === 1 ? 'dia' : 'dias'}
                      </span>
                      {product.mode !== 'INDIVIDUAL'
                        ? ` × ${draft.count} ${unitOfMode(product.mode, draft.count)}`
                        : ''}{' '}
                      · faixa {price.period.name} (
                      {formatBrl(price.perDayCents)} por dia
                      {unit ? ` por ${unit}` : ''})
                    </p>
                    {days < price.period.days && (
                      <p className="text-gray">
                        Menos dias que o menor período: cobra o período inteiro
                        ({price.period.name}).
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray">
                    Escolha a data de início e a de fim para ver o valor.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray">Total da locação</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatBrl(price.totalCents)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray">
            A impressão da lona, a instalação e o frete entram como itens comuns
            do orçamento, ao lado da locação.
          </p>

          <PlanLock
            plan={plan}
            from="LITE"
            title="Reserva do bem"
            locked="No Start o sistema não confere se este bem já está alugado no período: o controle é seu. No Lite, o orçamento em Aguardando reserva o bem até a proposta vencer, e o sistema não deixa alugar o mesmo período duas vezes."
          >
            {blocked ? (
              <Notice
                tone="error"
                icon={IconCalendarOff}
                title={
                  product.mode === 'INDIVIDUAL'
                    ? 'Este período já está reservado'
                    : `Só ${availability.free} ${unitOfMode(product.mode, availability.free)} livres neste período`
                }
              >
                {availability.conflicts.map((conflict) => (
                  <p key={conflict.id}>
                    {product.mode !== 'INDIVIDUAL'
                      ? `${conflict.count} ${unitOfMode(product.mode, conflict.count)} · `
                      : ''}
                    {formatDate(conflict.start)} a {formatDate(conflict.end)} ·
                    orçamento {conflict.quotation}, {conflict.client} (
                    {conflict.status === 'WAITING'
                      ? `Aguardando, a proposta vence em ${formatDate(conflict.validUntil)}`
                      : 'Aprovado'}
                    )
                  </p>
                ))}
                <p className="mt-1">
                  {product.mode === 'INDIVIDUAL'
                    ? 'Escolha outro período ou outro bem para enviar ao cliente.'
                    : `Diminua a quantidade para até ${availability.free} ou escolha outro período.`}
                </p>
              </Notice>
            ) : draft.status === 'DRAFT' ? (
              <Notice
                tone="info"
                icon={IconInfoCircle}
                title="Em digitação o bem não fica reservado"
              >
                {days > 0
                  ? product.mode === 'INDIVIDUAL'
                    ? 'O período está livre. A reserva começa quando o orçamento vai para Aguardando.'
                    : `${availability.free} de ${product.capacity} ${unitOfMode(product.mode, product.capacity)} livres no período. A reserva começa quando o orçamento vai para Aguardando.`
                  : 'A reserva começa quando o orçamento vai para Aguardando.'}
              </Notice>
            ) : draft.status === 'WAITING' ? (
              <Notice
                tone="warning"
                icon={IconCalendarTime}
                title={`Reservado até ${formatDate(draft.validUntil)}`}
              >
                A reserva vale até a validade da proposta. Se a proposta vencer
                sem aprovação, o bem volta a ficar livre.
              </Notice>
            ) : draft.status === 'APPROVED' ? (
              <Notice
                tone="success"
                icon={IconCalendarCheck}
                title="Reserva confirmada"
              >
                {formatDate(draft.start)} a {formatDate(draft.end)}. O bem só
                volta a ficar livre no fim do período ou se o contrato for
                encerrado antes.
              </Notice>
            ) : (
              <Notice
                tone="error"
                icon={IconAlertTriangle}
                title={`A proposta venceu em ${formatDate(draft.validUntil)}`}
              >
                O bem saiu da reserva e voltou a ficar livre. Para reservar de
                novo, renove a validade da proposta.
              </Notice>
            )}
          </PlanLock>

          <PlanLock
            plan={plan}
            from="LITE"
            title="Cobrança mensal da locação longa"
            locked="No Start a locação é cobrada pela condição de pagamento do orçamento. No Lite, o contrato longo pode gerar uma cobrança por mês em Contas a receber, enquanto a locação durar."
          >
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Switch
                  id="rental-monthly"
                  checked={draft.monthly}
                  disabled={!editable || days <= 30}
                  onCheckedChange={(monthly) => patch({ monthly })}
                />
                <div>
                  <Label htmlFor="rental-monthly">
                    Cobrar todo mês enquanto a locação durar
                  </Label>
                  <p className="text-sm text-gray">
                    {days <= 30
                      ? 'Vale para a locação de mais de 30 dias. Esta usa a condição de pagamento do orçamento.'
                      : 'Uma parcela a cada 30 dias de locação. Encerrar o contrato antes cancela as parcelas que ainda não venceram.'}
                  </p>
                </div>
              </div>
              {installments.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Parcela</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((installment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {index + 1} de {installments.length}
                        </TableCell>
                        <TableCell>
                          {formatDate(installment.from)} a{' '}
                          {formatDate(installment.to)}
                        </TableCell>
                        <TableCell>{formatDate(installment.due)}</TableCell>
                        <TableCell className="text-right">
                          {formatBrl(installment.cents)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </PlanLock>
        </CardContent>
      </Card>

      {hasReserve && (
        <Card>
          <CardHeader>
            <CardTitle>Reservas de {product.name}</CardTitle>
            <CardDescription>
              O que já segura este bem. A tela de agenda, com a ocupação de
              todos os bens, fica para depois do Elite.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {productReservations.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Período</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Cliente</TableHead>
                    {product.mode !== 'INDIVIDUAL' && (
                      <TableHead>
                        {product.mode === 'QUANTITY' ? 'Peças' : 'Cotas'}
                      </TableHead>
                    )}
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        {formatDate(reservation.start)} a{' '}
                        {formatDate(reservation.end)}
                      </TableCell>
                      <TableCell>{reservation.quotation}</TableCell>
                      <TableCell>{reservation.client}</TableCell>
                      {product.mode !== 'INDIVIDUAL' && (
                        <TableCell>
                          {reservation.count} de {product.capacity}
                        </TableCell>
                      )}
                      <TableCell>
                        {reservation.status === 'APPROVED' ? (
                          <Badge variant="successLight">Confirmada</Badge>
                        ) : holds(reservation) ? (
                          <Badge variant="warningLight">
                            Reservado até {formatDate(reservation.validUntil)}
                          </Badge>
                        ) : (
                          <Badge variant="neutralLight">Liberada</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray">
                Nenhuma reserva para este bem.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

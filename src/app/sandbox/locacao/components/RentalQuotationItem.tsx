'use client'

// O item de locação no orçamento, com as regras que o sistema já tem
// (revisão de 16/11/2026): o produto, o período (no LITE, a variação), a
// quantidade comum do item e a data de início. Cada linha é um período: o fim
// sai do início e dos dias do período, e o valor é o preço do período vezes a
// quantidade. O vendedor edita o valor dentro do limite de desconto do perfil.
// No LITE entra a reserva (LC-8): Digitação não reserva, Aguardando reserva
// até a proposta vencer, Aprovado confirma. A cobrança mensal (LC-12) também.

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
import { BrlInput } from '@/components/common/BrlInput'
import { DatePicker } from '@/components/common/date-picker'
import { cn } from '@/lib/utils'

import {
  RESERVATIONS,
  STATUS_LABEL,
  addDays,
  availabilityOf,
  endOf,
  formatBrl,
  formatDate,
  holds,
  periodOf,
  periodsOf,
  planHas,
  today,
  unitOf,
  type Plan,
  type QuotationStatus,
  type RentalPeriod,
  type RentalProduct,
} from '../data'
import { PlanLock } from './PlanLock'

export interface RentalDraft {
  productId: string
  periodId: string
  start?: Date
  quantity: number
  // Valor do item editado pelo vendedor; nulo vale o da tabela
  valueCents: number | null
  status: QuotationStatus
  validUntil: Date
  monthly: boolean
}

// Limite de desconto do perfil do vendedor (Configurações › Vendas › Perfil
// de vendedor), o mesmo que vale para qualquer item
export const MAX_DISCOUNT = 0.1

export interface RentalLine {
  period: RentalPeriod
  end?: Date
  tableCents: number
  totalCents: number
  minCents: number
}

export const lineOf = (
  product: RentalProduct,
  draft: RentalDraft,
  plan: Plan,
): RentalLine => {
  // No START o produto só tem o período dele
  const period = planHas(plan, 'LITE')
    ? periodOf(product, draft.periodId)
    : product.periods[0]
  const tableCents = period.priceCents * draft.quantity
  return {
    period,
    end: endOf(draft.start, period),
    tableCents,
    totalCents: draft.valueCents ?? tableCents,
    minCents: Math.round(tableCents * (1 - MAX_DISCOUNT)),
  }
}

export interface Installment {
  due: Date
  from: Date
  to: Date
  cents: number
}

// Cobrança mensal (LC-12): uma parcela a cada 30 dias de locação, com a
// parte do valor daquele trecho
export const installmentsOf = (
  draft: RentalDraft,
  line: RentalLine,
): Installment[] => {
  const days = line.period.days
  if (!draft.start || days <= 30) return []
  const list: Installment[] = []
  for (let offset = 0; offset < days; offset += 30) {
    const block = Math.min(30, days - offset)
    const from = addDays(draft.start, offset)
    list.push({
      due: from,
      from,
      to: addDays(from, block - 1),
      cents: Math.round((line.totalCents * block) / days),
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

  const line = lineOf(product, draft, plan)
  const periods = periodsOf(product, plan)
  const unit = unitOf(product)
  const hasReserve = planHas(plan, 'LITE')
  const hasDates = !!draft.start

  const availability = availabilityOf(product, draft.start, line.end)
  // Decisão de 16/11/2026: a reserva vale para o bem único (outdoor, painel
  // inteiro). O produto com várias unidades (peças, anúncios no painel de
  // LED) aceita várias locações no período; o saldo fica para o estudo do
  // controle de estoque
  const single = product.capacity === 1
  const blocked =
    hasReserve && hasDates && single && availability.conflicts.length > 0
  const belowLimit = line.totalCents < line.minCents
  const editable = draft.status === 'DRAFT'
  const installments = draft.monthly ? installmentsOf(draft, line) : []

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
                  disabled={blocked || belowLimit || !hasDates}
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
                  onClick={() =>
                    patch({ status: 'DRAFT', validUntil: addDays(today(), 7) })
                  }
                >
                  Voltar para digitação
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1.2fr_110px_1fr_1fr]">
              <div className="space-y-1.5">
                <Label>Produto</Label>
                <Select
                  value={product.id}
                  disabled={!editable}
                  onValueChange={(productId) => {
                    const next = products.find((item) => item.id === productId)
                    patch({
                      productId,
                      periodId: next?.periods[0].id || '',
                      quantity: 1,
                      valueCents: null,
                      monthly: false,
                    })
                  }}
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
              <div className="space-y-1.5">
                <Label>{hasReserve ? 'Variação (período)' : 'Período'}</Label>
                <Select
                  value={line.period.id}
                  disabled={!editable || periods.length === 1}
                  onValueChange={(periodId) =>
                    patch({ periodId, valueCents: null, monthly: false })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name} · {period.days}{' '}
                        {period.days === 1 ? 'dia' : 'dias'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rental-quantity">Quantidade</Label>
                <Input
                  id="rental-quantity"
                  type="number"
                  min={1}
                  disabled={!editable}
                  value={draft.quantity}
                  onChange={(event) =>
                    patch({
                      quantity: Number(event.target.value) || 1,
                      valueCents: null,
                    })
                  }
                />
              </div>
              <DatePicker
                label="Início"
                value={draft.start}
                disabled={!editable}
                onChange={(start) => patch({ start })}
              />
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-700">
                  {formatDate(line.end)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gray-200 pt-4">
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">{line.period.name}</span> ·{' '}
                  {draft.quantity}
                  {unit ? ` ${unitOf(product, draft.quantity)}` : ''} ×{' '}
                  {formatBrl(line.period.priceCents)} ={' '}
                  {formatBrl(line.tableCents)}
                </p>
                <p className="text-gray">
                  Cada linha é um período. Para um tempo maior, acrescente outra
                  linha com o início seguinte
                  {hasReserve ? ' ou escolha uma variação maior' : ''}.
                </p>
              </div>
              <div className="w-56 space-y-1.5">
                <Label htmlFor="rental-value">Valor do item</Label>
                <BrlInput
                  id="rental-value"
                  disabled={!editable}
                  value={line.totalCents}
                  onChange={(valueCents) => patch({ valueCents })}
                />
                {draft.valueCents !== null &&
                  draft.valueCents !== line.tableCents && (
                    <button
                      type="button"
                      className="text-sm text-brand-700 underline"
                      onClick={() => patch({ valueCents: null })}
                    >
                      Voltar ao valor da tabela
                    </button>
                  )}
              </div>
            </div>

            {belowLimit && (
              <p role="alert" className="mt-3 text-sm text-error-700">
                O seu perfil de vendedor permite até{' '}
                {Math.round(MAX_DISCOUNT * 100)}% de desconto: o mínimo deste
                item é {formatBrl(line.minCents)}. Aumente o valor ou peça a um
                gestor para liberar.
              </p>
            )}
          </div>

          <p className="text-sm text-gray">
            A impressão da lona, a instalação e o frete entram como itens comuns
            do orçamento, ao lado da locação.
          </p>

          <PlanLock
            plan={plan}
            from="LITE"
            title="Reserva do bem"
            locked="No Start o sistema não confere se este bem já está alugado no período: o controle é seu. No Lite, o orçamento em Aguardando reserva o bem único (o outdoor, o painel) até a proposta vencer, e o sistema não deixa alugar o mesmo período duas vezes."
          >
            {!single ? (
              <Notice
                tone="info"
                icon={IconInfoCircle}
                title="Este produto aceita várias locações no mesmo período"
              >
                O sistema não controla quantas unidades estão livres: confira o
                que já foi locado na lista abaixo. O controle do saldo entra com
                o controle de estoque.
              </Notice>
            ) : blocked ? (
              <Notice
                tone="error"
                icon={IconCalendarOff}
                title="Este período já está reservado"
              >
                {availability.conflicts.map((conflict) => (
                  <p key={conflict.id}>
                    {formatDate(conflict.start)} a {formatDate(conflict.end)} ·
                    orçamento {conflict.quotation}, {conflict.client} (
                    {conflict.status === 'WAITING'
                      ? `Aguardando, a proposta vence em ${formatDate(conflict.validUntil)}`
                      : 'Aprovado'}
                    )
                  </p>
                ))}
                <p className="mt-1">
                  Escolha outra data de início ou outro produto para enviar ao
                  cliente.
                </p>
              </Notice>
            ) : draft.status === 'DRAFT' ? (
              <Notice
                tone="info"
                icon={IconInfoCircle}
                title="Em digitação o bem não fica reservado"
              >
                {hasDates
                  ? 'O período está livre. A reserva começa quando o orçamento vai para Aguardando.'
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
                {formatDate(draft.start)} a {formatDate(line.end)}. O bem só
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
            locked="No Start a locação é cobrada pela condição de pagamento do orçamento. No Lite, o período de mais de 30 dias pode gerar uma cobrança por mês em Contas a receber, enquanto a locação durar."
          >
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Switch
                  id="rental-monthly"
                  checked={draft.monthly && line.period.days > 30}
                  disabled={!editable || line.period.days <= 30}
                  onCheckedChange={(monthly) => patch({ monthly })}
                />
                <div>
                  <Label htmlFor="rental-monthly">
                    Cobrar todo mês enquanto a locação durar
                  </Label>
                  <p className="text-sm text-gray">
                    {line.period.days <= 30
                      ? 'Vale para o período de mais de 30 dias. Este usa a condição de pagamento do orçamento.'
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
            <CardTitle>
              {single ? 'Reservas' : 'Locações'} de {product.name}
            </CardTitle>
            <CardDescription>
              {single
                ? 'O que já segura este bem.'
                : 'O que já foi locado deste produto, para conferir o saldo.'}{' '}
              A tela de agenda, com a ocupação de todos os bens, fica para
              depois do Elite.
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
                    <TableHead>Quantidade</TableHead>
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
                      <TableCell>
                        {reservation.count}
                        {product.unit
                          ? ` ${unitOf(product, reservation.count)}`
                          : ''}
                      </TableCell>
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

'use client'

import { IconCircleCheck, IconCoin } from '@tabler/icons-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'
import type { QuoteResult } from '@/types/checkout'

interface Props {
  quote: QuoteResult | null | undefined
  isLoading?: boolean
  /** A forma de pagamento escolhida; sem ela, a linha não aparece. */
  billingType?: string
}

const Divider = () => <div className="h-px bg-gray-200" />

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span
        className={cn(
          'flex items-center gap-2 text-sm',
          accent ? 'text-brand-600' : 'text-gray-500',
        )}
      >
        <IconCircleCheck className="size-4 flex-none text-brand-500" />
        <span>{label}</span>
      </span>
      <span
        className={cn(
          'flex-none whitespace-nowrap text-sm font-semibold',
          accent ? 'text-brand-600' : 'text-gray-600',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Resumo da assinatura, no desenho do protótipo. Só EXIBE o orçamento
 * calculado no servidor — nenhum valor é somado aqui. Com desconto, o
 * subtotal aparece riscado e os descontos logo abaixo, na cor da marca.
 */
export function OrderSummary({ quote, isLoading, billingType }: Props) {
  const methodLabel = PAYMENT_METHOD_OPTIONS.find(
    (m) => m.value === billingType,
  )?.label
  const installments = quote?.installments
  const selectedInstallment =
    installments?.allowed && installments.selected > 1
      ? installments.options.find((o) => o.count === installments.selected)
      : null
  const hasDiscount = !!quote && quote.discounts.length > 0

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-lg font-semibold leading-7 text-gray-700">
        Resumo da assinatura
      </p>
      <Divider />

      {isLoading || !quote ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {quote.lines.map((line) => (
              <Row
                key={`${line.kind}-${line.label}`}
                label={
                  line.kind === 'ADDITIONAL_USERS' && line.quantity
                    ? line.quantity === 1
                      ? '1 usuário adicional'
                      : `${line.quantity} usuários adicionais`
                    : line.label
                }
                value={
                  <>
                    {formatCurrencyToBrl(line.monthlyCents)}
                    <small className="ml-0.5 font-normal text-gray-500">
                      /mês
                    </small>
                  </>
                }
              />
            ))}
          </div>
          <Divider />

          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-700">
            <span>Subtotal</span>
            <span
              className={cn(
                'flex-none whitespace-nowrap text-sm font-semibold text-gray-600',
                hasDiscount && 'text-gray-400 line-through',
              )}
            >
              {formatCurrencyToBrl(quote.subtotalCents)}
              <small className="ml-0.5 font-normal">{quote.totalSuffix}</small>
            </span>
          </div>

          {hasDiscount && (
            <div className="flex flex-col gap-6">
              {quote.discounts.map((d) => (
                <Row
                  key={d.kind}
                  label={d.label}
                  value={`-${formatCurrencyToBrl(d.amountCents)}`}
                  accent
                />
              ))}
            </div>
          )}
          <Divider />

          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-700">
            <span>Total</span>
            <span className="flex items-center gap-1 text-xl font-semibold text-gray-700">
              <IconCoin className="size-6 flex-none text-brand-500" />
              {formatCurrencyToBrl(quote.totalCents)}
              <small className="ml-0.5 text-sm font-normal text-gray-500">
                {quote.totalSuffix}
              </small>
            </span>
          </div>

          {selectedInstallment && (
            <p className="-mt-2 text-xs text-gray-500">
              em{' '}
              <strong className="font-semibold text-brand-600">
                {selectedInstallment.count}x de{' '}
                {formatCurrencyToBrl(selectedInstallment.amountCents)}
              </strong>{' '}
              sem juros no cartão
            </p>
          )}

          {(quote.couponDiscountCents > 0 || quote.creditCents > 0) && (
            <p className="-mt-2 text-xs text-gray-500">
              {quote.creditCents > 0 && quote.couponDiscountCents > 0
                ? 'O cupom e o crédito valem só para esta primeira cobrança.'
                : quote.creditCents > 0
                  ? 'O crédito vale só para esta primeira cobrança.'
                  : 'O cupom vale só para esta primeira cobrança.'}{' '}
              A renovação é de {formatCurrencyToBrl(quote.recurringCents)}
              {quote.totalSuffix}.
            </p>
          )}

          {methodLabel && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3 text-sm text-gray-700">
              <span>Forma de pagamento</span>
              <strong className="font-semibold text-gray-900">
                {methodLabel}
              </strong>
            </div>
          )}
        </>
      )}
    </div>
  )
}

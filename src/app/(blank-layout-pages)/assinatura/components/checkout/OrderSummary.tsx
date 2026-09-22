'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import type { QuoteResult } from '@/types/checkout'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'

interface Props {
  quote: QuoteResult | null | undefined
  isLoading?: boolean
  billingType?: string
  children?: React.ReactNode
}

/**
 * Resumo do pedido. Só EXIBE o orçamento calculado no servidor — nenhum valor
 * é somado aqui. Com qualquer desconto, o subtotal aparece riscado.
 */
export function OrderSummary({
  quote,
  isLoading,
  billingType,
  children,
}: Props) {
  const hasDiscount = !!quote && quote.discounts.length > 0
  const methodLabel = PAYMENT_METHOD_OPTIONS.find(
    (m) => m.value === billingType,
  )?.label
  const installments = quote?.installments
  const selectedInstallment =
    installments?.allowed && installments.selected > 1
      ? installments.options.find((o) => o.count === installments.selected)
      : null

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-lg">Resumo da assinatura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !quote ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : (
          <>
            <ul className="space-y-2 text-sm">
              {quote.lines.map((line) => (
                <li
                  key={`${line.kind}-${line.label}`}
                  className="flex justify-between gap-4"
                >
                  <span className="text-gray-700">
                    {line.label}
                    {line.quantity ? ` (${line.quantity})` : ''}
                  </span>
                  <span className="text-gray-900 whitespace-nowrap">
                    {formatCurrencyToBrl(line.monthlyCents)}/mês
                  </span>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal</span>
              <span
                className={cn(
                  'text-gray-900',
                  hasDiscount && 'line-through text-gray-500',
                )}
              >
                {formatCurrencyToBrl(quote.subtotalCents)}
                {quote.totalSuffix}
              </span>
            </div>

            {quote.discounts.map((d) => (
              <div
                key={d.kind}
                className="flex justify-between gap-4 text-sm text-brand-700"
              >
                <span>{d.label}</span>
                <span className="whitespace-nowrap">
                  − {formatCurrencyToBrl(d.amountCents)}
                </span>
              </div>
            ))}

            <Separator />

            <div className="flex items-end justify-between">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrencyToBrl(quote.totalCents)}
                <span className="text-sm font-normal text-gray-600">
                  {quote.totalSuffix}
                </span>
              </span>
            </div>

            {selectedInstallment && (
              <p className="text-sm text-gray-600 text-right">
                em {selectedInstallment.count}x de{' '}
                {formatCurrencyToBrl(selectedInstallment.amountCents)} sem juros
                no cartão
              </p>
            )}

            {(quote.couponDiscountCents > 0 || quote.creditCents > 0) && (
              <p className="text-xs text-gray-500">
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Forma de pagamento</span>
                <span className="text-gray-900">{methodLabel}</span>
              </div>
            )}
          </>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

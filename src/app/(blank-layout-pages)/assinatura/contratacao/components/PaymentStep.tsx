'use client'

import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { IconBarcode, IconCheck, IconCreditCard } from '@tabler/icons-react'
import { IconPix } from '@/assets/icons/CustomIcons'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { formatCurrencyToBrl } from '@/lib/utils'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'
import type {
  CheckoutBillingType,
  QuoteCoupon,
  QuoteResult,
} from '@/types/checkout'

const ICONS = {
  CREDIT_CARD: IconCreditCard,
  PIX: IconPix,
  BOLETO: IconBarcode,
} as const

type Cycle = 'MONTHLY' | 'YEARLY'

const CYCLES: Record<Cycle, { label: string; description: string }> = {
  MONTHLY: { label: 'Mensal', description: 'Cobrança todo mês.' },
  YEARLY: {
    label: 'Anual',
    description: 'Pague 11 meses e ganhe 1. No cartão, em até 12x sem juros.',
  },
}

interface Props {
  appliedCoupon: string | null
  couponStatus: QuoteCoupon | null | undefined
  onApplyCoupon: (code: string | null) => void
  /** Na regularização não há cupom: o valor é o da cobrança em aberto. */
  showCoupon?: boolean
  /** As formas de pagamento que valem aqui; sem a lista, as três. */
  allowedMethods?: CheckoutBillingType[]
  /** Ciclo de cobrança: só aparece quando há ciclo a escolher. */
  cycle?: Cycle
  cycleOptions?: Cycle[]
  onCycleChange?: (cycle: Cycle) => void
  /** O parcelamento do anual no cartão, como o orçamento o oferece. */
  installments?: QuoteResult['installments']
  installmentCount?: number
  onInstallmentCountChange?: (count: number) => void
}

/**
 * Etapa 3 — o pagamento.
 *
 * As decisões de cobrança vêm nesta ordem, cada uma com o seu rótulo: a forma
 * de pagamento, que governa as outras; o ciclo; e o parcelamento, que só
 * existe no anual no cartão e começa em 1x. Escolher não cobra nada: o cartão
 * é digitado na fatura do Asaas, para onde "Realizar pagamento" leva.
 */
export function PaymentStep({
  appliedCoupon,
  couponStatus,
  onApplyCoupon,
  showCoupon = true,
  allowedMethods,
  cycle,
  cycleOptions,
  onCycleChange,
  installments,
  installmentCount = 1,
  onInstallmentCountChange,
}: Props) {
  const [couponInput, setCouponInput] = useState(appliedCoupon ?? '')
  const { control } = useFormContext()
  const billingType = useWatch({ control, name: 'billingType' })

  const options = PAYMENT_METHOD_OPTIONS.filter(
    (m) => !allowedMethods || allowedMethods.includes(m.value),
  ).map((m) => ({
    value: m.value,
    label: m.label,
    description: m.hint,
    icon: ICONS[m.value],
  }))

  const showCycle = !!onCycleChange && (cycleOptions?.length ?? 0) > 0
  const showInstallments =
    !!onInstallmentCountChange &&
    cycle === 'YEARLY' &&
    billingType === 'CREDIT_CARD' &&
    !!installments?.allowed &&
    installments.options.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pagamento</CardTitle>
        <p className="text-sm text-gray-600">
          Ao confirmar, você vai para a fatura para concluir o pagamento. Seu
          acesso é liberado assim que a contratação é registrada.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Forma de pagamento</p>
          <FormToggleCard
            name="billingType"
            options={options}
            groupClassName="flex-wrap"
          />
        </div>

        {showCycle && (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Ciclo de cobrança</p>
            <ToggleGroup
              type="single"
              value={cycle}
              onValueChange={(value) => {
                if (value) onCycleChange!(value as Cycle)
              }}
              className="gap-4 w-full flex-wrap"
            >
              {cycleOptions!.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="w-full h-full bg-white rounded-lg data-[state=on]:bg-brand-50 border data-[state=on]:border-brand-200 hover:bg-white [&_.check-icon]:data-[state=on]:bg-brand [&_.check-icon]:data-[state=on]:border-brand"
                >
                  <div className="flex items-center justify-between gap-1 py-3 w-full">
                    <div className="text-start">
                      <p className="text-brand-800">{CYCLES[option].label}</p>
                      <p className="text-brand font-normal">
                        {CYCLES[option].description}
                      </p>
                    </div>
                    <span className="flex items-center justify-center h-4 min-w-4 rounded-full bg-white text-white border border-gray-300 check-icon transition-colors">
                      <IconCheck size={11} className="stroke-[4px]" />
                    </span>
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {showInstallments && (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Parcelamento</p>
            <Select
              value={String(installmentCount)}
              onValueChange={(value) =>
                onInstallmentCountChange!(Number(value))
              }
            >
              <SelectTrigger aria-label="Parcelamento" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {installments!.options.map((option) => (
                  <SelectItem key={option.count} value={String(option.count)}>
                    {option.count === 1
                      ? `À vista: ${formatCurrencyToBrl(option.amountCents)}`
                      : `${option.count}x de ${formatCurrencyToBrl(option.amountCents)} sem juros`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showCoupon && (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Cupom de desconto</p>
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Digite o cupom"
                aria-label="Cupom de desconto"
                className="uppercase"
              />
              {appliedCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCouponInput('')
                    onApplyCoupon(null)
                  }}
                >
                  Remover
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!couponInput.trim()}
                  onClick={() => onApplyCoupon(couponInput.trim())}
                >
                  Aplicar
                </Button>
              )}
            </div>
            {couponStatus?.applied && (
              <p className="text-sm text-brand-700">
                Cupom {couponStatus.code} aplicado à primeira cobrança.
              </p>
            )}
            {couponStatus && !couponStatus.applied && (
              <p className="text-sm text-error-600" role="alert">
                {couponStatus.reason === 'MIN_VALUE'
                  ? 'Este cupom exige um valor mínimo de contratação maior.'
                  : couponStatus.message || 'Cupom inválido ou expirado.'}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

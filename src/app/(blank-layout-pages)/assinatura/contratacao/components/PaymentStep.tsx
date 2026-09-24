'use client'

import { useController, useFormContext } from 'react-hook-form'
import { IconBarcode, IconCreditCard } from '@tabler/icons-react'
import { IconPix } from '@/assets/icons/CustomIcons'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrencyToBrl } from '@/lib/utils'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'
import type { CheckoutBillingType, QuoteResult } from '@/types/checkout'

import {
  CheckoutSection,
  ChoiceCard,
  GroupTitle,
  SectionNote,
} from '../../components/checkout/CheckoutLayout'

const ICONS = {
  CREDIT_CARD: <IconCreditCard />,
  PIX: <IconPix />,
  BOLETO: <IconBarcode />,
} as const

type Cycle = 'MONTHLY' | 'YEARLY'

interface Props {
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
 * Etapa 3 — o pagamento, no desenho do protótipo.
 *
 * As decisões de cobrança vêm na ordem em que dependem umas das outras: a
 * forma de pagamento; o ciclo, que chega marcado com o escolhido nos planos;
 * e o parcelamento, que só existe no anual no cartão e começa em 1x. Escolher
 * não cobra nada: o cartão é digitado na fatura segura, para onde "Realizar
 * pagamento" leva.
 */
export function PaymentStep({
  allowedMethods,
  cycle,
  cycleOptions,
  onCycleChange,
  installments,
  installmentCount = 1,
  onInstallmentCountChange,
}: Props) {
  const { control } = useFormContext()
  const { field } = useController({ control, name: 'billingType' })
  const billingType = field.value as CheckoutBillingType

  const methods = PAYMENT_METHOD_OPTIONS.filter(
    (m) => !allowedMethods || allowedMethods.includes(m.value),
  )
  const showCycle = !!onCycleChange && (cycleOptions?.length ?? 0) > 1
  const showInstallments =
    !!onInstallmentCountChange &&
    cycle === 'YEARLY' &&
    billingType === 'CREDIT_CARD' &&
    !!installments?.allowed &&
    installments.options.length > 1

  return (
    <CheckoutSection title="Pagamento" id="section-pagamento">
      <SectionNote>
        A cobrança acontece ao confirmar a contratação: você conclui o pagamento
        na fatura segura, para onde é levado no fim desta etapa.
      </SectionNote>

      <div className="flex flex-col gap-2.5">
        <GroupTitle id="forma-pagamento-titulo">Forma de pagamento</GroupTitle>
        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-labelledby="forma-pagamento-titulo"
        >
          {methods.map((method) => (
            <ChoiceCard
              key={method.value}
              name="billingType"
              value={method.value}
              checked={billingType === method.value}
              onSelect={(value) => field.onChange(value)}
              icon={ICONS[method.value]}
              title={method.label}
              description={
                method.value === 'CREDIT_CARD' && cycle === 'YEARLY'
                  ? 'Renovação automática a cada ano.'
                  : method.hint
              }
            />
          ))}
        </div>
      </div>

      {showCycle && (
        <div className="flex flex-col gap-2.5">
          <GroupTitle id="ciclo-cobranca-titulo">Ciclo de cobrança</GroupTitle>
          <div
            className="flex flex-col gap-3 sm:flex-row"
            role="radiogroup"
            aria-labelledby="ciclo-cobranca-titulo"
          >
            {cycleOptions!.includes('MONTHLY') && (
              <ChoiceCard
                name="billingCycle"
                value="MONTHLY"
                className="flex-1"
                checked={cycle === 'MONTHLY'}
                onSelect={() => onCycleChange!('MONTHLY')}
                title="Mensal"
                description="Cobrança todo mês"
              />
            )}
            {cycleOptions!.includes('YEARLY') && (
              <ChoiceCard
                name="billingCycle"
                value="YEARLY"
                className="flex-1"
                checked={cycle === 'YEARLY'}
                onSelect={() => onCycleChange!('YEARLY')}
                title="Anual"
                description="Pague 11 meses, ganhe 1 grátis"
                badge="1 mês grátis"
              />
            )}
          </div>
        </div>
      )}

      {showInstallments && (
        <div className="flex flex-col gap-2.5">
          <GroupTitle id="parcelamento-titulo">Parcelamento</GroupTitle>
          <Select
            value={String(installmentCount)}
            onValueChange={(value) => onInstallmentCountChange!(Number(value))}
          >
            <SelectTrigger
              aria-labelledby="parcelamento-titulo"
              className="w-full"
            >
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
    </CheckoutSection>
  )
}

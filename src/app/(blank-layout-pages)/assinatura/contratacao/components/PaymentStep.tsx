'use client'

import { useState } from 'react'
import { IconBarcode, IconCreditCard } from '@tabler/icons-react'
import { IconPix } from '@/assets/icons/CustomIcons'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'
import type { QuoteCoupon } from '@/types/checkout'

const ICONS = {
  CREDIT_CARD: IconCreditCard,
  PIX: IconPix,
  BOLETO: IconBarcode,
} as const

interface Props {
  appliedCoupon: string | null
  couponStatus: QuoteCoupon | null | undefined
  onApplyCoupon: (code: string | null) => void
  /** Na regularização não há cupom: o valor é o da cobrança em aberto. */
  showCoupon?: boolean
}

/**
 * Etapa 3 — o pagamento.
 *
 * Escolher a forma não cobra nada. O cartão é digitado na fatura do Asaas,
 * para onde "Realizar pagamento" leva; aqui só se escolhe como pagar.
 */
export function PaymentStep({
  appliedCoupon,
  couponStatus,
  onApplyCoupon,
  showCoupon = true,
}: Props) {
  const [couponInput, setCouponInput] = useState(appliedCoupon ?? '')

  const options = PAYMENT_METHOD_OPTIONS.map((m) => ({
    value: m.value,
    label: m.label,
    description: m.hint,
    icon: ICONS[m.value],
  }))

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

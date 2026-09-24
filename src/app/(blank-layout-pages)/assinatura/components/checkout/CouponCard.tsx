'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input-uncontrolled'
import { Label } from '@/components/ui/label'
import type { QuoteCoupon } from '@/types/checkout'

interface Props {
  appliedCoupon: string | null
  couponStatus: QuoteCoupon | null | undefined
  onApply: (code: string | null) => void
}

/**
 * O cupom, ao lado do resumo na etapa do pagamento. Vale só para a primeira
 * cobrança; quem diz se valeu é o orçamento do servidor.
 */
export function CouponCard({ appliedCoupon, couponStatus, onApply }: Props) {
  const [code, setCode] = useState(appliedCoupon ?? '')

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contratacao-coupon">Cupom de desconto</Label>
        <div className="flex gap-2">
          <Input
            id="contratacao-coupon"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Digite o código"
            autoComplete="off"
            className="flex-1 uppercase placeholder:normal-case"
          />
          {appliedCoupon ? (
            <Button
              type="button"
              variant="neutralOutline"
              className="flex-none"
              onClick={() => {
                setCode('')
                onApply(null)
              }}
            >
              Remover
            </Button>
          ) : (
            <Button
              type="button"
              variant="neutralOutline"
              className="flex-none"
              onClick={() => code.trim() && onApply(code.trim())}
            >
              Aplicar
            </Button>
          )}
        </div>
        <p className="min-h-[14px] text-xs" aria-live="polite">
          {couponStatus?.applied ? (
            <span className="text-brand-600">
              Cupom {couponStatus.code} aplicado à primeira cobrança.
            </span>
          ) : couponStatus ? (
            <span className="text-error-700">
              {couponStatus.reason === 'MIN_VALUE'
                ? 'Este cupom exige um valor mínimo de contratação maior.'
                : couponStatus.message || 'Cupom inválido ou expirado.'}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  )
}

'use client'

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'

// Types
import {
  paymentMethodLabel,
  type PaymentPart,
  type PaymentMethod,
} from '../types'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

export const allPaymentMethods: PaymentMethod[] = ['CASH', 'PIX', 'CARD']

// Taxa do cartão: o recebimento entra líquido, pela mesma regra que o
// financeiro já usa (FC-10). Vem da configuração da empresa.
export const CARD_FEE = 0.04

// A conta do recebimento, usada pelo caixa (receber a venda) e pelo vendedor
// (cobrar a venda rápida na hora). Uma só, para as duas telas não divergirem.
export function usePaymentSplit(remaining: number) {
  const [amounts, setAmounts] = useState<Record<PaymentMethod, number>>({
    CASH: remaining,
    PIX: 0,
    CARD: 0,
  })

  const received = allPaymentMethods.reduce(
    (total, method) => total + amounts[method],
    0,
  )

  // No balcão, o cliente entrega uma nota maior: o troco é a diferença entre
  // o que ele deu e o que faltava
  const change = Math.max(0, received - remaining)
  const missing = Math.max(0, remaining - received)
  const fee = Math.round(amounts.CARD * CARD_FEE)

  // O troco sai do dinheiro: o que entra no caixa é o valor da venda
  const parts = (): PaymentPart[] =>
    allPaymentMethods
      .filter((method) => amounts[method] > 0)
      .map((method) => {
        const amount =
          method === 'CASH' ? amounts.CASH - change : amounts[method]

        return {
          method,
          amount,
          netAmount: method === 'CARD' ? amount - fee : amount,
        }
      })
      .filter((part) => part.amount > 0)

  // O caso comum é receber tudo em dinheiro: já vem preenchido, e quem divide
  // o pagamento muda daí
  const reset = (value: number, method: PaymentMethod = 'CASH') =>
    setAmounts({ CASH: 0, PIX: 0, CARD: 0, [method]: value })

  const setAmount = (method: PaymentMethod, value: number) =>
    setAmounts((current) => ({ ...current, [method]: value }))

  return {
    amounts,
    setAmount,
    reset,
    received,
    change,
    missing,
    fee,
    parts,
  }
}

type Split = ReturnType<typeof usePaymentSplit>

export function PaymentSplitFields({
  split,
  methods = allPaymentMethods,
}: {
  split: Split
  methods?: PaymentMethod[]
}) {
  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <div key={method} className="flex items-center gap-3">
          <label
            htmlFor={`amount-${method}`}
            className="w-28 text-sm font-medium"
          >
            {paymentMethodLabel[method]}
          </label>
          <Input
            id={`amount-${method}`}
            type="number"
            min={0}
            step="0.01"
            startAdornment={<span className="text-sm">R$</span>}
            value={(split.amounts[method] / 100).toFixed(2)}
            onChange={(event) =>
              split.setAmount(
                method,
                Math.round(Number(event.target.value || 0) * 100),
              )
            }
          />
        </div>
      ))}
      {methods.length > 1 && (
        <p className="text-sm text-gray">
          Para dividir o pagamento, preencha mais de uma forma. Cada parte vai
          para a sua conta.
        </p>
      )}
    </div>
  )
}

export function PaymentSplitSummary({ split }: { split: Split }) {
  const { received, fee, missing, change } = split

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray">Recebido</span>
        <span className="font-medium">{money(received)}</span>
      </div>
      {fee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray">
            Taxa do cartão ({(CARD_FEE * 100).toFixed(0)}%)
          </span>
          <span className="font-medium text-error-600">− {money(fee)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-2">
        <span className="font-medium">
          {missing > 0 ? 'Ainda falta' : 'Troco'}
        </span>
        <span
          className={cn(
            'text-lg font-semibold',
            missing > 0 ? 'text-error-600' : 'text-gray-900',
          )}
        >
          {money(missing > 0 ? missing : change)}
        </span>
      </div>
      {fee > 0 && (
        <p className="text-sm text-gray">
          O cartão entra líquido na conta, como no resto do financeiro.
        </p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { IconPlus, IconTrash, IconCash } from '@tabler/icons-react'

export interface Pagamento {
  tipo: string
  valor: number
}

interface NfcePaymentSectionProps {
  pagamentos: Pagamento[]
  onChangePagamentos: (pags: Pagamento[]) => void
  totalNota: number
  valorTroco: number
  onChangeValorTroco: (troco: number) => void
}

export const PAYMENT_METHODS = [
  { value: '01', label: 'Dinheiro' },
  { value: '02', label: 'Cheque' },
  { value: '03', label: 'Cartão de Crédito' },
  { value: '04', label: 'Cartão de Débito' },
  { value: '05', label: 'Crédito Loja' },
  { value: '10', label: 'Vale Alimentação' },
  { value: '11', label: 'Vale Refeição' },
  { value: '12', label: 'Vale Presente' },
  { value: '13', label: 'Vale Combustível' },
  { value: '15', label: 'Boleto Bancário' },
  { value: '17', label: 'PIX' },
  { value: '99', label: 'Outros' },
]

export function NfcePaymentSection({
  pagamentos,
  onChangePagamentos,
  totalNota,
  valorTroco,
  onChangeValorTroco,
}: NfcePaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState('01')
  const [paymentValue, setPaymentValue] = useState('')

  const handleAddPayment = () => {
    const val = parseFloat(paymentValue.replace(/\./g, '').replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      return
    }

    const newPagamentos = [...pagamentos, { tipo: selectedMethod, valor: val }]
    onChangePagamentos(newPagamentos)
    setPaymentValue('')

    // Recalculate troco
    const totalPago = newPagamentos.reduce((acc, p) => acc + p.valor, 0)
    if (totalPago > totalNota) {
      onChangeValorTroco(Number((totalPago - totalNota).toFixed(2)))
    } else {
      onChangeValorTroco(0)
    }
  }

  const handleRemovePayment = (index: number) => {
    const newPagamentos = pagamentos.filter((_, i) => i !== index)
    onChangePagamentos(newPagamentos)

    // Recalculate troco
    const totalPago = newPagamentos.reduce((acc, p) => acc + p.valor, 0)
    if (totalPago > totalNota) {
      onChangeValorTroco(Number((totalPago - totalNota).toFixed(2)))
    } else {
      onChangeValorTroco(0)
    }
  }

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0)
  const restante = Math.max(0, totalNota - totalPago)

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-2.5 py-4 bg-white border-b border-gray-100">
        <FeaturedIcon variant="successOutline" Icon={IconCash} />
        <div className="flex-1">
          <CardTitle className="text-gray-700 font-semibold text-base">
            Forma de Pagamento
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="space-y-4">
          {/* Payment Form Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Meio de Pagamento</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger
                  id="payment-method"
                  className="h-10 border-gray-200"
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-value">Valor a Pagar (R$)</Label>
              <Input
                id="payment-value"
                type="text"
                inputMode="decimal"
                placeholder={
                  restante > 0 ? restante.toFixed(2).replace('.', ',') : '0,00'
                }
                value={paymentValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  if (raw === '') {
                    setPaymentValue('')
                    return
                  }
                  const num = Number(raw) / 100
                  setPaymentValue(
                    num.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  )
                }}
                onFocus={(e) => {
                  e.target.select()
                }}
              />
            </div>

            <Button
              type="button"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              onClick={handleAddPayment}
              className="w-full h-10"
            >
              Adicionar Pagamento
            </Button>
          </div>

          {/* Payments list */}
          {pagamentos.length > 0 && (
            <div className="mt-4 border rounded-lg divide-y bg-gray-50/50">
              {pagamentos.map((pag, idx) => {
                const label =
                  PAYMENT_METHODS.find((m) => m.value === pag.tipo)?.label ||
                  'Outro'
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <span className="font-medium text-gray-700">{label}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(pag.valor)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(idx)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Payment Summary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 font-medium uppercase">
                Total da Nota
              </div>
              <div className="text-base font-semibold text-gray-900 mt-1">
                {formatCurrency(totalNota)}
              </div>
            </div>
            <div className="p-3 bg-green-50/40 rounded-lg">
              <div className="text-xs text-green-700 font-medium uppercase">
                Total Pago
              </div>
              <div className="text-base font-bold text-green-700 mt-1">
                {formatCurrency(totalPago)}
              </div>
            </div>
            <div className="p-3 bg-blue-50/40 rounded-lg">
              <div className="text-xs text-blue-700 font-medium uppercase">
                Restante
              </div>
              <div className="text-base font-bold text-blue-700 mt-1">
                {formatCurrency(restante)}
              </div>
            </div>
            <div className="p-3 bg-amber-50/40 rounded-lg">
              <div className="text-xs text-amber-700 font-medium uppercase">
                Troco
              </div>
              <div className="text-base font-bold text-amber-700 mt-1">
                {formatCurrency(valorTroco)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

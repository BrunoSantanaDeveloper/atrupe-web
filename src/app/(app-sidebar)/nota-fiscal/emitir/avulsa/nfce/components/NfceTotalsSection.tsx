'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { IconCalculator } from '@tabler/icons-react'

interface NfceTotalsSectionProps {
  subtotal: number
  descontos: number
  totalNota: number
  totalPago: number
  troco: number
}

export function NfceTotalsSection({
  subtotal,
  descontos,
  totalNota,
  totalPago,
  troco,
}: NfceTotalsSectionProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <Card className="border-gray-200 shadow-sm sticky top-6">
      <CardHeader className="flex flex-row items-center space-x-2.5 pb-4">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
          <IconCalculator size={20} />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Resumo dos Totais
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Subtotal Itens</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total Descontos</span>
          <span className="font-medium text-red-600">
            -{formatCurrency(descontos)}
          </span>
        </div>

        <div className="h-px bg-gray-150 my-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            Valor Total da Nota
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(totalNota)}
          </span>
        </div>

        <div className="h-px bg-gray-150 my-2" />

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Valor Recebido</span>
          <span className="font-medium text-green-700">
            {formatCurrency(totalPago)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Valor Troco</span>
          <span className="font-medium text-amber-700">
            {formatCurrency(troco)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

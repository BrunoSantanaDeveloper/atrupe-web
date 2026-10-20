'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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
    <Card className="border-none shadow-sm overflow-hidden sticky top-6">
      <CardHeader className="flex flex-row items-center space-x-2.5 py-4 bg-white border-b border-gray-100">
        <FeaturedIcon tone="neutral" Icon={IconCalculator} />
        <div>
          <CardTitle>Resumo dos Totais</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 p-6 pt-4">
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

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            Valor total da nota
          </span>
          <span className="type-kpi-value">{formatCurrency(totalNota)}</span>
        </div>

        <Separator className="my-2" />

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

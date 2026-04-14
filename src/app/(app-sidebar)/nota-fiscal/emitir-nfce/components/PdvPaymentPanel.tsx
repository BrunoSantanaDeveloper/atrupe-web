'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import { IconCash, IconPlus, IconTrash } from '@tabler/icons-react'

// Types
import type { Pagamento } from './pdv-types'
import { PAYMENT_TYPES, formatBRL } from './pdv-types'

interface PdvPaymentPanelProps {
  pagamentos: Pagamento[]
  onAddPagamento: (pagamento: Pagamento) => void
  onRemovePagamento: (index: number) => void
}

export function PdvPaymentPanel({
  pagamentos,
  onAddPagamento,
  onRemovePagamento,
}: PdvPaymentPanelProps) {
  const [pagTipo, setPagTipo] = useState('01')
  const [pagValor, setPagValor] = useState('')

  const addPagamento = useCallback(() => {
    const valor = parseFloat(pagValor)
    if (!valor || valor <= 0) {
      toast.error('Informe o valor do pagamento.')
      return
    }

    const payType = PAYMENT_TYPES.find((p) => p.value === pagTipo)
    onAddPagamento({ tipo: pagTipo, valor, label: payType?.label || pagTipo })
    setPagValor('')
  }, [pagTipo, pagValor, onAddPagamento])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconCash className="h-5 w-5" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Forma</Label>
          <Select value={pagTipo} onValueChange={setPagTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valor (R$)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={pagValor}
            onChange={(e) => setPagValor(e.target.value)}
            placeholder="0,00"
            onKeyDown={(e) => e.key === 'Enter' && addPagamento()}
          />
        </div>
        <Button
          variant="neutralOutline"
          size="sm"
          className="w-full"
          onClick={addPagamento}
        >
          <IconPlus className="h-4 w-4 mr-1" />
          Adicionar Pagamento
        </Button>

        {pagamentos.length > 0 && (
          <div className="space-y-2 pt-2">
            {pagamentos.map((pag, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-2"
              >
                <span>{pag.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {formatBRL(pag.valor)}
                  </span>
                  <Button
                    variant="ghost"
                    size="iconXs"
                    onClick={() => onRemovePagamento(idx)}
                    className="text-error-500 hover:text-error-700"
                    aria-label="Remover pagamento"
                  >
                    <IconTrash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

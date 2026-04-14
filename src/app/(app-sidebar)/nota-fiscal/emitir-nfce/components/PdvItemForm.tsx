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

// Icons
import { IconPlus, IconShoppingCart } from '@tabler/icons-react'

// Types
import type { PdvItem } from './pdv-types'

interface PdvItemFormProps {
  onAddItem: (item: PdvItem) => void
  itemCount: number
}

export function PdvItemForm({ onAddItem, itemCount }: PdvItemFormProps) {
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ncm, setNcm] = useState('00000000')
  const [cfop, setCfop] = useState('5102')
  const [qtd, setQtd] = useState('1')
  const [valor, setValor] = useState('')
  const [desconto, setDesconto] = useState('0')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const addItem = useCallback(() => {
    if (!descricao) {
      toast.error('Informe a descrição do produto.')
      return
    }
    const parsedValor = parseFloat(valor)
    const parsedQtd = parseFloat(qtd)
    const parsedDesconto = parseFloat(desconto) || 0

    if (!parsedValor || parsedValor <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    if (!parsedQtd || parsedQtd <= 0) {
      toast.error('Informe uma quantidade válida.')
      return
    }

    const newItem: PdvItem = {
      id: crypto.randomUUID(),
      productId: codigo || `PDV-${Date.now()}`,
      codigo: codigo || `PDV-${itemCount + 1}`,
      descricao,
      ncm: ncm || '00000000',
      cfop: cfop || '5102',
      unidade: 'UN',
      quantidade: parsedQtd,
      valorUnitario: parsedValor,
      valorDesconto: parsedDesconto,
      valorTotal: parsedQtd * parsedValor,
    }

    onAddItem(newItem)
    setCodigo('')
    setDescricao('')
    setQtd('1')
    setValor('')
    setDesconto('0')

    toast.success(`${newItem.descricao} adicionado.`)
  }, [codigo, descricao, ncm, cfop, qtd, valor, desconto, itemCount, onAddItem])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconShoppingCart className="h-5 w-5" />
          Adicionar Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Código</Label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Cód."
            />
          </div>
          <div className="col-span-2 md:col-span-1 space-y-1">
            <Label className="text-xs">Descrição *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Nome do produto"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
        </div>
        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              <Label className="text-xs">NCM</Label>
              <Input
                value={ncm}
                onChange={(e) => setNcm(e.target.value)}
                placeholder="00000000"
                maxLength={8}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CFOP</Label>
              <Input
                value={cfop}
                onChange={(e) => setCfop(e.target.value)}
                placeholder="5102"
                maxLength={4}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="space-y-1">
            <Label className="text-xs">Qtd *</Label>
            <Input
              type="number"
              min={0.001}
              step="1"
              value={qtd}
              onChange={(e) => setQtd(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Valor Unit. *</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Desconto</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? 'Ocultar Avançado' : 'Avançado (NCM/CFOP)'}
          </Button>
          <Button className="flex-1" variant="default" onClick={addItem}>
            <IconPlus className="h-4 w-4 mr-1" />
            Adicionar Item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

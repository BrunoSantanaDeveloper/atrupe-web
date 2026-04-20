'use client'

import { useState, useEffect } from 'react'

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NfePrepareItem
  onSave: (updatedItem: NfePrepareItem) => void
}

export function InvoiceItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: Props) {
  const [formData, setFormData] = useState<NfePrepareItem>(item)

  useEffect(() => {
    setFormData(item)
  }, [item, open])

  const updateField = (field: keyof NfePrepareItem, value: number) => {
    const newData = { ...formData, [field]: value }

    // Recalculate total
    // Total = (Qty * UnitValue) - Discount + Freight + Insurance
    const quantity = field === 'quantity' ? value : formData.quantity
    const unitValue = field === 'unitValue' ? value : formData.unitValue
    const discount = field === 'discount' ? value : formData.discount
    const freight = field === 'freight' ? value : formData.freight
    const insurance = field === 'insurance' ? value : formData.insurance

    const total = quantity * unitValue - discount + freight + insurance
    newData.totalValue = Number(total.toFixed(2))

    setFormData(newData)
  }

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <div className="text-sm text-gray-500">
            {item.itemNumber} - {item.description}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Quantidade</Label>
            <Input
              id="edit-quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => updateField('quantity', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-unit-value">Valor Unitário (R$)</Label>
            <Input
              id="edit-unit-value"
              type="number"
              value={formData.unitValue}
              onChange={(e) => updateField('unitValue', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-discount">Desconto (R$)</Label>
            <Input
              id="edit-discount"
              type="number"
              value={formData.discount}
              onChange={(e) => updateField('discount', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-freight">Frete (R$)</Label>
            <Input
              id="edit-freight"
              type="number"
              value={formData.freight}
              onChange={(e) => updateField('freight', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-insurance">Seguro (R$)</Label>
            <Input
              id="edit-insurance"
              type="number"
              value={formData.insurance}
              onChange={(e) => updateField('insurance', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-total-value">Valor Total (Calc)</Label>
            <Input
              id="edit-total-value"
              type="number"
              value={formData.totalValue}
              disabled
              className="bg-gray-50 font-semibold text-gray-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

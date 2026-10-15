'use client'

// O mínimo do material e o ajuste de inventário pela contagem física (o
// motivo fica registrado; o custo médio não muda)

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Types
import type { StockItem } from '../types'

// Actions
import { adjustStock, setStockMinimum } from '@/actions/stock'

// Third-party
import { toast } from 'sonner'

export function StockItemDialog({
  item,
  mode,
  onDone,
  onOpenChange,
}: {
  item?: StockItem
  mode: 'minimum' | 'adjustment'
  onDone: () => void
  onOpenChange: (open: boolean) => void
}) {
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item) return
    setValue(String(mode === 'minimum' ? item.minimum : item.quantity))
    setReason('')
  }, [item, mode])

  const number = Number(value.replace(',', '.'))
  const valid = value !== '' && Number.isFinite(number) && number >= 0

  const save = async () => {
    if (!item) return
    setSaving(true)
    const res =
      mode === 'minimum'
        ? await setStockMinimum(item.id, number)
        : await adjustStock(item.id, number, reason)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(mode === 'minimum' ? 'Mínimo salvo' : 'Estoque ajustado')
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'minimum' ? 'Estoque mínimo' : 'Ajuste de inventário'}
          </DialogTitle>
          <DialogDescription>
            {item?.name}
            {item?.variation ? ` · ${item.variation}` : ''}
            {mode === 'adjustment'
              ? ` · hoje ${item?.quantity} ${item?.unit}. Informe o que foi contado: a diferença vira o ajuste.`
              : ' · abaixo dele, o material aparece em "Abaixo do mínimo".'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stock-value">
              {mode === 'minimum' ? 'Mínimo' : 'Quantidade contada'} (
              {item?.unit})
            </Label>
            <Input
              id="stock-value"
              type="number"
              min={0}
              step="0.01"
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          {mode === 'adjustment' && (
            <div className="space-y-2">
              <Label htmlFor="stock-reason">Motivo</Label>
              <Textarea
                id="stock-reason"
                rows={2}
                value={reason}
                placeholder="Ex.: perda de recorte, contagem do fim do mês"
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!valid || (mode === 'adjustment' && !reason.trim())}
            onClick={save}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

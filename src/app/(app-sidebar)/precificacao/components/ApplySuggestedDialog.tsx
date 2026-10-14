'use client'

// Aplicar o preço sugerido a vários itens de uma vez (CP-7, decisão do PO de
// 14/10/2026): abre com a prévia que a API calcula (preço e margem antes e
// depois, e o motivo de quem fica de fora) e só grava na confirmação

// React
import { useEffect, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { toast } from 'sonner'

// Types
import type { PricingGroup, SuggestedPriceItem } from '../types'

// Actions
import { applySuggestedPrices } from '@/actions/pricing'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Icons
import { IconWand } from '@tabler/icons-react'

interface Props {
  group: PricingGroup
  ids: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplied: () => void
}

const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const formatMargin = (margin: number | null) =>
  margin === null ? '-' : `${margin.toFixed(1).replace('.', ',')}%`

export function ApplySuggestedDialog({
  group,
  ids,
  open,
  onOpenChange,
  onApplied,
}: Props) {
  const [items, setItems] = useState<SuggestedPriceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // A prévia é refeita a cada abertura: o custo pode ter mudado
  useEffect(() => {
    if (!open || !ids.length) return
    let active = true
    setIsLoading(true)
    setError('')
    applySuggestedPrices({ group, ids, confirmed: false }).then((result) => {
      if (!active) return
      setIsLoading(false)
      if (result.success) setItems(result.data.items)
      else setError(result.message)
    })
    return () => {
      active = false
    }
  }, [open, group, ids])

  const toApply = items.filter(
    (item) => !item.skipped && item.suggestedPrice !== item.price,
  )

  const confirm = async () => {
    setIsSaving(true)
    const result = await applySuggestedPrices({ group, ids, confirmed: true })
    setIsSaving(false)
    if (!result.success) {
      toast.error(result.message)
      return
    }
    toast.success(
      result.data.applied === 1
        ? 'Preço sugerido aplicado a 1 item'
        : `Preço sugerido aplicado a ${result.data.applied} itens`,
    )
    onApplied()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[880px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconWand} />
            <div>
              <DialogTitle>Aplicar preço sugerido</DialogTitle>
              <DialogDescription>
                {group === 'products'
                  ? 'O preço passa a ser o da composição na medida padrão.'
                  : 'O preço passa a ser custo × markup, como preço variável: ele acompanha o custo e preserva o lucro desejado.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {ids.slice(0, 5).map((id) => (
                <Skeleton key={id} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-error-700">{error}</p>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[30%]">Item</TableHead>
                  <TableHead numeric>Custo</TableHead>
                  <TableHead numeric>Preço atual</TableHead>
                  <TableHead numeric>Preço sugerido</TableHead>
                  <TableHead numeric>Margem antes</TableHead>
                  <TableHead numeric>Margem depois</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(item.skipped && 'text-gray')}
                  >
                    <TableCell>
                      <p className="font-medium">{item.name || '-'}</p>
                      {item.skipped ? (
                        <p className="text-sm">{item.skipped}</p>
                      ) : item.suggestedPrice === item.price ? (
                        <p className="text-sm text-gray">
                          Já está no preço sugerido.
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell numeric>{formatValue(item.cost)}</TableCell>
                    <TableCell numeric>{formatValue(item.price)}</TableCell>
                    <TableCell numeric className="font-medium">
                      {formatValue(item.suggestedPrice)}
                    </TableCell>
                    <TableCell numeric>
                      {formatMargin(item.marginBefore)}
                    </TableCell>
                    <TableCell numeric>
                      {formatMargin(item.marginAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={confirm}
            disabled={isLoading || !!error || !toApply.length}
            isLoading={isSaving}
          >
            {toApply.length === 1
              ? 'Aplicar a 1 item'
              : `Aplicar a ${toApply.length} itens`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

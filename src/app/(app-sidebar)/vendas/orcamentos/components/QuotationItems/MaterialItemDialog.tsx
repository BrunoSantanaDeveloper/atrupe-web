'use client'

// O material de venda direta como item do orçamento (ORG-1, 06/10/2026): o
// vendedor escolhe a variação (marca · cor), se houver, e a quantidade; o
// item nasce com a unidade e o preço do material. Serve para criar e para
// editar a quantidade. Vai para a API (Fase 4.4): o servidor calcula o
// valor pelo preço de hoje do material.

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
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  addMaterialItem,
  updateMaterialItem,
  getDirectSaleMaterials,
} from '@/actions/material-item'
import { QUOTATION_DATA_QUERY_KEY } from '../../[quotationId]/components/Quotation'

// Types
import type { ComposedItemSummary } from '../../[quotationId]/composicao/types'

// Hooks / Store / Consts
import { useQuotation } from '@/contexts/quotationContext'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  open: boolean
  quotationId: string
  // O item de material em edição; vazio ao criar
  editing: ComposedItemSummary | null
  onClose: () => void
}

export function MaterialItemDialog({
  open,
  quotationId,
  editing,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const { quotationData, openChangeModal } = useQuotation()

  const materialId = editing?.materialId || quotationData.materialId || ''

  const { data: materialsRes } = useQuery({
    queryKey: ['direct-sale-materials'],
    queryFn: () => getDirectSaleMaterials(),
    enabled: open,
  })
  const material = materialsRes?.data.find((item) => item.id === materialId)

  const [quantity, setQuantity] = useState('1')
  const [variationId, setVariationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setQuantity(String(editing?.quantity || 1))
    setVariationId(editing?.variationId ?? null)
  }, [open, editing])

  const variation = material?.variations.find((item) => item.id === variationId)
  const unitPrice = variation?.price ?? material?.price ?? null
  const qty = Math.max(1, Math.floor(Number(quantity) || 0))
  const total = unitPrice === null ? null : Math.round(unitPrice * qty)
  const needsVariation = !!material?.variations.length && !variationId

  const save = async () => {
    if (!material) return
    setSaving(true)
    const res = editing
      ? await updateMaterialItem({
          itemId: editing.id,
          variationId,
          quantity: qty,
        })
      : await addMaterialItem({
          quotationId,
          materialId: material.id,
          variationId,
          quantity: qty,
        })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(editing ? 'Item editado' : 'Item adicionado')
    // O item e o total do orçamento voltam do servidor
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {material?.name || 'Material'}
            <Badge variant="warningLight">Material</Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Quantidade e variação do material
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!material ? (
            <p className="text-sm text-gray">Material não encontrado.</p>
          ) : (
            <>
              <p className="text-sm text-gray">
                Vendido por {material.unit} · {material.sector}
              </p>
              {material.variations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Variação</p>
                  <div
                    role="radiogroup"
                    aria-label="Variação"
                    className="flex flex-wrap gap-2"
                  >
                    {material.variations.map((item) => {
                      const selected = variationId === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={item.price === null}
                          title={
                            item.price === null ? 'Sem preço de venda' : ''
                          }
                          onClick={() => setVariationId(item.id)}
                          className={cn(
                            'h-10 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-50',
                            selected
                              ? 'border-brand bg-success-25 text-brand-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                          )}
                        >
                          {item.name}
                        </button>
                      )
                    })}
                  </div>
                  {needsVariation && (
                    <p className="text-xs text-gray">
                      Escolha a variação para o preço e o nome do item.
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="material-qty"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantidade ({material.unit})
                  </label>
                  <Input
                    id="material-qty"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
                <PermissionGate permissions={['values:values:view']}>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">
                      Preço por {material.unit}
                    </p>
                    <p className="flex h-10 items-center text-sm text-gray-900">
                      {unitPrice === null
                        ? 'escolha a variação'
                        : formatCurrencyToBrl(unitPrice)}
                    </p>
                  </div>
                </PermissionGate>
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col">
            <PermissionGate permissions={['values:values:view']}>
              <strong className="text-lg font-semibold text-gray-900">
                {total === null ? '-' : formatCurrencyToBrl(total)}
              </strong>
              <span className="text-sm font-medium text-gray-700">
                Valor final
              </span>
            </PermissionGate>
          </div>
          <div className="flex gap-4">
            {!editing && (
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconArrowLeft}
                onClick={() => openChangeModal(true, 'productsList')}
              >
                Voltar
              </Button>
            )}
            <Button type="button" variant="neutralOutline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              RightIcon={IconCircleCheck}
              isLoading={saving}
              disabled={!material || needsVariation || total === null}
              onClick={save}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

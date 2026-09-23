'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { InvoiceItem } from '../../types'

// Actions
import { matchInvoiceItem } from '@/actions/stock'
import { getMaterials } from '@/actions/materials'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconLink } from '@tabler/icons-react'

interface Props {
  invoiceId?: string
  item?: InvoiceItem
  open: boolean
  onOpenChange: () => void
}

// Conciliação de materiais (DC-9): o item chega descrito pelo fornecedor e
// precisa virar material interno, com o fator de conversão da unidade.
export function MatchItemModal({ invoiceId, item, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [materialId, setMaterialId] = useState('')
  const [factor, setFactor] = useState('1')

  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['materials'],
    queryFn: () => getMaterials({}),
  })

  const materials = data?.data || []
  const selected = materials.find((material) => material.id === materialId)

  useEffect(() => {
    setMaterialId(item?.materialId || '')
    setFactor(String(item?.conversionFactor || 1))
  }, [item])

  const converted = (item?.quantity || 0) * Number(factor || 1)
  const unitCost = converted
    ? Math.round(((item?.unitValue || 0) * (item?.quantity || 0)) / converted)
    : 0

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      matchInvoiceItem({
        invoiceId: invoiceId || '',
        itemId: item?.id || '',
        materialId,
        materialName: selected?.name || '',
        conversionFactor: Number(factor || 1),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Item vinculado ao material')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao vincular o item'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconLink} />
            <DialogTitle>Vincular item da nota</DialogTitle>
            <DialogDescription className="sr-only">
              Escolha o material interno e a conversão da unidade.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium">{item?.description}</p>
            <p className="text-sm text-gray">
              {item?.supplierCode} · {item?.quantity} {item?.supplierUnit} ·{' '}
              {formatCurrencyToBrl(item?.unitValue || 0)} cada
            </p>
          </div>

          <SelectBasic
            name="material"
            label="Material interno"
            value={materialId}
            onChange={setMaterialId}
            options={materials.map((material) => ({
              value: material.id,
              label: `${material.name} (${assetUnitShort[material.unit]})`,
            }))}
          />

          <div className="space-y-1.5">
            <label htmlFor="factor" className="text-sm font-medium">
              Conversão
            </label>
            <Input
              id="factor"
              type="number"
              min={0}
              step="0.01"
              value={factor}
              onChange={(event) => setFactor(event.target.value)}
            />
            <p className="text-sm text-gray">
              Quantos {selected ? assetUnitShort[selected.unit] : 'unidades'}{' '}
              cada {item?.supplierUnit} contém. Ex.: um rolo de lona com 76 m².
            </p>
          </div>

          {selected && (
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray">Entrada no estoque</p>
              <p className="text-lg font-semibold text-gray-900">
                {converted} {assetUnitShort[selected.unit]}
              </p>
              <p className="text-sm text-gray">
                Custo de entrada: {formatCurrencyToBrl(unitCost)} por{' '}
                {assetUnitShort[selected.unit]}
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!materialId || !factor}
            onClick={() => mutate()}
          >
            {isPending ? 'Vinculando...' : 'Vincular item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
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

// Types
import type { Material, MaterialVariation } from '../types'
import type { PricingItem } from '@/app/(app-sidebar)/precificacao/types'

// Actions
import { updateMaterialVariation } from '@/actions/materials'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { EditPriceModal } from '@/app/(app-sidebar)/precificacao/components/EditPriceModal'
import { materialUnitSymbol } from '@/actions/materials-data'

// Hooks / Store / Consts

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCurrencyReal } from '@tabler/icons-react'

interface Props {
  material?: Material
  open: boolean
  onOpenChange: () => void
}

// Custo e preço das variações, aberto pelo R$ da lista (05/10/2026). O custo
// nasce repetido e é alterado linha a linha (MT-3 e MT-4); o preço sai do modal
// de precificação. As marcas e cores são cadastradas na edição do material.
export function VariationsModal({ material, open, onOpenChange }: Props) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  // A variação sendo precificada, no mesmo modal da Precificação (DC-6)
  const [pricing, setPricing] = useState<PricingItem | undefined>()

  // O preço segue o padrão dos materiais (MT-3, PR-2): informa-se o custo e
  // o preço sai do modal de precificação, preço variável pelo markup ou fixo
  const pricingItemOf = (variation: MaterialVariation): PricingItem => ({
    id: `mat:${material?.id}:${variation.id}`,
    name: `${material?.name} · ${variation.brand} ${variation.color}`.trim(),
    code: material?.code || '',
    sector: material?.sector || '',
    unit: material ? materialUnitSymbol(material.unit) : '',
    cost: variation.cost,
    costUpdatedAt: null,
    rule: material?.priceRule || 'VARIABLE',
    price: variation.price,
    margin:
      variation.cost !== null && variation.price
        ? Math.round(
            ((variation.price - variation.cost) / variation.price) * 1000,
          ) / 10
        : null,
    status:
      variation.cost === null
        ? 'NO_COST'
        : !variation.price
          ? 'PENDING'
          : variation.price < variation.cost
            ? 'BELOW_COST'
            : 'PRICED',
  })

  // Custo e preço são alterados linha a linha, direto na tabela (MT-4). Em
  // branco, o valor fica sem definição
  const { mutate: updateValues } = useMutation({
    mutationFn: (values: {
      variationId: string
      cost: number | null
      price: number | null
    }) =>
      updateMaterialVariation({ materialId: material?.id || '', ...values }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Variação atualizada')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: () => toast.error('Erro ao atualizar a variação'),
  })
  const toCents = (value: string) =>
    value.trim() === ''
      ? null
      : Math.round(Number(value.replace(',', '.')) * 100)
  const toReais = (value: number | null) =>
    value === null ? '' : String(value / 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Custo e preço de {material?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Custo e preço de venda de cada variação do material.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <p className="text-sm text-gray">
            O custo é alterado direto na tabela. O preço de venda sai da
            precificação, pelo R$ de cada linha. Para incluir marcas e cores,
            use a edição do material.
          </p>

          {material && material.variations.length > 0 && (
            <div className="space-y-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[20%]">Marca</TableHead>
                    <TableHead className="w-[16%]">Cor</TableHead>
                    <TableHead className="w-[30%]">Custo</TableHead>
                    <TableHead numeric className="w-[24%]">
                      Preço de venda
                    </TableHead>
                    <TableHead className="w-[10%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {material.variations.map((variation) => (
                    <TableRow key={variation.id}>
                      <TableCell className="font-medium">
                        {variation.brand}
                      </TableCell>
                      <TableCell>{variation.color}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          startAdornment={<span className="text-sm">R$</span>}
                          aria-label={`Custo de ${variation.brand} ${variation.color}`}
                          title={
                            variation.cost === null ? '' : money(variation.cost)
                          }
                          defaultValue={toReais(variation.cost)}
                          onBlur={(event) => {
                            const cost = toCents(event.target.value)
                            if (cost !== variation.cost) {
                              updateValues({
                                variationId: variation.id,
                                cost,
                                price: variation.price,
                              })
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {variation.price === null ? (
                          <span className="text-sm text-gray">Sem preço</span>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">
                              {money(variation.price)}
                            </span>
                            {variation.cost !== null && (
                              <span className="block text-xs text-gray">
                                margem{' '}
                                {(
                                  ((variation.price - variation.cost) /
                                    variation.price) *
                                  100
                                )
                                  .toFixed(1)
                                  .replace('.', ',')}
                                %
                              </span>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionButton
                          Icon={IconCurrencyReal}
                          tooltip={`Precificar ${variation.brand} ${variation.color}`}
                          onClick={() => setPricing(pricingItemOf(variation))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      <EditPriceModal
        group="materials"
        item={pricing}
        open={!!pricing}
        onOpenChange={() => {
          setPricing(undefined)
          queryClient.invalidateQueries({ queryKey: ['materials'] })
        }}
      />
    </Dialog>
  )
}

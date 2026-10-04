'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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
import {
  createMaterialVariations,
  updateMaterialVariation,
} from '@/actions/materials'

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
import { IconPalette, IconCurrencyReal } from '@tabler/icons-react'

interface Props {
  material?: Material
  open: boolean
  onOpenChange: () => void
}

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

// Marca × cor formam o cruzamento; o custo nasce repetido e é alterado linha a
// linha (MT-3 e MT-4). Ao existir variação, o preço do material deixa de valer.
export function VariationsModal({ material, open, onOpenChange }: Props) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const [brands, setBrands] = useState('')
  const [colors, setColors] = useState('')
  const [cost, setCost] = useState('')
  // A variação sendo precificada, no mesmo modal da Precificação (DC-6)
  const [pricing, setPricing] = useState<PricingItem | undefined>()

  useEffect(() => {
    setBrands('')
    setColors('')
    setCost('')
  }, [material])

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

  const brandList = splitList(brands)
  const colorList = splitList(colors)
  const combinations = brandList.length * colorList.length

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createMaterialVariations({
        materialId: material?.id || '',
        brands: brandList,
        colors: colorList,
        cost: Math.round(Number(cost || 0) * 100),
        // O preço vem depois, pelo modal de precificação (MT-3)
        price: null,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(
        `${response.data} ${response.data === 1 ? 'variação criada' : 'variações criadas'}`,
      )
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao criar as variações'),
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
            <FeaturedIcon variant="neutralOutline" Icon={IconPalette} />
            <DialogTitle>Variações de {material?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Cadastre as marcas e cores do material.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <p className="text-sm text-gray">
            Informe as marcas e as cores separadas por vírgula. O sistema cria
            uma linha por combinação, com o mesmo valor, e você altera as que
            forem diferentes. A partir daí, a venda passa a exigir a escolha da
            variação.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="brands" className="text-sm font-medium">
                Marcas
              </label>
              <Input
                id="brands"
                value={brands}
                placeholder="Marca X, Marca Y"
                onChange={(event) => setBrands(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="colors" className="text-sm font-medium">
                Cores
              </label>
              <Input
                id="colors"
                value={colors}
                placeholder="Branca, Preta"
                onChange={(event) => setColors(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="variation-cost" className="text-sm font-medium">
                Custo de cada combinação
              </label>
              <Input
                id="variation-cost"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
            <p className="self-end pb-3 text-sm text-gray">
              O preço de venda de cada combinação sai da precificação, na tabela
              abaixo.
            </p>
          </div>

          {combinations > 0 && (
            <p className="text-sm text-gray">
              Serão criadas <strong>{combinations}</strong> combinações (
              {brandList.length} marcas × {colorList.length} cores).
            </p>
          )}

          {material && material.variations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Variações já cadastradas</p>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[20%]">Marca</TableHead>
                    <TableHead className="w-[16%]">Cor</TableHead>
                    <TableHead className="w-[30%]">Custo</TableHead>
                    <TableHead className="w-[24%] text-right">
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
          <Button
            isLoading={isPending}
            disabled={!combinations || !cost}
            onClick={() => mutate()}
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar variações'}
          </Button>
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

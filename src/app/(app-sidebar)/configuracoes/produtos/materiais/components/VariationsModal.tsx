'use client'

// React / Next
import { useEffect, useState } from 'react'
import { useMoney } from '@/hooks/useMoney'

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
import type { Material } from '../types'

// Actions
import { createMaterialVariations } from '@/actions/materials'

// Hooks / Store / Consts

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPalette } from '@tabler/icons-react'

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
  const [price, setPrice] = useState('')

  useEffect(() => {
    setBrands('')
    setColors('')
    setCost('')
    setPrice('')
  }, [material])

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
        price: price ? Math.round(Number(price) * 100) : null,
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
            <div className="space-y-1.5">
              <label htmlFor="variation-price" className="text-sm font-medium">
                Preço de venda (opcional)
              </label>
              <Input
                id="variation-price"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
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
                    <TableHead className="w-[34%]">Marca</TableHead>
                    <TableHead className="w-[30%]">Cor</TableHead>
                    <TableHead className="w-[18%] text-right">Custo</TableHead>
                    <TableHead className="w-[18%] text-right">
                      Preço de venda
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {material.variations.map((variation) => (
                    <TableRow key={variation.id}>
                      <TableCell className="font-medium">
                        {variation.brand}
                      </TableCell>
                      <TableCell>{variation.color}</TableCell>
                      <TableCell className="text-right">
                        {variation.cost === null ? '-' : money(variation.cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {variation.price === null
                          ? '-'
                          : money(variation.price)}
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
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!combinations || !cost}
            onClick={() => mutate()}
          >
            {isPending ? 'Criando...' : 'Criar variações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

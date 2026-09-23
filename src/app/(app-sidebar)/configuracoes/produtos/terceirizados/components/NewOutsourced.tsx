'use client'

// React / Next
import { useState } from 'react'

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

// Actions
import { createOutsourcedService } from '@/actions/outsourced'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort, assetUnitOptions } from '@/consts/assets'

// Types
import type { AssetUnit } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

// Cadastro prévio por fornecedor, serviço, unidade, custo e preço (D3 §11)
export function NewOutsourcedModal() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [supplier, setSupplier] = useState('')
  const [unit, setUnit] = useState<AssetUnit>('UN')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')

  const costValue = Math.round(Number(cost || 0) * 100)
  const priceValue = price ? Math.round(Number(price) * 100) : null
  const margin =
    priceValue && priceValue > 0
      ? Math.round(((priceValue - costValue) / priceValue) * 1000) / 10
      : null

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createOutsourcedService({
        name,
        supplier,
        unit: assetUnitShort[unit],
        cost: costValue,
        price: priceValue,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Serviço cadastrado')
      queryClient.invalidateQueries({ queryKey: ['outsourced'] })
      setName('')
      setSupplier('')
      setCost('')
      setPrice('')
      setOpen(false)
    },
    onError: () => toast.error('Erro ao cadastrar o serviço'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Novo terceirizado
      </Button>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Novo serviço terceirizado</DialogTitle>
            <DialogDescription className="sr-only">
              Cadastre o serviço contratado de terceiros.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="outsourced-name" className="text-sm font-medium">
              Serviço
            </label>
            <Input
              id="outsourced-name"
              value={name}
              placeholder="Ex.: Instalação em altura"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="outsourced-supplier"
              className="text-sm font-medium"
            >
              Fornecedor
            </label>
            <Input
              id="outsourced-supplier"
              value={supplier}
              placeholder="Quem presta o serviço"
              onChange={(event) => setSupplier(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectBasic
              name="unit"
              label="Unidade"
              value={unit}
              onChange={(value) => setUnit(value as AssetUnit)}
              options={assetUnitOptions}
            />
            <div className="space-y-1.5">
              <label htmlFor="outsourced-cost" className="text-sm font-medium">
                Custo
              </label>
              <Input
                id="outsourced-cost"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="outsourced-price" className="text-sm font-medium">
                Preço de venda
              </label>
              <Input
                id="outsourced-price"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
          </div>

          {margin !== null && (
            <p className="text-sm text-gray">
              Margem de {margin.toString().replace('.', ',')}% sobre o preço de{' '}
              {formatCurrencyToBrl(priceValue || 0)}.
            </p>
          )}

          <p className="text-sm text-gray">
            O serviço pode entrar num processo, num produto ou direto no
            orçamento. Ao aprovar a venda, ele gera previsão de despesa no
            financeiro.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !supplier || !cost}
            onClick={() => mutate()}
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar serviço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

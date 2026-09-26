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

// Types
import type { FormulaKey, ResourceKind } from '../../types'

// Actions
import { addProcessResource, getAvailableResources } from '@/actions/processes'

// Hooks / Store / Consts

import {
  formulaObj,
  formulaOptions,
  resourceKindOptions,
} from '@/consts/processes'

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  processId: string
}

// Só patrimônio detalhado entra como máquina (P-16) e o material entra pela
// variação (MT-5): a lista já chega assim da action.
export function AddResourceModal({ processId }: Props) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<ResourceKind>('MATERIAL')
  const [resourceId, setResourceId] = useState('')
  const [formula, setFormula] = useState<FormulaKey>('PER_AREA')
  const [quantity, setQuantity] = useState('1')
  const [lossPercent, setLossPercent] = useState('0')
  const [minimum, setMinimum] = useState('')
  // Terceirizado avulso: o que não tem valor fixo e não vale cadastrar
  // (T-4). Fornecedor e custo ficam no próprio recurso
  const [supplier, setSupplier] = useState('')
  const [description, setDescription] = useState('')
  const [unitCost, setUnitCost] = useState('')

  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['process-resources'],
    queryFn: () => getAvailableResources(),
  })

  const options = data?.data?.[kind] || []
  const selected = options.find((option) => option.id === resourceId)
  const isLoose = kind === 'OUTSOURCED' && resourceId === 'loose'

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addProcessResource({
        processId,
        resource: {
          kind,
          name: isLoose ? description : selected?.name || '',
          origin: isLoose ? supplier : selected?.origin || '',
          unit: isLoose ? 'un' : selected?.unit || '',
          unitCost: isLoose
            ? Math.round(Number(unitCost || 0) * 100)
            : (selected?.unitCost ?? null),
          formula,
          quantity: Number(quantity || 1),
          extraFieldId: null,
          lossPercent: Number(lossPercent || 0),
          minimum: minimum === '' ? null : Number(minimum),
        },
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Recurso acrescentado')
      queryClient.invalidateQueries({ queryKey: ['process', processId] })
      setResourceId('')
      setSupplier('')
      setDescription('')
      setUnitCost('')
      setOpen(false)
    },
    onError: () => toast.error('Erro ao acrescentar o recurso'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Novo recurso
      </Button>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Novo recurso no processo</DialogTitle>
            <DialogDescription className="sr-only">
              Escolha o recurso e como ele é consumido.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <SelectBasic
            name="kind"
            label="Tipo de recurso"
            value={kind}
            onChange={(value) => {
              setKind(value as ResourceKind)
              setResourceId('')
            }}
            options={resourceKindOptions}
          />
          <SelectBasic
            name="resource"
            label="Recurso"
            value={resourceId}
            onChange={setResourceId}
            options={[
              ...options.map((option) => ({
                value: option.id,
                label: `${option.name} — ${money(option.unitCost)}/${option.unit}`,
              })),
              ...(kind === 'OUTSOURCED'
                ? [{ value: 'loose', label: 'Terceirizado avulso' }]
                : []),
            ]}
          />
          {isLoose && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="loose-supplier" className="text-sm font-medium">
                  Fornecedor
                </label>
                <Input
                  id="loose-supplier"
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="loose-desc" className="text-sm font-medium">
                  O que está sendo terceirizado
                </label>
                <Input
                  id="loose-desc"
                  value={description}
                  placeholder="Ex.: dobra de chapa"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="loose-cost" className="text-sm font-medium">
                  Custo
                </label>
                <Input
                  id="loose-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={unitCost}
                  startAdornment={<span className="text-sm">R$</span>}
                  onChange={(event) => setUnitCost(event.target.value)}
                />
              </div>
            </div>
          )}
          <SelectBasic
            name="formula"
            label="Como é consumido"
            value={formula}
            onChange={(value) => setFormula(value as FormulaKey)}
            options={formulaOptions}
          />
          <p className="text-sm text-gray">{formulaObj[formula].help}</p>
          <div className="space-y-1.5">
            <label htmlFor="quantity" className="text-sm font-medium">
              Consumo por {selected?.unit || 'unidade'}
            </label>
            <Input
              id="quantity"
              type="number"
              min={0}
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="loss" className="text-sm font-medium">
                Perda (%)
              </label>
              <Input
                id="loss"
                type="number"
                min={0}
                step="1"
                value={lossPercent}
                onChange={(event) => setLossPercent(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="minimum" className="text-sm font-medium">
                Mínimo ({selected?.unit || 'unidade'})
              </label>
              <Input
                id="minimum"
                type="number"
                min={0}
                step="0.01"
                placeholder="Sem mínimo"
                value={minimum}
                onChange={(event) => setMinimum(event.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-gray">
            A perda soma ao consumo (a sobra do corte). O mínimo impede que a
            peça pequena saia com custo irreal — a madeira do banner usa 2,2 m
            por metro, mas nunca menos de 1 m.
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
            disabled={!resourceId || (isLoose && (!description || !unitCost))}
            onClick={() => mutate()}
          >
            {isPending ? 'Acrescentando...' : 'Acrescentar recurso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

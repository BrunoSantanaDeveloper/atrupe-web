'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { Material, MaterialUnit } from '../types'

// Actions
import { createMaterial, updateMaterial } from '@/actions/materials'

// Hooks / Store / Consts
import { assetUnitOptions } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil } from '@tabler/icons-react'

const sectors = [
  'Impressão',
  'Marcenaria',
  'Produção',
  'Serralheria',
  'Gráfica',
  'Almoxarifado',
].map((sector) => ({ value: sector, label: sector }))

const subcategories = [
  'Lonas',
  'Vinis',
  'Chapas',
  'Tintas',
  'Acabamentos',
  'Brindes',
].map((item) => ({ value: item, label: item }))

interface Props {
  // Com o material informado, o mesmo formulário edita em vez de cadastrar
  material?: Material
}

// Marca e cor entram depois, como variações (MT-2); espessura e tamanho viram
// materiais diferentes.
export function NewMaterialModal({ material }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(material)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(material?.name || '')
  const [sector, setSector] = useState(material?.sector || sectors[0].value)
  const [subcategory, setSubcategory] = useState(
    material?.subcategory || subcategories[0].value,
  )
  const [unit, setUnit] = useState<MaterialUnit>(material?.unit || 'M2')
  const [cost, setCost] = useState(
    material?.cost ? String(material.cost / 100) : '',
  )
  const [directSale, setDirectSale] = useState(material?.directSale ?? false)
  const [productionMaterial, setProductionMaterial] = useState(
    material?.productionMaterial ?? true,
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        sector,
        subcategory,
        unit,
        directSale,
        productionMaterial,
        cost: Math.round(Number(cost || 0) * 100),
      }

      return material
        ? updateMaterial({ id: material.id, ...values })
        : createMaterial(values)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(isEdit ? 'Material atualizado' : 'Material cadastrado')
      queryClient.invalidateQueries({ queryKey: ['materials'] })

      if (!isEdit) {
        setName('')
        setCost('')
      }

      setOpen(false)
    },
    onError: () =>
      toast.error(
        isEdit
          ? 'Erro ao atualizar o material'
          : 'Erro ao cadastrar o material',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <ActionButton
          Icon={IconPencil}
          tooltip={`Editar ${material?.name}`}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
          Novo material
        </Button>
      )}
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon
              variant="neutralOutline"
              Icon={isEdit ? IconPencil : IconPlus}
            />
            <DialogTitle>
              {isEdit ? 'Editar material' : 'Novo material'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Cadastre o insumo usado na composição dos produtos.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="material-name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="material-name"
                value={name}
                placeholder="Ex.: Lona 440"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <SelectBasic
              name="sector"
              label="Setor"
              value={sector}
              onChange={setSector}
              options={sectors}
            />
            <SelectBasic
              name="subcategory"
              label="Subcategoria"
              value={subcategory}
              onChange={setSubcategory}
              options={subcategories}
            />
            <SelectBasic
              name="unit"
              label="Unidade"
              value={unit}
              onChange={(value) => setUnit(value as MaterialUnit)}
              options={assetUnitOptions}
            />
            <div className="space-y-1.5">
              <label htmlFor="material-cost" className="text-sm font-medium">
                Custo por unidade
              </label>
              <Input
                id="material-cost"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium">Venda direta</p>
                <p className="text-sm text-gray">
                  Aparece na busca do orçamento para ser revendido.
                </p>
              </div>
              <Switch
                checked={directSale}
                onCheckedChange={setDirectSale}
                aria-label="Venda direta"
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium">Material de produção</p>
                <p className="text-sm text-gray">
                  Fica disponível para compor produtos e processos.
                </p>
              </div>
              <Switch
                checked={productionMaterial}
                onCheckedChange={setProductionMaterial}
                aria-label="Material de produção"
              />
            </div>
          </div>

          <p className="text-sm text-gray">
            Marca e cor entram depois, como variações. Espessuras e tamanhos
            diferentes são materiais diferentes.
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
            disabled={!name}
            onClick={() => mutate()}
          >
            {isEdit ? 'Salvar alterações' : 'Cadastrar material'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

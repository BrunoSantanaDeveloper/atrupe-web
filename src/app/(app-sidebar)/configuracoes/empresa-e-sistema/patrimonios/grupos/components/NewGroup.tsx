'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import type { AssetUnit } from '../../types'

// Actions
import { createAssetGroup } from '@/actions/asset'

// Hooks / Store / Consts
import { assetUnitOptions } from '@/consts/assets'
import { useSector } from '@/hooks/queries/useSector'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

export function NewGroupModal() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<AssetUnit>('KM')
  const [sectorId, setSectorId] = useState('')

  // Os setores do cadastro da empresa (os ativos), pelo id
  const { data: sectorsData } = useSector()
  const sectors = (sectorsData || [])
    .filter((sector) => sector.isActive)
    .map((sector) => ({ value: sector.id, label: sector.name }))

  const { mutate, isPending } = useMutation({
    mutationFn: () => createAssetGroup({ name, unit, sectorId }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Grupo criado')
      queryClient.invalidateQueries({ queryKey: ['asset-groups'] })
      setName('')
      setOpen(false)
    },
    onError: () => toast.error('Erro ao criar o grupo'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Novo grupo
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Novo grupo de bens</DialogTitle>
            <DialogDescription className="sr-only">
              Reúna bens equivalentes para usar como referência na composição.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="group-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="group-name"
              value={name}
              placeholder="Ex.: Impressoras de bobina"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <SelectBasic
            name="sector"
            label="Setor"
            value={sectorId}
            onChange={setSectorId}
            options={sectors}
            emptyMessage="Nenhum setor ativo"
          />
          <SelectBasic
            name="unit"
            label="Unidade"
            value={unit}
            onChange={(value) => setUnit(value as AssetUnit)}
            options={assetUnitOptions}
          />
          <p className="text-sm text-gray">
            Todos os bens do grupo precisam ter a mesma unidade e o mesmo setor.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !sectorId}
            onClick={() => mutate()}
          >
            Cadastrar grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

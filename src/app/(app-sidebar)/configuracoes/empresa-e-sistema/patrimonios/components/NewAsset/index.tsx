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
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { AssetKind, AssetUnit } from '../../types'

// Actions
import { createAsset } from '@/actions/assets'

// Hooks / Store / Consts
import {
  assetKindOptions,
  assetUnitShort,
  assetUnitOptions,
} from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  sectors: { value: string; label: string }[]
  groups: { value: string; label: string }[]
}

// Cadastro rápido em duas etapas (P-12): aqui só o essencial; vida útil,
// residual, custos e configurações ficam na página do bem.
export function NewAssetModal({ sectors, groups }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [detailed, setDetailed] = useState(true)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<AssetKind>('MACHINES')
  const [sector, setSector] = useState('')
  const [groupId, setGroupId] = useState('none')
  const [unit, setUnit] = useState<AssetUnit>('HR')
  const [productivity, setProductivity] = useState('')
  const [acquisitionDate, setAcquisitionDate] = useState('')
  const [acquisitionValue, setAcquisitionValue] = useState('')

  const reset = () => {
    setName('')
    setSector('')
    setGroupId('none')
    setProductivity('')
    setAcquisitionDate('')
    setAcquisitionValue('')
    setDetailed(true)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createAsset({
        name,
        kind,
        sector,
        detailed,
        groupId: groupId === 'none' ? null : groupId,
        unit: detailed ? unit : null,
        monthlyProductivity: detailed ? Number(productivity) || null : null,
        acquisitionDate,
        acquisitionValue: Math.round(Number(acquisitionValue || 0) * 100),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Patrimônio cadastrado')
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      reset()
      setOpen(false)
    },
    onError: () => toast.error('Erro ao cadastrar o patrimônio'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Novo patrimônio
      </Button>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Novo patrimônio</DialogTitle>
            <DialogDescription className="sr-only">
              Cadastro rápido do bem. Depreciação e custos são detalhados na
              página do patrimônio.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium">Detalhar custos deste bem</p>
              <p className="text-sm text-gray">
                Desligado, o bem entra só com a depreciação no custo do setor,
                sem unidade, produtividade ou configurações.
              </p>
            </div>
            <Switch
              checked={detailed}
              onCheckedChange={setDetailed}
              aria-label="Detalhar custos deste bem"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="asset-name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="asset-name"
                value={name}
                placeholder="Digite"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <SelectBasic
              name="kind"
              label="Agrupamento"
              value={kind}
              onChange={(value) => setKind(value as AssetKind)}
              options={assetKindOptions}
            />
            <SelectBasic
              name="sector"
              label="Setor"
              value={sector}
              onChange={setSector}
              options={sectors}
            />
            <div className="space-y-1.5">
              <label htmlFor="asset-date" className="text-sm font-medium">
                Data da aquisição
              </label>
              <Input
                id="asset-date"
                type="date"
                value={acquisitionDate}
                onChange={(event) => setAcquisitionDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-value" className="text-sm font-medium">
                Valor da aquisição
              </label>
              <Input
                id="asset-value"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={acquisitionValue}
                onChange={(event) => setAcquisitionValue(event.target.value)}
              />
            </div>

            {detailed && (
              <>
                <SelectBasic
                  name="unit"
                  label="Unidade"
                  value={unit}
                  onChange={(value) => setUnit(value as AssetUnit)}
                  options={assetUnitOptions}
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="asset-productivity"
                    className="text-sm font-medium"
                  >
                    Produtividade de referência ({assetUnitShort[unit]}/mês)
                  </label>
                  <Input
                    id="asset-productivity"
                    type="number"
                    min={0}
                    value={productivity}
                    placeholder="Digite"
                    onChange={(event) => setProductivity(event.target.value)}
                  />
                </div>
                <SelectBasic
                  name="group"
                  label="Grupo de bens equivalentes (opcional)"
                  value={groupId}
                  onChange={setGroupId}
                  options={[{ value: 'none', label: 'Sem grupo' }, ...groups]}
                />
              </>
            )}
          </div>

          <p className="text-sm text-gray">
            Vida útil e valor residual entram com os padrões do sistema (60
            meses e 30%) e podem ser revisados na página do patrimônio.
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
            disabled={!name || !sector || !acquisitionValue}
            onClick={() => mutate()}
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar patrimônio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

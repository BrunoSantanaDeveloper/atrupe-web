'use client'

// React / Next
import Image from 'next/image'
import { useRef, useState } from 'react'

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
import type { Asset, AssetKind, AssetUnit } from '../../types'

// Actions
import { createAsset, updateAsset } from '@/actions/assets'

// Hooks / Store / Consts
import {
  assetKindOptions,
  assetUnitShort,
  assetUnitOptions,
} from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Components
import { ActionButton } from '@/components/common/ActionButton'

// Icons
import { IconPlus, IconPencil, IconPhoto, IconX } from '@tabler/icons-react'
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

interface Props {
  sectors: { value: string; label: string }[]
  groups: { value: string; label: string }[]
  // Com o bem informado, o mesmo formulário edita em vez de cadastrar (P-12)
  asset?: Asset
}

// Cadastro rápido em duas etapas (P-12): aqui só o essencial; vida útil,
// residual, custos e configurações ficam na página do bem.
export function NewAssetModal({ sectors, groups, asset }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(asset)
  const fileInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [detailed, setDetailed] = useState(asset?.detailed ?? true)
  const [name, setName] = useState(asset?.name || '')
  const [kind, setKind] = useState<AssetKind>(asset?.kind || 'MACHINES')
  const [sector, setSector] = useState(asset?.sector || '')
  const [groupId, setGroupId] = useState(asset?.groupId || 'none')
  const [unit, setUnit] = useState<AssetUnit>(asset?.unit || 'HR')
  const [imageUrl, setImageUrl] = useState(asset?.imageUrl || '')
  const [productivity, setProductivity] = useState(
    asset?.monthlyProductivity ? String(asset.monthlyProductivity) : '',
  )
  const [acquisitionDate, setAcquisitionDate] = useState(
    asset?.acquisitionDate || '',
  )
  const [acquisitionValue, setAcquisitionValue] = useState(
    asset ? String(asset.acquisitionValue / 100) : '',
  )

  const reset = () => {
    if (isEdit) return

    setName('')
    setSector('')
    setGroupId('none')
    setProductivity('')
    setAcquisitionDate('')
    setAcquisitionValue('')
    setImageUrl('')
    setDetailed(true)
  }

  // Sem API de upload ainda: a imagem fica como data URL, e o endpoint real
  // vai receber o arquivo (registrado em alteracoes-pendentes.md)
  const pickImage = (file?: File | null) => {
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        kind,
        sector,
        detailed,
        imageUrl: imageUrl || null,
        groupId: groupId === 'none' ? null : groupId,
        unit: detailed ? unit : null,
        monthlyProductivity: detailed ? Number(productivity) || null : null,
        acquisitionDate,
        acquisitionValue: Math.round(Number(acquisitionValue || 0) * 100),
      }

      return asset
        ? updateAsset({ id: asset.id, ...values })
        : createAsset(values)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(isEdit ? 'Patrimônio atualizado' : 'Patrimônio cadastrado')
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset'] })
      reset()
      setOpen(false)
    },
    onError: () =>
      toast.error(
        isEdit
          ? 'Erro ao atualizar o patrimônio'
          : 'Erro ao cadastrar o patrimônio',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <ActionButton
          Icon={IconPencil}
          tooltip={`Editar ${asset?.name}`}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
          Novo patrimônio
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
              {isEdit ? 'Editar patrimônio' : 'Novo patrimônio'}
            </DialogTitle>
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

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {imageUrl ? (
                <Image
                  fill
                  unoptimized
                  src={imageUrl}
                  alt={name || 'Foto do patrimônio'}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <IconPhoto
                    aria-hidden
                    size={ICON_SIZE.lg}
                    stroke={ICON_STROKE.lg}
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Foto do patrimônio</p>
              <p className="text-sm text-gray">
                Ajuda a reconhecer o equipamento na lista e na produção.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                >
                  {imageUrl ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
                {imageUrl && (
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    LeftIcon={IconX}
                    onClick={() => setImageUrl('')}
                  >
                    Remover
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInput}
                  onChange={(event) => pickImage(event.target.files?.[0])}
                />
              </div>
            </div>
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

          {!isEdit && (
            <p className="text-sm text-gray">
              Vida útil e valor residual entram com os padrões do sistema (60
              meses e 30%) e podem ser revisados na página do patrimônio.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !sector || !acquisitionValue}
            onClick={() => mutate()}
          >
            {isEdit ? 'Salvar' : 'Cadastrar patrimônio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

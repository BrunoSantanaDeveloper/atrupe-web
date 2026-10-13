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
import type {
  AssetItem,
  AssetKind,
  AssetUnit,
  AssetFormValues,
  AssetComposition,
} from '../../types'

// Actions
import { createAsset, updateAsset } from '@/actions/asset'

// Hooks / Store / Consts
import { useUploadFile } from '@/hooks/use-upload-file'
import { useImageCompression } from '@/hooks/use-image-compression'
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
import { CompositionsWarning } from '../CompositionsWarning'

// Icons
import { IconPlus, IconPencil, IconPhoto, IconX } from '@tabler/icons-react'

interface Props {
  // Os setores ativos da empresa, pelo id
  sectors: { value: string; label: string }[]
  groups: {
    value: string
    label: string
    unit: AssetUnit
    sectorId: string | null
  }[]
  // Com o bem informado, o mesmo formulário edita em vez de cadastrar (P-12)
  asset?: AssetItem
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
  const [sectorId, setSectorId] = useState(asset?.sectorId || '')
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
  // As composições que perdem o custo da máquina ao simplificar (P-16): a API
  // recusa e a tela pede a confirmação
  const [conflict, setConflict] = useState<AssetComposition[]>()
  const { compressImage, isCompressing } = useImageCompression()
  const { handleUpload, isUploading } = useUploadFile()
  const uploading = isCompressing || isUploading

  // O setor atual fica na lista mesmo inativo, para a edição não o perder
  const sectorOptions =
    asset?.sectorId && !sectors.some((item) => item.value === asset.sectorId)
      ? [...sectors, { value: asset.sectorId, label: asset.sector || '-' }]
      : sectors

  // O grupo tem a mesma unidade e o mesmo setor do bem (P-5.2); os de
  // veículo nascem sem setor e ficam com o do primeiro bem
  const groupOptions = groups
    .filter(
      (group) =>
        group.unit === unit && (!group.sectorId || group.sectorId === sectorId),
    )
    .map((group) => ({ value: group.value, label: group.label }))

  const reset = () => {
    setConflict(undefined)
    if (isEdit) return

    setName('')
    setSectorId('')
    setGroupId('none')
    setProductivity('')
    setAcquisitionDate('')
    setAcquisitionValue('')
    setImageUrl('')
    setDetailed(true)
  }

  // A foto sobe pelo upload de arquivos e entra pela URL: a API recusa data
  // URL (ALT-16). Comprimida antes, pelo limite de 1 MB do upload
  const pickImage = async (file?: File | null) => {
    if (fileInput.current) fileInput.current.value = ''
    if (!file) return

    try {
      const compressed = await compressImage(file, 'large')
      const uploaded = await handleUpload([compressed])
      const url = typeof uploaded === 'string' ? uploaded : uploaded?.url

      if (url) setImageUrl(url)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar a foto',
      )
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const values: AssetFormValues = {
        name,
        kind,
        sectorId,
        detailed,
        imageUrl: imageUrl || null,
        // Só o detalhado tem grupo, e só um grupo que combine com ele
        groupId:
          detailed && groupOptions.some((group) => group.value === groupId)
            ? groupId
            : null,
        unit: detailed ? unit : null,
        monthlyProductivity: detailed ? Number(productivity) || null : null,
        acquisitionDate: acquisitionDate || null,
        acquisitionValue: Math.round(Number(acquisitionValue || 0) * 100),
      }

      if (!asset) {
        const created = await createAsset(values)

        return { ...created, compositions: [] as AssetComposition[] }
      }

      return updateAsset({
        id: asset.id,
        ...values,
        confirmed: Boolean(conflict),
      })
    },
    onSuccess: (response) => {
      if (response.compositions.length) {
        return setConflict(response.compositions)
      }
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
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) setConflict(undefined)
      }}
    >
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
              onCheckedChange={(value) => {
                setDetailed(value)
                setConflict(undefined)
              }}
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
                  <IconPhoto size={24} />
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
                  isLoading={uploading}
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
              value={sectorId}
              onChange={setSectorId}
              options={sectorOptions}
              emptyMessage="Nenhum setor ativo"
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
                  options={[
                    { value: 'none', label: 'Sem grupo' },
                    ...groupOptions,
                  ]}
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

          {conflict && <CompositionsWarning compositions={conflict} />}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !sectorId || !acquisitionValue || uploading}
            onClick={() => mutate()}
          >
            {conflict
              ? 'Confirmar e salvar'
              : isEdit
                ? 'Salvar'
                : 'Cadastrar patrimônio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

// React / Next
import Image from 'next/image'
import { useRef, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import type {
  AssetKind,
  AssetRecord,
  AssetUnit,
  AssetFormValues,
} from '../../types'

// Actions
import { createAsset } from '@/actions/asset'

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

// Icons
import { IconPlus, IconPhoto, IconX } from '@tabler/icons-react'
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

interface Props {
  // Os setores ativos da empresa, pelo id
  sectors: { value: string; label: string }[]
  groups: {
    value: string
    label: string
    unit: AssetUnit
    sectorId: string | null
  }[]
  // Cadastrado, o bem abre na janela dele para seguir a montagem (28/10/2026)
  onCreated?: (asset: AssetRecord) => void
}

// Cadastro rápido em duas etapas (P-12): aqui só o essencial; vida útil,
// residual, custos e configurações ficam na janela do bem, que abre em
// seguida. Editar é só na janela do bem (28/10/2026, design.md §19).
export function NewAssetModal({ sectors, groups, onCreated }: Props) {
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [detailed, setDetailed] = useState(true)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<AssetKind>('MACHINES')
  const [sectorId, setSectorId] = useState('')
  const [groupId, setGroupId] = useState('none')
  const [unit, setUnit] = useState<AssetUnit>('HR')
  const [imageUrl, setImageUrl] = useState('')
  const [productivity, setProductivity] = useState('')
  const [acquisitionDate, setAcquisitionDate] = useState('')
  const [acquisitionValue, setAcquisitionValue] = useState('')
  const { compressImage, isCompressing } = useImageCompression()
  const { handleUpload, isUploading } = useUploadFile()
  const uploading = isCompressing || isUploading

  const sectorOptions = sectors

  // O grupo tem a mesma unidade e o mesmo setor do bem (P-5.2); os de
  // veículo nascem sem setor e ficam com o do primeiro bem
  const groupOptions = groups
    .filter(
      (group) =>
        group.unit === unit && (!group.sectorId || group.sectorId === sectorId),
    )
    .map((group) => ({ value: group.value, label: group.label }))

  const reset = () => {
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

      return createAsset(values)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Patrimônio cadastrado')
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      reset()
      setOpen(false)
      if (response.data) onCreated?.(response.data)
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
            <DialogTitle>Novo patrimônio</DialogTitle>
            <DialogDescription className="sr-only">
              Cadastro rápido do bem. Depreciação, configurações e custos são
              detalhados na janela do patrimônio, que abre em seguida.
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

          <p className="text-sm text-gray">
            Vida útil e valor residual entram com os padrões do sistema (60
            meses e 30%) e podem ser revisados na aba Patrimônio, que abre ao
            cadastrar.
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
            disabled={!name || !sectorId || !acquisitionValue || uploading}
            onClick={() => mutate()}
          >
            Cadastrar patrimônio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

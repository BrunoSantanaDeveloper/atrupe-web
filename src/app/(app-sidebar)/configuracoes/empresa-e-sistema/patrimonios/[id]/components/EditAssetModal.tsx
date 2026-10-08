'use client'

// React / Next
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

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
import type { Asset, AssetUnit } from '../../types'

// Actions
import { updateAsset } from '@/actions/assets'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort, assetUnitOptions } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPhoto, IconX } from '@tabler/icons-react'
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

interface Props {
  asset: Asset
  open: boolean
  onOpenChange: () => void
}

// O residual é informado em percentual; valor e depreciação são calculados
// (P-12). A troca de nível vale nos dois sentidos (P-16).
export function EditAssetModal({ asset, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [detailed, setDetailed] = useState(asset.detailed)
  const [name, setName] = useState(asset.name)
  const [usefulLife, setUsefulLife] = useState('')
  const [residualPercent, setResidualPercent] = useState('')
  const [unit, setUnit] = useState<AssetUnit>(asset.unit || 'HR')
  const [productivity, setProductivity] = useState('')
  const [imageUrl, setImageUrl] = useState(asset.imageUrl || '')
  const fileInput = useRef<HTMLInputElement>(null)

  // Sem API de upload ainda: a imagem fica como data URL (ALT-16)
  const pickImage = (file?: File | null) => {
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    setDetailed(asset.detailed)
    setName(asset.name)
    setUsefulLife(String(asset.usefulLifeMonths || ''))
    setResidualPercent(String(asset.residualPercent ?? ''))
    setUnit(asset.unit || 'HR')
    setProductivity(String(asset.monthlyProductivity ?? ''))
    setImageUrl(asset.imageUrl || '')
  }, [asset])

  const residualValue = Math.round(
    (asset.acquisitionValue * Number(residualPercent || 0)) / 100,
  )
  const months = Number(usefulLife || 0)
  const depreciation = months
    ? Math.round((asset.acquisitionValue - residualValue) / months)
    : null

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateAsset({
        id: asset.id,
        name,
        detailed,
        imageUrl: imageUrl || null,
        unit: detailed ? unit : null,
        monthlyProductivity: detailed ? Number(productivity) || null : null,
        usefulLifeMonths: months || null,
        residualPercent: Number(residualPercent || 0),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Patrimônio atualizado')
      queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao atualizar o patrimônio'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Editar patrimônio</DialogTitle>
            <DialogDescription className="sr-only">
              Altere os dados do bem e a base da depreciação.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {imageUrl ? (
                <Image
                  fill
                  unoptimized
                  src={imageUrl}
                  alt={name}
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

          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium">Detalhar custos deste bem</p>
              <p className="text-sm text-gray">
                Só o bem detalhado entra na composição dos processos e produtos.
              </p>
            </div>
            <Switch
              checked={detailed}
              onCheckedChange={setDetailed}
              aria-label="Detalhar custos deste bem"
            />
          </div>

          {!detailed && asset.setups.length > 0 && (
            <p className="text-sm text-warning-700 bg-warning-25 border border-warning-200 rounded-lg p-3">
              Este bem tem {asset.setups.length} configuração(ões) produtiva(s).
              Ao simplificar o cadastro, as composições que usam essas
              configurações perdem o custo da máquina.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-life" className="text-sm font-medium">
                Vida útil
              </label>
              <Input
                id="edit-life"
                type="number"
                min={1}
                value={usefulLife}
                endAdornment={<span className="text-sm">meses</span>}
                onChange={(event) => setUsefulLife(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-residual" className="text-sm font-medium">
                Valor residual
              </label>
              <Input
                id="edit-residual"
                type="number"
                min={0}
                max={99}
                value={residualPercent}
                endAdornment={<span className="text-sm">%</span>}
                onChange={(event) => setResidualPercent(event.target.value)}
              />
              <p className="text-sm text-gray">
                {formatCurrencyToBrl(residualValue)}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Depreciação mensal</p>
              <p className="text-lg font-semibold text-gray-900">
                {depreciation === null
                  ? 'Não calculada'
                  : formatCurrencyToBrl(depreciation)}
              </p>
            </div>

            {detailed && (
              <>
                <SelectBasic
                  name="edit-unit"
                  label="Unidade"
                  value={unit}
                  onChange={(value) => setUnit(value as AssetUnit)}
                  options={assetUnitOptions}
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-productivity"
                    className="text-sm font-medium"
                  >
                    Produtividade de referência ({assetUnitShort[unit]}/mês)
                  </label>
                  <Input
                    id="edit-productivity"
                    type="number"
                    min={0}
                    value={productivity}
                    disabled={asset.setups.length > 0}
                    onChange={(event) => setProductivity(event.target.value)}
                  />
                  {asset.setups.length > 0 && (
                    <p className="text-sm text-gray">
                      Calculada pela soma das configurações produtivas.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button isLoading={isPending} onClick={() => mutate()}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

// A aba Patrimônio da janela do bem (28/10/2026, design.md §19): o cadastro
// inteiro num lugar só. Juntou a edição rápida da lista (setor, agrupamento,
// aquisição, grupo) com a da antiga página do bem (vida útil, residual,
// depreciação). Não tem botão próprio: o Salvar do rodapé grava (PAD-5).

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { CompositionsWarning } from '../CompositionsWarning'

// Types
import type {
  AssetKind,
  AssetUnit,
  AssetRecord,
  AssetComposition,
} from '../../types'

// Actions
import { updateAsset } from '@/actions/asset'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { useUploadFile } from '@/hooks/use-upload-file'
import { useImageCompression } from '@/hooks/use-image-compression'
import {
  assetKindOptions,
  assetUnitShort,
  assetUnitOptions,
} from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPhoto, IconX } from '@tabler/icons-react'
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

export type AssetSaveHandle = {
  dirty: boolean
  save: () => Promise<boolean>
}

interface Props {
  asset: AssetRecord
  sectors: { value: string; label: string }[]
  groups: {
    value: string
    label: string
    unit: AssetUnit
    sectorId: string | null
  }[]
  canEdit: boolean
  onSaveHandle: (handle: AssetSaveHandle) => void
}

const fromAsset = (asset: AssetRecord) => ({
  detailed: asset.detailed,
  name: asset.name,
  kind: asset.kind,
  sectorId: asset.sectorId || '',
  groupId: asset.groupId || 'none',
  unit: (asset.unit || 'HR') as AssetUnit,
  imageUrl: asset.imageUrl || '',
  productivity:
    asset.monthlyProductivity === null ? '' : String(asset.monthlyProductivity),
  acquisitionDate: asset.acquisitionDate || '',
  acquisitionValue: String(asset.acquisitionValue / 100),
  usefulLife: asset.usefulLifeMonths ? String(asset.usefulLifeMonths) : '',
  residualPercent:
    asset.residualPercent === null ? '' : String(asset.residualPercent),
})

export function AssetForm({
  asset,
  sectors,
  groups,
  canEdit,
  onSaveHandle,
}: Props) {
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(() => fromAsset(asset))
  // As composições que perdem o custo da máquina ao simplificar (P-16): a API
  // recusa e a tela pede a confirmação no próximo Salvar
  const [conflict, setConflict] = useState<AssetComposition[]>()
  const { compressImage, isCompressing } = useImageCompression()
  const { handleUpload, isUploading } = useUploadFile()
  const uploading = isCompressing || isUploading

  // Outro bem, ou o mesmo depois de gravar: os campos voltam ao cadastro
  useEffect(() => {
    setForm(fromAsset(asset))
    setConflict(undefined)
  }, [asset])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const hasSetups = asset.setups.length > 0

  // O setor atual fica na lista mesmo inativo, para a edição não o perder
  const sectorOptions =
    asset.sectorId && !sectors.some((item) => item.value === asset.sectorId)
      ? [...sectors, { value: asset.sectorId, label: asset.sector || '-' }]
      : sectors

  // O grupo tem a mesma unidade e o mesmo setor do bem (P-5.2)
  const groupOptions = groups
    .filter(
      (group) =>
        group.unit === form.unit &&
        (!group.sectorId || group.sectorId === form.sectorId),
    )
    .map((group) => ({ value: group.value, label: group.label }))

  const acquisition = Math.round(Number(form.acquisitionValue || 0) * 100)
  const residualValue = Math.round(
    (acquisition * Number(form.residualPercent || 0)) / 100,
  )
  const months = Number(form.usefulLife || 0)
  const depreciation = months
    ? Math.round((acquisition - residualValue) / months)
    : null

  const dirty =
    JSON.stringify(form) !== JSON.stringify(fromAsset(asset)) || !!conflict

  const save = useMemo(
    () => async () => {
      if (!dirty) return true
      if (!form.name.trim() || !form.sectorId || !form.acquisitionValue) {
        toast.error('Preencha nome, setor e valor da aquisição')
        return false
      }
      const response = await updateAsset({
        id: asset.id,
        name: form.name,
        kind: form.kind as AssetKind,
        sectorId: form.sectorId,
        detailed: form.detailed,
        imageUrl: form.imageUrl || null,
        // Só o detalhado tem grupo, e só um grupo que combine com ele
        groupId:
          form.detailed &&
          groupOptions.some((group) => group.value === form.groupId)
            ? form.groupId
            : null,
        unit: form.detailed ? form.unit : null,
        // Com configurações, a produtividade é a soma delas (P-31)
        ...(form.detailed && hasSetups
          ? {}
          : {
              monthlyProductivity: form.detailed
                ? Number(form.productivity) || null
                : null,
            }),
        acquisitionDate: form.acquisitionDate || null,
        acquisitionValue: acquisition,
        // Vida útil e residual daqui contam como revistos (P-26); vazios,
        // ficam como estão
        ...(months > 0 ? { usefulLifeMonths: months } : {}),
        ...(form.residualPercent !== ''
          ? { residualPercent: Number(form.residualPercent) }
          : {}),
        confirmed: Boolean(conflict),
      })
      if (response.compositions.length) {
        setConflict(response.compositions)
        return false
      }
      if (!response.success) {
        toast.error(response.message)
        return false
      }
      toast.success('Patrimônio atualizado')
      setConflict(undefined)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['asset', asset.id] }),
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
      ])
      return true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dirty, form, conflict, asset],
  )

  useEffect(() => {
    onSaveHandle({ dirty, save })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, save])

  // A foto sobe pelo upload de arquivos e entra pela URL: a API recusa data
  // URL (ALT-16). Comprimida antes, pelo limite de 1 MB do upload
  const pickImage = async (file?: File | null) => {
    if (fileInput.current) fileInput.current.value = ''
    if (!file) return

    try {
      const compressed = await compressImage(file, 'large')
      const uploaded = await handleUpload([compressed])
      const url = typeof uploaded === 'string' ? uploaded : uploaded?.url

      if (url) set('imageUrl', url)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar a foto',
      )
    }
  }

  return (
    <fieldset disabled={!canEdit} className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">Detalhar custos deste bem</p>
            <InfoHint title="Cadastro detalhado">
              <p>
                Ligado, o bem ganha unidade, volume mensal previsto,
                configurações produtivas e custos próprios (manutenção,
                energia). É o caso das máquinas que produzem.
              </p>
              <p>
                Desligado, o bem entra no custo do setor só pela depreciação. É
                o caso de móveis e equipamentos que não produzem.
              </p>
            </InfoHint>
          </div>
        </div>
        <Switch
          checked={form.detailed}
          disabled={!canEdit}
          onCheckedChange={(value) => {
            set('detailed', value)
            setConflict(undefined)
          }}
          aria-label="Detalhar custos deste bem"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {form.imageUrl ? (
            <Image
              fill
              unoptimized
              src={form.imageUrl}
              alt={form.name || 'Foto do patrimônio'}
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
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">Foto do patrimônio</p>
            <InfoHint title="Apelido">
              <p>
                Um nome curto para reconhecer o equipamento na lista e na
                produção, como &quot;Plotter grande&quot; ou &quot;Router
                2&quot;.
              </p>
            </InfoHint>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              isLoading={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {form.imageUrl ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
            {form.imageUrl && (
              <Button
                size="sm"
                type="button"
                variant="outline"
                LeftIcon={IconX}
                onClick={() => set('imageUrl', '')}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="asset-name" className="text-sm font-medium">
            Nome
          </label>
          <Input
            id="asset-name"
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
          />
        </div>
        <SelectBasic
          name="kind"
          label="Agrupamento"
          value={form.kind}
          onChange={(value) => set('kind', value as AssetKind)}
          options={assetKindOptions}
        />
        <SelectBasic
          name="sector"
          label="Setor"
          value={form.sectorId}
          onChange={(value) => set('sectorId', value)}
          options={sectorOptions}
          emptyMessage="Nenhum setor ativo"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">
          Aquisição e depreciação
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="asset-date" className="text-sm font-medium">
              Data da aquisição
            </label>
            <Input
              id="asset-date"
              type="date"
              value={form.acquisitionDate}
              onChange={(event) => set('acquisitionDate', event.target.value)}
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
              value={form.acquisitionValue}
              onChange={(event) => set('acquisitionValue', event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="asset-life" className="text-sm font-medium">
              Vida útil
            </label>
            <Input
              id="asset-life"
              type="number"
              min={1}
              value={form.usefulLife}
              endAdornment={<span className="text-sm">meses</span>}
              onChange={(event) => set('usefulLife', event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="asset-residual" className="text-sm font-medium">
              Valor residual
            </label>
            <Input
              id="asset-residual"
              type="number"
              min={0}
              max={99}
              value={form.residualPercent}
              endAdornment={<span className="text-sm">%</span>}
              onChange={(event) => set('residualPercent', event.target.value)}
            />
            <p className="text-sm text-gray">
              {formatCurrencyToBrl(residualValue)}
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <p className="text-sm font-medium">Depreciação mensal</p>
            <p className="text-lg font-semibold text-gray-900">
              {depreciation === null
                ? 'Não calculada'
                : formatCurrencyToBrl(depreciation)}
            </p>
            <p className="text-sm text-gray">
              (aquisição − residual) ÷ vida útil.
            </p>
          </div>
        </div>
      </div>

      {form.detailed && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">Produção</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectBasic
              name="unit"
              label="Unidade"
              value={form.unit}
              onChange={(value) => set('unit', value as AssetUnit)}
              options={assetUnitOptions}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="asset-productivity"
                className="text-sm font-medium"
              >
                Volume mensal previsto ({assetUnitShort[form.unit]}/mês)
              </label>
              <Input
                id="asset-productivity"
                type="number"
                min={0}
                value={form.productivity}
                disabled={hasSetups}
                onChange={(event) => set('productivity', event.target.value)}
              />
              {hasSetups && (
                <p className="text-sm text-gray">
                  Soma das configurações produtivas.
                </p>
              )}
            </div>
            <SelectBasic
              name="group"
              label="Grupo de bens equivalentes (opcional)"
              value={form.groupId}
              onChange={(value) => set('groupId', value)}
              options={[{ value: 'none', label: 'Sem grupo' }, ...groupOptions]}
            />
          </div>
        </div>
      )}

      {conflict && <CompositionsWarning compositions={conflict} />}
    </fieldset>
  )
}

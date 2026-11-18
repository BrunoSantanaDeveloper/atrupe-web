'use client'

// O patrimônio num lugar só (28/10/2026, design.md §19 item 8): o lápis da
// lista abre esta janela, com o cadastro e a montagem do bem em abas. Antes
// eram duas entradas: o lápis editava parte do cadastro e a lupa abria uma
// página com o resto (custos, configurações, leituras), mais uma segunda
// janela de edição. Consulta ("usado em", depreciação) fica no cabeçalho e
// as ações do bem (vender, inativar) no rodapé, como no processo.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { AssetForm, type AssetSaveHandle } from './AssetForm'
import { SetupsTab, CostsTab } from './AssetTabs'
import { SellAssetModal } from './SellAssetModal'
import { AssetReadingsCard } from './AssetReadingsCard'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { AssetRecord, AssetUnit } from '../../types'

// Actions
import { getAsset, setAssetActive } from '@/actions/asset'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import { useAlertDialog } from '@/store/useAlertDialog'
import { assetUnitShort, assetLifeStatusObj } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconGauge,
  IconReceipt,
  IconRestore,
  IconAdjustments,
  IconCircleCheck,
  IconCurrencyReal,
  IconBuildingWarehouse,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

export type AssetTab = 'asset' | 'setups' | 'costs' | 'readings'

const EDIT = ['cost:base:edit']

interface Props {
  assetId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  // Depois de cadastrar, o bem detalhado reabre nas configurações
  initialTab?: AssetTab
  sectors: { value: string; label: string }[]
  groups: {
    value: string
    label: string
    unit: AssetUnit
    sectorId: string | null
  }[]
}

// Os processos que usam o bem, como consulta (como o "Usado em" do processo)
function UsedInLine({ processes }: { processes: AssetRecord['processes'] }) {
  if (!processes.length) return <span>Ainda não é usado em processos.</span>
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="underline-offset-2 hover:text-brand-700 hover:underline"
        >
          {processes.length === 1
            ? 'Usado em 1 processo · ver lista'
            : `Usado em ${processes.length} processos · ver lista`}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] space-y-2" align="start">
        <div className="flex items-center gap-1.5 text-xs text-gray">
          Sobre esta lista
          <InfoHint title="Processos do bem">
            <p>Os processos que usam este equipamento.</p>
            <p>O processo é criado em Cadastros › Processos, não aqui.</p>
          </InfoHint>
        </div>
        <ul className="max-h-[240px] space-y-1 overflow-y-auto">
          {processes.map((process) => (
            <li
              key={process.id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-gray-800"
            >
              <span>{process.name}</span>
              {process.taskType && (
                <Badge variant="neutralLight">{process.taskType}</Badge>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function AssetDialog({
  assetId,
  open,
  onOpenChange,
  initialTab = 'asset',
  sectors,
  groups,
}: Props) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const { hasAnyPermission } = usePermissions()
  const canEdit = hasAnyPermission(EDIT)
  const [tab, setTab] = useState<AssetTab>(initialTab)
  const [selling, setSelling] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveHandle, setSaveHandle] = useState<AssetSaveHandle | null>(null)

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  const { data, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset({ id: assetId! }),
    enabled: open && !!assetId,
  })
  const asset = data?.data

  // Bem inativo (ou vendido) não recebe custo, configuração nem venda: a API
  // recusa, e reativar vem antes
  const isInactive = asset?.status === 'INACTIVE'

  // Fechar com o cadastro alterado avisa, como no processo
  const close = () => {
    if (!saveHandle?.dirty) return onOpenChange(false)
    alertDialog.open({
      title: 'Descartar alterações',
      description:
        'O que mudou na aba Patrimônio ainda não foi salvo. Fechar descarta essas alterações.',
      confirmLabel: 'Descartar',
      confirmVariant: 'error',
      onConfirm: () => onOpenChange(false),
    })
  }

  const save = async () => {
    if (!saveHandle) return onOpenChange(false)
    setSaving(true)
    const ok = await saveHandle.save()
    setSaving(false)
    if (ok) onOpenChange(false)
    else setTab('asset')
  }

  // Registro com histórico é inativado, não excluído: o patrimônio tem
  // depreciação, custos e configurações usadas em composições
  const toggleActive = () => {
    if (!asset) return
    alertDialog.open({
      title: isInactive ? 'Reativar patrimônio' : 'Inativar patrimônio',
      description: isInactive
        ? 'O bem volta a depreciar e a aparecer nas listas e composições.'
        : 'O bem para de depreciar e deixa de aparecer nas composições. O histórico é preservado, e ele pode ser reativado depois.',
      confirmLabel: isInactive ? 'Reativar' : 'Inativar',
      confirmVariant: isInactive ? 'default' : 'error',
      onConfirm: async () => {
        const response = await setAssetActive({
          id: asset.id,
          active: isInactive,
        })
        if (!response.success) {
          toast.error(response.message)
          return
        }
        toast.success(
          isInactive ? 'Patrimônio reativado' : 'Patrimônio inativado',
        )
        // Configuração em composição: a inativação vale, com o aviso (P-16)
        response.warnings.forEach((warning) =>
          toast.warning(warning.message, {
            description: warning.compositions
              .map((item) => item.name)
              .join(', '),
          }),
        )
        queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
        queryClient.invalidateQueries({ queryKey: ['assets'] })
      },
    })
  }

  const summary = asset
    ? [
        asset.sector || 'Sem setor',
        asset.detailed && asset.unit
          ? assetUnitShort[asset.unit]
          : 'cadastro simplificado',
        asset.monthlyDepreciation === null
          ? 'depreciação não calculada'
          : `depreciação ${formatCurrencyToBrl(asset.monthlyDepreciation)}/mês`,
      ].join(' · ')
    : ''

  const tabs: { value: AssetTab; label: string; Icon: typeof IconGauge }[] = [
    { value: 'asset', label: 'Patrimônio', Icon: IconBuildingWarehouse },
    ...(asset?.detailed
      ? ([
          {
            value: 'setups',
            label: 'Configurações produtivas',
            Icon: IconAdjustments,
          },
          { value: 'costs', label: 'Custos', Icon: IconReceipt },
          { value: 'readings', label: 'Leituras', Icon: IconGauge },
        ] as const)
      : []),
  ]

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? null : close())}>
      <DialogContent className="sm:max-w-[1180px]">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle>
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  {asset ? `Editar patrimônio · ${asset.name}` : 'Patrimônio'}
                </span>
                {asset && (
                  <Badge
                    status
                    variant={assetLifeStatusObj[asset.status].variant}
                  >
                    {assetLifeStatusObj[asset.status].text}
                  </Badge>
                )}
              </div>
            </DialogTitle>
            {asset ? (
              <DialogDescription asChild>
                <div className="flex flex-wrap items-center gap-x-1 text-sm text-gray">
                  <span>{summary} ·</span>
                  <UsedInLine processes={asset.processes} />
                </div>
              </DialogDescription>
            ) : (
              <DialogDescription hidden></DialogDescription>
            )}
          </DialogHeader>
          <DialogBody className="p-0">
            {isLoading || !asset ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as AssetTab)}
                className="flex h-full flex-col"
              >
                <div className="border-b border-gray-100 px-6 pt-4">
                  <TabsList>
                    {tabs.map(({ value, label, Icon }) => (
                      <TabsTrigger key={value} value={value}>
                        <Icon
                          aria-hidden
                          size={ICON_SIZE.sm}
                          className="mr-1.5"
                        />
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <ScrollArea className="max-h-[calc(100vh-280px)] flex-1">
                  {/* A aba Patrimônio fica montada mesmo inativa: o que foi
                      digitado sobrevive à troca de aba até o Salvar */}
                  <TabsContent
                    value="asset"
                    forceMount
                    className="mt-0 p-6 data-[state=inactive]:hidden"
                  >
                    <AssetForm
                      asset={asset}
                      sectors={sectors}
                      groups={groups}
                      canEdit={canEdit && !isInactive}
                      onSaveHandle={setSaveHandle}
                    />
                  </TabsContent>
                  {asset.detailed && (
                    <>
                      <TabsContent value="setups" className="mt-0 p-6">
                        <SetupsTab asset={asset} isInactive={isInactive} />
                      </TabsContent>
                      <TabsContent value="costs" className="mt-0 p-6">
                        <CostsTab asset={asset} isInactive={isInactive} />
                      </TabsContent>
                      <TabsContent value="readings" className="mt-0 p-6">
                        <AssetReadingsCard
                          assetId={asset.id}
                          unit={asset.unit}
                        />
                      </TabsContent>
                    </>
                  )}
                </ScrollArea>
              </Tabs>
            )}
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {asset && (
                <PermissionGate permissions={EDIT}>
                  {!isInactive && (
                    <Button
                      type="button"
                      variant="neutralOutline"
                      LeftIcon={IconCurrencyReal}
                      onClick={() => setSelling(true)}
                    >
                      Vender
                    </Button>
                  )}
                  {/* Vendido não volta: a API recusa reativar */}
                  {!asset.sale && (
                    <Button
                      type="button"
                      variant={isInactive ? 'successOutline' : 'errorOutline'}
                      LeftIcon={isInactive ? IconRestore : IconBan}
                      onClick={toggleActive}
                    >
                      {isInactive ? 'Reativar' : 'Inativar'}
                    </Button>
                  )}
                </PermissionGate>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="neutralOutline" onClick={close}>
                Cancelar
              </Button>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  RightIcon={IconCircleCheck}
                  isLoading={saving}
                  disabled={!asset || isInactive}
                  onClick={save}
                >
                  Salvar
                </Button>
              </PermissionGate>
            </div>
          </DialogFooter>
          {asset && (
            <SellAssetModal
              asset={asset}
              open={selling}
              onOpenChange={() => setSelling(false)}
            />
          )}
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}

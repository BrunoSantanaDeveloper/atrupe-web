'use client'

// O diálogo do processo, no mesmo desenho do diálogo do produto: abas
// Processo · Composição · Uso, cabeçalho, rodapé e reabertura depois de criar.
// Processo e produto são a mesma coisa vista de dois lugares — o trabalho de
// um setor com máquina, material e mão de obra — e por isso se cadastram do
// mesmo jeito (design.md §17: funções semelhantes, telas iguais).

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ProcessEditor } from '../[id]/components/ProcessEditor'

// Actions
import {
  createProcessDef,
  getProcessDetail,
  updateProcessMeta,
  getAssemblyResources,
} from '@/actions/product-assembly'

// Hooks / Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPencil,
  IconListCheck,
  IconCirclePlus,
  IconHierarchy2,
  IconCircleCheck,
  IconPackages,
} from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

export type ProcessTab = 'general' | 'composition' | 'usage'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editMode?: boolean
  processId?: string
  // Depois de criar, o processo reabre na Composição (como o produto, CP-16)
  initialTab?: ProcessTab
  onCreated?: (processId: string) => void
}

const EDIT = ['product_settings:products:edit']

// O que só existe depois de salvar, como na aba Composição do produto novo
function AfterSave({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <FeaturedIcon variant="light" Icon={IconHierarchy2} rounded />
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="max-w-md text-sm text-gray">{text}</p>
    </div>
  )
}

export function ProcessDialog({
  open,
  onOpenChange,
  editMode = false,
  processId,
  initialTab = 'general',
  onCreated,
}: Props) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [activeTab, setActiveTab] = useState<ProcessTab>(initialTab)
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [finishingOf, setFinishingOf] = useState('none')
  const [saving, setSaving] = useState(false)

  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
    enabled: open,
  })
  const sectors = useMemo(
    () => resourcesRes?.data?.sectors || [],
    [resourcesRes],
  )

  // Em edição, o título e a situação vêm do processo; as seções são do editor
  const { data: detailRes } = useQuery({
    queryKey: ['process-detail', processId, undefined],
    queryFn: () => getProcessDetail({ processId: processId || '' }),
    enabled: open && editMode && !!processId,
  })
  const detail = detailRes?.data

  useEffect(() => {
    if (!open) return
    setActiveTab(initialTab)
    setName('')
    setSector(sectors[0] || '')
    setFinishingOf('none')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTab])

  useEffect(() => {
    if (open && !sector && sectors.length) setSector(sectors[0])
  }, [open, sector, sectors])

  const save = async () => {
    setSaving(true)
    const res = await createProcessDef({
      name,
      sector,
      finishingOf: finishingOf === 'none' ? null : finishingOf,
    })
    setSaving(false)
    if (!res.success || !res.data) return toast.error(res.message)
    toast.success('Processo criado')
    await queryClient.invalidateQueries({ queryKey: ['process-list'] })
    onOpenChange(false)
    onCreated?.(res.data)
  }

  // Processo usado em produto é inativado, não excluído (regra geral)
  const toggleActive = () => {
    if (!detail) return
    const active = detail.meta.active
    alertDialog.open({
      title: active
        ? `Inativar ${detail.block.name}?`
        : `Reativar ${detail.block.name}?`,
      description: active
        ? `Ele deixa de aparecer para escolher nas composições.${
            detail.usedIn.length
              ? ` Os ${detail.usedIn.length} produtos que já o usam continuam como estão.`
              : ''
          }`
        : 'Ele volta a aparecer nas listas de escolha.',
      confirmLabel: active ? 'Inativar' : 'Reativar',
      cancelLabel: 'Cancelar',
      confirmVariant: active ? 'error' : 'primary',
      onConfirm: async () => {
        const res = await updateProcessMeta({
          processId: detail.id,
          values: { active: !active },
        })
        if (!res.success) throw new Error(res.message)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['process-list'] }),
          queryClient.invalidateQueries({ queryKey: ['process-detail'] }),
        ])
      },
      toastMsg: {
        success: active ? 'Processo inativado' : 'Processo reativado',
        error: 'Não foi possível alterar o processo',
      },
    })
  }

  const ready = editMode && !!processId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          activeTab === 'general' ? 'sm:max-w-[855px]' : 'sm:max-w-[1180px]',
        )}
      >
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconListCheck} />
              <span>
                {editMode
                  ? `Editar processo${detail ? ` · ${detail.block.name}` : ''}`
                  : 'Novo processo'}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ProcessTab)}
            className="flex flex-col h-full"
          >
            <div className="px-6 pt-4 border-b border-gray-100">
              <TabsList>
                <TabsTrigger value="general">
                  <IconListCheck size={14} className="mr-1.5" />
                  Processo
                </TabsTrigger>
                <TabsTrigger value="composition">
                  <IconHierarchy2 size={14} className="mr-1.5" />
                  Composição
                </TabsTrigger>
                <TabsTrigger value="usage">
                  <IconPackages size={14} className="mr-1.5" />
                  Uso
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
              <TabsContent value="general" className="mt-0 p-6">
                {ready ? (
                  <ProcessEditor id={processId!} embedded section="config" />
                ) : (
                  // Os três campos de abertura, na ordem em que fazem
                  // sentido (MS-1). O resto se monta depois de salvar
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-[1_0_400px] space-y-2">
                      <Label htmlFor="process-name">Nome do processo</Label>
                      <Input
                        id="process-name"
                        autoFocus
                        placeholder="Ex.: Impressão solvente, Bainha, Ilhós"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                    <SelectBasic
                      name="process-sector"
                      label="Setor"
                      className="flex-[1_0_190px]"
                      options={sectors.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      value={sector}
                      onChange={(value) => value && setSector(String(value))}
                    />
                    <SelectBasic
                      name="process-finishing"
                      label="É acabamento de"
                      className="flex-[1_0_190px]"
                      options={[
                        { value: 'none', label: 'Não é acabamento' },
                        ...sectors.map((item) => ({
                          value: item,
                          label: item,
                        })),
                      ]}
                      value={finishingOf}
                      onChange={(value) =>
                        value && setFinishingOf(String(value))
                      }
                    />
                    <p className="w-full text-sm text-gray">
                      O acabamento é oferecido ao lado da etapa do setor de que
                      ele é acabamento, e herda a medida dela. Recursos, tempo e
                      regras de venda entram na aba Composição, depois de
                      salvar.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="composition" className="mt-0 p-6">
                {ready ? (
                  <ProcessEditor id={processId!} embedded section="resources" />
                ) : (
                  <AfterSave
                    title="Os recursos e o tempo vêm depois de salvar"
                    text="Preencha a aba Processo e salve. O processo reabre nesta aba para você montar as linhas: máquina, material, mão de obra e tempo."
                  />
                )}
              </TabsContent>

              <TabsContent value="usage" className="mt-0 p-6">
                {ready ? (
                  <ProcessEditor id={processId!} embedded section="usage" />
                ) : (
                  <AfterSave
                    title="O uso aparece depois de salvar"
                    text="Aqui ficam os produtos que usam o processo e as etapas que costumam vir antes e depois dele."
                  />
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {ready && detail && (
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  variant={detail.meta.active ? 'error' : 'default'}
                  onClick={toggleActive}
                >
                  {detail.meta.active ? 'Inativar' : 'Reativar'}
                </Button>
              </PermissionGate>
            )}
          </div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => onOpenChange(false)}
            >
              {editMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!editMode && (
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                isLoading={saving}
                disabled={!name.trim() || !sector}
                onClick={save}
              >
                Salvar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// O mesmo gatilho do produto: botão cheio para criar, lápis para editar
export function NewProcessTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      variant={editMode ? 'neutralGhost' : 'default'}
      size={editMode ? 'icon' : 'default'}
      RightIcon={editMode ? IconPencil : IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo processo'}
    </Button>
  )
}

'use client'

// O diálogo do processo, no mesmo desenho do diálogo do produto: abas
// Processo · Composição · Uso, cabeçalho, rodapé e reabertura depois de criar.
// Em edição, o Salvar do rodapé grava o card Processo (PAD-5, 05/10/2026) e
// o Inativar abre o "onde é usado" (PAD-7), como no produto e no material.
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
import { afterBaseObj } from '@/consts/processes'
import type { AfterBase } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  ProcessEditor,
  type ProcessSaveHandle,
} from '../[id]/components/ProcessEditor'
import { InactivateProcessDialog } from './InactivateProcessDialog'

// Actions
import { createProcessDef, getProcessDetail } from '@/actions/processes'

// Hooks / Store
import { useCompanySectors } from '@/hooks/queries/useCompanySectors'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPencil,
  IconListCheck,
  IconPlus,
  IconLink,
  IconCircle,
  IconPackages,
  IconHierarchy2,
  IconCircleCheck,
  IconRulerMeasure,
  IconCalculator,
  IconCircleCheckFilled,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

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

const EDIT = ['product_settings:composition:edit']

// As duas preferências como cartões de regra, no desenho do modal de
// precificação (openspec/design.md): o texto de apoio diz quando usar cada
// uma, com "acabamento" e "serviço principal" como exemplos (05/10/2026)
const afterBaseCards: { value: AfterBase; Icon: typeof IconLink }[] = [
  { value: 'OWN', Icon: IconRulerMeasure },
  { value: 'INHERIT', Icon: IconLink },
]

// O que só existe depois de salvar, como na aba Composição do produto novo
function AfterSave({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <FeaturedIcon tone="brand" Icon={IconHierarchy2} />
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
  const [activeTab, setActiveTab] = useState<ProcessTab>(initialTab)
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [afterBase, setAfterBase] = useState<AfterBase>('INHERIT')
  const [saving, setSaving] = useState(false)
  // O que o card Processo tem pendente e como gravar (PAD-5)
  const [saveHandle, setSaveHandle] = useState<ProcessSaveHandle | null>(null)
  const [inactivateOpen, setInactivateOpen] = useState(false)
  const [simulationOpen, setSimulationOpen] = useState(false)

  // Os setores da empresa, do cadastro de setores (05/10/2026). Enquanto a
  // lista carrega, o campo diz isso em vez de parecer travado; se falhou,
  // dá para tentar de novo sem fechar o diálogo
  const {
    sectors: sectorNames,
    isLoading: sectorsLoading,
    isError: resourcesError,
  } = useCompanySectors()
  const sectors = useMemo(() => sectorNames, [sectorNames])
  const ready = editMode && !!processId
  const refetchResources = () =>
    queryClient.invalidateQueries({ queryKey: ['sectors'] })

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
    setAfterBase('INHERIT')
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
      afterBase,
    })
    setSaving(false)
    if (!res.success || !res.data) return toast.error(res.message)
    toast.success('Processo criado')
    await queryClient.invalidateQueries({ queryKey: ['process-list'] })
    onOpenChange(false)
    onCreated?.(res.data)
  }

  // Em edição, o Salvar do rodapé grava o card Processo e fecha, como o
  // produto (PAD-5). Sem nada pendente, só fecha
  const saveEdit = async () => {
    setSaving(true)
    const done = saveHandle ? await saveHandle.save() : true
    setSaving(false)
    if (done) onOpenChange(false)
  }

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
            <div className="flex items-center justify-between gap-4 px-6 pt-4 border-b border-gray-100">
              <TabsList>
                <TabsTrigger value="general">
                  <IconListCheck
                    aria-hidden
                    size={ICON_SIZE.sm}
                    className="mr-1.5"
                  />
                  Processo
                </TabsTrigger>
                <TabsTrigger value="composition">
                  <IconHierarchy2
                    aria-hidden
                    size={ICON_SIZE.sm}
                    className="mr-1.5"
                  />
                  Composição
                </TabsTrigger>
                <TabsTrigger value="usage">
                  <IconPackages
                    aria-hidden
                    size={ICON_SIZE.sm}
                    className="mr-1.5"
                  />
                  Uso
                </TabsTrigger>
              </TabsList>
              {/* A Simulação fica separada da composição (28/10/2026) */}
              {ready && activeTab === 'composition' && (
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconCalculator}
                  onClick={() => setSimulationOpen(true)}
                >
                  Simular
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
              {/* Em edição a aba fica montada mesmo inativa: o que foi
                  digitado no card Processo sobrevive à troca de aba até o
                  Salvar do rodapé (PAD-5) */}
              <TabsContent
                value="general"
                className="mt-0 p-6 data-[state=inactive]:hidden"
                forceMount={ready || undefined}
              >
                {ready ? (
                  <ProcessEditor
                    id={processId!}
                    embedded
                    section="config"
                    onSaveHandle={setSaveHandle}
                  />
                ) : (
                  // Os três campos de abertura, na ordem em que fazem
                  // sentido (MS-1). O resto se monta depois de salvar
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-[1_0_400px] flex-col">
                      <Label htmlFor="process-name" className="mb-2">
                        Nome do processo
                      </Label>
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
                      placeholder={
                        sectorsLoading ? 'Carregando setores…' : 'Setor'
                      }
                      emptyMessage={
                        sectorsLoading
                          ? 'Carregando setores…'
                          : 'Nenhum setor disponível'
                      }
                      className="flex-[1_0_190px]"
                      options={sectors.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      value={sector}
                      onChange={(value) => value && setSector(String(value))}
                    />
                    <div className="flex w-full flex-col">
                      <Label className="mb-2">
                        Quando entra depois de outra etapa
                      </Label>
                      <div
                        role="radiogroup"
                        aria-label="Quando entra depois de outra etapa"
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        {afterBaseCards.map(({ value, Icon }) => {
                          const selected = afterBase === value
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setAfterBase(value)}
                              className={cn(
                                'flex items-start gap-3 rounded-lg border bg-white p-3 text-left transition-colors',
                                selected
                                  ? 'border-brand bg-success-25'
                                  : 'border-gray-200 hover:border-gray-300',
                              )}
                            >
                              <FeaturedIcon
                                tone={selected ? 'brand' : 'neutral'}
                                size="sm"
                                Icon={Icon}
                              />
                              <span className="flex-1">
                                <span className="block text-sm font-medium text-gray-900">
                                  {afterBaseObj[value].label}
                                </span>
                                <span className="block text-sm text-gray">
                                  {afterBaseObj[value].help}
                                </span>
                              </span>
                              {selected ? (
                                <IconCircleCheckFilled
                                  size={ICON_SIZE.md}
                                  className="shrink-0 text-brand-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <IconCircle
                                  size={ICON_SIZE.md}
                                  className="shrink-0 text-gray-300"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {resourcesError && (
                      <p className="w-full text-sm text-error-700">
                        Não foi possível carregar os setores.{' '}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => refetchResources()}
                        >
                          Tentar de novo
                        </button>
                      </p>
                    )}
                    <p className="w-full text-sm text-gray">
                      Começando um produto, o processo sempre pede medida e
                      quantidade próprias. Recursos, tempo e regras de venda
                      entram na aba Composição, depois de salvar; as etapas que
                      costumam vir antes e depois, na aba Uso.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="composition" className="mt-0 p-6">
                {ready ? (
                  <ProcessEditor
                    id={processId!}
                    embedded
                    section="resources"
                    simulationOpen={simulationOpen}
                    onSimulationOpenChange={setSimulationOpen}
                  />
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
                  variant={
                    detail.meta.active ? 'errorOutline' : 'successOutline'
                  }
                  onClick={() => setInactivateOpen(true)}
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
              Cancelar
            </Button>
            {!editMode ? (
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                isLoading={saving}
                disabled={!name.trim() || !sector}
                onClick={save}
              >
                Salvar
              </Button>
            ) : (
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  RightIcon={IconCircleCheck}
                  isLoading={saving}
                  disabled={!ready}
                  onClick={saveEdit}
                >
                  Salvar
                </Button>
              </PermissionGate>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
      {ready && detail && (
        <InactivateProcessDialog
          process={{
            id: detail.id,
            name: detail.block.name,
            active: detail.meta.active,
          }}
          open={inactivateOpen}
          onOpenChange={setInactivateOpen}
        />
      )}
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
      RightIcon={editMode ? IconPencil : IconPlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo processo'}
    </Button>
  )
}

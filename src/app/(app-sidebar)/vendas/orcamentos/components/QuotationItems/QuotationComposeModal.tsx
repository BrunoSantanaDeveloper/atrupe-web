'use client'

// O botão "Composição" do modal "Qual item deseja adicionar?" (ORC-11): para
// quando o produto não existe pronto. O vendedor informa nome, medida,
// quantidade e descritivo e monta o item com o MESMO editor de fluxo do
// produto (FL-1 a FL-7): etapas preenchidas por processos, etapas seguintes
// com os usuais primeiro, partes e caminhos paralelos. A montagem fica só
// neste item — não vira cadastro, a não ser pelo "Salvar como produto", bem
// discreto, que cria o produto "Em edição" (IP-14).
//
// O vendedor vê os recursos e o PREÇO DE VENDA de cada um, como o legado
// ("Lona 440 g – R$ 25,00"). Nunca o custo (ORC-7).

// React
import { useEffect, useState } from 'react'

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
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  FlowCanvas,
  type FlowNode,
  type FlowMenuItem,
} from '@/components/common/FlowCanvas/FlowCanvas'
import {
  NextStepDialog,
  LinkStageDialog,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/components/NextStepDialog'

// Types
import type { ComposedItemSummary } from '../../[quotationId]/composicao/types'
import type {
  FlowStage,
  ComposedItemView,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
// As etapas usam o editor da composição do produto, com o id do rascunho
// (Fase 4.5): as rotas vão para o orçamento
import {
  linkBlock,
  unlinkBlock,
  addOwnBlock,
  addPartBlock,
  addAssemblyBlock,
  getPartCandidates,
  removeAssemblyBlock,
  replaceBlockProcess,
  getAssemblyResources,
  getNextStepCandidates,
} from '@/actions/assembly'
import {
  addComposedItem,
  updateComposedItem,
  saveDraftAsProduct,
  createDraftAssembly,
  updateDraftAssembly,
  getComposedItemView,
} from '@/actions/composed-item'
import { QUOTATION_DATA_QUERY_KEY } from '../../[quotationId]/components/Quotation'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { resourceKindObj } from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'

// Third-party
import { toast } from 'sonner'
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

// Icons
import {
  IconLink,
  IconTrash,
  IconUnlink,
  IconReplace,
  IconPlus,
} from '@tabler/icons-react'

// Utils
import { formatMoney } from '@/lib/utils'

type Stage = ComposedItemView['stages'][number]

type Dialog =
  | { kind: 'next'; after: Stage | null; before?: Stage }
  | { kind: 'link'; stage: Stage }
  | { kind: 'swap'; stage: Stage }
  | null

interface Props {
  open: boolean
  quotationId: string
  // Ao editar, o item já montado (ORC-4)
  editing?: ComposedItemSummary | null
  onClose: () => void
}

const num = (value: number, digits = 3) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits })

const amount = (value: number, unit: string) => {
  if (unit !== 'min' || value < 60) return `${num(value)} ${unit}`
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value - hours * 60)
  return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`
}

const toNode = (stage: FlowStage): FlowNode => ({
  id: stage.id,
  name: stage.name,
  sector: stage.sector,
  dependsOn: stage.dependsOn,
  subtitle: stage.partProductId ? 'Parte' : undefined,
  part: stage.partFlow ? stage.partFlow.map(toNode) : null,
})

export function QuotationComposeModal({
  open,
  quotationId,
  editing,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  const [draftId, setDraftId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [width, setWidth] = useState('1')
  const [height, setHeight] = useState('1')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedPart, setExpandedPart] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [saving, setSaving] = useState(false)

  const measure = {
    quantity: Math.max(1, Math.round(Number(quantity) || 1)),
    width: Number(width) || 0,
    height: Number(height) || 0,
  }

  // Ao abrir: o item em edição, ou um rascunho novo em memória
  useEffect(() => {
    if (!open) return
    setSelectedId(null)
    setExpandedPart(null)
    setDialog(null)
    if (editing) {
      setDraftId(editing.draftId)
      setName(editing.name)
      setDescription(editing.description)
      setQuantity(String(editing.quantity))
      // Rascunho sem medida chega com 0: o editor abre no 1 × 1 m de um
      // item novo, mas a lista não inventa a medida
      setWidth(String(editing.width || 1))
      setHeight(String(editing.height || 1))
      return
    }
    setName('')
    setDescription('')
    setQuantity('1')
    setWidth('1')
    setHeight('1')
    setDraftId(null)
    createDraftAssembly({ quotationId }).then((res) => {
      if (res.success && res.data) setDraftId(res.data)
    })
  }, [open, editing, quotationId])

  const { data: viewRes } = useQuery({
    enabled: open && !!draftId,
    queryKey: ['composed-view', draftId, measure],
    queryFn: () => getComposedItemView({ productId: draftId!, measure }),
    placeholderData: keepPreviousData,
  })
  const { data: resourcesRes } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
  })
  const { data: partsRes } = useQuery({
    enabled: open && !!draftId,
    queryKey: ['assembly-parts', draftId],
    queryFn: () => getPartCandidates({ productId: draftId! }),
  })
  const nextAfterId =
    dialog?.kind === 'next'
      ? dialog.after?.id || null
      : dialog?.kind === 'swap'
        ? dialog.stage.dependsOn[0] || null
        : null
  const { data: candidatesRes } = useQuery({
    enabled: !!draftId && (dialog?.kind === 'next' || dialog?.kind === 'swap'),
    queryKey: ['next-step', draftId, nextAfterId],
    queryFn: () =>
      getNextStepCandidates({ productId: draftId!, blockId: nextAfterId }),
  })

  const view = viewRes?.data
  const stages = view?.stages || []
  const sectors = resourcesRes?.data?.sectors || []

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['composed-view', draftId] })

  const run = async (
    action: Promise<{ success: boolean; message: string }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) return toast.error(res.message)
    if (success) toast.success(success)
    await refresh()
  }

  const selected =
    stages.find((stage) => stage.id === selectedId) || stages[0] || null
  const nameOf = (id: string) =>
    stages.find((stage) => stage.id === id)?.name || ''

  const nodes: FlowNode[] = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    sector: stage.sector,
    dependsOn: stage.dependsOn.filter((id) =>
      stages.some((item) => item.id === id),
    ),
    // O preço de venda da etapa, nunca o custo (ORC-7, ORC-11)
    subtitle: `${stage.sector} · ${formatMoney(stage.sale)}`,
    badge:
      !stage.partProductId && !stage.lines.length
        ? { text: 'Sem recursos', variant: 'warningLight' as const }
        : undefined,
    part: stage.partFlow ? stage.partFlow.map(toNode) : null,
  }))

  const stageMenu = (node: FlowNode): FlowMenuItem[] => {
    const stage = stages.find((item) => item.id === node.id)
    if (!stage || !draftId) return []
    return [
      ...(stage.partProductId
        ? []
        : [
            {
              label: stage.processId
                ? 'Trocar o processo'
                : 'Preencher com um processo',
              icon: IconReplace,
              onSelect: () => setDialog({ kind: 'swap', stage }),
            },
          ]),
      {
        label: 'Ligar a…',
        icon: IconLink,
        disabled: stages.length < 2,
        onSelect: () => setDialog({ kind: 'link', stage }),
      },
      ...stage.dependsOn
        .filter((id) => stages.some((item) => item.id === id))
        .map((id) => ({
          label: `Desligar de ${nameOf(id).toLowerCase()}`,
          icon: IconUnlink,
          onSelect: () =>
            run(
              unlinkBlock({
                productId: draftId,
                blockId: stage.id,
                fromId: id,
              }),
              'Ligação desfeita',
            ),
        })),
      {
        label: 'Remover etapa',
        icon: IconTrash,
        destructive: true,
        separator: true,
        onSelect: () =>
          alertDialog.open({
            title: `Remover ${stage.name}?`,
            description:
              'A etapa sai do item. As etapas que vinham depois dela passam a vir depois das anteriores.',
            confirmLabel: 'Remover',
            cancelLabel: 'Cancelar',
            confirmVariant: 'error',
            onConfirm: async () => {
              const res = await removeAssemblyBlock({
                productId: draftId,
                blockId: stage.id,
              })
              if (!res.success) throw new Error(res.message)
              await refresh()
            },
            toastMsg: {
              success: 'Etapa removida',
              error: 'Erro ao remover a etapa',
            },
          }),
      },
    ]
  }

  const close = () => {
    setDialog(null)
    onClose()
  }

  const confirm = async () => {
    if (!draftId) return
    if (!name.trim()) return toast.error('Informe o nome do item')
    setSaving(true)
    try {
      await updateDraftAssembly({
        productId: draftId,
        values: { name, measure },
      })
      const payload = {
        quotationId,
        name,
        description,
        quantity: measure.quantity,
        width: measure.width,
        height: measure.height,
      }
      const res = editing
        ? await updateComposedItem({ ...payload, itemId: editing.id })
        : await addComposedItem({ ...payload, draftId })
      if (!res.success) return toast.error(res.message)
      toast.success(editing ? 'Item atualizado' : 'Item acrescentado')
      // O item e o total do orçamento voltam do servidor
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      close()
    } finally {
      setSaving(false)
    }
  }

  // Bem discreto (ORC-11): o produto nasce "Em edição" (IP-14)
  const saveAsProduct = async () => {
    if (!draftId) return
    const res = await saveDraftAsProduct({
      productId: draftId,
      name: name || view?.name || '',
    })
    if (!res.success) return toast.error(res.message)
    toast.success(
      'Produto criado em edição. Revise a composição em Configurações › Produtos antes de liberar para venda.',
    )
    queryClient.invalidateQueries({ queryKey: ['assembly-parts'] })
    queryClient.invalidateQueries({ queryKey: ['composed-product-ids'] })
  }

  const attention = !!view && stages.length === 0

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => !value && close()}>
        <DialogContent className="sm:max-w-[90%] lg:max-w-[1040px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {editing ? 'Editar composição' : 'Composição'}
                  {attention && (
                    <Badge status variant="warningLight">
                      Exige atenção
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Para quando o produto não existe pronto. Monte o item pelo
                  caminho da produção: a montagem fica só neste orçamento.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto">
            {/* 1. O que está sendo vendido */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              <div className="col-span-2 space-y-2 md:col-span-3">
                <Label htmlFor="compose-name">Nome do item</Label>
                <Input
                  id="compose-name"
                  autoFocus={!editing}
                  placeholder="Ex.: Letreiro em ACM com iluminação"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compose-quantity">Quantidade</Label>
                <Input
                  id="compose-quantity"
                  type="number"
                  min={1}
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compose-width">Largura (m)</Label>
                <Input
                  id="compose-width"
                  type="number"
                  min={0}
                  step="0.01"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compose-height">Altura (m)</Label>
                <Input
                  id="compose-height"
                  type="number"
                  min={0}
                  step="0.01"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2 md:col-span-6">
                <Label htmlFor="compose-description">Descritivo</Label>
                <Textarea
                  id="compose-description"
                  placeholder="O que o cliente vai receber. Aparece na proposta, abaixo do nome do item."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>

            {/* 2. O fluxo: o mesmo editor do produto (FL-5) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Etapas da produção
                  </p>
                  <p className="text-xs text-gray">
                    Use o &quot;+&quot; depois de uma caixa para a etapa
                    seguinte. Clique na caixa para ver os recursos.
                  </p>
                </div>
                {attention && (
                  <p className="text-sm text-warning-700">
                    Sem nenhuma etapa, o item fica marcado &quot;Exige
                    atenção&quot;. O orçamento segue, mas sem custo nem
                    produção.
                  </p>
                )}
              </div>
              {!draftId || !view ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <FlowCanvas
                  nodes={nodes}
                  selectedId={selected?.id}
                  onSelect={setSelectedId}
                  menu={stageMenu}
                  expandedPartId={expandedPart}
                  onTogglePart={(id) =>
                    setExpandedPart((current) => (current === id ? null : id))
                  }
                  onAddAfter={(node) => {
                    const after = stages.find((item) => item.id === node.id)
                    if (after) setDialog({ kind: 'next', after })
                  }}
                  onInsertBetween={(from, to) => {
                    const after = stages.find((item) => item.id === from.id)
                    const before = stages.find((item) => item.id === to.id)
                    if (after && before) {
                      setDialog({ kind: 'next', after, before })
                    }
                  }}
                  onAddPath={() => setDialog({ kind: 'next', after: null })}
                  addPathLabel={
                    stages.length ? 'Novo caminho' : 'Primeira etapa'
                  }
                  empty={
                    <EmptyState
                      className="py-6"
                      title="Nenhuma etapa ainda"
                      description="Comece pela etapa onde o item começa — a criação, a impressão, a estrutura."
                      action={
                        <Button
                          type="button"
                          LeftIcon={IconPlus}
                          onClick={() =>
                            setDialog({ kind: 'next', after: null })
                          }
                        >
                          Primeira etapa
                        </Button>
                      }
                    />
                  }
                />
              )}
            </div>

            {/* 3. A etapa escolhida: os recursos com o preço de venda de
                cada um (ORC-11), e nunca o custo (ORC-7) */}
            {selected && (
              <div className="rounded-xl border border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selected.name}
                    </p>
                    <p className="text-xs text-gray">
                      {selected.sector}
                      {selected.setupMinutes
                        ? ` · preparo ${amount(selected.setupMinutes, 'min')}`
                        : ''}
                    </p>
                  </div>
                  <PermissionGate permissions={['values:values:view']}>
                    <p className="text-sm">
                      <span className="text-gray">Venda da etapa </span>
                      <span className="font-semibold text-gray-900">
                        {formatMoney(selected.sale)}
                      </span>
                    </p>
                  </PermissionGate>
                </div>
                {selected.lines.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[50%]">Recurso</TableHead>
                        <TableHead numeric className="w-[25%]">
                          Quantidade
                        </TableHead>
                        <TableHead className="w-[25%] text-right">
                          Venda
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <p className="text-sm font-medium text-gray-800">
                              {line.resource || line.name}
                            </p>
                            <p className="text-xs text-gray">
                              {line.name !== line.resource
                                ? `${line.name} · `
                                : ''}
                              <ResourceKindLabel
                                kind={line.kind}
                                label={resourceKindObj[line.kind]}
                              />
                            </p>
                          </TableCell>
                          <TableCell
                            numeric
                            className="whitespace-nowrap text-sm"
                          >
                            {line.quantity === null
                              ? 'Informado na venda'
                              : amount(line.quantity, line.unit)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                            <PermissionGate
                              permissions={['values:values:view']}
                              fallback={<span>•••</span>}
                            >
                              {line.sale === null
                                ? '-'
                                : formatMoney(line.sale)}
                            </PermissionGate>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="px-4 py-4 text-sm text-gray">
                    {selected.partProductId
                      ? 'A parte traz a composição dela. Abra a caixa no fluxo para ver o que ela tem por dentro.'
                      : 'Esta etapa não tem recursos. Preencha com um processo cadastrado pelo menu da caixa.'}
                  </p>
                )}
              </div>
            )}

            {view && stages.length > 0 && (
              <PermissionGate permissions={['values:values:view']}>
                <p className="text-right text-sm">
                  <span className="text-gray">Total do item </span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatMoney(view.total)}
                  </span>
                </p>
              </PermissionGate>
            )}
          </DialogBody>
          <DialogFooter className="flex-wrap gap-3 sm:justify-between">
            {/* Salvar como produto cria um cadastro: pede a permissão de
                criar produto, como manda o contrato (o vazio segura o
                rodapé à direita) */}
            <PermissionGate
              permissions={['product_settings:products:create']}
              fallback={<span />}
            >
              <Button
                type="button"
                size="sm"
                variant="link"
                className="px-0 text-gray"
                disabled={!stages.length}
                onClick={saveAsProduct}
              >
                Salvar como produto
              </Button>
            </PermissionGate>
            <div className="space-x-2">
              <Button type="button" variant="neutralOutline" onClick={close}>
                Cancelar
              </Button>
              <Button
                type="button"
                isLoading={saving}
                disabled={!draftId}
                onClick={confirm}
              >
                {editing ? 'Salvar item' : 'Acrescentar ao orçamento'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NextStepDialog
        open={dialog?.kind === 'next'}
        onOpenChange={() => setDialog(null)}
        title={
          dialog?.kind === 'next'
            ? dialog.before
              ? `Entre ${dialog.after?.name.toLowerCase()} e ${dialog.before.name.toLowerCase()}`
              : dialog.after
                ? `Depois de ${dialog.after.name.toLowerCase()}`
                : stages.length
                  ? 'Novo caminho'
                  : 'Primeira etapa'
            : ''
        }
        afterName={dialog?.kind === 'next' ? dialog.after?.name : null}
        candidates={dialog?.kind === 'next' ? candidatesRes?.data : undefined}
        sectors={sectors}
        parts={partsRes?.data || []}
        onPickProcess={(processId) => {
          if (dialog?.kind !== 'next' || !draftId) return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            addAssemblyBlock({
              productId: draftId,
              processId,
              dependsOn,
              insertBefore,
            }).then((res) => {
              if (res.success && res.data) setSelectedId(res.data)
              return res
            }),
            'Etapa adicionada',
          )
        }}
        onCreateOwn={(stageName, sector) => {
          if (dialog?.kind !== 'next' || !draftId) return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            addOwnBlock({
              productId: draftId,
              name: stageName,
              sector,
              dependsOn,
              insertBefore,
            }).then((res) => {
              if (res.success && res.data) setSelectedId(res.data)
              return res
            }),
            'Etapa criada',
          )
        }}
        onPickPart={(partProductId) => {
          if (dialog?.kind !== 'next' || !draftId) return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            addPartBlock({
              productId: draftId,
              partProductId,
              dependsOn,
              insertBefore,
            }).then((res) => {
              if (res.success && res.data) setSelectedId(res.data)
              return res
            }),
            'Parte adicionada',
          )
        }}
      />
      <NextStepDialog
        open={dialog?.kind === 'swap'}
        onOpenChange={() => setDialog(null)}
        title={
          dialog?.kind === 'swap'
            ? dialog.stage.processId
              ? `Trocar o processo de ${dialog.stage.name.toLowerCase()}`
              : `Preencher ${dialog.stage.name.toLowerCase()} com um processo`
            : ''
        }
        description="A caixa continua no mesmo lugar do fluxo, com as mesmas ligações. O que muda são os recursos e o tempo."
        afterName={
          dialog?.kind === 'swap' && dialog.stage.dependsOn[0]
            ? nameOf(dialog.stage.dependsOn[0])
            : null
        }
        candidates={dialog?.kind === 'swap' ? candidatesRes?.data : undefined}
        sectors={sectors}
        allowOwn={false}
        allowPart={false}
        onPickProcess={(processId) => {
          if (dialog?.kind !== 'swap' || !draftId) return
          const blockId = dialog.stage.id
          setDialog(null)
          run(
            replaceBlockProcess({ productId: draftId, blockId, processId }),
            'Processo trocado',
          )
        }}
        onCreateOwn={() => undefined}
      />
      <LinkStageDialog
        open={dialog?.kind === 'link'}
        onOpenChange={() => setDialog(null)}
        block={dialog?.kind === 'link' ? dialog.stage : null}
        stages={stages.map((stage) => ({
          id: stage.id,
          name: stage.name,
          sector: stage.sector,
        }))}
        onPick={(toId) => {
          if (dialog?.kind !== 'link' || !draftId) return
          const blockId = dialog.stage.id
          setDialog(null)
          run(
            linkBlock({ productId: draftId, blockId, toId }),
            'Etapas ligadas',
          )
        }}
      />
    </>
  )
}

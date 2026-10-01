'use client'

import Link from 'next/link'

// PROVISÓRIO nos dados: lê `src/actions/product-assembly.ts`, que também faz
// o cálculo (SEG-1).
//
// O produto composto montado por etapas — o "item pronto" do legado na nova
// versão (área 8, §3.4.1). A pergunta que a tela responde primeiro: quanto
// custa este produto na medida em que ele é vendido, e se o preço cobre.

// React
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// UI
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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  LineDialog,
  RulesDialog,
  NewLineDialog,
  OptionsDialog,
  LibraryDialog,
  type LineValues,
} from './AssemblyDialogs'
import { PriceTiersCard } from './PriceTiersCard'
import { NextStepDialog, LinkStageDialog } from './NextStepDialog'
import {
  FlowCanvas,
  type FlowNode,
  type FlowMenuItem,
} from '@/components/common/FlowCanvas/FlowCanvas'

// Types
import {
  unitKindObj,
  unitSymbol,
  unitSaleLabel,
  unitAmountLabel,
  productDimensionObj,
  formulaInputs,
  type FormulaInput,
  type UnitKind,
  type ComputedLine,
  type ComputedBlock,
  type AssemblyStatus,
  type AssemblyMeasure,
  type ProductDimension,
} from '../assembly'

// Actions
import {
  getAssembly,
  updateAssembly,
  addOwnBlock,
  addAssemblyLine,
  addAssemblyBlock,
  removeAssemblyLine,
  getAssemblyResources,
  addLineOption,
  removeLineOption,
  addPartBlock,
  getPartCandidates,
  addVariationBlock,
  removeVariationBlock,
  getLibrary,
  importFromLibrary,
  linkBlock,
  unlinkBlock,
  replaceBlockProcess,
  getNextStepCandidates,
  resetAssemblyLine,
  restoreProcessLines,
  setBlockLocalRules,
  updateAssemblyLine,
  removeAssemblyBlock,
  addVariation,
  removeVariation,
  setVariationLine,
  setVariationPrice,
  clearVariationLine,
} from '@/actions/product-assembly'

// Hooks / Store / Consts
import {
  assemblyStatusObj,
  assemblyOverrideObj,
} from '@/consts/productAssembly'
import { formulaObj, resourceKindObj } from '@/consts/processes'

// Third-party
import { toast } from 'sonner'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import {
  IconLink,
  IconTrash,
  IconBooks,
  IconPencil,
  IconSearch,
  IconUnlink,
  IconReplace,
  IconSettings,
  IconCirclePlus,
  IconArrowBackUp,
  IconListDetails,
} from '@tabler/icons-react'

// Utils
import { updateFilterParam } from '@/lib/filter-utils'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const EDIT = ['product_settings:products:edit']

const num = (value: number, digits = 3) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits })

// Tempo em horas e minutos, como o legado mostra: 90 min → 1h30 (IP-33)
const amount = (value: number, unit: string) => {
  if (unit !== 'min' || value < 60) return `${num(value)} ${unit}`
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value - hours * 60)
  return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`
}

// O campo que a fórmula consome está zerado nesta etapa? (IP-35)
const zeroInput = (input: FormulaInput, block: ComputedBlock) => {
  const { measure: m, rules } = block
  switch (input) {
    case 'quantidade':
      return !m.quantity
    case 'largura':
      return !m.width
    case 'altura':
      return !m.height
    case 'área':
    case 'perímetro':
      return !m.width || !m.height
    case 'campo extra':
      return rules.extraField === 'NONE' || !rules.extraFieldDefault
    case 'tempo':
      return !rules.timeField || !rules.timeFieldDefault
    default:
      return false
  }
}

const money = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const toOptions = <K extends string>(obj: { [key in K]: string }) =>
  (Object.keys(obj) as K[]).map((value) => ({ value, label: obj[value] }))

type Dialog =
  // "O que vem depois?" (FL-5): depois de `after` (nulo é um caminho novo)
  // e, ao inserir no meio da ligação, antes de `before`
  | { kind: 'next'; after: ComputedBlock | null; before?: ComputedBlock }
  // Ligar a outra etapa: o ponto de encontro (FL-4)
  | { kind: 'link'; block: ComputedBlock }
  // Trocar ou escolher o processo que preenche a etapa (FL-6)
  | { kind: 'swap'; block: ComputedBlock }
  | { kind: 'line'; block: ComputedBlock; line: ComputedLine }
  | { kind: 'rules'; block: ComputedBlock }
  | { kind: 'newLine'; block: ComputedBlock }
  | { kind: 'options'; blockId: string; lineId: string }
  | { kind: 'library' }
  | null

// A caixa do fluxo a partir da etapa calculada
const toFlowNode = (
  block: ComputedBlock,
  allBlocks: ComputedBlock[],
): FlowNode => {
  const subtitle = block.part
    ? `Parte · ${block.part.stages} ${block.part.stages === 1 ? 'etapa' : 'etapas'}`
    : block.processId
      ? `Processo · ${block.sector}`
      : block.sector
  const badge = block.variationOnly
    ? { text: 'Só nesta variação', variant: 'blueLight' as const }
    : block.localRules
      ? assemblyOverrideObj.LOCAL_RULES
      : !block.part && !block.lines.length
        ? { text: 'Sem recursos', variant: 'warningLight' as const }
        : undefined
  return {
    id: block.id,
    name: block.name,
    sector: block.sector,
    // Só as ligações com etapas que estão no desenho
    dependsOn: block.dependsOn.filter((id) =>
      allBlocks.some((item) => item.id === id),
    ),
    subtitle,
    badge,
    part: block.partFlow
      ? block.partFlow.map(function toNode(stage): FlowNode {
          return {
            id: stage.id,
            name: stage.name,
            sector: stage.sector,
            dependsOn: stage.dependsOn,
            subtitle: stage.partProductId ? 'Parte' : undefined,
            part: stage.partFlow ? stage.partFlow.map(toNode) : null,
          }
        })
      : null,
  }
}

export function AssemblyEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  // A medida da simulação é da tela; a medida padrão só muda ao salvar
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [newVariation, setNewVariation] = useState<string | null>(null)
  // A etapa escolhida no fluxo: o detalhe dela (recursos, tempo) aparece
  // embaixo do desenho (FL-5, FL-8)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedPart, setExpandedPart] = useState<string | null>(null)

  // A variação vista fica na URL (design.md §8): ?variacao=
  const router = useRouter()
  const params = useSearchParams()
  const variationId = params.get('variacao')
  const setVariation = (id: string | null) =>
    updateFilterParam('variacao', id || 'all', { router, params })
  const [description, setDescription] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['assembly', productId, measure, variationId],
    queryFn: () => getAssembly({ productId, measure, variationId }),
    placeholderData: keepPreviousData,
  })
  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
  })

  const { data: libraryRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-library'],
    queryFn: () => getLibrary(),
  })
  const { data: partsRes } = useQuery({
    queryKey: ['assembly-parts', productId],
    queryFn: () => getPartCandidates({ productId }),
  })

  // O que "+ etapa seguinte" oferece depois da etapa escolhida (FL-7)
  const nextAfterId =
    dialog?.kind === 'next'
      ? dialog.after?.id || null
      : dialog?.kind === 'swap'
        ? dialog.block.dependsOn[0] || null
        : null
  const { data: candidatesRes } = useQuery({
    enabled: dialog?.kind === 'next' || dialog?.kind === 'swap',
    queryKey: ['next-step', productId, nextAfterId],
    queryFn: () => getNextStepCandidates({ productId, blockId: nextAfterId }),
  })

  const assembly = data?.data
  const resources = resourcesRes?.data

  useEffect(() => {
    if (assembly && !measure) {
      setMeasure(assembly.measure)
      setDescription(assembly.technicalDescription)
    }
  }, [assembly, measure])

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['assembly', productId] })

  // Toda gravação passa por aqui: toast de erro ou atualização da tela
  const run = async (
    action: Promise<{ success: boolean; message: string }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) return toast.error(res.message)
    if (success) toast.success(success)
    await refresh()
  }

  if (isLoading || !assembly || !measure) {
    return <Skeleton className="h-[480px] w-full" />
  }

  const saved = assembly.measure
  const variation = assembly.activeVariation
  const inVariation = !!variation
  const measureChanged =
    saved.quantity !== measure.quantity ||
    saved.width !== measure.width ||
    saved.height !== measure.height

  // A etapa é do setor: todos os setores da empresa podem começar o produto
  const baseSectors = resources?.sectors || []

  // A etapa aberta embaixo do fluxo: a escolhida, ou a primeira
  const selectedBlock =
    assembly.blocks.find((item) => item.id === selectedId) ||
    assembly.blocks[0] ||
    null
  const flowNodes = assembly.blocks.map((item) =>
    toFlowNode(item, assembly.blocks),
  )
  const nameOf = (id: string) =>
    assembly.blocks.find((item) => item.id === id)?.name || ''

  // O menu da caixa (FL-5): abrir o detalhe, trocar o processo, ligar a
  // outra etapa, remover. Na variação, só a etapa que é dela sai
  const stageMenu = (node: FlowNode): FlowMenuItem[] => {
    const block = assembly.blocks.find((item) => item.id === node.id)
    if (!block) return []
    if (inVariation) {
      return block.variationOnly
        ? [
            {
              label: 'Remover desta variação',
              icon: IconTrash,
              destructive: true,
              onSelect: () =>
                run(
                  removeVariationBlock({
                    productId,
                    variationId: variation!.id,
                    blockId: block.id,
                  }),
                  'Etapa removida da variação',
                ),
            },
          ]
        : []
    }
    return [
      {
        label: 'Configurar etapa',
        icon: IconSettings,
        onSelect: () => setDialog({ kind: 'rules', block }),
      },
      ...(block.part
        ? []
        : [
            {
              label: block.processId
                ? 'Trocar o processo'
                : 'Preencher com um processo',
              icon: IconReplace,
              onSelect: () => setDialog({ kind: 'swap', block }),
            },
          ]),
      {
        label: 'Ligar a…',
        icon: IconLink,
        disabled: assembly.blocks.length < 2,
        onSelect: () => setDialog({ kind: 'link', block }),
      },
      ...block.dependsOn
        .filter((id) => assembly.blocks.some((item) => item.id === id))
        .map((id) => ({
          label: `Desligar de ${nameOf(id).toLowerCase()}`,
          icon: IconUnlink,
          onSelect: () =>
            run(
              unlinkBlock({ productId, blockId: block.id, fromId: id }),
              'Ligação desfeita',
            ),
        })),
      {
        label: 'Remover etapa',
        icon: IconTrash,
        destructive: true,
        separator: true,
        onSelect: () => removeBlock(block),
      },
    ]
  }

  // O sugerido já vem na unidade comercial: adotar é gravar como valor de
  // venda, o mesmo campo do cadastro do START
  const adoptSuggested = () =>
    run(
      assembly.activeVariation
        ? setVariationPrice({
            productId,
            variationId: assembly.activeVariation.id,
            unitPrice: assembly.suggestedUnitPrice,
          })
        : updateAssembly({
            productId,
            values: { unitPrice: assembly.suggestedUnitPrice },
          }),
      'Preço sugerido adotado',
    )

  const removeBlock = (block: ComputedBlock) =>
    alertDialog.open({
      title: `Remover ${block.name}?`,
      description: [
        'A etapa sai do fluxo, e as etapas que vinham depois dela passam a vir depois das anteriores.',
        block.processId ? 'O processo continua cadastrado.' : '',
      ]
        .filter(Boolean)
        .join(' '),
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeAssemblyBlock({ productId, blockId: block.id })
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: { success: 'Etapa removida', error: 'Erro ao remover a etapa' },
    })

  const removeLine = (block: ComputedBlock, line: ComputedLine) =>
    alertDialog.open({
      title: `Remover ${line.name}?`,
      // Na etapa que acompanha um processo, a linha sai só daqui (CP-21)
      description:
        block.processId && line.sourceLineId
          ? `A linha sai só deste produto. O processo continua com ela, e dá para restaurá-la depois.`
          : `A linha sai da etapa ${block.name}.`,
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeAssemblyLine({
          productId,
          blockId: block.id,
          lineId: line.id,
        })
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: { success: 'Linha removida', error: 'Erro ao remover a linha' },
    })

  const dependsText = (block: ComputedBlock) => {
    const names = block.dependsOn.map(nameOf).filter(Boolean)
    if (!names.length) return 'Começa o produto'
    return `Depois de ${names.join(' e ')}`
  }

  const measureText = (block: ComputedBlock) => {
    const { rules, measure: m } = block
    const qty = `${num(m.quantity)} ${m.quantity === 1 ? 'unidade' : 'unidades'}`
    if (rules.dimension === 'NONE') {
      return rules.followsBase ? qty : 'uma vez por pedido'
    }
    const size = `${num(m.width)} × ${num(m.height)} m`
    return rules.dimension === 'SAME_AS_PARENT'
      ? `${qty} · mesma medida da base (${size})`
      : `${qty} · ${size}`
  }

  // O detalhe da etapa escolhida no fluxo (FL-5): recursos, tempo e regras,
  // fora do desenho. Quem monta vê tudo (FL-8)
  const stageDetail = (item: ComputedBlock) => {
    return (
      <Card key={item.id} className="border-brand-200">
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutralLight">{item.sector}</Badge>
              <Badge variant="blueLight">{dependsText(item)}</Badge>
              {item.processId && (
                <Badge variant="neutralLight">Processo cadastrado</Badge>
              )}
              {item.part && <Badge variant="blueLight">Parte</Badge>}
              {item.variationOnly && (
                <Badge variant={assemblyOverrideObj.VARIATION_CHANGED.variant}>
                  Só nesta variação
                </Badge>
              )}
              {item.localRules && (
                <Badge variant={assemblyOverrideObj.LOCAL_RULES.variant}>
                  {assemblyOverrideObj.LOCAL_RULES.text}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>
              {measureText(item)}
              {` · tarefa: ${item.taskType.toLowerCase()}`}
              {item.rules.extraField !== 'NONE'
                ? ` · ${item.rules.extraFieldName}: ${num(item.rules.extraFieldDefault)}`
                : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <PermissionGate permissions={['values:values:view']}>
              <p className="text-right">
                <span className="block text-xs text-gray">
                  Custo · venda da etapa
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {money(item.cost)}
                  <span className="font-normal text-gray"> · </span>
                  <span className="text-success-700">{money(item.sale)}</span>
                </span>
              </p>
            </PermissionGate>
            {/* Na variação: acabamento só dela sobre a base, e a etapa só
                dela sai inteira (PV-7) */}
            {inVariation && (
              <PermissionGate permissions={EDIT}>
                <div className="flex gap-1">
                  {!item.variationOnly && (
                    <ActionButton
                      Icon={IconCirclePlus}
                      variant="neutralGhost"
                      tooltip={`Etapa seguinte só em ${variation?.name}`}
                      onClick={() => setDialog({ kind: 'next', after: item })}
                    />
                  )}
                  {item.variationOnly && (
                    <ActionButton
                      Icon={IconTrash}
                      variant="errorGhost"
                      tooltip="Remover desta variação"
                      onClick={() =>
                        run(
                          removeVariationBlock({
                            productId,
                            variationId: variation!.id,
                            blockId: item.id,
                          }),
                          'Etapa removida da variação',
                        )
                      }
                    />
                  )}
                </div>
              </PermissionGate>
            )}
            {/* A estrutura é da base: a variação só muda linhas (PV-2) */}
            {!inVariation && (
              <PermissionGate permissions={EDIT}>
                <div className="flex gap-1">
                  <ActionButton
                    Icon={IconCirclePlus}
                    variant="neutralGhost"
                    tooltip="Etapa seguinte"
                    onClick={() => setDialog({ kind: 'next', after: item })}
                  />
                  <ActionButton
                    Icon={IconSettings}
                    variant="neutralGhost"
                    tooltip="Configurar etapa"
                    onClick={() => setDialog({ kind: 'rules', block: item })}
                  />
                  <ActionButton
                    Icon={IconTrash}
                    variant="errorGhost"
                    tooltip="Remover etapa"
                    onClick={() => removeBlock(item)}
                  />
                </div>
              </PermissionGate>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {item.part ? (
            <div className="mx-6 mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-25 px-4 py-3">
              <p className="text-sm text-gray-700">
                Outro produto usado aqui, com a composição dele (
                {item.part.stages} {item.part.stages === 1 ? 'etapa' : 'etapas'}
                ) calculada na medida desta etapa. Para mudar o que ele leva,
                abra a composição dele.
              </p>
              <Button
                size="sm"
                variant="neutralOutline"
                LeftIcon={IconSearch}
                asChild
              >
                <Link
                  href={`/configuracoes/produtos/${item.part.productId}/composicao`}
                >
                  Abrir a composição da parte
                </Link>
              </Button>
            </div>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[18%]">Linha</TableHead>
                  <TableHead className="w-[24%]">Recurso</TableHead>
                  <TableHead className="w-[12%]">Consumo</TableHead>
                  <TableHead className="w-[16%]">Cálculo</TableHead>
                  <TableHead className="w-[10%] text-right">
                    Quantidade
                  </TableHead>
                  <TableHead className="w-[8%] text-right">Custo</TableHead>
                  <TableHead className="w-[8%] text-right">Venda</TableHead>
                  <TableHead className="w-[4%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.lines.map((line) => {
                  const unit =
                    line.selected?.unit || line.options[0]?.unit || ''

                  return (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="font-medium text-gray-800">{line.name}</p>
                        <p className="text-xs text-gray">
                          {resourceKindObj[line.kind]}
                          {line.overridden ? ' · ajustada neste produto' : ''}
                          {line.addedHere ? ' · só neste produto' : ''}
                        </p>
                        {line.optional && (
                          <Badge className="mt-1" variant="neutralLight">
                            {line.optionalDefault
                              ? 'Opcional · vem marcada'
                              : 'Opcional · fora do custo padrão'}
                          </Badge>
                        )}
                        {!line.options.length && (
                          <Badge className="mt-1" variant="errorLight">
                            Sem recurso: complete ou remova
                          </Badge>
                        )}
                        {line.variationOverride && (
                          <Badge
                            className="mt-1"
                            variant={
                              assemblyOverrideObj.VARIATION_CHANGED.variant
                            }
                          >
                            {assemblyOverrideObj.VARIATION_CHANGED.text}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {line.mode === 'CHOOSE' ? (
                          <SelectBasic
                            name={`choose-${line.id}`}
                            label=""
                            className="w-full"
                            options={line.options.map((option) => ({
                              value: option.id,
                              label: option.name,
                            }))}
                            value={line.selectedId}
                            onChange={(value) =>
                              run(
                                assembly.activeVariation
                                  ? setVariationLine({
                                      productId,
                                      variationId: assembly.activeVariation.id,
                                      blockId: item.id,
                                      lineId: line.id,
                                      values: { selectedId: value },
                                    })
                                  : updateAssemblyLine({
                                      productId,
                                      blockId: item.id,
                                      lineId: line.id,
                                      values: { selectedId: value },
                                    }),
                              )
                            }
                          />
                        ) : line.mode === 'LIST' ? (
                          <div>
                            <p className="text-sm text-gray-800">
                              {line.options
                                .map((option) => option.name)
                                .join(' · ')}
                            </p>
                            <p className="text-xs text-gray">
                              O vendedor preenche o que usou
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-800">
                            {line.selected?.name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {line.mode === 'LIST' ? (
                          '-'
                        ) : (
                          <>
                            <p className="text-sm">
                              {/* Estas fórmulas usam o tempo da etapa, não o
                                consumo (IP-32) */}
                              {item.rules.timeField &&
                              (line.formula === 'EQUAL_TIME' ||
                                line.formula === 'PER_TIME')
                                ? `tempo da etapa (${amount(item.rules.timeFieldDefault || 0, 'min')})`
                                : amount(line.effective.perUnit, unit)}
                            </p>
                            {(line.effective.lossPercent > 0 ||
                              line.effective.minimum !== null) && (
                              <p className="text-xs text-gray">
                                {[
                                  line.effective.lossPercent > 0
                                    ? `+${num(line.effective.lossPercent, 1)}% de perda`
                                    : null,
                                  line.effective.minimum !== null
                                    ? `mínimo ${num(line.effective.minimum)} ${unit}`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}
                            {line.effective.own && (
                              <p className="text-xs text-brand-700">
                                desta opção
                              </p>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray">
                        {line.mode === 'LIST'
                          ? 'Informado na venda'
                          : formulaObj[line.formula]?.label}
                        {line.mode !== 'LIST' &&
                          formulaInputs[line.formula]?.length > 0 && (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {formulaInputs[line.formula].map((input) => {
                                const zero = zeroInput(input, item)
                                return (
                                  <span
                                    key={input}
                                    title={
                                      zero
                                        ? `A fórmula usa ${input}, e está zerado nesta etapa`
                                        : `A fórmula usa ${input}`
                                    }
                                    className={cn(
                                      'rounded px-1.5 py-0.5 text-[11px]',
                                      zero
                                        ? 'bg-error-50 text-error-700'
                                        : 'bg-gray-100 text-gray-600',
                                    )}
                                  >
                                    {input}
                                  </span>
                                )
                              })}
                            </span>
                          )}
                        {line.sheetYield && (
                          <span
                            className="mt-0.5 block text-xs"
                            title={`Na outra posição cabem ${Math.min(line.sheetYield.firstFit, line.sheetYield.secondFit)}`}
                          >
                            {line.sheetYield.perSheet} por folha ·{' '}
                            {line.sheetYield.sheets} folhas
                            {line.sheetYield.leftover
                              ? ` · sobram ${line.sheetYield.leftover}`
                              : ''}
                            {line.sheetYield.charged !== line.sheetYield.sheets
                              ? ` · cobra ${num(line.sheetYield.charged)}`
                              : ''}
                            {line.sheetYield.marginMm || line.sheetYield.gapMm
                              ? ` · margem ${line.sheetYield.marginMm} mm, espaço ${line.sheetYield.gapMm} mm`
                              : ''}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm">
                        {line.quantity === null
                          ? '-'
                          : amount(line.quantity, unit)}
                        {line.minimumApplied && (
                          <span className="block text-xs text-warning-700">
                            mínimo aplicado
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                        <PermissionGate
                          permissions={['values:values:view']}
                          fallback={<span>•••</span>}
                        >
                          {money(line.cost)}
                        </PermissionGate>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-medium text-success-700">
                        <PermissionGate
                          permissions={['values:values:view']}
                          fallback={<span>•••</span>}
                        >
                          {money(line.sale)}
                        </PermissionGate>
                      </TableCell>
                      <TableCell>
                        <PermissionGate permissions={EDIT}>
                          <div className="flex justify-end gap-1">
                            {line.mode !== 'LIST' && (
                              <ActionButton
                                Icon={IconPencil}
                                variant="neutralGhost"
                                tooltip={`Ajustar ${line.name.toLowerCase()}`}
                                onClick={() =>
                                  setDialog({ kind: 'line', block: item, line })
                                }
                              />
                            )}
                            {line.variationOverride &&
                              assembly.activeVariation && (
                                <ActionButton
                                  Icon={IconArrowBackUp}
                                  variant="neutralGhost"
                                  tooltip="Voltar a acompanhar a base"
                                  onClick={() =>
                                    run(
                                      clearVariationLine({
                                        productId,
                                        variationId:
                                          assembly.activeVariation!.id,
                                        blockId: item.id,
                                        lineId: line.id,
                                      }),
                                      'Linha voltou a acompanhar a base',
                                    )
                                  }
                                />
                              )}
                            {!inVariation && line.mode !== 'SINGLE' && (
                              <ActionButton
                                Icon={IconListDetails}
                                variant="neutralGhost"
                                tooltip="Opções da linha"
                                onClick={() =>
                                  setDialog({
                                    kind: 'options',
                                    blockId: item.id,
                                    lineId: line.id,
                                  })
                                }
                              />
                            )}
                            {!inVariation && (
                              <ActionButton
                                Icon={IconTrash}
                                variant="errorGhost"
                                tooltip={`Remover ${line.name.toLowerCase()}`}
                                onClick={() => removeLine(item, line)}
                              />
                            )}
                            {line.overridden && !inVariation && (
                              <ActionButton
                                Icon={IconArrowBackUp}
                                variant="neutralGhost"
                                tooltip="Voltar a acompanhar o processo"
                                onClick={() =>
                                  run(
                                    resetAssemblyLine({
                                      productId,
                                      blockId: item.id,
                                      lineId: line.id,
                                    }),
                                    'A linha voltou a acompanhar o processo',
                                  )
                                }
                              />
                            )}
                          </div>
                        </PermissionGate>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {item.lines.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-6 text-center text-sm text-gray"
                    >
                      Nenhuma linha ainda. Acrescente o tempo, a máquina e o
                      material que o setor de {item.sector.toLowerCase()} usa
                      nesta etapa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {!inVariation && !item.part && (
            <PermissionGate permissions={EDIT}>
              <div className="px-6 pb-2 pt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconCirclePlus}
                  onClick={() => setDialog({ kind: 'newLine', block: item })}
                >
                  Nova linha
                </Button>
              </div>
            </PermissionGate>
          )}
          {!inVariation && !!item.removedSourceLineIds?.length && (
            <div className="flex flex-wrap items-center gap-2 px-6 pt-3 text-sm text-gray">
              <span>
                {item.removedSourceLineIds.length === 1
                  ? '1 linha do processo foi tirada deste produto.'
                  : `${item.removedSourceLineIds.length} linhas do processo foram tiradas deste produto.`}
              </span>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  size="sm"
                  variant="link"
                  onClick={() =>
                    run(
                      restoreProcessLines({ productId, blockId: item.id }),
                      'Linhas do processo restauradas',
                    )
                  }
                >
                  Restaurar
                </Button>
              </PermissionGate>
            </div>
          )}
        </CardContent>
        {item.setupMinutes > 0 && (
          <CardFooter className="justify-between text-sm text-gray">
            <span>Preparo: {item.setupMinutes} min, uma vez por pedido</span>
            <PermissionGate permissions={['values:values:view']}>
              <span>
                {money(item.setupCost)} ·{' '}
                <span className="text-success-700">
                  {money(item.setupSale)}
                </span>
              </span>
            </PermissionGate>
          </CardFooter>
        )}
      </Card>
    )
  }

  const status = assemblyStatusObj[assembly.status]

  return (
    <div className="space-y-5">
      {/* 1. O produto: a cobrança é a do cadastro do START (IP-17) —
          unidade comercial, valor de venda e padrão de medidas */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Produto</CardTitle>
            <CardDescription>
              Os mesmos campos do cadastro do produto. A composição acrescenta o
              custo e o preço sugerido.
            </CardDescription>
          </div>
          <PermissionGate permissions={EDIT}>
            <div className="w-full sm:w-[260px]">
              <SelectBasic
                name="assembly-status"
                label="Situação"
                options={toOptions(
                  Object.fromEntries(
                    Object.entries(assemblyStatusObj).map(([key, value]) => [
                      key,
                      value.text,
                    ]),
                  ) as { [key in AssemblyStatus]: string },
                )}
                value={assembly.status}
                onChange={(value) =>
                  run(
                    updateAssembly({
                      productId,
                      values: { status: value as AssemblyStatus },
                    }),
                    assemblyStatusObj[value as AssemblyStatus].text,
                  )
                }
              />
              <p className="mt-1 text-xs text-gray">{status.help}</p>
            </div>
          </PermissionGate>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectBasic
              name="assembly-unit"
              label="Unidade comercial"
              options={toOptions(unitKindObj)}
              value={assembly.unitKind}
              onChange={(value) =>
                run(
                  updateAssembly({
                    productId,
                    values: { unitKind: value as UnitKind },
                  }),
                )
              }
            />
            <PermissionGate permissions={['values:values:view']}>
              <div className="space-y-2">
                <Label htmlFor="assembly-unit-price">
                  {unitSaleLabel[assembly.unitKind]}
                  {variation ? ` · ${variation.name}` : ''}
                </Label>
                <Input
                  key={`${assembly.unitKind}-${assembly.unitPrice}-${variation?.id}-${variation?.unitPrice}`}
                  id="assembly-unit-price"
                  type="number"
                  min={0}
                  step="0.01"
                  startAdornment={<span className="text-sm">R$</span>}
                  placeholder={
                    variation && assembly.unitPrice !== null
                      ? `O do produto: ${(assembly.unitPrice / 100).toFixed(2)}`
                      : ''
                  }
                  defaultValue={
                    variation
                      ? variation.unitPrice === null
                        ? ''
                        : variation.unitPrice / 100
                      : assembly.unitPrice === null
                        ? ''
                        : assembly.unitPrice / 100
                  }
                  onBlur={(event) => {
                    const value =
                      event.target.value === ''
                        ? null
                        : Math.round(Number(event.target.value) * 100)
                    run(
                      variation
                        ? setVariationPrice({
                            productId,
                            variationId: variation.id,
                            unitPrice: value,
                          })
                        : updateAssembly({
                            productId,
                            values: { unitPrice: value },
                          }),
                    )
                  }}
                />
              </div>
            </PermissionGate>
            <SelectBasic
              name="assembly-dimension"
              label="Medida no orçamento"
              options={toOptions(productDimensionObj)}
              value={assembly.dimension}
              onChange={(value) =>
                run(
                  updateAssembly({
                    productId,
                    values: { dimension: value as ProductDimension },
                  }),
                )
              }
            />
          </div>

          <div>
            <h4 className="mb-2 text-base font-semibold text-gray-700">
              Padrão de medidas do produto
            </h4>
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-blue-light-300 bg-blue-light-50 p-6 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="measure-quantity">Quantidade</Label>
                <Input
                  id="measure-quantity"
                  type="number"
                  min={0}
                  step="1"
                  value={measure.quantity}
                  onChange={(event) =>
                    setMeasure((current) =>
                      current
                        ? {
                            ...current,
                            quantity: Number(event.target.value) || 0,
                          }
                        : current,
                    )
                  }
                />
              </div>
              {assembly.unitKind !== 'AREA' &&
                assembly.unitKind !== 'UNITY' && (
                  <div className="space-y-2">
                    <Label htmlFor="assembly-unit-amount">
                      {unitAmountLabel[assembly.unitKind]} (
                      {unitSymbol[assembly.unitKind]})
                    </Label>
                    <Input
                      key={`amount-${assembly.unitAmount}`}
                      id="assembly-unit-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={assembly.unitAmount}
                      onBlur={(event) =>
                        run(
                          updateAssembly({
                            productId,
                            values: {
                              unitAmount: Number(event.target.value) || 0,
                            },
                          }),
                        )
                      }
                    />
                  </div>
                )}
              {(
                [
                  [
                    'width',
                    assembly.unitKind === 'AREA'
                      ? 'Largura (m)'
                      : 'Largura da peça (m)',
                  ],
                  [
                    'height',
                    assembly.unitKind === 'AREA'
                      ? 'Altura (m)'
                      : 'Altura da peça (m)',
                  ],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`measure-${key}`}>{label}</Label>
                  <Input
                    id={`measure-${key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={measure[key]}
                    onChange={(event) =>
                      setMeasure((current) =>
                        current
                          ? {
                              ...current,
                              [key]: Number(event.target.value) || 0,
                            }
                          : current,
                      )
                    }
                  />
                </div>
              ))}
              {assembly.unitKind === 'AREA' && (
                <div className="space-y-2">
                  <Label>Área total</Label>
                  <p className="flex h-11 items-center text-sm text-gray-800">
                    {num(assembly.saleAmount)} m²
                  </p>
                </div>
              )}
              <PermissionGate permissions={['values:values:view']}>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <p className="flex h-11 items-center text-base font-semibold text-gray-900">
                    {money(assembly.priceForMeasure)}
                  </p>
                </div>
              </PermissionGate>
            </div>
            {assembly.unitKind !== 'AREA' && (
              <p className="mt-2 text-sm text-gray">
                Largura e altura da peça não mudam o valor de venda: servem para
                calcular a composição.
              </p>
            )}
          </div>

          <PermissionGate permissions={EDIT}>
            <div className="flex flex-wrap gap-6">
              {(
                [
                  ['allowEditValues', 'Permitir editar valor'],
                  ['allowEditDescription', 'Permitir editar descrição'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <Switch
                    checked={assembly[key]}
                    onCheckedChange={(checked) =>
                      run(
                        updateAssembly({
                          productId,
                          values: { [key]: checked },
                        }),
                      )
                    }
                    aria-label={label}
                  />
                  {label}
                </label>
              ))}
            </div>
          </PermissionGate>
        </CardContent>
        {measureChanged && (
          <CardFooter className="flex-wrap justify-between gap-3">
            <p className="text-sm text-gray">
              Simulando {num(measure.quantity)} × {num(measure.width)} ×{' '}
              {num(measure.height)} m. O padrão é {num(saved.quantity)} ×{' '}
              {num(saved.width)} × {num(saved.height)} m.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="neutralOutline"
                onClick={() => setMeasure(saved)}
              >
                Voltar ao padrão
              </Button>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() =>
                    run(
                      updateAssembly({ productId, values: { measure } }),
                      'Padrão de medidas salvo',
                    )
                  }
                >
                  Salvar como padrão
                </Button>
              </PermissionGate>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* 2. O resultado: custo e preço nesta medida */}
      <PermissionGate permissions={['values:values:view']}>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray">Custo nesta medida</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assembly.blocks.length
                  ? money(assembly.cost)
                  : 'Custo não calculado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray">Valor de venda nesta medida</p>
              <p className="text-2xl font-semibold text-gray-900">
                {money(assembly.priceForMeasure)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray">
                Sugerido pela composição · por {unitSymbol[assembly.unitKind]}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {assembly.blocks.length
                  ? money(assembly.suggestedUnitPrice)
                  : '-'}
              </p>
              {assembly.blocks.length > 0 && (
                <p className="text-xs text-gray">
                  {money(assembly.suggestedPrice)} nesta medida · soma do preço
                  de venda de cada recurso
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray">Margem</p>
              <p
                className={cn(
                  'text-2xl font-semibold',
                  assembly.margin !== null && assembly.margin < 0
                    ? 'text-error-700'
                    : 'text-gray-900',
                )}
              >
                {assembly.margin === null ? '-' : `${num(assembly.margin, 1)}%`}
              </p>
            </div>
          </CardContent>
          {assembly.blocks.length > 0 && (
            <CardFooter className="flex-wrap justify-between gap-3">
              <p className="text-sm text-gray">
                {assembly.margin !== null && assembly.margin < 0
                  ? 'Nesta medida, o produto está sendo vendido abaixo do custo.'
                  : 'Ter custo não muda o valor de venda: adotar o sugerido é uma decisão sua.'}
              </p>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  variant="neutralOutline"
                  disabled={assembly.unitPrice === assembly.suggestedUnitPrice}
                  onClick={adoptSuggested}
                >
                  Adotar preço sugerido
                </Button>
              </PermissionGate>
            </CardFooter>
          )}
        </Card>
      </PermissionGate>

      {/* A tabela comercial ao lado do custo técnico (FQ-1 a FQ-3) */}
      <PriceTiersCard assembly={assembly} onSaved={refresh} />

      {/* 3. As variações: a mesma composição com exceções (PV-1 a PV-7) */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Variações</CardTitle>
            <CardDescription>
              P, M, G; 4x0 ou 4x4; com ou sem laminação. A variação nasce igual
              à base, e só o que você mudar nela passa a ser dela.
            </CardDescription>
          </div>
          <PermissionGate permissions={EDIT}>
            {newVariation === null ? (
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconCirclePlus}
                onClick={() => setNewVariation('')}
              >
                Nova variação
              </Button>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto">
                <Input
                  autoFocus
                  aria-label="Nome da variação"
                  placeholder="Ex.: 4x4, GG, laminado"
                  value={newVariation}
                  onChange={(event) => setNewVariation(event.target.value)}
                />
                <Button
                  type="button"
                  onClick={async () => {
                    const res = await addVariation({
                      productId,
                      name: newVariation,
                    })
                    if (!res.success) return toast.error(res.message)
                    setNewVariation(null)
                    await refresh()
                    setVariation(res.data as string)
                  }}
                >
                  Criar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewVariation(null)}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </PermissionGate>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {assembly.variationSummary.map((item) => (
              <Button
                key={item.id || 'base'}
                type="button"
                variant={
                  (variation?.id || '') === item.id
                    ? 'default'
                    : 'neutralOutline'
                }
                onClick={() => setVariation(item.id || null)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          {assembly.variationSummary.length > 1 && (
            <PermissionGate permissions={['values:values:view']}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[40%]">Variação</TableHead>
                    <TableHead className="w-[20%] text-right">Custo</TableHead>
                    <TableHead className="w-[20%] text-right">
                      Valor de venda
                    </TableHead>
                    <TableHead className="w-[20%] text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assembly.variationSummary.map((item) => (
                    <TableRow key={item.id || 'base'}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {money(item.cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(item.priceForMeasure)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          item.margin !== null &&
                            item.margin < 0 &&
                            'text-error-700',
                        )}
                      >
                        {item.margin === null ? '-' : `${num(item.margin, 1)}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </PermissionGate>
          )}
          {variation && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-light-300 bg-blue-light-50 p-4 text-sm">
              <p className="text-gray-700">
                <strong>Você está na variação {variation.name}.</strong> O que
                mudar nas linhas abaixo vale só para ela; o resto acompanha a
                base. Etapas se acrescentam na base.
              </p>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  variant="errorGhost"
                  size="sm"
                  onClick={() =>
                    alertDialog.open({
                      title: `Remover a variação ${variation.name}?`,
                      description:
                        'As exceções desta variação se perdem. A base não muda.',
                      confirmLabel: 'Remover',
                      cancelLabel: 'Cancelar',
                      confirmVariant: 'error',
                      onConfirm: async () => {
                        const res = await removeVariation({
                          productId,
                          variationId: variation.id,
                        })
                        if (!res.success) throw new Error(res.message)
                        setVariation(null)
                        await refresh()
                      },
                      toastMsg: {
                        success: 'Variação removida',
                        error: 'Erro ao remover a variação',
                      },
                    })
                  }
                >
                  Remover variação
                </Button>
              </PermissionGate>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. A composição é o fluxo da produção (FL-1 a FL-5): cada caixa é
          a etapa de um setor, ligada às que vêm antes dela. As caixas são
          posicionadas pelo sistema; tudo parte de "o que vem depois?" */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Composição</CardTitle>
            <CardDescription>
              {inVariation
                ? `O que você acrescentar aqui existe só em ${variation?.name}. As etapas da base continuam valendo.`
                : 'O caminho da produção: cada caixa é a etapa de um setor e vira uma tarefa. Use o "+" depois de uma caixa para a etapa seguinte; usar de novo na mesma caixa abre um caminho em paralelo. Clique na caixa para ver os recursos e o tempo.'}
            </CardDescription>
          </div>
          {!inVariation && (
            <PermissionGate permissions={EDIT}>
              <Button
                type="button"
                size="md"
                variant="neutralOutline"
                LeftIcon={IconBooks}
                onClick={() => setDialog({ kind: 'library' })}
              >
                Biblioteca
              </Button>
            </PermissionGate>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <PermissionGate
            permissions={EDIT}
            fallback={
              <FlowCanvas
                readOnly
                nodes={flowNodes}
                selectedId={selectedBlock?.id}
                onSelect={setSelectedId}
                expandedPartId={expandedPart}
                onTogglePart={(id) =>
                  setExpandedPart((current) => (current === id ? null : id))
                }
                empty={
                  <EmptyState
                    title="Nenhuma etapa ainda"
                    description="O produto continua sendo vendido pelo preço cadastrado enquanto não houver composição."
                  />
                }
              />
            }
          >
            <FlowCanvas
              nodes={flowNodes}
              selectedId={selectedBlock?.id}
              onSelect={setSelectedId}
              menu={stageMenu}
              expandedPartId={expandedPart}
              onTogglePart={(id) =>
                setExpandedPart((current) => (current === id ? null : id))
              }
              onAddAfter={(node) => {
                const after = assembly.blocks.find(
                  (item) => item.id === node.id,
                )
                if (after) setDialog({ kind: 'next', after })
              }}
              onInsertBetween={
                inVariation
                  ? undefined
                  : (from, to) => {
                      const after = assembly.blocks.find(
                        (item) => item.id === from.id,
                      )
                      const before = assembly.blocks.find(
                        (item) => item.id === to.id,
                      )
                      if (after && before) {
                        setDialog({ kind: 'next', after, before })
                      }
                    }
              }
              onAddPath={
                inVariation
                  ? undefined
                  : () => setDialog({ kind: 'next', after: null })
              }
              addPathLabel={
                assembly.blocks.length ? 'Novo caminho' : 'Primeira etapa'
              }
              empty={
                <EmptyState
                  title="Nenhuma etapa ainda"
                  description="Importe uma composição pronta da biblioteca, ou comece pela etapa onde o produto começa — a criação, a impressão, o corte. O produto continua sendo vendido pelo preço cadastrado enquanto não houver composição."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        variant="neutralOutline"
                        LeftIcon={IconBooks}
                        onClick={() => setDialog({ kind: 'library' })}
                      >
                        Importar da biblioteca
                      </Button>
                      <Button
                        type="button"
                        LeftIcon={IconCirclePlus}
                        onClick={() => setDialog({ kind: 'next', after: null })}
                      >
                        Primeira etapa
                      </Button>
                    </div>
                  }
                />
              }
            />
          </PermissionGate>
        </CardContent>
      </Card>

      {selectedBlock && stageDetail(selectedBlock)}

      {/* O que o produto consome, cada recurso uma vez (IP-34) */}
      {assembly.resourceSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por recurso</CardTitle>
            <CardDescription>
              Cada recurso uma vez, somado de todas as etapas, na medida
              simulada. É a lista do que o produto consome.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[40%]">Recurso</TableHead>
                  <TableHead className="w-[15%]">Tipo</TableHead>
                  <TableHead className="w-[15%] text-right">
                    Quantidade
                  </TableHead>
                  <TableHead className="w-[15%] text-right">Custo</TableHead>
                  <TableHead className="w-[15%] text-right">Venda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assembly.resourceSummary.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="text-sm font-medium text-gray-800">
                      {resource.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {resourceKindObj[resource.kind]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm">
                      {amount(resource.quantity, resource.unit)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm">
                      <PermissionGate
                        permissions={['values:values:view']}
                        fallback={<span>•••</span>}
                      >
                        {money(resource.cost)}
                      </PermissionGate>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium text-success-700">
                      <PermissionGate
                        permissions={['values:values:view']}
                        fallback={<span>•••</span>}
                      >
                        {money(resource.sale)}
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 4. O texto técnico que vai para a proposta (IP-24) */}
      <Card>
        <CardHeader>
          <CardTitle>Descritivo técnico</CardTitle>
          <CardDescription>
            Aparece na proposta impressa, abaixo do nome do produto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          <Textarea
            aria-label="Descritivo técnico"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <PermissionGate permissions={EDIT}>
            <Button
              type="button"
              variant="neutralOutline"
              disabled={description === assembly.technicalDescription}
              onClick={() =>
                run(
                  updateAssembly({
                    productId,
                    values: { technicalDescription: description },
                  }),
                  'Descritivo salvo',
                )
              }
            >
              Salvar descritivo
            </Button>
          </PermissionGate>
        </CardContent>
      </Card>

      {/* "O que vem depois?" (FL-5): a etapa seguinte, a inserida no meio da
          ligação e o caminho novo passam pelo mesmo diálogo */}
      <NextStepDialog
        open={dialog?.kind === 'next'}
        onOpenChange={() => setDialog(null)}
        title={
          dialog?.kind === 'next'
            ? dialog.before
              ? `Entre ${dialog.after?.name.toLowerCase()} e ${dialog.before.name.toLowerCase()}`
              : dialog.after
                ? `Depois de ${dialog.after.name.toLowerCase()}`
                : assembly.blocks.length
                  ? 'Novo caminho'
                  : 'Primeira etapa'
            : ''
        }
        description={
          dialog?.kind === 'next' && !dialog.after && assembly.blocks.length
            ? 'Um caminho que começa sozinho — a estrutura que depois se encontra com a lona na instalação. Ligue-o a uma etapa pelo menu da caixa.'
            : undefined
        }
        afterName={dialog?.kind === 'next' ? dialog.after?.name : null}
        candidates={dialog?.kind === 'next' ? candidatesRes?.data : undefined}
        sectors={baseSectors}
        parts={partsRes?.data || []}
        allowOwn={!inVariation}
        allowPart={!inVariation}
        onPickProcess={(processId) => {
          if (dialog?.kind !== 'next') return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            variation
              ? addVariationBlock({
                  productId,
                  variationId: variation.id,
                  processId,
                  dependsOn,
                })
              : addAssemblyBlock({
                  productId,
                  processId,
                  dependsOn,
                  insertBefore,
                }).then((res) => {
                  if (res.success && res.data) setSelectedId(res.data)
                  return res
                }),
            variation
              ? `Etapa acrescentada só em ${variation.name}`
              : 'Etapa adicionada',
          )
        }}
        onCreateOwn={(name, sector) => {
          if (dialog?.kind !== 'next') return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            addOwnBlock({
              productId,
              name,
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
          if (dialog?.kind !== 'next') return
          const dependsOn = dialog.after ? [dialog.after.id] : []
          const insertBefore = dialog.before?.id
          setDialog(null)
          run(
            addPartBlock({
              productId,
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
      {/* Trocar o processo que preenche a etapa (FL-6) */}
      <NextStepDialog
        open={dialog?.kind === 'swap'}
        onOpenChange={() => setDialog(null)}
        title={
          dialog?.kind === 'swap'
            ? dialog.block.processId
              ? `Trocar o processo de ${dialog.block.name.toLowerCase()}`
              : `Preencher ${dialog.block.name.toLowerCase()} com um processo`
            : ''
        }
        description="A caixa continua no mesmo lugar do fluxo, com as mesmas ligações. O que muda é a montagem: recursos, tempo e regras passam a ser os do processo."
        afterName={
          dialog?.kind === 'swap' && dialog.block.dependsOn[0]
            ? nameOf(dialog.block.dependsOn[0])
            : null
        }
        candidates={dialog?.kind === 'swap' ? candidatesRes?.data : undefined}
        sectors={baseSectors}
        allowOwn={false}
        allowPart={false}
        onPickProcess={(processId) => {
          if (dialog?.kind !== 'swap') return
          const blockId = dialog.block.id
          setDialog(null)
          run(
            replaceBlockProcess({ productId, blockId, processId }),
            'Processo trocado',
          )
        }}
        onCreateOwn={() => undefined}
      />
      {/* "Ligar a…": o ponto de encontro (FL-4) */}
      <LinkStageDialog
        open={dialog?.kind === 'link'}
        onOpenChange={() => setDialog(null)}
        block={dialog?.kind === 'link' ? dialog.block : null}
        stages={assembly.blocks.map((item) => ({
          id: item.id,
          name: item.name,
          sector: item.sector,
        }))}
        onPick={(toId) => {
          if (dialog?.kind !== 'link') return
          const blockId = dialog.block.id
          setDialog(null)
          run(linkBlock({ productId, blockId, toId }), 'Etapas ligadas')
        }}
      />
      <NewLineDialog
        block={dialog?.kind === 'newLine' ? dialog.block : undefined}
        resources={resources?.resources || []}
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          if (dialog?.kind !== 'newLine') return
          const target = dialog.block
          setDialog(null)
          run(
            addAssemblyLine({ productId, blockId: target.id, values }),
            'Linha adicionada',
          )
        }}
      />
      <LibraryDialog
        open={dialog?.kind === 'library'}
        entries={libraryRes?.data || []}
        hasStages={assembly.blocks.length > 0}
        onOpenChange={() => setDialog(null)}
        onImport={(libraryId) => {
          setDialog(null)
          run(
            importFromLibrary({ productId, libraryId }),
            'Composição importada — ajuste ao seu jeito de produzir',
          )
        }}
      />
      <OptionsDialog
        line={
          dialog?.kind === 'options'
            ? assembly.blocks
                .find((block) => block.id === dialog.blockId)
                ?.lines.find((line) => line.id === dialog.lineId)
            : undefined
        }
        resources={resources?.resources || []}
        onOpenChange={() => setDialog(null)}
        onAdd={async (values) => {
          if (dialog?.kind !== 'options') return false
          const res = await addLineOption({
            productId,
            blockId: dialog.blockId,
            lineId: dialog.lineId,
            ...values,
          })
          if (!res.success) {
            toast.error(res.message)
            return false
          }
          toast.success('Opção acrescentada')
          await refresh()
          return true
        }}
        onRemove={(optionId) => {
          if (dialog?.kind !== 'options') return
          run(
            removeLineOption({
              productId,
              blockId: dialog.blockId,
              lineId: dialog.lineId,
              optionId,
            }),
            'Opção removida',
          )
        }}
      />
      <LineDialog
        line={dialog?.kind === 'line' ? dialog.line : undefined}
        onOpenChange={() => setDialog(null)}
        variationName={variation?.name}
        ownStage={dialog?.kind === 'line' && dialog.block.processId === null}
        onSave={(values: LineValues) => {
          if (dialog?.kind !== 'line') return
          const { block: target, line } = dialog
          setDialog(null)
          if (variation) {
            run(
              setVariationLine({
                productId,
                variationId: variation.id,
                blockId: target.id,
                lineId: line.id,
                values: { perUnit: values.perUnit },
              }),
              `Linha ajustada na variação ${variation.name}`,
            )
            return
          }
          run(
            updateAssemblyLine({
              productId,
              blockId: target.id,
              lineId: line.id,
              values,
            }),
            'Linha ajustada neste produto',
          )
        }}
      />
      <RulesDialog
        block={dialog?.kind === 'rules' ? dialog.block : undefined}
        onOpenChange={() => setDialog(null)}
        onSave={(rules, name, taskType) => {
          if (dialog?.kind !== 'rules') return
          const target = dialog.block
          setDialog(null)
          run(
            setBlockLocalRules({
              productId,
              blockId: target.id,
              rules,
              name,
              taskType,
            }),
            'Etapa configurada',
          )
        }}
      />
    </div>
  )
}

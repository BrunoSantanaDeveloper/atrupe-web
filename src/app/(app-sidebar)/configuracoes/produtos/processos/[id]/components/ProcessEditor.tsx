'use client'

// O processo por dentro (MS-11): a mesma etapa da composição do produto —
// linhas de recurso único, escolha ou lista, opções com consumo próprio,
// regras de venda, tempo e tipo de tarefa —, com uma simulação na medida e
// os produtos que o usam. Os diálogos são os mesmos da composição, para o
// processo e o produto se comportarem igual.

// React / Next
import Link from 'next/link'
import { useEffect, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  LineDialog,
  NewLineDialog,
  OptionsDialog,
} from '../../../[id]/composicao/components/AssemblyDialogs'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { DurationInput } from '@/components/common/DurationInput'
import { sectorIconByName } from '@/consts/sectors'

// Types
import {
  TASK_TYPES,
  formulaInputs,
  quantityModeObj,
  type SaleRules,
  type QuantityMode,
  type FormulaInput,
  type ComputedLine,
  type ComputedBlock,
  type AssemblyMeasure,
  type AfterBase,
} from '../../../[id]/composicao/assembly'
import type { ResourceKind, DimensionRule } from '../../types'
import { ResourceKindButtons } from '../../../[id]/composicao/components/ResourceKindButtons'
import { ProductFields } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/components/ProductFields'

// Actions
import {
  getUsualNext,
  setUsualNext,
  addLineOption,
  addAssemblyLine,
  getProcessDetail,
  removeLineOption,
  updateProcessMeta,
  removeAssemblyLine,
  setBlockLocalRules,
  updateAssemblyLine,
  getAssemblyResources,
} from '@/actions/product-assembly'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'
import { usePermissions } from '@/hooks/usePermissions'
import { useAlertDialog } from '@/store/useAlertDialog'
import {
  formulaLabel,
  resourceKindObj,
  dimensionRuleOptions,
  afterBaseOptions,
} from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'

// Third-party
import { toast } from 'sonner'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

// Icons
import { IconTrash, IconPencil, IconListDetails } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const EDIT = ['product_settings:products:edit']

const num = (value: number, digits = 3) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits })

// Tempo em horas e minutos, como a composição mostra (IP-33)
const amount = (value: number, unit: string) => {
  if (unit !== 'min' || value < 60) return `${num(value)} ${unit}`
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value - hours * 60)
  return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`
}

// O campo que a fórmula consome está zerado na simulação? (IP-35)
const zeroInput = (
  input: FormulaInput,
  block: ComputedBlock,
  line?: ComputedLine,
) => {
  const { measure: m, rules } = block
  if (input === 'quantidade') return !m.quantity
  if (input === 'largura') return !m.width
  if (input === 'altura') return !m.height
  if (input === 'área' || input === 'perímetro') return !m.width || !m.height
  // O campo do orçamento que a linha lê (IP-4); no processo vale o padrão
  if (input === 'campo extra') return line ? !line.extraValue : false
  if (input === 'tempo') return !rules.timeField || !rules.timeFieldDefault
  return false
}

type Dialog =
  | { kind: 'newLine'; lineKind?: ResourceKind }
  | { kind: 'line'; lineId: string }
  | { kind: 'options'; lineId: string }
  | null

export type ProcessSection = 'config' | 'resources' | 'usage'

// `embedded`: dentro do diálogo do processo (mesmo desenho do diálogo do
// produto, design.md §17). Cada aba monta uma seção: Processo (config),
// Composição (recursos e simulação) e Uso (usado em, fluxo dos produtos)
export function ProcessEditor({
  id,
  embedded = false,
  section,
}: {
  id: string
  embedded?: boolean
  section?: ProcessSection
}) {
  const show = (part: ProcessSection) => !section || section === part
  const money = useMoney()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  const [dialog, setDialog] = useState<Dialog>(null)
  // O nome do processo edita no título da etapa, como no produto
  const [renaming, setRenaming] = useState(false)
  const [meta, setMeta] = useState({
    sector: '',
    afterBase: 'INHERIT' as AfterBase,
    setupMinutes: 0,
    sellerInstructions: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['process-detail', id, measure],
    queryFn: () => getProcessDetail({ processId: id, measure }),
    placeholderData: keepPreviousData,
  })
  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
  })
  // As etapas seguintes usuais, vistas dos dois lados (FL-7)
  const { data: usualRes } = useQuery({
    queryKey: ['usual-next', id],
    queryFn: () => getUsualNext({ processId: id }),
  })
  const { hasAnyPermission } = usePermissions()
  const canEdit = hasAnyPermission(EDIT)

  const toggleUsual = async (
    side: 'before' | 'after',
    otherId: string,
    usual: boolean,
  ) => {
    const res = await setUsualNext({
      fromProcessId: side === 'before' ? otherId : id,
      toProcessId: side === 'before' ? id : otherId,
      usual,
    })
    if (!res.success) return toast.error(res.message)
    queryClient.invalidateQueries({ queryKey: ['usual-next'] })
    queryClient.invalidateQueries({ queryKey: ['next-step'] })
  }

  const detail = data?.data
  const block = detail?.block

  useEffect(() => {
    if (detail && !measure) {
      setMeasure(detail.measure)
      setMeta({
        sector: detail.block.sector,
        afterBase: detail.meta.afterBase,
        setupMinutes: detail.block.setupMinutes,
        sellerInstructions: detail.meta.sellerInstructions,
      })
    }
  }, [detail, measure])

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['process-detail', id] }),
      queryClient.invalidateQueries({ queryKey: ['process-list'] }),
    ])

  const run = async (
    action: Promise<{ success: boolean; message: string }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) return toast.error(res.message)
    if (success) toast.success(success)
    await refresh()
  }

  if (isLoading || !detail || !block || !measure) {
    // O Topbar aparece já (o título tem esqueleto próprio) e, embaixo, os
    // cartões no formato da tela
    const fields = (count: number) =>
      Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))
    return (
      <div className="space-y-5">
        {!embedded && (
          <Topbar
            review="new"
            title=""
            previousPage="/configuracoes/produtos/processos"
          />
        )}
        <div
          className={cn(
            'grid grid-cols-1 gap-5',
            !embedded && 'lg:grid-cols-3',
          )}
        >
          <Card className={cn(!embedded && 'lg:col-span-2')}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-3">
              {fields(3)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 px-6">
              {fields(3)}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3 px-6">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const hostId = detail.hostId
  const sectors = resourcesRes?.data?.sectors || []
  const lineOf = (lineId: string) =>
    block.lines.find((line) => line.id === lineId)
  const metaChanged =
    meta.sector !== block.sector ||
    meta.afterBase !== detail.meta.afterBase ||
    meta.setupMinutes !== block.setupMinutes ||
    meta.sellerInstructions !== detail.meta.sellerInstructions

  const removeLine = (line: ComputedLine) =>
    alertDialog.open({
      title: `Remover ${line.name}?`,
      // Os produtos acompanham o processo (CP-21)
      description: detail.usedIn.length
        ? `A linha sai do processo e ${detail.usedIn.length === 1 ? 'do produto que o usa' : `dos ${detail.usedIn.length} produtos que o usam`}, menos onde ela foi ajustada só para o produto.`
        : 'A linha sai do processo.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeAssemblyLine({
          productId: hostId,
          blockId: block.id,
          lineId: line.id,
        })
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: { success: 'Linha removida', error: 'Erro ao remover a linha' },
    })

  const rules = block.rules
  const SectorIcon = sectorIconByName(block.sector)

  // As regras da etapa ficam nos seletores do cabeçalho, como no produto
  // (03/10/2026): no processo elas são as regras originais, que os produtos
  // acompanham (CP-21)
  const saveStage = (
    patch: Partial<SaleRules>,
    extra: { name?: string; taskType?: string } = {},
    message = 'Processo configurado',
  ) =>
    run(
      setBlockLocalRules({
        productId: hostId,
        blockId: block.id,
        rules: Object.keys(patch).length
          ? { ...rules, ...patch }
          : block.originalRules,
        ...extra,
      }),
      message,
    )

  const measureText = (() => {
    const m = block.measure
    const qty = `${num(m.quantity)} ${m.quantity === 1 ? 'unidade' : 'unidades'}`
    if (rules.dimension === 'NONE') {
      return rules.followsBase ? qty : 'uma vez por pedido'
    }
    const size = `${num(m.width)} × ${num(m.height)} m`
    return rules.dimension === 'SAME_AS_PARENT'
      ? `${qty} · mesma medida da base (${size})`
      : `${qty} · ${size}`
  })()

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {!embedded && (
          <Topbar
            review="new"
            title={block.name}
            previousPage="/configuracoes/produtos/processos"
            supportText={`${detail.category} · ${block.sector}${
              detail.meta.active ? '' : ' · inativo'
            }`}
          />
        )}

        {/* 1. O que o processo é e como se comporta na venda */}
        {(show('config') || show('resources')) && (
          <div
            className={cn(
              'grid grid-cols-1 gap-5',
              !embedded && 'lg:grid-cols-3',
            )}
          >
            {show('config') && (
              <Card className={cn(!embedded && 'lg:col-span-2')}>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle>Processo</CardTitle>
                    <CardDescription>
                      Os mesmos campos do cadastro do processo. O que a etapa
                      usa fica na Composição.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-3">
                  <SelectBasic
                    name="process-sector"
                    label="Setor"
                    options={sectors.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    value={meta.sector}
                    onChange={(value) =>
                      value &&
                      setMeta((current) => ({
                        ...current,
                        sector: String(value),
                      }))
                    }
                  />
                  <SelectBasic
                    name="process-after-base"
                    label="Quando entra depois de outra etapa"
                    options={afterBaseOptions}
                    value={meta.afterBase}
                    onChange={(value) =>
                      value &&
                      setMeta((current) => ({
                        ...current,
                        afterBase: value as AfterBase,
                      }))
                    }
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="process-setup" className="mb-2">
                      Preparo (h:mm)
                    </Label>
                    <DurationInput
                      id="process-setup"
                      value={meta.setupMinutes}
                      onChange={(minutes) =>
                        setMeta((current) => ({
                          ...current,
                          setupMinutes: minutes ?? 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-3">
                    <Label htmlFor="process-instructions">
                      Instruções para o vendedor
                    </Label>
                    <Textarea
                      id="process-instructions"
                      placeholder="O que perguntar ao cliente, o que conferir antes de fechar"
                      value={meta.sellerInstructions}
                      onChange={(event) =>
                        setMeta((current) => ({
                          ...current,
                          sellerInstructions: event.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Os campos do orçamento junto do processo, como no bloco
                      Produto da composição (IP-4) */}
                  <div className="border-t border-gray-100 pt-4 sm:col-span-3">
                    <ProductFields
                      bare
                      productId={hostId}
                      fields={detail.fields}
                      description="Os valores que o vendedor informa e que as linhas deste processo leem. O produto que incluir o processo ganha estes campos, uma vez cada."
                    />
                  </div>
                </CardContent>
                <PermissionGate permissions={EDIT}>
                  <CardFooter className="flex-wrap justify-between gap-3">
                    <p className="text-sm text-gray">
                      O preparo entra uma vez por pedido, com o custo-hora do
                      setor.
                    </p>
                    <Button
                      type="button"
                      disabled={!metaChanged}
                      onClick={() =>
                        run(
                          updateProcessMeta({
                            processId: id,
                            values: {
                              sector: meta.sector,
                              afterBase: meta.afterBase,
                              setupMinutes: meta.setupMinutes,
                              sellerInstructions: meta.sellerInstructions,
                            },
                          }),
                          'Processo salvo',
                        )
                      }
                    >
                      Salvar processo
                    </Button>
                  </CardFooter>
                </PermissionGate>
              </Card>
            )}

            {/* 2. Simulação: conferir o processo antes de usá-lo */}
            {(!embedded || show('resources')) && (
              <Card>
                <CardHeader>
                  <CardTitle>Simulação</CardTitle>
                  <CardDescription>
                    Confira o consumo numa medida. Não grava nada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6">
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        ['quantity', 'Qtd.'],
                        ['width', 'Larg. (m)'],
                        ['height', 'Alt. (m)'],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`sim-${key}`}>{label}</Label>
                        <Input
                          id={`sim-${key}`}
                          type="number"
                          min={0}
                          step={key === 'quantity' ? '1' : '0.01'}
                          value={measure[key]}
                          onChange={(event) =>
                            setMeasure((current) => ({
                              ...current!,
                              [key]: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <PermissionGate permissions={['values:values:view']}>
                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                      <p>
                        <span className="block text-xs text-gray">Custo</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {money(detail.cost)}
                        </span>
                      </p>
                      <p>
                        <span className="block text-xs text-gray">Venda</span>
                        <span className="text-lg font-semibold text-success-700">
                          {money(detail.sale)}
                        </span>
                      </p>
                    </div>
                  </PermissionGate>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 3. As linhas: o que o setor usa nesta etapa */}
        {show('resources') && (
          <Card>
            <CardHeader>
              <CardTitle>Composição</CardTitle>
              <CardDescription>
                A etapa de um setor: a máquina, o material e a mão de obra que
                ele usa, cada um com o seu tipo de cálculo. O produto que
                incluir o processo acompanha esta montagem.
              </CardDescription>
              {/* Antes de mexer, quem edita sabe o alcance da mudança (CP-21) */}
              {detail.usedIn.length > 0 && (
                <Badge variant="warningLight" className="w-fit">
                  {detail.usedIn.length === 1
                    ? 'Mudar a montagem muda 1 produto'
                    : `Mudar a montagem muda ${detail.usedIn.length} produtos`}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {/* O cabeçalho da etapa, igual ao da composição do produto
                  (03/10/2026): setor em destaque, tarefa, nome editável e as
                  regras de venda nos seletores */}
              <div className="flex flex-wrap items-start gap-3 px-6 pb-4">
                <FeaturedIcon variant="light" Icon={SectorIcon} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutralLight">{block.sector}</Badge>
                    <Badge variant="blueLight">
                      {detail.meta.afterBase === 'INHERIT'
                        ? 'Depois de outra etapa, herda a medida da base'
                        : 'Depois de outra etapa, pede medida própria'}
                    </Badge>
                    <PermissionGate
                      permissions={EDIT}
                      fallback={
                        <Badge variant="neutralLight">
                          tarefa: {block.taskType.toLowerCase()}
                        </Badge>
                      }
                    >
                      <Select
                        value={block.taskType}
                        onValueChange={(value) =>
                          saveStage(
                            {},
                            { taskType: value },
                            'Tipo de tarefa alterado',
                          )
                        }
                      >
                        <SelectTrigger
                          aria-label="Tipo de tarefa na produção"
                          className="h-6 w-auto gap-1 rounded-full border-gray-200 bg-gray-50 px-2 text-xs"
                        >
                          <span className="text-gray">tarefa:</span>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set([block.taskType, ...TASK_TYPES]),
                          ).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </PermissionGate>
                  </div>
                  {renaming ? (
                    <Input
                      autoFocus
                      aria-label="Nome do processo"
                      className="h-9 max-w-sm text-base font-semibold"
                      defaultValue={block.name}
                      onBlur={(event) => {
                        setRenaming(false)
                        const value = event.target.value.trim()
                        if (value && value !== block.name) {
                          saveStage({}, { name: value }, 'Processo renomeado')
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                        if (event.key === 'Escape') setRenaming(false)
                      }}
                    />
                  ) : (
                    <PermissionGate
                      permissions={EDIT}
                      fallback={
                        <p className="text-base font-semibold text-gray-900">
                          {block.name}
                        </p>
                      }
                    >
                      <button
                        type="button"
                        className="group flex items-center gap-2 text-left"
                        title="Renomear processo"
                        onClick={() => setRenaming(true)}
                      >
                        <span className="text-base font-semibold text-gray-900">
                          {block.name}
                        </span>
                        <IconPencil
                          size={14}
                          aria-hidden="true"
                          className="text-gray opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </button>
                    </PermissionGate>
                  )}
                  <PermissionGate
                    permissions={EDIT}
                    fallback={
                      <p className="text-sm text-gray">{measureText}</p>
                    }
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray">
                      <Select
                        value={rules.quantityMode}
                        onValueChange={(value) =>
                          saveStage({ quantityMode: value as QuantityMode })
                        }
                      >
                        <SelectTrigger
                          aria-label="Quantidade"
                          className="h-7 w-auto gap-1 rounded-full border-gray-200 bg-white px-2.5 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(quantityModeObj) as QuantityMode[])
                            // "Área da base ÷ área deste" só faz sentido
                            // dentro do produto, depois de uma base
                            .filter((key) => key !== 'AREA_RATIO')
                            .map((key) => (
                              <SelectItem key={key} value={key}>
                                {quantityModeObj[key]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={rules.followsBase ? 'FOLLOWS' : 'ONCE'}
                        onValueChange={(value) =>
                          saveStage({ followsBase: value === 'FOLLOWS' })
                        }
                      >
                        <SelectTrigger
                          aria-label="Em relação à base"
                          className="h-7 w-auto gap-1 rounded-full border-gray-200 bg-white px-2.5 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FOLLOWS">
                            Acompanha a quantidade da base
                          </SelectItem>
                          <SelectItem value="ONCE">
                            Uma vez por pedido
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={rules.dimension}
                        onValueChange={(value) =>
                          saveStage({ dimension: value as DimensionRule })
                        }
                      >
                        <SelectTrigger
                          aria-label="Medida"
                          className="h-7 w-auto gap-1 rounded-full border-gray-200 bg-white px-2.5 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dimensionRuleOptions
                            // A medida da base é dada pela posição no
                            // produto, não pelo processo (03/10/2026)
                            .filter(
                              (option) => option.value !== 'SAME_AS_PARENT',
                            )
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs">= {measureText}</span>
                    </div>
                  </PermissionGate>
                </div>
              </div>
              {/* Os botões de acrescentar ficam no topo, antes da tabela,
                  como na etapa do produto (03/10/2026) */}
              <PermissionGate permissions={EDIT}>
                <div className="px-6 pb-4">
                  <ResourceKindButtons
                    onPick={(lineKind) =>
                      setDialog({ kind: 'newLine', lineKind })
                    }
                  />
                </div>
              </PermissionGate>
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[18%]">Recurso</TableHead>
                    <TableHead className="w-[22%]">Item</TableHead>
                    <TableHead className="w-[13%]">Consumo</TableHead>
                    <TableHead className="w-[17%]">Tipo de cálculo</TableHead>
                    <TableHead className="w-[10%] text-right">
                      Quantidade
                    </TableHead>
                    <TableHead className="w-[8%] text-right">Custo</TableHead>
                    <TableHead className="w-[8%] text-right">Venda</TableHead>
                    <TableHead className="w-[4%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.lines.map((line) => {
                    const unit =
                      line.selected?.unit || line.options[0]?.unit || ''
                    return (
                      <TableRow key={line.id}>
                        <TableCell>
                          <p className="font-medium text-gray-800">
                            {line.name}
                          </p>
                          <p className="text-xs text-gray">
                            <ResourceKindLabel
                              kind={line.kind}
                              label={resourceKindObj[line.kind]}
                            />
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
                                value &&
                                run(
                                  updateAssemblyLine({
                                    productId: hostId,
                                    blockId: block.id,
                                    lineId: line.id,
                                    values: { selectedId: String(value) },
                                  }),
                                  'Opção padrão alterada',
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
                                {line.formula === 'EQUAL_TIME' ||
                                line.formula === 'PER_TIME'
                                  ? rules.timeFieldDefault
                                    ? `tempo informado (${amount(rules.timeFieldDefault, 'min')})`
                                    : `tempo padrão ${amount(line.effective.perUnit, 'min')}`
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
                            : formulaLabel(line.formula, line.fieldName)}
                          {line.mode !== 'LIST' &&
                            formulaInputs[line.formula]?.length > 0 && (
                              <span className="mt-1 flex flex-wrap gap-1">
                                {formulaInputs[line.formula].map((input) => (
                                  <span
                                    key={input}
                                    className={cn(
                                      'rounded px-1.5 py-0.5 text-xs',
                                      zeroInput(input, block, line)
                                        ? 'bg-error-50 text-error-700'
                                        : 'bg-gray-100 text-gray-600',
                                    )}
                                  >
                                    {input === 'campo extra'
                                      ? line.fieldName || 'campo'
                                      : input}
                                  </span>
                                ))}
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
                                    setDialog({ kind: 'line', lineId: line.id })
                                  }
                                />
                              )}
                              {line.mode !== 'SINGLE' && (
                                <ActionButton
                                  Icon={IconListDetails}
                                  variant="neutralGhost"
                                  tooltip="Opções da linha"
                                  onClick={() =>
                                    setDialog({
                                      kind: 'options',
                                      lineId: line.id,
                                    })
                                  }
                                />
                              )}
                              <ActionButton
                                Icon={IconTrash}
                                variant="errorGhost"
                                tooltip={`Remover ${line.name.toLowerCase()}`}
                                onClick={() => removeLine(line)}
                              />
                            </div>
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {block.lines.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-6 text-center text-sm text-gray"
                      >
                        Este processo ainda não tem recursos. Acrescente abaixo
                        a máquina, o material e a mão de obra que o setor de{' '}
                        {block.sector.toLowerCase()} usa, cada um com o seu tipo
                        de cálculo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {block.setupMinutes > 0 && (
              <CardFooter className="text-sm text-gray">
                Preparo: {amount(block.setupMinutes, 'min')}, uma vez por pedido
              </CardFooter>
            )}
          </Card>
        )}

        {/* 4. Onde o processo está: os produtos acompanham a montagem (CP-21) */}
        {show('usage') && (
          <Card>
            <CardHeader>
              <CardTitle>Usado em</CardTitle>
              <CardDescription>
                Os produtos acompanham este processo: mudar a montagem aqui muda
                todos eles. O que cada produto ajustou só para ele continua como
                está, e os orçamentos já feitos não mudam.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {detail.usedIn.length ? (
                <div className="flex flex-wrap gap-2">
                  {detail.usedIn.map((item) => (
                    <Link
                      key={item.productId}
                      href={`/configuracoes/produtos/${item.productId}/composicao`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-brand-300 hover:bg-brand-25"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray">
                  Nenhum produto usa este processo ainda.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. No fluxo dos produtos (FL-7): as etapas seguintes usuais são
            marcadas à mão, num par guardado uma vez e editável dos dois
            lados. Nada é bloqueado: o não marcado fica em "ver todos" */}
        {show('usage') && (
          <Card>
            <CardHeader>
              <CardTitle>No fluxo dos produtos</CardTitle>
              <CardDescription>
                Ao montar um produto, &quot;+ etapa seguinte&quot; mostra
                primeiro o que está marcado aqui; o resto fica em &quot;ver
                todos&quot;. Marcar de um lado aparece no outro. Sem marcação,
                valem os acabamentos do mesmo setor.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
              {(
                [
                  [
                    'before',
                    'Costuma vir depois de',
                    'Os processos que normalmente vêm antes deste. A dupla face vem depois do adesivo, do PVC e do ACM.',
                  ],
                  [
                    'after',
                    'Etapas seguintes usuais',
                    'Os processos que normalmente vêm depois deste. Depois da impressão, o refile e a laminação.',
                  ],
                ] as const
              ).map(([side, label, help]) => (
                <div key={side} className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray">{help}</p>
                  <div className="max-h-[320px] space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {!usualRes ? (
                      <Skeleton className="h-20 w-full" />
                    ) : usualRes.data?.[side].length ? (
                      usualRes.data[side].map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={item.usual}
                            disabled={!canEdit}
                            aria-label={item.name}
                            onCheckedChange={(checked) =>
                              toggleUsual(side, item.id, checked === true)
                            }
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-gray-800">
                              {item.name}
                            </span>
                            <span className="block text-xs text-gray">
                              {item.sector}
                            </span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="px-2 py-1.5 text-sm text-gray">
                        Nenhum outro processo cadastrado.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <NewLineDialog
        block={dialog?.kind === 'newLine' ? block : undefined}
        initialKind={dialog?.kind === 'newLine' ? dialog.lineKind : undefined}
        resources={resourcesRes?.data?.resources || []}
        fields={detail.fields}
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          setDialog(null)
          run(
            addAssemblyLine({ productId: hostId, blockId: block.id, values }),
            'Recurso acrescentado ao processo',
          )
        }}
      />
      <LineDialog
        line={dialog?.kind === 'line' ? lineOf(dialog.lineId) : undefined}
        fields={detail.fields}
        ownStage
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          if (dialog?.kind !== 'line') return
          const lineId = dialog.lineId
          setDialog(null)
          run(
            updateAssemblyLine({
              productId: hostId,
              blockId: block.id,
              lineId,
              values,
            }),
            'Recurso ajustado',
          )
        }}
      />
      <OptionsDialog
        line={dialog?.kind === 'options' ? lineOf(dialog.lineId) : undefined}
        resources={resourcesRes?.data?.resources || []}
        onOpenChange={() => setDialog(null)}
        onAdd={async (values) => {
          if (dialog?.kind !== 'options') return false
          const res = await addLineOption({
            productId: hostId,
            blockId: block.id,
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
              productId: hostId,
              blockId: block.id,
              lineId: dialog.lineId,
              optionId,
            }),
            'Opção removida',
          )
        }}
      />
    </TooltipProvider>
  )
}

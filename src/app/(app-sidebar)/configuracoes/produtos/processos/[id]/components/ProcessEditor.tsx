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
  RulesDialog,
  NewLineDialog,
  OptionsDialog,
} from '../../../[id]/composicao/components/AssemblyDialogs'

// Types
import {
  formulaInputs,
  quantityModeObj,
  extraFieldKindObj,
  type FormulaInput,
  type ComputedLine,
  type ComputedBlock,
  type AssemblyMeasure,
} from '../../../[id]/composicao/assembly'

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
  formulaObj,
  resourceKindObj,
  dimensionRuleObj,
} from '@/consts/processes'

// Third-party
import { toast } from 'sonner'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

// Icons
import {
  IconTrash,
  IconPencil,
  IconSettings,
  IconCirclePlus,
  IconListDetails,
} from '@tabler/icons-react'

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
const zeroInput = (input: FormulaInput, block: ComputedBlock) => {
  const { measure: m, rules } = block
  if (input === 'quantidade') return !m.quantity
  if (input === 'largura') return !m.width
  if (input === 'altura') return !m.height
  if (input === 'área' || input === 'perímetro') return !m.width || !m.height
  if (input === 'campo extra')
    return rules.extraField === 'NONE' || !rules.extraFieldDefault
  if (input === 'tempo') return !rules.timeField || !rules.timeFieldDefault
  return false
}

type Dialog =
  | { kind: 'rules' }
  | { kind: 'newLine' }
  | { kind: 'line'; lineId: string }
  | { kind: 'options'; lineId: string }
  | null

export function ProcessEditor({ id }: { id: string }) {
  const money = useMoney()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [meta, setMeta] = useState({
    sector: '',
    finishingOf: 'none',
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
        finishingOf: detail.meta.finishingOf || 'none',
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
    return <Skeleton className="h-[480px] w-full" />
  }

  const hostId = detail.hostId
  const sectors = resourcesRes?.data?.sectors || []
  const lineOf = (lineId: string) =>
    block.lines.find((line) => line.id === lineId)
  const metaChanged =
    meta.sector !== block.sector ||
    meta.finishingOf !== (detail.meta.finishingOf || 'none') ||
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
  const rulesText = [
    quantityModeObj[rules.quantityMode],
    rules.followsBase ? 'acompanha a quantidade da base' : 'uma vez por pedido',
    dimensionRuleObj[rules.dimension],
    rules.extraField === 'NONE'
      ? null
      : `campo extra "${rules.extraFieldName}" (${extraFieldKindObj[rules.extraField].toLowerCase()})`,
    rules.timeField ? 'com campo tempo' : null,
    rules.descriptionEditable ? 'vendedor pode renomear' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={block.name}
          previousPage="/configuracoes/produtos/processos"
          supportText={`${detail.category} · ${block.sector}${
            detail.meta.active ? '' : ' · inativo'
          }`}
          primaryCta={
            <PermissionGate permissions={EDIT}>
              <Button
                variant="neutralOutline"
                LeftIcon={IconSettings}
                onClick={() => setDialog({ kind: 'rules' })}
              >
                Nome, tarefa e regras de venda
              </Button>
            </PermissionGate>
          }
        />

        {/* 1. O que o processo é e como se comporta na venda */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>
                Tarefa na produção: {block.taskType.toLowerCase()} · {rulesText}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-3">
              <SelectBasic
                name="process-sector"
                label="Setor"
                options={sectors.map((item) => ({ value: item, label: item }))}
                value={meta.sector}
                onChange={(value) =>
                  value &&
                  setMeta((current) => ({ ...current, sector: String(value) }))
                }
              />
              <SelectBasic
                name="process-finishing"
                label="É acabamento de"
                options={[
                  { value: 'none', label: 'Não é acabamento' },
                  ...sectors.map((item) => ({ value: item, label: item })),
                ]}
                value={meta.finishingOf}
                onChange={(value) =>
                  value &&
                  setMeta((current) => ({
                    ...current,
                    finishingOf: String(value),
                  }))
                }
              />
              <div className="space-y-2">
                <Label htmlFor="process-setup">Preparo (min)</Label>
                <Input
                  id="process-setup"
                  type="number"
                  min={0}
                  step="1"
                  value={meta.setupMinutes}
                  onChange={(event) =>
                    setMeta((current) => ({
                      ...current,
                      setupMinutes: Number(event.target.value) || 0,
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
            </CardContent>
            <PermissionGate permissions={EDIT}>
              <CardFooter className="flex-wrap justify-between gap-3">
                <p className="text-sm text-gray">
                  O preparo entra uma vez por pedido, com o custo-hora do setor.
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
                          finishingOf:
                            meta.finishingOf === 'none'
                              ? null
                              : meta.finishingOf,
                          setupMinutes: meta.setupMinutes,
                          sellerInstructions: meta.sellerInstructions,
                        },
                      }),
                      'Processo salvo',
                    )
                  }
                >
                  Salvar configuração
                </Button>
              </CardFooter>
            </PermissionGate>
          </Card>

          {/* 2. Simulação: conferir o processo antes de usá-lo */}
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
        </div>

        {/* 3. As linhas: o que o setor usa nesta etapa */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos e tempo</CardTitle>
            <CardDescription>
              Recurso único, escolha de um (o vendedor escolhe entre opções de
              mesma unidade) ou lista para o vendedor preencher.
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
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[18%]">Linha</TableHead>
                  <TableHead className="w-[22%]">Recurso</TableHead>
                  <TableHead className="w-[13%]">Consumo</TableHead>
                  <TableHead className="w-[17%]">Cálculo</TableHead>
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
                        <p className="font-medium text-gray-800">{line.name}</p>
                        <p className="text-xs text-gray">
                          {resourceKindObj[line.kind]}
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
                              {rules.timeField &&
                              (line.formula === 'EQUAL_TIME' ||
                                line.formula === 'PER_TIME')
                                ? `tempo da etapa (${amount(rules.timeFieldDefault || 0, 'min')})`
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
                              {formulaInputs[line.formula].map((input) => (
                                <span
                                  key={input}
                                  className={cn(
                                    'rounded px-1.5 py-0.5 text-[11px]',
                                    zeroInput(input, block)
                                      ? 'bg-error-50 text-error-700'
                                      : 'bg-gray-100 text-gray-600',
                                  )}
                                >
                                  {input}
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
                      Nenhuma linha ainda. Acrescente o tempo, a máquina e o
                      material que o setor de {block.sector.toLowerCase()} usa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <PermissionGate permissions={EDIT}>
              <div className="px-6 pb-2 pt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconCirclePlus}
                  onClick={() => setDialog({ kind: 'newLine' })}
                >
                  Nova linha
                </Button>
              </div>
            </PermissionGate>
          </CardContent>
          {block.setupMinutes > 0 && (
            <CardFooter className="text-sm text-gray">
              Preparo: {block.setupMinutes} min, uma vez por pedido
            </CardFooter>
          )}
        </Card>

        {/* 4. Onde o processo está: os produtos acompanham a montagem (CP-21) */}
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

        {/* 5. No fluxo dos produtos (FL-7): as etapas seguintes usuais são
            marcadas à mão, num par guardado uma vez e editável dos dois
            lados. Nada é bloqueado: o não marcado fica em "ver todos" */}
        <Card>
          <CardHeader>
            <CardTitle>No fluxo dos produtos</CardTitle>
            <CardDescription>
              Ao montar um produto, &quot;+ etapa seguinte&quot; mostra primeiro
              o que está marcado aqui; o resto fica em &quot;ver todos&quot;.
              Marcar de um lado aparece no outro. Sem marcação, valem os
              acabamentos do mesmo setor.
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
      </div>

      <RulesDialog
        block={dialog?.kind === 'rules' ? block : undefined}
        onOpenChange={() => setDialog(null)}
        onSave={(newRules, name, taskType) => {
          setDialog(null)
          run(
            setBlockLocalRules({
              productId: hostId,
              blockId: block.id,
              rules: newRules,
              name,
              taskType,
            }),
            'Processo configurado',
          )
        }}
      />
      <NewLineDialog
        block={dialog?.kind === 'newLine' ? block : undefined}
        resources={resourcesRes?.data?.resources || []}
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          setDialog(null)
          run(
            addAssemblyLine({ productId: hostId, blockId: block.id, values }),
            'Linha adicionada',
          )
        }}
      />
      <LineDialog
        line={dialog?.kind === 'line' ? lineOf(dialog.lineId) : undefined}
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
            'Linha ajustada',
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

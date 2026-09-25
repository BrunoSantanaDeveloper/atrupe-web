'use client'

// PROVISÓRIO nos dados: lê `src/actions/product-assembly.ts`, que também faz
// o cálculo (SEG-1).
//
// O produto composto montado por etapas — o "item pronto" do legado na nova
// versão (área 8, §3.4.1). A pergunta que a tela responde primeiro: quanto
// custa este produto na medida em que ele é vendido, e se o preço cobre.

// React
import { Fragment, useEffect, useMemo, useState } from 'react'

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
  AddBlockDialog,
  type LineValues,
} from './AssemblyDialogs'

// Types
import {
  unitKindObj,
  unitSymbol,
  unitSaleLabel,
  unitAmountLabel,
  assemblyStatusObj,
  productDimensionObj,
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
  addAssemblyBlock,
  getProcessCatalog,
  moveAssemblyBlock,
  resetAssemblyLine,
  setBlockLocalRules,
  updateAssemblyLine,
  removeAssemblyBlock,
} from '@/actions/product-assembly'

// Hooks / Store / Consts
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
  IconTrash,
  IconPencil,
  IconArrowUp,
  IconSettings,
  IconArrowDown,
  IconCirclePlus,
  IconArrowBackUp,
} from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const EDIT = ['product_settings:products:edit']

const num = (value: number, digits = 3) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits })

const money = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const toOptions = <K extends string>(obj: { [key in K]: string }) =>
  (Object.keys(obj) as K[]).map((value) => ({ value, label: obj[value] }))

type Dialog =
  | { kind: 'add'; sector: string }
  | { kind: 'finish'; block: ComputedBlock }
  | { kind: 'line'; block: ComputedBlock; line: ComputedLine }
  | { kind: 'rules'; block: ComputedBlock }
  | null

export function AssemblyEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  // A medida da simulação é da tela; a medida padrão só muda ao salvar
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [description, setDescription] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['assembly', productId, measure],
    queryFn: () => getAssembly({ productId, measure }),
    placeholderData: keepPreviousData,
  })
  const { data: catalogRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['process-catalog'],
    queryFn: () => getProcessCatalog(),
  })

  const assembly = data?.data
  const catalog = useMemo(() => catalogRes?.data || [], [catalogRes])

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
  const measureChanged =
    saved.quantity !== measure.quantity ||
    saved.width !== measure.width ||
    saved.height !== measure.height

  const baseSectors = Array.from(
    new Set(
      catalog.filter((item) => item.role === 'BASE').map((item) => item.sector),
    ),
  )

  const finishingFor = (block: ComputedBlock) =>
    catalog.filter(
      (item) => item.role === 'FINISHING' && item.finishingOf === block.sector,
    )

  // O sugerido já vem na unidade comercial: adotar é gravar como valor de
  // venda, o mesmo campo do cadastro do START
  const adoptSuggested = () =>
    run(
      updateAssembly({
        productId,
        values: { unitPrice: assembly.suggestedUnitPrice },
      }),
      'Preço sugerido adotado',
    )

  const removeBlock = (block: ComputedBlock) =>
    alertDialog.open({
      title: `Remover ${block.name}?`,
      description:
        block.role === 'BASE'
          ? 'A etapa sai do produto com os acabamentos dela. O processo continua cadastrado.'
          : 'A etapa sai do produto. O processo continua cadastrado.',
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

  const baseName = (block: ComputedBlock) =>
    assembly.blocks.find((item) => item.id === block.baseBlockId)?.name

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

  const block = (item: ComputedBlock, index: number) => {
    const finishing = item.role === 'FINISHING'
    const options = finishing ? [] : finishingFor(item)

    return (
      <Card
        key={item.id}
        className={cn(
          finishing && 'ml-4 border-l-4 border-l-brand-200 md:ml-8',
        )}
      >
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutralLight">{item.sector}</Badge>
              {finishing ? (
                <Badge variant="blueLight">
                  Acabamento de {baseName(item)?.toLowerCase()}
                </Badge>
              ) : (
                <Badge variant="neutralLight">Base</Badge>
              )}
              {item.localRules && (
                <Badge variant="warningLight">Regras próprias</Badge>
              )}
            </div>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>
              {measureText(item)}
              {item.rules.extraField !== 'NONE'
                ? ` · ${item.rules.extraFieldName}: ${num(item.rules.extraFieldDefault)}`
                : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <PermissionGate permissions={['values:values:view']}>
              <p className="text-right">
                <span className="block text-xs text-gray">Custo da etapa</span>
                <span className="text-base font-semibold text-gray-900">
                  {money(item.cost)}
                </span>
              </p>
            </PermissionGate>
            <PermissionGate permissions={EDIT}>
              <div className="flex gap-1">
                {!finishing && options.length > 0 && (
                  <ActionButton
                    Icon={IconCirclePlus}
                    variant="neutralGhost"
                    tooltip="Adicionar acabamento"
                    onClick={() => setDialog({ kind: 'finish', block: item })}
                  />
                )}
                <ActionButton
                  Icon={IconSettings}
                  variant="neutralGhost"
                  tooltip="Regras de venda"
                  onClick={() => setDialog({ kind: 'rules', block: item })}
                />
                <ActionButton
                  Icon={IconArrowUp}
                  variant="neutralGhost"
                  tooltip="Subir etapa"
                  disabled={index === 0}
                  onClick={() =>
                    run(
                      moveAssemblyBlock({
                        productId,
                        blockId: item.id,
                        direction: 'UP',
                      }),
                    )
                  }
                />
                <ActionButton
                  Icon={IconArrowDown}
                  variant="neutralGhost"
                  tooltip="Descer etapa"
                  disabled={index === assembly.blocks.length - 1}
                  onClick={() =>
                    run(
                      moveAssemblyBlock({
                        productId,
                        blockId: item.id,
                        direction: 'DOWN',
                      }),
                    )
                  }
                />
                <ActionButton
                  Icon={IconTrash}
                  variant="errorGhost"
                  tooltip="Remover etapa"
                  onClick={() => removeBlock(item)}
                />
              </div>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[20%]">Linha</TableHead>
                <TableHead className="w-[26%]">Recurso</TableHead>
                <TableHead className="w-[14%]">Consumo</TableHead>
                <TableHead className="w-[16%]">Cálculo</TableHead>
                <TableHead className="w-[10%] text-right">Quantidade</TableHead>
                <TableHead className="w-[10%] text-right">Custo</TableHead>
                <TableHead className="w-[4%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.lines.map((line) => {
                const unit = line.selected?.unit || line.options[0]?.unit || ''

                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <p className="font-medium text-gray-800">{line.name}</p>
                      <p className="text-xs text-gray">
                        {resourceKindObj[line.kind]}
                        {line.overridden ? ' · ajustada neste produto' : ''}
                      </p>
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
                              updateAssemblyLine({
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
                            {num(line.perUnit)} {unit}
                          </p>
                          {(line.lossPercent > 0 || line.minimum !== null) && (
                            <p className="text-xs text-gray">
                              {[
                                line.lossPercent > 0
                                  ? `+${num(line.lossPercent, 1)}% de perda`
                                  : null,
                                line.minimum !== null
                                  ? `mínimo ${num(line.minimum)} ${unit}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {line.mode === 'LIST'
                        ? 'Informado na venda'
                        : formulaObj[line.formula]?.label}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm">
                      {line.quantity === null
                        ? '-'
                        : `${num(line.quantity)} ${unit}`}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                      <PermissionGate
                        permissions={['values:values:view']}
                        fallback={<span>•••</span>}
                      >
                        {money(line.cost)}
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
                          {line.overridden && (
                            <ActionButton
                              Icon={IconArrowBackUp}
                              variant="neutralGhost"
                              tooltip="Voltar ao que o processo define"
                              onClick={() =>
                                run(
                                  resetAssemblyLine({
                                    productId,
                                    blockId: item.id,
                                    lineId: line.id,
                                  }),
                                  'Linha voltou ao processo',
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
            </TableBody>
          </Table>
        </CardContent>
        {item.setupMinutes > 0 && (
          <CardFooter className="justify-between text-sm text-gray">
            <span>Preparo: {item.setupMinutes} min, uma vez por pedido</span>
            <PermissionGate permissions={['values:values:view']}>
              <span>{money(item.setupCost)}</span>
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
                </Label>
                <Input
                  key={`${assembly.unitKind}-${assembly.unitPrice}`}
                  id="assembly-unit-price"
                  type="number"
                  min={0}
                  step="0.01"
                  startAdornment={<span className="text-sm">R$</span>}
                  defaultValue={
                    assembly.unitPrice === null ? '' : assembly.unitPrice / 100
                  }
                  onBlur={(event) =>
                    run(
                      updateAssembly({
                        productId,
                        values: {
                          unitPrice:
                            event.target.value === ''
                              ? null
                              : Math.round(Number(event.target.value) * 100),
                        },
                      }),
                    )
                  }
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
                  {money(assembly.suggestedPrice)} nesta medida
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

      {/* 3. A composição: etapas por setor, acabamentos embaixo da base */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-gray-800">Composição</p>
          <p className="text-sm text-gray">
            Comece pela base; os acabamentos entram embaixo dela.
          </p>
        </div>
        <PermissionGate permissions={EDIT}>
          <div className="flex flex-wrap gap-2">
            {baseSectors.map((sector) => (
              <Button
                key={sector}
                type="button"
                size="md"
                variant="neutralOutline"
                LeftIcon={IconCirclePlus}
                onClick={() => setDialog({ kind: 'add', sector })}
              >
                {sector}
              </Button>
            ))}
          </div>
        </PermissionGate>
      </div>

      {assembly.blocks.length ? (
        assembly.blocks.map((item, index) => (
          <Fragment key={item.id}>{block(item, index)}</Fragment>
        ))
      ) : (
        <Card>
          <EmptyState
            title="Nenhuma etapa ainda"
            description="Adicione a etapa onde o produto começa — a impressão, a criação, o corte. O produto continua sendo vendido pelo preço cadastrado enquanto não houver composição."
          />
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

      <AddBlockDialog
        open={dialog?.kind === 'add' || dialog?.kind === 'finish'}
        onOpenChange={() => setDialog(null)}
        title={
          dialog?.kind === 'finish'
            ? `Acabamento para ${dialog.block.name.toLowerCase()}`
            : `Etapa de ${dialog?.kind === 'add' ? dialog.sector.toLowerCase() : ''}`
        }
        description={
          dialog?.kind === 'finish'
            ? `Só os acabamentos do setor de ${dialog.block.sector.toLowerCase()}.`
            : 'Escolha o processo que começa o produto.'
        }
        processes={
          dialog?.kind === 'finish'
            ? finishingFor(dialog.block)
            : dialog?.kind === 'add'
              ? catalog.filter(
                  (item) =>
                    item.role === 'BASE' && item.sector === dialog.sector,
                )
              : []
        }
        onPick={(processId) => {
          const baseBlockId = dialog?.kind === 'finish' ? dialog.block.id : null
          setDialog(null)
          run(
            addAssemblyBlock({ productId, processId, baseBlockId }),
            'Etapa adicionada',
          )
        }}
      />
      <LineDialog
        line={dialog?.kind === 'line' ? dialog.line : undefined}
        onOpenChange={() => setDialog(null)}
        onSave={(values: LineValues) => {
          if (dialog?.kind !== 'line') return
          const { block: target, line } = dialog
          setDialog(null)
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
        onSave={(rules) => {
          if (dialog?.kind !== 'rules') return
          const target = dialog.block
          setDialog(null)
          run(
            setBlockLocalRules({ productId, blockId: target.id, rules }),
            rules
              ? 'Regras próprias salvas'
              : 'Etapa voltou às regras do processo',
          )
        }}
      />
    </div>
  )
}

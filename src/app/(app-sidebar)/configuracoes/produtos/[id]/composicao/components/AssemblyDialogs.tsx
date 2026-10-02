'use client'

// Os diálogos do montador: adicionar etapa, ajustar a linha e as regras de
// venda do processo dentro do produto.

// React
import { useEffect, useState } from 'react'

// Next
import Link from 'next/link'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import {
  TASK_TYPES,
  lineModeObj,
  hhmmToMinutes,
  minutesToHhmm,
  quantityModeObj,
  extraFieldKindObj,
  type LineMode,
  type NewLineValues,
  type AssemblyResource,
  type LibraryEntry,
  type SaleRules,
  type QuantityMode,
  type ComputedLine,
  type ComputedBlock,
  type ExtraFieldKind,
  type ProcessCatalogItem,
} from '../assembly'
import type {
  FormulaKey,
  ResourceKind,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Hooks / Store / Consts
import {
  formulaObj,
  resourceKindObj,
  formulaOptions,
  resourceKindOptions,
  dimensionRuleOptions,
} from '@/consts/processes'

// Icons
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSettings,
  IconListDetails,
  IconPuzzle,
  IconBooks,
  IconSearch,
} from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const toOptions = <K extends string>(obj: { [key in K]: string }) =>
  (Object.keys(obj) as K[]).map((value) => ({ value, label: obj[value] }))

/* ---------------------------------------------------------------------------
 * Adicionar etapa — por setor, ou acabamento filtrado pela base (MS-2)
 * ------------------------------------------------------------------------- */

export function AddBlockDialog({
  open,
  allowOwn = true,
  onOpenChange,
  title,
  description,
  processes,
  onCreate,
  onPick,
}: {
  open: boolean
  // Na variação só entra processo cadastrado: a etapa só dela sai inteira
  allowOwn?: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  processes: ProcessCatalogItem[]
  // A etapa montada no próprio produto: o caminho normal
  onCreate: (name: string) => void
  // Incluir um processo já cadastrado: a alternativa
  onPick: (processId: string) => void
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {allowOwn && (
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (name.trim()) onCreate(name)
              }}
            >
              <Label htmlFor="own-block-name">Nome da etapa</Label>
              <div className="flex gap-2">
                <Input
                  id="own-block-name"
                  autoFocus
                  placeholder="Ex.: Impressão da lona, Solda da estrutura"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Button type="submit" disabled={!name.trim()}>
                  Criar
                </Button>
              </div>
              <p className="text-sm text-gray">
                Depois de criada, acrescente os recursos e o tempo que o setor
                usa nela.
              </p>
            </form>
          )}

          {processes.length > 0 && (
            <div
              className={cn(
                'space-y-2',
                allowOwn && 'border-t border-gray-200 pt-4',
              )}
            >
              <p className="text-sm font-medium text-gray-800">
                {allowOwn
                  ? 'Ou inclua um processo já cadastrado'
                  : 'Escolha o processo'}
              </p>
              {processes.map((process) => (
                <button
                  key={process.id}
                  type="button"
                  onClick={() => onPick(process.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-brand-300 hover:bg-brand-25"
                >
                  <span className="font-medium text-gray-800">
                    {process.name}
                  </span>
                  <span className="text-sm text-gray">{process.sector}</span>
                </button>
              ))}
            </div>
          )}
          {!allowOwn && !processes.length && (
            <p className="text-sm text-gray">
              Nenhum processo cadastrado para este setor.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Nova linha da etapa: um recurso, uma escolha entre recursos ou uma lista
 * para o vendedor preencher (IP-21)
 * ------------------------------------------------------------------------- */

const emptyLine = (kind: ResourceKind): NewLineValues => ({
  name: '',
  kind,
  mode: 'SINGLE',
  optionIds: [],
  perUnit: 1,
  formula: 'PER_UNIT',
  lossPercent: 0,
  minimum: null,
  optional: false,
  optionalDefault: true,
})

// Opcional é escolha do vendedor (a cantoneira do quadro com lona); linha sem
// recurso é outra coisa — erro de cadastro, que o sistema não deixa criar
function OptionalFields({
  optional,
  optionalDefault,
  onChange,
}: {
  optional: boolean
  optionalDefault: boolean
  onChange: (values: { optional: boolean; optionalDefault: boolean }) => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
      <label className="flex items-start justify-between gap-6">
        <span>
          <span className="block text-sm font-medium text-gray-800">
            Opcional
          </span>
          <span className="block text-sm text-gray">
            O vendedor decide no orçamento se esta linha entra.
          </span>
        </span>
        <Switch
          checked={optional}
          onCheckedChange={(checked) =>
            onChange({ optional: checked, optionalDefault })
          }
          aria-label="Opcional"
        />
      </label>
      {optional && (
        <label className="flex items-start justify-between gap-6">
          <span>
            <span className="block text-sm font-medium text-gray-800">
              Já vem marcada no orçamento
            </span>
            <span className="block text-sm text-gray">
              É também o que o custo e o sugerido da composição consideram.
            </span>
          </span>
          <Switch
            checked={optionalDefault}
            onCheckedChange={(checked) =>
              onChange({ optional, optionalDefault: checked })
            }
            aria-label="Já vem marcada no orçamento"
          />
        </label>
      )}
    </div>
  )
}

export function NewLineDialog({
  block,
  resources,
  initialKind = 'LABOR',
  onOpenChange,
  onSave,
}: {
  block?: ComputedBlock
  resources: AssemblyResource[]
  // O botão que abriu o diálogo já diz o tipo: Máquina, Material, Mão de
  // obra ou Terceirizado, como no item pronto do legado
  initialKind?: ResourceKind
  onOpenChange: (open: boolean) => void
  onSave: (values: NewLineValues) => void
}) {
  const [values, setValues] = useState<NewLineValues>(emptyLine(initialKind))

  useEffect(() => {
    if (block) setValues(emptyLine(initialKind))
  }, [block, initialKind])

  const set = <K extends keyof NewLineValues>(
    key: K,
    value: NewLineValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }))

  // A mão de obra do próprio setor aparece primeiro
  const available = resources
    .filter((item) => item.kind === values.kind)
    .sort((a, b) =>
      a.name.includes(block?.sector || '#')
        ? -1
        : b.name.includes(block?.sector || '#')
          ? 1
          : a.name.localeCompare(b.name),
    )
  const chosen = available.filter((item) => values.optionIds.includes(item.id))
  const unit = chosen[0]?.unit || ''
  const list = values.mode === 'LIST'
  const mixedUnits =
    values.mode === 'CHOOSE' && new Set(chosen.map((i) => i.unit)).size > 1

  const toggle = (id: string) =>
    set(
      'optionIds',
      values.mode === 'SINGLE'
        ? [id]
        : values.optionIds.includes(id)
          ? values.optionIds.filter((item) => item !== id)
          : [...values.optionIds, id],
    )

  // No recurso único o nome é o do próprio recurso (a impressora laser); só
  // o grupo de escolha e a lista precisam de um nome seu ("Papel")
  const singleName = values.mode === 'SINGLE' ? chosen[0]?.name || '' : ''
  const finalName = values.name.trim() || singleName
  const valid =
    finalName &&
    values.optionIds.length > 0 &&
    !mixedUnits &&
    (values.mode !== 'CHOOSE' || values.optionIds.length > 1)

  return (
    <Dialog open={!!block} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <div>
              <DialogTitle>
                Acrescentar {resourceKindObj[values.kind].toLowerCase()} ·{' '}
                {block?.name}
              </DialogTitle>
              <DialogDescription>
                O que o setor de {block?.sector.toLowerCase()} usa nesta etapa,
                e como a quantidade é calculada a partir da medida vendida.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-line-name">
                {values.mode === 'SINGLE'
                  ? 'Nome (opcional)'
                  : values.mode === 'CHOOSE'
                    ? 'Nome do grupo'
                    : 'Nome da lista'}
              </Label>
              <Input
                id="new-line-name"
                placeholder={
                  values.mode === 'SINGLE'
                    ? singleName || 'Fica o nome do recurso escolhido'
                    : values.mode === 'CHOOSE'
                      ? 'Ex.: Papel, Lona, Acabamento'
                      : 'Ex.: Materiais da estrutura'
                }
                value={values.name}
                onChange={(event) => set('name', event.target.value)}
              />
            </div>
            <SelectBasic
              name="new-line-kind"
              label="Tipo de recurso"
              options={resourceKindOptions}
              value={values.kind}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  kind: value as ResourceKind,
                  optionIds: [],
                }))
              }
            />
          </div>

          <SelectBasic
            name="new-line-mode"
            label="Como funciona"
            options={toOptions(lineModeObj)}
            value={values.mode}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                mode: value as LineMode,
                optionIds:
                  value === 'SINGLE'
                    ? current.optionIds.slice(0, 1)
                    : current.optionIds,
              }))
            }
          />
          <p className="-mt-2 text-sm text-gray">
            {values.mode === 'SINGLE'
              ? 'Um recurso, sempre o mesmo: a impressora, a lona, a hora do setor.'
              : values.mode === 'CHOOSE'
                ? 'Um grupo com várias opções de mesma unidade, e o vendedor escolhe uma no orçamento: o grupo "Papel" com couché 150 g, couché 300 g e offset 90 g. Entra no custo só a escolhida.'
                : 'O vendedor informa no orçamento quanto usou de cada item (o metalon de uma base de ACM).'}
          </p>

          <div className="space-y-2">
            <Label>{values.mode === 'SINGLE' ? 'Recurso' : 'Recursos'}</Label>
            <div className="max-h-[220px] space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {available.length ? (
                available.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type={values.mode === 'SINGLE' ? 'radio' : 'checkbox'}
                        name="new-line-resource"
                        className="accent-brand-600"
                        checked={values.optionIds.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <span className="text-sm text-gray-800">{item.name}</span>
                    </span>
                    <span className="text-sm text-gray">{item.unit}</span>
                  </label>
                ))
              ) : (
                <p className="p-2 text-sm text-gray">
                  Nenhum recurso deste tipo na Base de custos.
                </p>
              )}
            </div>
            {mixedUnits && (
              <p className="text-sm text-error-700">
                As opções de uma escolha precisam ter a mesma unidade.
              </p>
            )}
          </div>

          {!list && (
            <>
              <SelectBasic
                name="new-line-formula"
                label="Tipo de cálculo"
                options={formulaOptions}
                value={values.formula}
                onChange={(value) => set('formula', value as FormulaKey)}
              />
              <p className="-mt-2 text-sm text-gray">
                {formulaObj[values.formula]?.help}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="new-line-per-unit">
                    Consumo{unit ? ` (${unit})` : ''}
                  </Label>
                  <Input
                    id="new-line-per-unit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.perUnit}
                    onChange={(event) =>
                      set('perUnit', Number(event.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-line-loss">Perda (%)</Label>
                  <Input
                    id="new-line-loss"
                    type="number"
                    min={0}
                    step="1"
                    value={values.lossPercent}
                    onChange={(event) =>
                      set('lossPercent', Number(event.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-line-minimum">
                    Mínimo{unit ? ` (${unit})` : ''}
                  </Label>
                  <Input
                    id="new-line-minimum"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Sem mínimo"
                    value={values.minimum ?? ''}
                    onChange={(event) =>
                      set(
                        'minimum',
                        event.target.value === ''
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  />
                </div>
              </div>
            </>
          )}
          <OptionalFields
            optional={values.optional}
            optionalDefault={values.optionalDefault}
            onChange={(next) =>
              setValues((current) => ({ ...current, ...next }))
            }
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!valid}
            onClick={() => onSave({ ...values, name: finalName })}
          >
            Adicionar {resourceKindObj[values.kind].toLowerCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Ajustar a linha só neste produto (IP-22, CP-8)
 * ------------------------------------------------------------------------- */

export type LineValues = {
  perUnit: number
  formula: FormulaKey
  lossPercent: number
  minimum: number | null
  optional: boolean
  optionalDefault: boolean
  // Aproveitamento de folha (AP-3, AP-4)
  sheetMargin?: number
  sheetGap?: number
  chargeWholeSheets?: boolean
  // Consumo, perda e mínimo próprios de cada opção (IP-26)
  optionValues?: {
    id: string
    perUnit?: number
    lossPercent?: number
    minimum?: number | null
  }[]
}

const optionalNumber = (value: string) =>
  value === '' ? undefined : Number(value)

export function LineDialog({
  line,
  variationName,
  ownStage,
  onOpenChange,
  onSave,
}: {
  line?: ComputedLine
  // Na variação só o consumo muda: o 4x4 passa a folha duas vezes (PV-7)
  variationName?: string
  // A etapa foi montada no produto: não há processo por trás
  ownStage?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: LineValues) => void
}) {
  const [values, setValues] = useState<LineValues>({
    perUnit: 0,
    formula: 'FIXED',
    lossPercent: 0,
    minimum: null,
    optional: false,
    optionalDefault: true,
  })

  useEffect(() => {
    if (line) {
      setValues({
        perUnit: line.perUnit,
        formula: line.formula,
        lossPercent: line.lossPercent,
        minimum: line.minimum,
        optional: !!line.optional,
        optionalDefault: line.optionalDefault ?? true,
        sheetMargin: line.sheetMargin,
        sheetGap: line.sheetGap,
        chargeWholeSheets: line.chargeWholeSheets,
        optionValues:
          line.mode === 'CHOOSE'
            ? line.options.map((option) => ({
                id: option.id,
                perUnit: option.perUnit,
                lossPercent: option.lossPercent,
                minimum: option.minimum,
              }))
            : undefined,
      })
    }
  }, [line])

  const unit = line?.selected?.unit || line?.options[0]?.unit || ''

  return (
    <Dialog open={!!line} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
            <div>
              <DialogTitle>Ajustar {line?.name.toLowerCase()}</DialogTitle>
              <DialogDescription>
                {variationName
                  ? `Vale só na variação ${variationName}. O resto acompanha a base.`
                  : ownStage
                    ? 'Linha desta etapa do produto.'
                    : 'Vale só neste produto. O processo continua como está.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!variationName && (
            <SelectBasic
              name="line-formula"
              label="Tipo de cálculo"
              options={formulaOptions}
              value={values.formula}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  formula: value as FormulaKey,
                }))
              }
            />
          )}
          {!variationName && (
            <p className="-mt-2 text-sm text-gray">
              {formulaObj[values.formula]?.help}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="line-per-unit">Consumo ({unit})</Label>
              <Input
                id="line-per-unit"
                type="number"
                min={0}
                step="0.01"
                value={values.perUnit}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    perUnit: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            {!variationName && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="line-loss">Perda (%)</Label>
                  <Input
                    id="line-loss"
                    type="number"
                    min={0}
                    step="1"
                    value={values.lossPercent}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        lossPercent: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line-minimum">Mínimo ({unit})</Label>
                  <Input
                    id="line-minimum"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Sem mínimo"
                    value={values.minimum ?? ''}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        minimum:
                          event.target.value === ''
                            ? null
                            : Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-gray">
            A perda é somada ao consumo (a sobra do corte). O mínimo impede que
            a peça pequena saia com custo irreal.
          </p>
          {!variationName &&
            line?.formula === 'SHEET_YIELD' &&
            line.options.some((option) => option.sheet) && (
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-800">
                  Aproveitamento da folha
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="line-sheet-margin">
                      Margem da folha (mm)
                    </Label>
                    <Input
                      id="line-sheet-margin"
                      type="number"
                      min={0}
                      step="1"
                      placeholder="0"
                      value={values.sheetMargin ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          sheetMargin: optionalNumber(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line-sheet-gap">
                      Espaçamento entre peças (mm)
                    </Label>
                    <Input
                      id="line-sheet-gap"
                      type="number"
                      min={0}
                      step="1"
                      placeholder="0"
                      value={values.sheetGap ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          sheetGap: optionalNumber(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <label className="flex items-start justify-between gap-6">
                  <span>
                    <span className="block text-sm font-medium text-gray-800">
                      Cobrar a folha inteira
                    </span>
                    <span className="block text-sm text-gray">
                      Desligado, cobra só a fração aproveitada — quando a sobra
                      volta para o estoque.
                    </span>
                  </span>
                  <Switch
                    checked={values.chargeWholeSheets !== false}
                    onCheckedChange={(checked) =>
                      setValues((current) => ({
                        ...current,
                        chargeWholeSheets: checked,
                      }))
                    }
                    aria-label="Cobrar a folha inteira"
                  />
                </label>
              </div>
            )}
          {!variationName && line?.mode === 'CHOOSE' && values.optionValues && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">
                Por opção
                <span className="font-normal text-gray">
                  {' '}
                  · em branco, vale o da linha
                </span>
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray">
                    <tr>
                      <th className="px-3 py-2 font-medium">Opção</th>
                      <th className="px-3 py-2 font-medium">Consumo</th>
                      <th className="px-3 py-2 font-medium">Perda (%)</th>
                      <th className="px-3 py-2 font-medium">Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {line.options.map((option) => {
                      const current = values.optionValues?.find(
                        (item) => item.id === option.id,
                      )
                      const setOption = (
                        key: 'perUnit' | 'lossPercent' | 'minimum',
                        value: number | undefined,
                      ) =>
                        setValues((state) => ({
                          ...state,
                          optionValues: state.optionValues?.map((item) =>
                            item.id === option.id
                              ? { ...item, [key]: value }
                              : item,
                          ),
                        }))

                      return (
                        <tr
                          key={option.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-3 py-2 text-gray-800">
                            {option.name}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              aria-label={`Consumo de ${option.name}`}
                              placeholder={String(values.perUnit)}
                              value={current?.perUnit ?? ''}
                              onChange={(event) =>
                                setOption(
                                  'perUnit',
                                  optionalNumber(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              step="1"
                              aria-label={`Perda de ${option.name}`}
                              placeholder={String(values.lossPercent)}
                              value={current?.lossPercent ?? ''}
                              onChange={(event) =>
                                setOption(
                                  'lossPercent',
                                  optionalNumber(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              aria-label={`Mínimo de ${option.name}`}
                              placeholder={
                                values.minimum === null
                                  ? '-'
                                  : String(values.minimum)
                              }
                              value={current?.minimum ?? ''}
                              onChange={(event) =>
                                setOption(
                                  'minimum',
                                  optionalNumber(event.target.value),
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray">
                No mesmo grupo, cada material pode consumir diferente: o ACM usa
                1,0 e o PVC 1,2 com mínimo de 0,5.
              </p>
            </div>
          )}
          {!variationName && (
            <OptionalFields
              optional={values.optional}
              optionalDefault={values.optionalDefault}
              onChange={(next) =>
                setValues((current) => ({ ...current, ...next }))
              }
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSave(values)}>
            Salvar ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Regras de venda do processo dentro do produto (IP-18, MS-3 a MS-6)
 * ------------------------------------------------------------------------- */

const describe = (rules: SaleRules) =>
  [
    quantityModeObj[rules.quantityMode],
    rules.followsBase ? 'acompanha a quantidade da base' : 'uma vez por pedido',
    dimensionRuleOptions.find((item) => item.value === rules.dimension)?.label,
    rules.extraField === 'NONE'
      ? null
      : `campo extra "${rules.extraFieldName}"`,
    rules.timeField
      ? `com campo tempo (${minutesToHhmm(rules.timeFieldDefault || 0)})`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

export function RulesDialog({
  block,
  onOpenChange,
  onSave,
}: {
  block?: ComputedBlock
  onOpenChange: (open: boolean) => void
  onSave: (rules: SaleRules | null, name: string, taskType: string) => void
}) {
  const [useLocal, setUseLocal] = useState(false)
  const [rules, setRules] = useState<SaleRules | null>(null)
  const [name, setName] = useState('')
  const [taskType, setTaskType] = useState('')

  // Na etapa montada no produto, as regras são dela: não há o que sobrescrever
  const own = block?.processId === null

  useEffect(() => {
    if (block) {
      setUseLocal(block.processId === null || !!block.localRules)
      setRules(block.localRules ?? block.originalRules)
      setName(block.name)
      setTaskType(block.taskType)
    }
  }, [block])

  if (!block || !rules) return null

  const set = <K extends keyof SaleRules>(key: K, value: SaleRules[K]) =>
    setRules((current) => (current ? { ...current, [key]: value } : current))

  return (
    <Dialog open={!!block} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
            <div>
              <DialogTitle>Configurar · {block.name}</DialogTitle>
              <DialogDescription>
                Como esta etapa aparece para o vendedor no orçamento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rules-block-name">
              {own ? 'Nome da etapa' : 'Nome neste produto'}
            </Label>
            <Input
              id="rules-block-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {!own && (
              <p className="text-sm text-gray">
                Muda só aqui; o processo continua com o nome dele.
              </p>
            )}
          </div>

          <SelectBasic
            name="rules-task-type"
            label="Tipo de tarefa na produção"
            options={Array.from(new Set([...TASK_TYPES, taskType]))
              .filter(Boolean)
              .map((item) => ({ value: item, label: item }))}
            value={taskType}
            onChange={(value) => value && setTaskType(String(value))}
          />

          {!own && (
            <>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-800">Regras do processo</p>
                <p className="mt-1 text-gray">
                  {describe(block.originalRules)}
                </p>
                <p className="mt-2 text-gray">
                  Mudar o processo muda todos os produtos que o usam — isso se
                  faz em{' '}
                  <Link
                    href="/configuracoes/produtos/processos"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    Processos
                  </Link>
                  , não daqui.
                </p>
              </div>

              <label className="flex items-start justify-between gap-6">
                <span>
                  <span className="block font-medium text-gray-800">
                    Usar regras próprias neste produto
                  </span>
                  <span className="block text-sm text-gray">
                    Valem só aqui. Desligado, a etapa segue as regras do
                    processo.
                  </span>
                </span>
                <Switch
                  checked={useLocal}
                  onCheckedChange={setUseLocal}
                  aria-label="Usar regras próprias neste produto"
                />
              </label>
            </>
          )}

          <fieldset
            disabled={!useLocal}
            className={cn(
              'grid grid-cols-1 gap-4 sm:grid-cols-2',
              !useLocal && 'pointer-events-none opacity-50',
            )}
          >
            <SelectBasic
              name="rules-quantity"
              label="Quantidade"
              options={toOptions(quantityModeObj)}
              value={rules.quantityMode}
              onChange={(value) => set('quantityMode', value as QuantityMode)}
            />
            <SelectBasic
              name="rules-follows"
              label="Em relação à base"
              options={[
                { value: 'yes', label: 'Acompanha a quantidade da base' },
                { value: 'no', label: 'Uma vez por pedido' },
              ]}
              value={rules.followsBase ? 'yes' : 'no'}
              onChange={(value) => set('followsBase', value === 'yes')}
            />
            <SelectBasic
              name="rules-dimension"
              label="Medida"
              options={dimensionRuleOptions}
              value={rules.dimension}
              onChange={(value) => set('dimension', value as DimensionRule)}
            />
            <SelectBasic
              name="rules-extra"
              label="Campo extra"
              options={toOptions(extraFieldKindObj)}
              value={rules.extraField}
              onChange={(value) => set('extraField', value as ExtraFieldKind)}
            />
            {rules.extraField !== 'NONE' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rules-extra-name">
                    Nome do campo extra para o vendedor
                  </Label>
                  <Input
                    id="rules-extra-name"
                    value={rules.extraFieldName}
                    onChange={(event) =>
                      set('extraFieldName', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rules-extra-default">Valor padrão</Label>
                  <Input
                    id="rules-extra-default"
                    type="number"
                    min={0}
                    step={rules.extraField === 'INTEGER' ? '1' : '0.01'}
                    value={rules.extraFieldDefault}
                    onChange={(event) =>
                      set('extraFieldDefault', Number(event.target.value) || 0)
                    }
                  />
                </div>
              </>
            )}
            <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm font-medium">Campo tempo</span>
              <Switch
                checked={rules.timeField}
                onCheckedChange={(checked) => set('timeField', checked)}
                aria-label="Campo tempo"
              />
            </label>
            {rules.timeField && (
              <div className="space-y-2">
                <Label htmlFor="rules-time-default">Tempo padrão (h:mm)</Label>
                <Input
                  id="rules-time-default"
                  placeholder="1:00"
                  defaultValue={minutesToHhmm(rules.timeFieldDefault || 0)}
                  onBlur={(event) =>
                    set('timeFieldDefault', hhmmToMinutes(event.target.value))
                  }
                />
              </div>
            )}
            <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm font-medium">
                Vendedor pode renomear
              </span>
              <Switch
                checked={rules.descriptionEditable}
                onCheckedChange={(checked) =>
                  set('descriptionEditable', checked)
                }
                aria-label="Vendedor pode renomear"
              />
            </label>
          </fieldset>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!name.trim()}
            onClick={() => onSave(useLocal ? rules : null, name, taskType)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Opções da linha: acrescentar e remover recursos de uma escolha ou lista.
 * O mesmo recurso pode entrar mais de uma vez, com um nome de configuração
 * para cada — "Refile lona", "Refile PVC", "Refile ACM" (IP-27)
 * ------------------------------------------------------------------------- */

export function OptionsDialog({
  line,
  resources,
  onOpenChange,
  onAdd,
  onRemove,
}: {
  line?: ComputedLine
  resources: AssemblyResource[]
  onOpenChange: (open: boolean) => void
  onAdd: (values: {
    resourceId: string
    configName: string
    perUnit?: number
  }) => Promise<boolean>
  onRemove: (optionId: string) => void
}) {
  const [resourceId, setResourceId] = useState('')
  const [configName, setConfigName] = useState('')
  const [perUnit, setPerUnit] = useState('')

  useEffect(() => {
    setResourceId('')
    setConfigName('')
    setPerUnit('')
  }, [line?.id])

  if (!line) return null

  const unit = line.options[0]?.unit
  // Mesma unidade na escolha: é o que permite trocar uma pela outra (IP-39)
  const available = resources.filter(
    (item) =>
      item.kind === line.kind &&
      (line.mode !== 'CHOOSE' || !unit || item.unit === unit),
  )
  const repeated = line.options.some(
    (option) => (option.resourceId || option.id) === resourceId,
  )

  return (
    <Dialog open={!!line} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconListDetails} />
            <div>
              <DialogTitle>Opções · {line.name}</DialogTitle>
              <DialogDescription>
                {line.mode === 'CHOOSE'
                  ? 'Entre estas, entra no custo só a escolhida.'
                  : 'O vendedor informa no orçamento quanto usou de cada uma.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {line.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between gap-3 px-4 py-2"
              >
                <span className="text-sm text-gray-800">
                  {option.name}
                  {option.id === line.selectedId && line.mode === 'CHOOSE' && (
                    <span className="text-gray"> · escolhida</span>
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="errorGhost"
                  disabled={line.options.length <= 1}
                  LeftIcon={IconTrash}
                  aria-label={`Remover ${option.name}`}
                  onClick={() => onRemove(option.id)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <form
            className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            onSubmit={async (event) => {
              event.preventDefault()
              const added = await onAdd({
                resourceId,
                configName,
                perUnit: perUnit === '' ? undefined : Number(perUnit),
              })
              if (added) {
                setResourceId('')
                setConfigName('')
                setPerUnit('')
              }
            }}
          >
            <p className="text-sm font-medium text-gray-800">
              Acrescentar opção
            </p>
            <SelectBasic
              name="option-resource"
              label="Recurso"
              placeholder="Escolha o recurso"
              options={available.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.unit})`,
              }))}
              value={resourceId}
              onChange={(value) => setResourceId(String(value))}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="option-config-name">
                  Nome da configuração
                  {repeated ? '' : ' (opcional)'}
                </Label>
                <Input
                  id="option-config-name"
                  placeholder="Ex.: Refile PVC"
                  value={configName}
                  onChange={(event) => setConfigName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option-per-unit">
                  Consumo{unit ? ` (${unit})` : ''}
                </Label>
                <Input
                  id="option-per-unit"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={`${line.perUnit} (o da linha)`}
                  value={perUnit}
                  onChange={(event) => setPerUnit(event.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-gray">
              {repeated
                ? 'Este recurso já está na linha: o nome diferencia as configurações.'
                : 'Com nome, o mesmo recurso pode entrar de novo com outro consumo.'}
            </p>
            <Button
              type="submit"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              disabled={!resourceId || (repeated && !configName.trim())}
            >
              Acrescentar
            </Button>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Parte: outro produto com composição usado como etapa (IP-9)
 * ------------------------------------------------------------------------- */

export function PartDialog({
  open,
  candidates,
  onOpenChange,
  onPick,
}: {
  open: boolean
  candidates: {
    productId: string
    name: string
    code: string
    status: string
    stages: number
  }[]
  onOpenChange: (open: boolean) => void
  onPick: (productId: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPuzzle} />
            <div>
              <DialogTitle>Acrescentar parte</DialogTitle>
              <DialogDescription>
                Outro produto com composição, usado dentro deste — o quadro de
                ferro da placa, a letra caixa da fachada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-2">
          {candidates.length ? (
            candidates.map((item) => (
              <button
                key={item.productId}
                type="button"
                onClick={() => onPick(item.productId)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-brand-300 hover:bg-brand-25"
              >
                <span>
                  <span className="block font-medium text-gray-800">
                    {item.name}
                  </span>
                  <span className="block text-sm text-gray">
                    {[
                      item.code,
                      `${item.stages} ${item.stages === 1 ? 'etapa' : 'etapas'}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                {item.status === 'PART' && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Parte
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray">
              Nenhum outro produto com composição. Monte a composição da parte
              no produto dela, com a situação &quot;Parte&quot;.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Biblioteca de composições prontas (IP-7): o cliente importa em vez de
 * montar do zero. Importar é copiar — depois, a composição é do produto
 * ------------------------------------------------------------------------- */

export function LibraryDialog({
  open,
  entries,
  hasStages,
  onOpenChange,
  onImport,
}: {
  open: boolean
  entries: LibraryEntry[]
  // O produto já tem etapas: as importadas entram depois delas
  hasStages: boolean
  onOpenChange: (open: boolean) => void
  onImport: (libraryId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('all')

  useEffect(() => {
    if (open) {
      setSearch('')
      setSegment('all')
    }
  }, [open])

  const segments = Array.from(new Set(entries.map((item) => item.segment)))
  const visible = entries.filter(
    (item) =>
      (segment === 'all' || item.segment === segment) &&
      item.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconBooks} />
            <div>
              <DialogTitle>Biblioteca de composições</DialogTitle>
              <DialogDescription>
                Composições prontas, com etapas e recursos. Importe e ajuste ao
                seu jeito de produzir.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Buscar na biblioteca"
              placeholder="Buscar pelo nome"
              className="min-w-[220px] flex-1"
              startAdornment={<IconSearch className="size-4 text-gray" />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {['all', ...segments].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSegment(item)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm',
                  segment === item
                    ? 'border-brand-500 bg-brand-25 font-medium text-brand-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {item === 'all' ? 'Todos' : item}
              </button>
            ))}
          </div>

          {hasStages && (
            <p className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
              Este produto já tem etapas. As importadas entram depois delas —
              remova o que não servir.
            </p>
          )}

          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {visible.length ? (
              visible.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-gray-800">{entry.name}</p>
                      <p className="text-sm text-gray">
                        {entry.segment} · {entry.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.stages.map((stage) => (
                        <span
                          key={stage.name}
                          className={cn(
                            'rounded px-2 py-0.5 text-xs',
                            stage.role === 'FINISHING'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-700',
                          )}
                        >
                          {stage.name} · {stage.sector}
                        </span>
                      ))}
                      <span className="px-1 py-0.5 text-xs text-gray">
                        {entry.resources} linhas
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    onClick={() => onImport(entry.id)}
                  >
                    Importar
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray">
                Nada encontrado com esse nome.
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

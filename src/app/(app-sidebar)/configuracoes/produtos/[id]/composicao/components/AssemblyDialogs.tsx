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
  lineModeObj,
  quantityModeObj,
  extraFieldKindObj,
  type LineMode,
  type NewLineValues,
  type AssemblyResource,
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
  formulaOptions,
  resourceKindOptions,
  dimensionRuleOptions,
} from '@/consts/processes'

// Icons
import { IconPlus, IconPencil, IconSettings } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const toOptions = <K extends string>(obj: { [key in K]: string }) =>
  (Object.keys(obj) as K[]).map((value) => ({ value, label: obj[value] }))

/* ---------------------------------------------------------------------------
 * Adicionar etapa — por setor, ou acabamento filtrado pela base (MS-2)
 * ------------------------------------------------------------------------- */

export function AddBlockDialog({
  open,
  onOpenChange,
  title,
  description,
  processes,
  onCreate,
  onPick,
}: {
  open: boolean
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
              Depois de criada, acrescente os recursos e o tempo que o setor usa
              nela.
            </p>
          </form>

          {processes.length > 0 && (
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-800">
                Ou inclua um processo já cadastrado
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
  onOpenChange,
  onSave,
}: {
  block?: ComputedBlock
  resources: AssemblyResource[]
  onOpenChange: (open: boolean) => void
  onSave: (values: NewLineValues) => void
}) {
  const [values, setValues] = useState<NewLineValues>(emptyLine('LABOR'))

  useEffect(() => {
    if (block) setValues(emptyLine('LABOR'))
  }, [block])

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

  const valid =
    values.name.trim() &&
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
              <DialogTitle>Nova linha · {block?.name}</DialogTitle>
              <DialogDescription>
                O que o setor de {block?.sector.toLowerCase()} usa nesta etapa:
                tempo, máquina ou material.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-line-name">Nome da linha</Label>
              <Input
                id="new-line-name"
                placeholder="Ex.: Tempo por metro, Material"
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
            label="Como a linha funciona"
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
              ? 'Um recurso, sempre o mesmo.'
              : values.mode === 'CHOOSE'
                ? 'Várias opções de mesma unidade; entra no custo só a escolhida (a lona do banner).'
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
                label="Como a quantidade é calculada"
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
            onClick={() => onSave(values)}
          >
            Adicionar linha
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
}

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
              label="Como a quantidade é calculada"
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
    rules.timeField ? 'com campo tempo' : null,
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
  onSave: (rules: SaleRules | null) => void
}) {
  const [useLocal, setUseLocal] = useState(false)
  const [rules, setRules] = useState<SaleRules | null>(null)

  // Na etapa montada no produto, as regras são dela: não há o que sobrescrever
  const own = block?.processId === null

  useEffect(() => {
    if (block) {
      setUseLocal(block.processId === null || !!block.localRules)
      setRules(block.localRules ?? block.originalRules)
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
              <DialogTitle>Regras de venda · {block.name}</DialogTitle>
              <DialogDescription>
                Como esta etapa aparece para o vendedor no orçamento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-6">
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
          <Button type="button" onClick={() => onSave(useLocal ? rules : null)}>
            Salvar regras
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

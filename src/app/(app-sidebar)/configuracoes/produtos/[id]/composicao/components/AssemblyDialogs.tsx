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
  quantityModeObj,
  extraFieldKindObj,
  type SaleRules,
  type QuantityMode,
  type ComputedLine,
  type ComputedBlock,
  type ExtraFieldKind,
  type ProcessCatalogItem,
} from '../assembly'
import type {
  FormulaKey,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Hooks / Store / Consts
import {
  formulaObj,
  formulaOptions,
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
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  processes: ProcessCatalogItem[]
  onPick: (processId: string) => void
}) {
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
        <DialogBody className="space-y-2">
          {processes.length ? (
            processes.map((process) => (
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
            ))
          ) : (
            <p className="text-sm text-gray">
              Nenhum processo deste tipo cadastrado. Cadastre em Processos.
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
 * Ajustar a linha só neste produto (IP-22, CP-8)
 * ------------------------------------------------------------------------- */

export type LineValues = {
  perUnit: number
  formula: FormulaKey
  lossPercent: number
  minimum: number | null
}

export function LineDialog({
  line,
  onOpenChange,
  onSave,
}: {
  line?: ComputedLine
  onOpenChange: (open: boolean) => void
  onSave: (values: LineValues) => void
}) {
  const [values, setValues] = useState<LineValues>({
    perUnit: 0,
    formula: 'FIXED',
    lossPercent: 0,
    minimum: null,
  })

  useEffect(() => {
    if (line) {
      setValues({
        perUnit: line.perUnit,
        formula: line.formula,
        lossPercent: line.lossPercent,
        minimum: line.minimum,
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
                Vale só neste produto. O processo continua como está.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
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
          <p className="-mt-2 text-sm text-gray">
            {formulaObj[values.formula]?.help}
          </p>
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
          </div>
          <p className="text-sm text-gray">
            A perda é somada ao consumo (a sobra do corte). O mínimo impede que
            a peça pequena saia com custo irreal.
          </p>
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

  useEffect(() => {
    if (block) {
      setUseLocal(!!block.localRules)
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
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-medium text-gray-800">Regras do processo</p>
            <p className="mt-1 text-gray">{describe(block.originalRules)}</p>
            <p className="mt-2 text-gray">
              Mudar o processo muda todos os produtos que o usam — isso se faz
              em{' '}
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
                Valem só aqui. Desligado, a etapa segue as regras do processo.
              </span>
            </span>
            <Switch
              checked={useLocal}
              onCheckedChange={setUseLocal}
              aria-label="Usar regras próprias neste produto"
            />
          </label>

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

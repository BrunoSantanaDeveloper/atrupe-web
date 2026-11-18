'use client'

// O processo por dentro (MS-11): a mesma etapa da composição do produto —
// linhas de recurso único, escolha ou lista, opções com consumo próprio,
// regras de venda, tempo e tipo de tarefa —, com uma simulação na medida e
// os produtos que o usam. Os diálogos são os mesmos da composição, para o
// processo e o produto se comportarem igual. Desde 06/10/2026 o card
// Processo não tem botão próprio: salva no rodapé do diálogo ou da página,
// como o produto (PAD-5); a Simulação é o mesmo card do produto (PAD-6) e
// aceita uma base simulada (§9.1); as fórmulas entram pelas linhas (IP-2).

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { RiskHint } from '@/components/common/RiskHint'
import Link from 'next/link'
import { useRouter } from '@/hooks/useRouter'
import { useEffect, useMemo, useState } from 'react'

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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card'

// Components
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  LineDialog,
  NewLineDialog,
  OptionsDialog,
} from '../../../[id]/composicao/components/AssemblyDialogs'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { DurationInput } from '@/components/common/DurationInput'
import { SectorIcon } from '@/components/common/SectorIcon'

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
  sellsByEquipment,
} from '../../../[id]/composicao/assembly'
import type { ResourceKind, DimensionRule } from '../../types'
import { ResourceKindButtons } from '../../../[id]/composicao/components/ResourceKindButtons'
import { SimulationCard } from '../../../[id]/composicao/components/SimulationCard'
import { UsualStepsPicker } from './UsualStepsPicker'
import { ProductFields } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/components/ProductFields'
import { ProductFormulas } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/components/ProductFormulas'

// Actions
import {
  getUsualNext,
  setUsualNext,
  addProcessLine,
  setProcessStage,
  getProcessDetail,
  updateProcessLine,
  removeProcessLine,
  updateProcessMeta,
  addProcessFormula,
  getProcessResources,
  addProcessLineOption,
  removeProcessLineOption,
} from '@/actions/processes'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'
import { usePermissions } from '@/hooks/usePermissions'
import { useCompanySectors } from '@/hooks/queries/useCompanySectors'
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
import {
  IconClock,
  IconTrash,
  IconPencil,
  IconCircleCheck,
  IconListDetails,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

const EDIT = ['product_settings:composition:edit']

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

export type ProcessSection = 'config' | 'resources' | 'usage' | 'steps'

// O que o rodapé precisa para salvar o card Processo (PAD-5): se há algo
// pendente e a ação de gravar. O diálogo e a página chamam no Salvar
export type ProcessSaveHandle = {
  dirty: boolean
  save: () => Promise<boolean>
}

const PROCESSES_PATH = '/configuracoes/produtos/processos'

// `embedded`: dentro do diálogo do processo (mesmo desenho do diálogo do
// produto, design.md §17). Cada aba monta uma seção: Processo (config),
// Composição (recursos e simulação) e Uso (usado em, fluxo dos produtos)
export function ProcessEditor({
  id,
  embedded = false,
  section,
  onSaveHandle,
  simulationOpen,
  onSimulationOpenChange,
}: {
  id: string
  embedded?: boolean
  section?: ProcessSection
  // No diálogo, a Simulação abre separada pelo botão das abas
  simulationOpen?: boolean
  onSimulationOpenChange?: (open: boolean) => void
  // O diálogo recebe o handle e põe o Salvar no rodapé dele (PAD-5)
  onSaveHandle?: (handle: ProcessSaveHandle | null) => void
}) {
  const show = (part: ProcessSection) => !section || section === part
  const money = useMoney()
  const router = useRouter()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  // A base simulada (§9.1): a medida e a quantidade da etapa anterior, para
  // ver "acompanha a base", "mesma medida" e "quantas cabem" na conta
  const [baseMeasure, setBaseMeasure] = useState<AssemblyMeasure | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  // O nome do processo edita no título da etapa, como no produto
  const [renaming, setRenaming] = useState(false)
  const [meta, setMeta] = useState({
    sector: '',
    afterBase: 'INHERIT' as AfterBase,
    setupMinutes: 0,
    sellerInstructions: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['process-detail', id, measure, baseMeasure],
    queryFn: () =>
      getProcessDetail({
        processId: id,
        measure,
        baseMeasure: baseMeasure ?? undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['process-resources'],
    queryFn: () => getProcessResources(),
  })
  // Os setores da empresa, do cadastro de setores (05/10/2026)
  const { sectors } = useCompanySectors()
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
      // O processo que acompanha a base já abre simulado depois dela: é
      // assim que ele é usado, e a medida vem da base (08/10/2026)
      if (detail.meta.afterBase === 'INHERIT') setBaseMeasure(detail.measure)
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
      queryClient.invalidateQueries({ queryKey: ['sale-form'] }),
    ])

  const run = async (
    action: Promise<{ success: boolean; message: string }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) return toast.error(res.message)
    if (success) toast.success(success)
    setSavedAt(new Date())
    await refresh()
  }

  // O card Processo não tem botão próprio (PAD-5): o que mudou nele é
  // gravado pelo Salvar do rodapé, do diálogo ou da página
  const metaChanged =
    !!detail &&
    !!block &&
    (meta.sector !== block.sector ||
      meta.afterBase !== detail.meta.afterBase ||
      meta.setupMinutes !== block.setupMinutes ||
      meta.sellerInstructions !== detail.meta.sellerInstructions)
  const saveMeta = useMemo(
    () => async () => {
      if (!metaChanged) return true
      const res = await updateProcessMeta({
        processId: id,
        values: {
          sector: meta.sector,
          afterBase: meta.afterBase,
          setupMinutes: meta.setupMinutes,
          sellerInstructions: meta.sellerInstructions,
        },
      })
      if (!res.success) {
        toast.error(res.message)
        return false
      }
      toast.success('Processo salvo')
      setSavedAt(new Date())
      await refresh()
      return true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metaChanged, meta, id],
  )
  useEffect(() => {
    if (!onSaveHandle || !show('config')) return
    onSaveHandle({ dirty: metaChanged, save: saveMeta })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaChanged, saveMeta])

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
          <Topbar title="" previousPage="/configuracoes/produtos/processos" />
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
  const lineOf = (lineId: string) =>
    block.lines.find((line) => line.id === lineId)

  // "Como este setor vende" (29/09/2026): setor que vende por equipamento
  // não tem linha de mão de obra; o impressor já está dentro do m²
  const sectorSales = resourcesRes?.data?.sectorSales
  const laborBlocked = sellsByEquipment(sectorSales, block.sector)
    ? `${block.sector} vende por ${sectorSales?.[block.sector]}: quem trabalha nele já está dentro do custo do equipamento. Não há linha de mão de obra deste setor; o acabamento feito por outro setor entra pela mão de obra dele.`
    : undefined

  // O que a fórmula do processo pode ler (IP-2): as medidas simuladas, os
  // campos do processo e o material das outras linhas (MT-10.1)
  const lineRefs: { [name: string]: number } = {}
  block.lines.forEach((line) => {
    const selected = line.selected
    if (!selected) return
    if (selected.profile) {
      lineRefs[`${line.name} · X`] = selected.profile.x / 1000
      lineRefs[`${line.name} · Y`] = selected.profile.y / 1000
    }
    if (selected.sheet) {
      lineRefs[`${line.name} · largura`] = selected.sheet.width
      lineRefs[`${line.name} · altura`] = selected.sheet.height
    }
    if (selected.weight) lineRefs[`${line.name} · peso`] = selected.weight
  })
  const testVars: { [name: string]: number } = {
    largura: block.measure.width,
    altura: block.measure.height,
    área: block.measure.width * block.measure.height,
    perímetro: 2 * (block.measure.width + block.measure.height),
    quantidade: block.measure.quantity,
    tempo: 0,
    ...Object.fromEntries(
      detail.fields.map((field) => [field.name, field.defaultValue]),
    ),
    ...lineRefs,
  }
  const createFormula = async (values: {
    name: string
    expression: string
  }) => {
    const res = await addProcessFormula({ hostId, ...values })
    if (!res.success) {
      toast.error(res.message)
      return null
    }
    toast.success('Fórmula criada')
    await refresh()
    return res.data
  }

  // Salvar e Fechar da página (como na composição do produto): o que pode
  // estar pendente é o card Processo; as linhas gravam por ação (IP-40)
  const savePage = async () => {
    if (await saveMeta()) router.push(PROCESSES_PATH)
  }
  const closePage = () => {
    if (!metaChanged) return router.push(PROCESSES_PATH)
    alertDialog.open({
      title: 'Sair sem salvar o processo?',
      description:
        'As linhas da composição já estão gravadas. Só o que foi mudado no card Processo ainda não foi salvo.',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        router.push(PROCESSES_PATH)
      },
    })
  }

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
        const res = await removeProcessLine({ hostId, lineId: line.id })
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: { success: 'Linha removida', error: 'Erro ao remover a linha' },
    })

  const rules = block.rules

  // As regras da etapa ficam nos seletores do cabeçalho, como no produto
  // (03/10/2026): no processo elas são as regras originais, que os produtos
  // acompanham (CP-21)
  const saveStage = (
    patch: Partial<SaleRules>,
    extra: { name?: string; taskType?: string } = {},
    message = 'Processo configurado',
  ) =>
    run(
      setProcessStage({
        hostId,
        // Sobre as regras do processo, e não as da simulação depois da base
        rules: Object.keys(patch).length
          ? { ...block.originalRules, ...patch }
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

  // As regras que valem depois de uma base: quem "acompanha a base" herda a
  // medida e a quantidade dela, seja qual for a regra própria (como na
  // composição do produto). Quem tem "medida própria" usa as regras próprias
  const simRules =
    baseMeasure && meta.afterBase === 'INHERIT'
      ? {
          ...rules,
          dimension: 'SAME_AS_PARENT' as const,
          quantityMode: 'HIDDEN_ONE' as const,
        }
      : rules

  // Só pede ao usuário o que não vem da base (08/10/2026): a quantidade
  // quando o vendedor informa, e a medida quando é própria
  const ownQuantity =
    !baseMeasure || (!simRules.followsBase && simRules.quantityMode === 'FREE')
  const ownSize =
    !baseMeasure || !['SAME_AS_PARENT', 'NONE'].includes(simRules.dimension)
  const ownFields = [
    ...(ownQuantity ? ['quantity' as const] : []),
    ...(ownSize ? ['width' as const, 'height' as const] : []),
  ]

  // As regras herdadas aplicadas na simulação (§9.1): com a base ligada, o
  // cabeçalho explica de onde veio a quantidade e a medida
  const baseText = baseMeasure
    ? [
        simRules.followsBase
          ? `quantidade da base (${num(baseMeasure.quantity)})`
          : simRules.quantityMode === 'AREA_RATIO'
            ? 'quantas cabem na base'
            : simRules.quantityMode === 'HIDDEN_ONE'
              ? 'uma unidade'
              : 'quantidade própria',
        simRules.dimension === 'SAME_AS_PARENT'
          ? `medida da base (${num(baseMeasure.width)} × ${num(baseMeasure.height)} m)`
          : simRules.dimension === 'NONE'
            ? 'sem medida'
            : 'medida própria',
      ].join(' · ')
    : null

  // A Simulação (PAD-6): o mesmo card do produto. Com a base ligada, as
  // regras herdadas entram na conta (§9.1)
  const simulation = (
    <SimulationCard
      hideHeader={embedded}
      idPrefix="process-sim"
      description="Confira o consumo numa medida. Não grava nada."
      measure={measure}
      onMeasureChange={setMeasure}
      measureLabel={baseMeasure ? 'Medida própria do processo' : undefined}
      fields={ownFields}
      measureNote="Nada a informar: a quantidade e a medida vêm da base."
      results={[
        { label: 'Custo', value: money(detail.cost) },
        {
          label: 'Venda',
          value: money(detail.sale),
          tone: 'success',
        },
      ]}
      footer={
        baseText ? (
          <p className="text-sm text-gray">Depois da base: {baseText}.</p>
        ) : undefined
      }
    >
      <div className="space-y-3 rounded-lg border border-gray-200 p-3">
        <label className="flex items-start gap-3">
          <Switch
            className="mt-0.5"
            checked={!!baseMeasure}
            onCheckedChange={(checked) =>
              setBaseMeasure(checked ? { ...block.measure, ...measure } : null)
            }
            aria-label="Simular depois de outra etapa"
          />
          <span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-800">
                Simular depois de outra etapa
              </span>
              <InfoHint title="Simular com as regras">
                <p>
                  Aplica as regras da etapa na simulação: acompanhar a
                  quantidade da base, usar a medida dela e quantas peças cabem
                  nela.
                </p>
              </InfoHint>
            </div>
          </span>
        </label>
        {baseMeasure && (
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ['quantity', 'Qtd. da base', '1'],
                ['width', 'Larg. da base (m)', '0.01'],
                ['height', 'Alt. da base (m)', '0.01'],
              ] as const
            ).map(([key, label, step]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`sim-base-${key}`}>{label}</Label>
                <Input
                  id={`sim-base-${key}`}
                  type="number"
                  min={0}
                  step={step}
                  value={baseMeasure[key]}
                  onChange={(event) =>
                    setBaseMeasure((current) => ({
                      ...current!,
                      [key]: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </SimulationCard>
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {!embedded && (
          <Topbar
            title={block.name}
            previousPage="/configuracoes/produtos/processos"
            supportText={`${detail.category} · ${block.sector}${
              detail.meta.active ? '' : ' · inativo'
            }`}
          />
        )}

        {/* 1. O que o processo é e como se comporta na venda */}
        {(show('config') || (!embedded && show('resources'))) && (
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
                    <div className="flex items-center gap-1.5">
                      <CardTitle>Processo</CardTitle>
                      <InfoHint title="Processo">
                        <p>
                          Os mesmos campos do cadastro do processo. O que a
                          etapa usa fica na Composição.
                        </p>
                      </InfoHint>
                    </div>
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
                      onSaved={refresh}
                      description="Os valores que o vendedor informa e que as linhas deste processo leem. O produto que incluir o processo ganha estes campos, uma vez cada."
                    />
                  </div>
                </CardContent>
                {/* Sem botão próprio (PAD-5): o Salvar do rodapé grava */}
                <CardFooter className="text-sm text-gray">
                  O preparo entra uma vez por pedido, com o custo-hora do setor.
                  {metaChanged
                    ? ' O que mudou aqui é gravado pelo Salvar do rodapé.'
                    : ''}
                </CardFooter>
              </Card>
            )}

            {/* 2. Simulação (PAD-6): na página, ao lado do card Processo. No
                diálogo ela abre separada, pelo "Simular" das abas (28/10/2026) */}
            {!embedded && simulation}
          </div>
        )}

        {/* 3. As linhas: o que o setor usa nesta etapa */}
        {show('resources') && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <CardTitle>Composição</CardTitle>
                <InfoHint title="Composição">
                  <p>
                    A etapa de um setor: a máquina, o material e a mão de obra
                    que ele usa, cada um com o seu tipo de cálculo. O produto
                    que incluir o processo acompanha esta montagem.
                  </p>
                </InfoHint>
              </div>
              {/* Os valores das linhas são de uma medida: a tela diz qual
                  (28/10/2026) */}
              <p className="text-xs text-gray">
                Quantidade, custo e venda das linhas calculados em {measureText}
                .{embedded ? ' Para outra medida, use Simular.' : ''}
              </p>
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
                <SectorIcon name={block.sector} size="lg" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutralLight">{block.sector}</Badge>
                    <Badge variant="blueLight">
                      {detail.meta.afterBase === 'INHERIT'
                        ? 'Depois de outra etapa, usa a medida da etapa anterior'
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
                          size={ICON_SIZE.sm}
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
                          {/* "Quantas cabem na base" vale depois de uma
                              base; a Simulação mostra o efeito com a base
                              ligada (§9.1) */}
                          {(Object.keys(quantityModeObj) as QuantityMode[]).map(
                            (key) => (
                              <SelectItem key={key} value={key}>
                                {quantityModeObj[key]}
                              </SelectItem>
                            ),
                          )}
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
                    disabled={laborBlocked ? { LABOR: laborBlocked } : {}}
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
                    <TableHead numeric className="w-[10%]">
                      Quantidade
                    </TableHead>
                    <TableHead numeric className="w-[8%]">
                      Custo
                    </TableHead>
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
                                  updateProcessLine({
                                    hostId,
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
                              {/* Pessoas multiplicam o tempo (IP-13) */}
                              {line.kind === 'LABOR' &&
                                (line.people || 1) > 1 && (
                                  <p className="text-xs text-gray">
                                    × {line.people} pessoas
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
                        <TableCell
                          numeric
                          className="whitespace-nowrap text-sm font-medium"
                        >
                          <PermissionGate
                            permissions={['values:values:view']}
                            fallback={<span>•••</span>}
                          >
                            {money(line.cost)}
                          </PermissionGate>
                        </TableCell>
                        <TableCell
                          numeric
                          className="whitespace-nowrap text-sm font-medium text-success-700"
                        >
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
              {/* Fórmulas do processo (IP-2, 05/10/2026): recurso avançado,
                  como no produto. A porta de entrada é "Nova fórmula…" no
                  tipo de cálculo da linha; a lista aparece depois da
                  primeira */}
              {detail.formulas.length > 0 && (
                <div className="px-6 pt-4">
                  <ProductFormulas
                    bare
                    title="Fórmulas do processo"
                    description="Quando nenhum tipo de cálculo pronto serve, escreva a conta: ela lê as medidas, a quantidade e os campos do orçamento deste processo e passa a aparecer nos tipos de cálculo das linhas. O produto que incluir o processo recebe a fórmula junto."
                    productId={hostId}
                    fields={detail.fields}
                    formulas={detail.formulas}
                    lineRefs={Object.keys(lineRefs)}
                    testVars={testVars}
                    onSaved={refresh}
                  />
                </div>
              )}
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
              <div className="flex items-center gap-1.5">
                <CardTitle>Usado em</CardTitle>
                <RiskHint title="Mudar o processo muda os produtos">
                  <p>
                    Os produtos acompanham este processo: mudar a montagem aqui
                    muda todos eles. O que cada produto ajustou só para ele
                    continua como está, e os orçamentos já feitos não mudam.
                  </p>
                </RiskHint>
              </div>
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

        {/* 5. Etapas anteriores e seguintes (FL-7): sugestões marcadas à
            mão, num par guardado uma vez e editável dos dois lados. Nada é
            bloqueado: o não marcado fica em "ver todos". Os dois lados com
            o mesmo tipo de nome e só o marcado na lista (28/10/2026) */}
        {show('steps') && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <CardTitle>Etapas anteriores e seguintes</CardTitle>
                <InfoHint title="Etapas anteriores e seguintes">
                  <p>
                    São sugestões, não uma ordem obrigatória. Ao montar um
                    produto, &quot;+ etapa seguinte&quot; mostra primeiro o que
                    está marcado aqui; o resto fica em &quot;ver todos&quot;.
                    Marcar de um lado aparece no outro. Sem marcação, valem os
                    acabamentos do mesmo setor.
                  </p>
                </InfoHint>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
              <UsualStepsPicker
                label="Etapas anteriores"
                help="Os processos que costumam vir antes deste. Ex.: a dupla face vem depois do adesivo, do PVC e do ACM."
                items={usualRes?.data?.before}
                canEdit={canEdit}
                onToggle={(otherId, usual) =>
                  toggleUsual('before', otherId, usual)
                }
              />
              <UsualStepsPicker
                label="Etapas seguintes"
                help="Os processos que costumam vir depois deste. Ex.: depois da impressão, o refile e a laminação."
                items={usualRes?.data?.after}
                canEdit={canEdit}
                onToggle={(otherId, usual) =>
                  toggleUsual('after', otherId, usual)
                }
              />
            </CardContent>
          </Card>
        )}
        {/* Rodapé da página, como na composição do produto (PAD-5): Salvar
            grava o card Processo e volta para a lista; Fechar avisa se
            houver pendência. No diálogo o rodapé é o dele */}
        {!embedded && (
          <Card className="sticky bottom-0 z-10">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <p className="inline-flex items-center gap-1.5 text-sm text-gray">
                <IconClock size={ICON_SIZE.sm} aria-hidden="true" />
                {metaChanged
                  ? 'O card Processo ainda não foi salvo. As linhas já estão gravadas.'
                  : savedAt
                    ? `Salvo automaticamente às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : 'As linhas gravam a cada alteração'}
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={closePage}
                >
                  Fechar
                </Button>
                <PermissionGate permissions={EDIT}>
                  <Button
                    type="button"
                    RightIcon={IconCircleCheck}
                    onClick={savePage}
                  >
                    Salvar
                  </Button>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No diálogo do processo a simulação fica separada da composição:
          abre pelo "Simular" ao lado das abas (28/10/2026) */}
      {embedded && show('resources') && (
        <Dialog
          open={!!simulationOpen}
          onOpenChange={(open) => onSimulationOpenChange?.(open)}
        >
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>Simulação · {block.name}</DialogTitle>
              <DialogDescription>
                Confira o consumo numa medida. Não grava nada.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>{simulation}</DialogBody>
          </DialogContent>
        </Dialog>
      )}
      <NewLineDialog
        block={dialog?.kind === 'newLine' ? block : undefined}
        initialKind={dialog?.kind === 'newLine' ? dialog.lineKind : undefined}
        resources={resourcesRes?.data?.resources || []}
        fields={detail.fields}
        formulas={detail.formulas}
        lineRefs={Object.keys(lineRefs)}
        testVars={testVars}
        onCreateFormula={createFormula}
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          setDialog(null)
          run(
            addProcessLine({ hostId, values }),
            'Recurso acrescentado ao processo',
          )
        }}
      />
      <LineDialog
        line={dialog?.kind === 'line' ? lineOf(dialog.lineId) : undefined}
        fields={detail.fields}
        formulas={detail.formulas}
        lineRefs={Object.keys(lineRefs)}
        testVars={testVars}
        onCreateFormula={createFormula}
        ownStage
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          if (dialog?.kind !== 'line') return
          const lineId = dialog.lineId
          setDialog(null)
          run(updateProcessLine({ hostId, lineId, values }), 'Recurso ajustado')
        }}
      />
      <OptionsDialog
        line={dialog?.kind === 'options' ? lineOf(dialog.lineId) : undefined}
        resources={resourcesRes?.data?.resources || []}
        onOpenChange={() => setDialog(null)}
        onAdd={async (values) => {
          if (dialog?.kind !== 'options') return false
          const res = await addProcessLineOption({
            hostId,
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
            removeProcessLineOption({
              hostId,
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

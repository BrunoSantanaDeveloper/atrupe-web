'use client'

import Link from 'next/link'
import Image from 'next/image'

// O produto composto montado por etapas — o "item pronto" do legado na nova
// versão (área 8, §3.4.1). A pergunta que a tela responde primeiro: quanto
// custa este produto na medida em que ele é vendido, e se o preço cobre.

// React
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import {
  AllowEditValueHint,
  AllowEditDescriptionHint,
} from '@/components/common/RiskHint'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  LineDialog,
  NewLineDialog,
  OptionsDialog,
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
  type QuantityMode,
  type SaleRules,
  quantityModeObj,
  TASK_TYPES,
  unitKindObj,
  unitSymbol,
  unitSaleLabel,
  unitAmountLabel,
  productDimensionObj,
  formulaInputs,
  sellsByEquipment,
  type FormulaInput,
  type UnitKind,
  type ComputedLine,
  type ComputedBlock,
  type AssemblyStatus,
  type AssemblyMeasure,
  type ProductDimension,
  type AssemblySeed,
} from '../assembly'

// Actions
// A composição lê e grava na API (contrato, módulo 1, parte A)
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
  addProductFormula,
  getProductVariants,
  createProductVariant,
  renameProductVariant,
  removeProductVariant,
  linkBlock,
  unlinkBlock,
  replaceBlockProcess,
  getNextStepCandidates,
  resetAssemblyLine,
  restoreProcessLines,
  setBlockLocalRules,
  updateAssemblyLine,
  removeAssemblyBlock,
  adoptSuggestedPrice,
} from '@/actions/assembly'

// Actions (cadastro)
import { getItemOld } from '@/actions/_cruds'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Hooks / Store / Consts
import { useSector } from '@/hooks/queries/useSector'
import { usePending } from '@/hooks/usePending'
import { usePermissions } from '@/hooks/usePermissions'
import { SectorIcon } from '@/components/common/SectorIcon'
import {
  assemblyStatusObj,
  assemblyOverrideObj,
} from '@/consts/productAssembly'
import {
  formulaLabel,
  resourceKindObj,
  dimensionRuleOptions,
} from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'
import type { ResourceKind, DimensionRule } from '../../../processos/types'
import { ResourceKindButtons } from './ResourceKindButtons'
import { ProductFields } from './ProductFields'
import { ProductFormulas } from './ProductFormulas'
import { SimulationCard } from './SimulationCard'
import { useCompanySectors } from '@/hooks/queries/useCompanySectors'

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
  IconPackage,
  IconPencil,
  IconSearch,
  IconUnlink,
  IconReplace,
  IconPlus,
  IconCircleCheck,
  IconClock,
  IconChevronUp,
  IconChevronDown,
  IconArrowBackUp,
  IconListDetails,
} from '@tabler/icons-react'
import { Icon, ICON_SIZE } from '@/components/ui/icon'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const SHOW_SECOND_PART = false

// Do produto da API para a semente da composição: unidade, valor por unidade
// (guardado por mm², mm, ml… e mostrado por m², m, l), medida padrão em
// metros (a API guarda milímetros), descritivo e permissões
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedFromProduct = (product: any): AssemblySeed | undefined => {
  if (!product?.id) return undefined
  const item = product.items?.[0]
  const unitKind: UnitKind = item?.unitKind || 'UNITY'
  const raw = Number(item?.unitCost ?? product.unitCost ?? 0)
  return {
    name: product.name || 'Produto',
    code: product.code || '',
    unitKind,
    unitPrice: raw > 0 ? Math.round(convertRawToUnitCost(unitKind, raw)) : null,
    width: item?.width ? Number(item.width) / 1000 : undefined,
    height: item?.height ? Number(item.height) / 1000 : undefined,
    technicalDescription: product.technicalDescription || '',
    allowEditValues: product.allowEditValues ?? true,
    allowEditDescription: product.allowEditDescription ?? true,
  }
}

const EDIT = ['product_settings:composition:edit']

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
const zeroInput = (
  input: FormulaInput,
  block: ComputedBlock,
  line?: ComputedLine,
) => {
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
      // O campo do orçamento que a linha lê (IP-4), ou o extra legado
      return line
        ? !line.extraValue
        : rules.extraField === 'NONE' || !rules.extraFieldDefault
    case 'tempo':
      // O tempo informado na venda, ou o padrão da linha
      return !rules.timeFieldDefault && !line?.perUnit
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
  | { kind: 'newLine'; block: ComputedBlock; lineKind?: ResourceKind }
  | { kind: 'options'; blockId: string; lineId: string }
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

// `embedded`: dentro do diálogo do produto (CP-17) o cartão "Produto" some,
// porque unidade, valor e medidas já são os campos da aba Produto
type EditorProps = {
  productId: string
  embedded?: boolean
  // Na página, o editor desenha o Topbar para pôr a Situação no canto
  // superior direito da tela (pedido do time, 03/10/2026)
  topbar?: { title: string; supportText?: string; previousPage?: string }
}

// Primeira carga: o Topbar aparece já (o título tem esqueleto próprio) e,
// embaixo, o cartão do produto e as etapas do fluxo no formato da tela
export function AssemblyEditorSkeleton({
  embedded = false,
  topbar,
}: Pick<EditorProps, 'embedded' | 'topbar'>) {
  return (
    <div className="flex flex-col gap-5">
      {!embedded && topbar && (
        <Topbar
          title={topbar.title}
          supportText={topbar.supportText}
          previousPage={topbar.previousPage}
        />
      )}
      {!embedded && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-6 pb-5 pt-1 md:flex-row">
            <Skeleton className="h-[180px] w-full shrink-0 rounded-xl md:w-[240px]" />
            <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 px-6 pb-6">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-56 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function AssemblyEditorBody({
  productId,
  embedded = false,
  topbar,
  variantTabs,
  topbarExtra,
}: EditorProps & {
  // As abas de variação e o botão "+ Variação", desenhados pelo invólucro
  variantTabs?: ReactNode
  topbarExtra?: ReactNode
}) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  // A medida da simulação é da tela; a medida padrão só muda ao salvar
  const [measure, setMeasure] = useState<AssemblyMeasure>()
  const [dialog, setDialog] = useState<Dialog>(null)
  // A etapa escolhida no fluxo: o detalhe dela (recursos, tempo) aparece
  // embaixo do desenho (FL-5, FL-8)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedPart, setExpandedPart] = useState<string | null>(null)
  // O fluxo nasce recolhido (03/10/2026): a composição é a lista de etapas,
  // na ordem da produção; o desenho só abre para quem quer mudar a ordem
  const [flowOpen, setFlowOpen] = useState(false)
  // O bloco Produto já vem resolvido do cadastro: nasce recolhido, com um
  // resumo em linha, e abre para quem precisar mexer (03/10/2026)
  const [productOpen, setProductOpen] = useState(true)
  // A página em abas (18/11/2026): a composição é o principal e abre
  // primeiro; simulação, dados de venda e descritivo ficam nas suas abas.
  // O principal de cada aba aberto, o secundário recolhido
  const [pageTab, setPageTab] = useState<
    'composition' | 'simulation' | 'sale' | 'description'
  >('composition')
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Etapas recolhidas (18/11/2026): todas nascem abertas (são o principal);
  // a pessoa recolhe as que já acertou
  const [closedStages, setClosedStages] = useState<Set<string>>(new Set())
  const toggleStage = (id: string) =>
    setClosedStages((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  // A etapa em renomeação: o nome é editado no próprio título (03/10/2026)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  // Hora da última gravação, para a tela dizer que já salvou (IP-40: cada
  // ação grava; não há botão Salvar na composição)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  // Ao escolher ou acrescentar uma etapa, o detalhe dela entra na vista
  const detailRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selectedId) return
    const timer = setTimeout(
      () =>
        detailRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        }),
      150,
    )
    return () => clearTimeout(timer)
  }, [selectedId])

  // A variação vista fica na URL (design.md §8): ?variacao=
  const router = useRouter()
  const { pending: savingComposition, track } = usePending()
  const params = useSearchParams()
  const variationId = params.get('variacao')
  const [description, setDescription] = useState('')

  // O produto do cadastro (API), para a composição abrir com a unidade, o
  // valor e a medida que o START/LITE já tinham (CP-16). Só para ids reais;
  // os rascunhos do orçamento não têm cadastro
  const isCatalogId = /^[0-9a-f-]{32,36}$/i.test(productId)
  const { data: catalogProduct, isFetched: catalogFetched } = useQuery({
    staleTime: Infinity,
    enabled: isCatalogId,
    queryKey: ['product', productId],
    queryFn: () => getItemOld({ route: 'productRoute', id: productId }),
  })
  const seed = useMemo(() => seedFromProduct(catalogProduct), [catalogProduct])
  // Para nomear a etapa única do produto simples pelo setor do cadastro
  const { data: companySectors } = useSector()
  const { sectors: registerSectors } = useCompanySectors()

  const { data, isLoading } = useQuery({
    // Espera o cadastro chegar, para a primeira composição já nascer dele
    enabled: !isCatalogId || catalogFetched,
    queryKey: ['assembly', productId, measure, variationId, seed],
    queryFn: () => getAssembly({ productId, measure, variationId, seed }),
    placeholderData: keepPreviousData,
  })
  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
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
    setSavedAt(new Date())
    await refresh()
  }

  // A etapa é do setor: todos os setores da empresa podem começar o produto.
  // A lista é a do cadastro de setores (05/10/2026), não uma lista fixa
  const baseSectors = registerSectors
  // O setor do produto no cadastro: é a etapa única do produto simples. O
  // cadastro devolve só o id; o nome vem da lista de setores da empresa
  const ownSector: string =
    companySectors?.find((item) => item.id === catalogProduct?.sectorId)
      ?.name ||
    catalogProduct?.sectorName ||
    catalogProduct?.sector?.name ||
    baseSectors[0] ||
    'Produção'

  // A composição vazia já nasce com a etapa do setor do produto (pedido do
  // time, 03/10/2026): a tela abre direto nos botões Máquina · Material ·
  // Mão de obra. Vale sempre que a composição estiver vazia; só não vale
  // depois de a pessoa remover a última etapa de propósito, quando fica o
  // estado vazio com "começa em outro setor"
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(EDIT[0])
  const autoStage = useRef(false)
  const emptiedByUser = useRef(false)
  useEffect(() => {
    if (!assembly || !canEdit) return
    if (assembly.blocks.length > 0) {
      // Com etapa na tela, a próxima composição vazia pode nascer de novo
      autoStage.current = false
      emptiedByUser.current = false
      return
    }
    if (autoStage.current || emptiedByUser.current || assembly.activeVariation)
      return
    // Espera o cadastro e os setores, para a etapa nascer no setor certo
    if (isCatalogId && (!catalogFetched || !companySectors)) return
    autoStage.current = true
    addOwnBlock({
      productId,
      name: ownSector,
      sector: ownSector,
      dependsOn: [],
    }).then((res) => {
      if (res.success && res.data) setSelectedId(res.data)
      refresh()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly, canEdit, catalogFetched, companySectors, ownSector])

  if (isLoading || !assembly || !measure) {
    return <AssemblyEditorSkeleton embedded={embedded} topbar={topbar} />
  }

  const saved = assembly.measure
  const variation = assembly.activeVariation
  const inVariation = !!variation
  const measureChanged =
    saved.quantity !== measure.quantity ||
    saved.width !== measure.width ||
    saved.height !== measure.height

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
    return [
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

  // O sugerido já vem na unidade comercial: usá-lo é gravar como valor de
  // venda, o mesmo campo do cadastro do START
  const adoptSuggested = () =>
    run(
      // O servidor calcula o sugerido na medida padrão (DC-14)
      adoptSuggestedPrice({ productId }),
      'Valor de venda atualizado para o sugerido',
    )

  // Salvar e Fechar da página (rodapé). O que pode estar pendente é só o
  // descritivo técnico, que tem campo livre; o resto grava por ação
  const PRODUCTS_PATH = '/configuracoes/produtos'
  const pendingDescription = description !== assembly.technicalDescription
  const saveComposition = () =>
    track('save', async () => {
      if (pendingDescription) {
        const res = await updateAssembly({
          productId,
          values: { technicalDescription: description },
        })
        if (!res.success) return toast.error(res.message)
      }
      toast.success('Composição salva')
      router.push(PRODUCTS_PATH)
    })
  const closeComposition = () => {
    if (!pendingDescription) return router.push(PRODUCTS_PATH)
    alertDialog.open({
      title: 'Sair sem salvar o descritivo?',
      description:
        'As etapas e os recursos já estão gravados. Só o descritivo técnico digitado ainda não foi salvo.',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        router.push(PRODUCTS_PATH)
      },
    })
  }

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
        // Remover a última etapa é decisão da pessoa: não recriar sozinho
        if (assembly.blocks.length === 1) emptiedByUser.current = true
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

  // As regras da etapa ficam nos seletores do cabeçalho (03/10/2026): na
  // etapa montada no produto gravam nela; na vinda de processo viram ajuste
  // local, marcado "alterado neste produto"
  const saveStage = (
    block: ComputedBlock,
    patch: Partial<SaleRules>,
    extra: { name?: string; taskType?: string } = {},
    message = 'Etapa configurada',
  ) =>
    run(
      setBlockLocalRules({
        productId,
        blockId: block.id,
        rules: Object.keys(patch).length
          ? { ...block.rules, ...patch }
          : block.processId === null
            ? block.originalRules
            : block.localRules,
        ...extra,
      }),
      message,
    )

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
  // O fluxo em uma linha, para o card recolhido: "Serralheria → Impressão".
  // Quando há caminho paralelo ou ponto de encontro, o resumo avisa
  const flowIsLinear = assembly.blocks.every((item, index) =>
    index === 0
      ? item.dependsOn.length === 0
      : item.dependsOn.length === 1 &&
        item.dependsOn[0] === assembly.blocks[index - 1].id,
  )
  const flowSummary = `${assembly.blocks.map((item) => item.name).join(' → ')}${
    flowIsLinear
      ? ' · uma linha, na ordem das etapas'
      : ' · com caminhos paralelos ou pontos de encontro'
  }`

  // "Nova etapa depois de X": a nova depende de X e, se X já tinha uma
  // etapa seguinte, entra no meio da ligação, para a linha não se partir
  const addStageAfter = (item: ComputedBlock) => {
    const followers = assembly.blocks.filter((block) =>
      block.dependsOn.includes(item.id),
    )
    setDialog({
      kind: 'next',
      after: item,
      before: followers.length === 1 ? followers[0] : undefined,
    })
  }

  const readOnlyEmpty = (
    <EmptyState
      title="Nenhuma etapa ainda"
      description="O produto continua sendo vendido pelo preço cadastrado enquanto não houver composição."
    />
  )

  // Uma ação só: a etapa do setor do produto, já aberta com os botões de
  // máquina e material. O caso de várias etapas fica num link discreto
  const ownStageEmpty = (
    <EmptyState
      title={`Monte a etapa de ${ownSector.toLowerCase()}`}
      description="Sem composição, o produto segue vendido pelo preço cadastrado."
      action={
        <div className="flex flex-col items-center gap-3">
          {/* Uma ação só: a etapa do setor do produto, já aberta
              com os botões de máquina e material. O caso de
              várias etapas fica num link discreto */}
          <Button
            type="button"
            LeftIcon={IconPlus}
            onClick={() =>
              run(
                addOwnBlock({
                  productId,
                  name: ownSector,
                  sector: ownSector,
                  dependsOn: [],
                }).then((res) => {
                  if (res.success && res.data) {
                    setSelectedId(res.data)
                  }
                  return res
                }),
                `Etapa de ${ownSector.toLowerCase()} criada: acrescente a máquina, o material e a mão de obra`,
              )
            }
          >
            Montar a etapa de {ownSector.toLowerCase()}
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-sm"
            onClick={() => setDialog({ kind: 'next', after: null })}
          >
            O produto começa em outro setor ou usa um processo cadastrado
          </Button>
        </div>
      }
    />
  )

  // O que a fórmula do produto pode ler, na medida padrão (IP-2): para o
  // teste ao vivo do diálogo
  const testVars: { [name: string]: number } = {
    largura: assembly.measure.width,
    altura: assembly.measure.height,
    área: assembly.measure.width * assembly.measure.height,
    perímetro: 2 * (assembly.measure.width + assembly.measure.height),
    quantidade: assembly.measure.quantity,
    tempo: 0,
    ...Object.fromEntries(
      assembly.fields.map((field) => [field.name, field.defaultValue]),
    ),
  }
  // As referências do material das linhas de uma etapa (MT-10.1): nome e
  // valor em metros, para os botões e o teste do diálogo da fórmula
  const lineRefsOf = (blocks: ComputedBlock[]) => {
    const refs: { [name: string]: number } = {}
    blocks.forEach((block) =>
      block.lines.forEach((line) => {
        const selected = line.selected
        if (!selected) return
        if (selected.profile) {
          refs[`${line.name} · X`] = selected.profile.x / 1000
          refs[`${line.name} · Y`] = selected.profile.y / 1000
        }
        if (selected.sheet) {
          refs[`${line.name} · largura`] = selected.sheet.width
          refs[`${line.name} · altura`] = selected.sheet.height
        }
        if (selected.weight) refs[`${line.name} · peso`] = selected.weight
      }),
    )
    return refs
  }
  const dialogBlock =
    dialog?.kind === 'newLine' || dialog?.kind === 'line' ? dialog.block : null
  const dialogRefs = lineRefsOf(dialogBlock ? [dialogBlock] : [])
  const allRefs = lineRefsOf(assembly.blocks)

  const createFormula = async (values: {
    name: string
    expression: string
  }) => {
    const res = await addProductFormula({ productId, ...values })
    if (!res.success) {
      toast.error(res.message)
      return null
    }
    toast.success('Fórmula criada')
    await refresh()
    return res.data
  }

  const stageDetail = (item: ComputedBlock) => {
    // Os campos do orçamento que as linhas desta etapa leem (IP-4)
    const blockFields = Array.from(
      new Set(
        item.lines
          .filter((line) => line.fieldName)
          .map((line) => line.fieldName as string),
      ),
    )
    return (
      <Card
        key={item.id}
        className={cn(
          'border-brand-200',
          item.id === selectedBlock?.id && 'ring-2 ring-brand-100',
        )}
      >
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="flex min-w-0 items-start gap-3">
            {/* O setor em destaque, na cor dele: é ele que diz onde a etapa
                é produzida (área 9 §4.14) */}
            <SectorIcon name={item.sector} size="lg" />
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutralLight">{item.sector}</Badge>
                <Badge variant="blueLight">{dependsText(item)}</Badge>
                {/* O tipo de tarefa que a etapa gera na produção (IP-23),
                    junto do setor */}
                {!inVariation && (
                  <PermissionGate
                    permissions={EDIT}
                    fallback={
                      <Badge variant="neutralLight">
                        tarefa: {item.taskType.toLowerCase()}
                      </Badge>
                    }
                  >
                    <Select
                      value={item.taskType}
                      onValueChange={(value) =>
                        saveStage(
                          item,
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
                          new Set([item.taskType, ...TASK_TYPES]),
                        ).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PermissionGate>
                )}
                {item.processId && (
                  <Badge variant="neutralLight">Processo cadastrado</Badge>
                )}
                {/* Inativar não tira a etapa do produto (PAD-7): fica a marca */}
                {item.processInactive && (
                  <Badge variant="warningLight">Processo inativo</Badge>
                )}
                {item.part && <Badge variant="blueLight">Parte</Badge>}
                {item.partInactive && (
                  <Badge variant="warningLight">Produto inativo</Badge>
                )}
                {item.variationOnly && (
                  <Badge
                    variant={assemblyOverrideObj.VARIATION_CHANGED.variant}
                  >
                    Só nesta variação
                  </Badge>
                )}
                {item.localRules && (
                  <Badge variant={assemblyOverrideObj.LOCAL_RULES.variant}>
                    {assemblyOverrideObj.LOCAL_RULES.text}
                  </Badge>
                )}
              </div>
              {/* O nome edita no título; a engrenagem e o diálogo
                  "Configurar" saíram (03/10/2026) */}
              {renamingId === item.id ? (
                <Input
                  autoFocus
                  aria-label="Nome da etapa"
                  className="h-9 max-w-sm text-base font-semibold"
                  defaultValue={item.name}
                  onBlur={(event) => {
                    setRenamingId(null)
                    const value = event.target.value.trim()
                    if (value && value !== item.name) {
                      saveStage(item, {}, { name: value }, 'Etapa renomeada')
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                    if (event.key === 'Escape') setRenamingId(null)
                  }}
                />
              ) : (
                <PermissionGate
                  permissions={EDIT}
                  fallback={<CardTitle>{item.name}</CardTitle>}
                >
                  <button
                    type="button"
                    className="group flex items-center gap-2 text-left"
                    title="Renomear etapa"
                    onClick={() => setRenamingId(item.id)}
                  >
                    <CardTitle>{item.name}</CardTitle>
                    <IconPencil
                      size={ICON_SIZE.sm}
                      aria-hidden="true"
                      className="text-gray opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </PermissionGate>
              )}
              {/* Quantidade, relação com a base e medida: as regras da etapa
                  no lugar onde a medida já aparecia (03/10/2026) */}
              <PermissionGate
                permissions={EDIT}
                fallback={
                  <CardDescription>
                    {measureText(item)}
                    {` · tarefa: ${item.taskType.toLowerCase()}`}
                  </CardDescription>
                }
              >
                {inVariation ? (
                  <CardDescription>{measureText(item)}</CardDescription>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray">
                    <Select
                      value={item.rules.quantityMode}
                      onValueChange={(value) =>
                        saveStage(item, { quantityMode: value as QuantityMode })
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
                          .filter(
                            (key) =>
                              key !== 'AREA_RATIO' || item.dependsOn.length,
                          )
                          .map((key) => (
                            <SelectItem key={key} value={key}>
                              {quantityModeObj[key]}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {item.dependsOn.length > 0 && (
                      <Select
                        value={item.rules.followsBase ? 'FOLLOWS' : 'ONCE'}
                        onValueChange={(value) =>
                          saveStage(item, { followsBase: value === 'FOLLOWS' })
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
                    )}
                    <Select
                      value={item.rules.dimension}
                      onValueChange={(value) =>
                        saveStage(item, { dimension: value as DimensionRule })
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
                          .filter(
                            (option) =>
                              option.value !== 'SAME_AS_PARENT' ||
                              item.dependsOn.length,
                          )
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs">
                      = {measureText(item)}
                      {blockFields.length
                        ? ` · ${blockFields.length === 1 ? 'campo' : 'campos'}: ${blockFields.join(', ')}`
                        : ''}
                    </span>
                  </div>
                )}
              </PermissionGate>
            </div>
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
            <ActionButton
              Icon={closedStages.has(item.id) ? IconChevronDown : IconChevronUp}
              variant="neutralGhost"
              tooltip={
                closedStages.has(item.id) ? 'Abrir a etapa' : 'Recolher a etapa'
              }
              onClick={() => toggleStage(item.id)}
            />
            {/* A estrutura é da base: a variação só muda linhas (PV-2) */}
            {!inVariation && (
              <PermissionGate permissions={EDIT}>
                <div className="flex gap-1">
                  {/* A etapa seguinte entra pela linha "Nova etapa depois
                      de…" embaixo do card; o "+" daqui repetia a função */}
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
        {!closedStages.has(item.id) && (
          <CardContent>
            {/* Os botões de acrescentar ficam no topo da caixa, antes da
              tabela (pedido do time, 03/10/2026) */}
            {!inVariation && !item.part && (
              <PermissionGate permissions={EDIT}>
                <div className="px-6 pb-4">
                  <ResourceKindButtons
                    disabled={
                      sellsByEquipment(resources?.sectorSales, item.sector)
                        ? {
                            LABOR: `${item.sector} vende por ${resources?.sectorSales[item.sector]}: quem trabalha nele já está dentro do custo do equipamento. Não há linha de mão de obra deste setor; o acabamento feito por outro setor entra pela mão de obra dele.`,
                          }
                        : {}
                    }
                    onPick={(lineKind) =>
                      setDialog({ kind: 'newLine', block: item, lineKind })
                    }
                  />
                </div>
              </PermissionGate>
            )}
            {item.part ? (
              <div className="mx-6 mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-25 px-4 py-3">
                <p className="text-sm text-gray-700">
                  Outro produto usado aqui, com a composição dele (
                  {item.part.stages}{' '}
                  {item.part.stages === 1 ? 'etapa' : 'etapas'}) calculada na
                  medida desta etapa. Para mudar o que ele leva, abra a
                  composição dele.
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
                    <TableHead className="w-[16%]">Recurso</TableHead>
                    <TableHead className="w-[24%]">Item</TableHead>
                    <TableHead className="w-[10%]">Consumo</TableHead>
                    <TableHead className="w-[20%]">Cálculo</TableHead>
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
                  {item.lines.map((line) => {
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
                                {/* Estas fórmulas usam o tempo da etapa, não o
                                consumo (IP-32) */}
                                {line.formula === 'EQUAL_TIME' ||
                                line.formula === 'PER_TIME'
                                  ? item.rules.timeFieldDefault
                                    ? `tempo informado (${amount(item.rules.timeFieldDefault, 'min')})`
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
                            : line.formula === 'CUSTOM'
                              ? `Fórmula · ${line.formulaName || '?'}`
                              : formulaLabel(line.formula, line.fieldName)}
                          {/* As entradas da fórmula numa linha só (18/11/2026):
                            "área × quantidade"; a zerada fica em vermelho */}
                          {line.mode !== 'LIST' &&
                            formulaInputs[line.formula]?.length > 0 && (
                              <span className="mt-0.5 block text-xs text-gray-500">
                                {formulaInputs[line.formula].map(
                                  (input, index) => {
                                    const zero = zeroInput(input, item, line)
                                    const label =
                                      input === 'campo extra'
                                        ? line.fieldName || 'campo'
                                        : input
                                    return (
                                      <span
                                        key={input}
                                        title={
                                          zero
                                            ? `A fórmula usa ${label}, e está zerado nesta etapa`
                                            : `A fórmula usa ${label}`
                                        }
                                        className={cn(
                                          zero &&
                                            'rounded bg-error-50 px-1 text-error-700',
                                        )}
                                      >
                                        {index > 0 && ' × '}
                                        {label}
                                      </span>
                                    )
                                  },
                                )}
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
                              {line.sheetYield.charged !==
                              line.sheetYield.sheets
                                ? ` · cobra ${num(line.sheetYield.charged)}`
                                : ''}
                              {line.sheetYield.marginMm || line.sheetYield.gapMm
                                ? ` · margem ${line.sheetYield.marginMm} mm, espaço ${line.sheetYield.gapMm} mm`
                                : ''}
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          numeric
                          className="whitespace-nowrap text-sm"
                        >
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
                                    setDialog({
                                      kind: 'line',
                                      block: item,
                                      line,
                                    })
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
                        Esta etapa ainda não tem recursos. Acrescente acima a
                        máquina, o material e a mão de obra que o setor de{' '}
                        {item.sector.toLowerCase()} usa nela, cada um com o seu
                        tipo de cálculo. O custo da etapa é a soma deles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
        )}
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
    // Embutido no diálogo do produto, o fluxo sobe para o topo (order-first)
    <div className="flex flex-col gap-5">
      {/* 1. O produto: a cobrança é a do cadastro do START (IP-17) —
          unidade comercial, valor de venda e padrão de medidas */}
      {!embedded && topbar && (
        <Topbar
          title={topbar.title}
          supportText={topbar.supportText}
          previousPage={topbar.previousPage}
          primaryCta={
            <div className="flex items-center gap-2">
              {topbarExtra}
              <PermissionGate
                permissions={EDIT}
                fallback={<Badge variant={status.variant}>{status.text}</Badge>}
              >
                {/* A situação da composição (IP-14 revisto em 29/10/2026):
                    em montagem, o botão aprova; aprovada ou parte, a lista
                    volta para montagem ou troca */}
                {assembly.status === 'DRAFT' ? (
                  <>
                    <Badge variant={status.variant} title={status.help}>
                      {status.text}
                    </Badge>
                    <Button
                      type="button"
                      LeftIcon={IconCircleCheck}
                      title={assemblyStatusObj.RELEASED.help}
                      onClick={() =>
                        run(
                          updateAssembly({
                            productId,
                            values: { status: 'RELEASED' },
                          }),
                          'Composição aprovada: o custo passa a valer no orçamento',
                        )
                      }
                    >
                      Aprovar composição
                    </Button>
                  </>
                ) : (
                  <Select
                    value={assembly.status}
                    onValueChange={(value) =>
                      run(
                        updateAssembly({
                          productId,
                          values: { status: value as AssemblyStatus },
                        }),
                        assemblyStatusObj[value as AssemblyStatus].text,
                      )
                    }
                  >
                    <SelectTrigger
                      aria-label="Status"
                      title={status.help}
                      className="h-10 w-[220px]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(assemblyStatusObj) as AssemblyStatus[]).map(
                        (key) => (
                          <SelectItem key={key} value={key}>
                            {assemblyStatusObj[key].text}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              </PermissionGate>
            </div>
          }
        />
      )}

      {/* As variações como abas (03/10/2026): Padrão e as cópias */}
      {variantTabs && (
        <div className={cn(embedded && 'order-first')}>{variantTabs}</div>
      )}

      {/* As abas da página (18/11/2026): a composição primeiro; simulação,
          dados de venda e descritivo cada um na sua aba */}
      {!embedded && (
        <Tabs
          value={pageTab}
          onValueChange={(value) => setPageTab(value as typeof pageTab)}
        >
          <TabsList>
            <TabsTrigger value="composition">Composição</TabsTrigger>
            <TabsTrigger value="simulation">Simulação</TabsTrigger>
            <TabsTrigger value="sale">Dados de venda</TabsTrigger>
            <TabsTrigger value="description">Descritivo técnico</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* O descritivo técnico é campo do cadastro do START (IP-24) */}
      {!embedded && pageTab === 'description' && (
        <Card>
          <CardContent className="px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="technical-description">Descritivo técnico</Label>
              <Textarea
                id="technical-description"
                rows={2}
                placeholder="Aparece na proposta impressa, abaixo do nome do produto."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  size="sm"
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* O total do produto fica à vista enquanto a composição é montada
          (18/11/2026): na medida padrão, a soma das etapas */}
      {!embedded && pageTab === 'composition' && assembly.blocks.length > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm shadow-sm">
          <span className="font-medium text-gray-900">Total do produto</span>
          <PermissionGate
            permissions={['values:values:view']}
            fallback={<span className="text-gray">•••</span>}
          >
            <span className="text-gray">
              Custo{' '}
              <strong className="text-gray-900">{money(assembly.cost)}</strong>
            </span>
            <span className="text-gray">
              Venda dos recursos{' '}
              <strong className="text-success-700">
                {money(assembly.suggestedPrice)}
              </strong>
            </span>
          </PermissionGate>
          <span className="text-gray">
            {assembly.blocks.length}{' '}
            {assembly.blocks.length === 1 ? 'etapa' : 'etapas'} ·{' '}
            {num(measure.quantity)} × {num(measure.width)} ×{' '}
            {num(measure.height)} m
          </span>
        </div>
      )}

      {!embedded && pageTab === 'sale' && (
        <Card>
          <button
            type="button"
            aria-expanded={productOpen}
            onClick={() => setProductOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-4 rounded-t-xl px-6 py-4 text-left hover:bg-gray-50"
          >
            <div className="min-w-0">
              <CardTitle>Produto</CardTitle>
              <CardDescription className="truncate">
                {productOpen
                  ? 'Os mesmos campos do cadastro do produto. A composição acrescenta o custo e o preço sugerido.'
                  : [
                      unitKindObj[assembly.unitKind],
                      assembly.unitPrice === null
                        ? 'sem valor de venda'
                        : `${money(assembly.unitPrice)} por ${unitSymbol[assembly.unitKind]}`,
                      `${num(saved.quantity)} × ${num(saved.width)} × ${num(saved.height)} m`,
                      productDimensionObj[assembly.dimension].toLowerCase(),
                      assembly.fields.length
                        ? `${assembly.fields.length} ${assembly.fields.length === 1 ? 'campo do orçamento' : 'campos do orçamento'}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </CardDescription>
            </div>
            {productOpen ? (
              <IconChevronUp
                aria-hidden
                size={ICON_SIZE.md}
                className="shrink-0 text-gray"
              />
            ) : (
              <IconChevronDown
                aria-hidden
                size={ICON_SIZE.md}
                className="shrink-0 text-gray"
              />
            )}
          </button>
          {productOpen && (
            <CardContent className="px-6 pb-5 pt-1">
              {/* O mesmo desenho do item do orçamento (pedido do time,
                03/10/2026): imagem à esquerda; à direita unidade, quantidade
                e medidas, depois área, valor por unidade e valor de venda */}
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 md:w-[240px]">
                  {catalogProduct?.imageUrl ? (
                    <Image
                      src={catalogProduct.imageUrl}
                      alt={assembly.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-gray">
                      <Icon icon={IconPackage} size="lg" />
                      <span className="text-xs">
                        A imagem é a do cadastro do produto
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  {/* Quantidade, largura e altura saíram daqui: são a
                      medida da Simulação, com "Salvar como padrão" lá
                      (PAD-6, 05/10/2026) */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                    {assembly.unitKind !== 'AREA' &&
                      assembly.unitKind !== 'UNITY' && (
                        <div className="flex flex-col">
                          <Label
                            htmlFor="assembly-unit-amount"
                            className="mb-2"
                          >
                            {unitAmountLabel[assembly.unitKind]}
                          </Label>
                          <Input
                            key={`amount-${assembly.unitAmount}`}
                            id="assembly-unit-amount"
                            type="number"
                            min={0}
                            step="0.01"
                            endAdornment={
                              <span className="text-sm text-gray">
                                {unitSymbol[assembly.unitKind]}
                              </span>
                            }
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
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {assembly.unitKind === 'AREA' && (
                      <div className="flex flex-col">
                        <Label className="mb-2">Área total</Label>
                        <Input
                          value={`${num(assembly.saleAmount)} m²`}
                          disabled
                        />
                      </div>
                    )}
                    <PermissionGate permissions={['values:values:view']}>
                      <div className="flex flex-col">
                        <Label htmlFor="assembly-unit-price" className="mb-2">
                          {unitSaleLabel[assembly.unitKind]}
                        </Label>
                        <Input
                          key={`${assembly.unitKind}-${assembly.unitPrice}`}
                          id="assembly-unit-price"
                          type="number"
                          min={0}
                          step="0.01"
                          startAdornment={<span className="text-sm">R$</span>}
                          placeholder="0,00"
                          defaultValue={
                            assembly.unitPrice === null
                              ? ''
                              : assembly.unitPrice / 100
                          }
                          onBlur={(event) => {
                            const value =
                              event.target.value === ''
                                ? null
                                : Math.round(Number(event.target.value) * 100)
                            run(
                              updateAssembly({
                                productId,
                                values: { unitPrice: value },
                              }),
                            )
                          }}
                        />
                        {/* O sugerido ao lado de onde se define a cobrança
                            (17/11/2026): quem olha o valor de venda vê o que
                            a composição sugere, sem descer à simulação */}
                        {assembly.blocks.length > 0 &&
                          assembly.cost > 0 &&
                          assembly.suggestedUnitPrice !== null && (
                            <p className="mt-1.5 text-xs text-gray">
                              Sugerido pela composição:{' '}
                              {money(assembly.suggestedUnitPrice)} por{' '}
                              {unitSymbol[assembly.unitKind]}.{' '}
                              {assembly.unitPrice ===
                              assembly.suggestedUnitPrice ? (
                                'Já é o valor de venda.'
                              ) : (
                                <PermissionGate permissions={EDIT}>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={adoptSuggested}
                                  >
                                    Usar preço sugerido
                                  </Button>
                                </PermissionGate>
                              )}
                            </p>
                          )}
                      </div>
                      <div className="flex flex-col">
                        <Label className="mb-2">Preço de venda</Label>
                        <Input
                          value={money(assembly.priceForMeasure)}
                          disabled
                          className="font-semibold text-gray-900"
                        />
                      </div>
                    </PermissionGate>
                  </div>

                  <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
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
                    <PermissionGate permissions={EDIT}>
                      <div className="flex flex-wrap gap-5 pb-3">
                        {(
                          [
                            ['allowEditValues', 'Permitir editar valor'],
                            [
                              'allowEditDescription',
                              'Permitir editar descrição',
                            ],
                            ['allowRenameStages', 'Permitir renomear etapas'],
                          ] as const
                        ).map(([key, label]) => (
                          <label
                            key={key}
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            <Switch
                              checked={assembly[key] ?? true}
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
                            {key === 'allowEditValues' && (
                              <AllowEditValueHint />
                            )}
                            {key === 'allowEditDescription' && (
                              <AllowEditDescriptionHint />
                            )}
                          </label>
                        ))}
                      </div>
                    </PermissionGate>
                  </div>
                  <p className="text-sm text-gray">
                    Padrão de medidas: {num(saved.quantity)} ×{' '}
                    {num(saved.width)} × {num(saved.height)} m. Para mudar,
                    simule outra medida e use &quot;Salvar como padrão&quot;.
                    {assembly.unitKind !== 'AREA'
                      ? ' Largura e altura não mudam o valor de venda: servem para calcular a composição.'
                      : ''}
                  </p>
                </div>
              </div>

              {/* Os campos do orçamento (IP-4, IP-6) ficam junto de largura,
                  altura e quantidade: são as entradas do produto na venda
                  (orientação do time, 03/10/2026) */}
              <div className="mt-5 border-t border-gray-100 pt-5">
                <ProductFields
                  bare
                  productId={productId}
                  fields={assembly.fields}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 2. Simulação (PAD-6, 05/10/2026): a medida simulada e, quando a
          composição tem etapa com custo, custo, preço, sugerido e margem
          nessa medida. O mesmo desenho da Simulação do processo. A medida
          padrão do produto só muda pelo "Salvar como padrão" */}
      {(embedded || pageTab === 'simulation') && (
        <SimulationCard
          className={cn(embedded && 'order-first')}
          idPrefix="measure"
          description="Confira custo, preço e margem numa medida. Não grava nada: o padrão do produto só muda com “Salvar como padrão”."
          measure={measure}
          onMeasureChange={setMeasure}
          emptyText="Os valores aparecem quando houver etapa com custo."
          results={
            assembly.blocks.length > 0 && assembly.cost > 0
              ? [
                  { label: 'Custo', value: money(assembly.cost) },
                  {
                    label: 'Preço de venda',
                    value: money(assembly.priceForMeasure),
                  },
                  {
                    label: `Sugerido · por ${unitSymbol[assembly.unitKind]}`,
                    value: money(assembly.suggestedUnitPrice),
                    help: `${money(assembly.suggestedPrice)} nesta medida · soma do preço de venda de cada recurso`,
                  },
                  {
                    label: 'Margem',
                    value:
                      assembly.margin === null
                        ? '-'
                        : `${num(assembly.margin, 1)}%`,
                    tone:
                      assembly.margin !== null && assembly.margin < 0
                        ? 'error'
                        : 'default',
                  },
                ]
              : []
          }
          footer={
            measureChanged ||
            (assembly.blocks.length > 0 && assembly.cost > 0) ? (
              <>
                <p className="text-sm text-gray">
                  {measureChanged
                    ? `Simulando ${num(measure.quantity)} × ${num(measure.width)} × ${num(measure.height)} m. O padrão é ${num(saved.quantity)} × ${num(saved.width)} × ${num(saved.height)} m.`
                    : assembly.margin !== null && assembly.margin < 0
                      ? 'Nesta medida, o produto está sendo vendido abaixo do custo.'
                      : 'Ter custo não muda o valor de venda: usar o sugerido é uma decisão sua.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {measureChanged && (
                    <Button
                      type="button"
                      variant="neutralOutline"
                      onClick={() => setMeasure(saved)}
                    >
                      Voltar ao padrão
                    </Button>
                  )}
                  <PermissionGate permissions={EDIT}>
                    {measureChanged && (
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
                    )}
                    {assembly.blocks.length > 0 && assembly.cost > 0 && (
                      <PermissionGate permissions={['values:values:view']}>
                        <Button
                          type="button"
                          variant="neutralOutline"
                          disabled={
                            assembly.unitPrice === assembly.suggestedUnitPrice
                          }
                          onClick={adoptSuggested}
                        >
                          Usar preço sugerido
                        </Button>
                      </PermissionGate>
                    )}
                  </PermissionGate>
                </div>
              </>
            ) : null
          }
        />
      )}

      {/* Segunda parte (decisão de 30/09 e 02/10/2026): a faixa de quantidade
          fica fora da tela enquanto a composição é acertada. O código
          continua; só não é mostrado. A tabela comercial fica ao lado do
          custo técnico (FQ-1 a FQ-3) */}
      {SHOW_SECOND_PART && (
        <PriceTiersCard assembly={assembly} onSaved={refresh} />
      )}

      {/* 4. A composição é a lista de etapas, na ordem da produção, como o
          item pronto do legado (03/10/2026): todas abertas, cada uma com os
          recursos, e uma linha "Nova etapa" embaixo de cada uma. A etapa nova
          entra depois da anterior, numa linha contínua; o fluxo acima é onde
          essa linha se altera */}
      {(embedded || pageTab === 'composition') && (
        <Card className={cn(embedded && 'order-first')}>
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
            <div className="min-w-0 flex-1 basis-80">
              <CardTitle>Composição</CardTitle>
              <CardDescription>
                {inVariation
                  ? `O que você acrescentar aqui existe só em ${variation?.name}. As etapas da base continuam valendo.`
                  : 'Cada etapa é o trabalho de um setor, com a máquina, o material e a mão de obra que ele usa. A ordem das etapas é a ordem da produção.'}
              </CardDescription>
            </div>
            {assembly.blocks.length > 1 && (
              <Button
                type="button"
                size="md"
                variant="neutralOutline"
                onClick={() =>
                  setClosedStages(
                    closedStages.size === assembly.blocks.length
                      ? new Set()
                      : new Set(assembly.blocks.map((block) => block.id)),
                  )
                }
              >
                {closedStages.size === assembly.blocks.length
                  ? 'Abrir todas as etapas'
                  : 'Recolher todas as etapas'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {/* No diálogo do produto não há o bloco Produto: os campos do
              orçamento abrem a composição */}
            {embedded && (
              <div className="border-b border-gray-100 pb-5">
                <ProductFields
                  bare
                  productId={productId}
                  fields={assembly.fields}
                />
              </div>
            )}
            {assembly.blocks.length === 0 ? (
              <PermissionGate permissions={EDIT} fallback={readOnlyEmpty}>
                {ownStageEmpty}
              </PermissionGate>
            ) : (
              assembly.blocks.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div
                    ref={item.id === selectedBlock?.id ? detailRef : undefined}
                  >
                    {stageDetail(item)}
                  </div>
                  {!inVariation && (
                    <PermissionGate permissions={EDIT}>
                      <Button
                        type="button"
                        variant="neutralOutline"
                        className="w-full border-dashed"
                        LeftIcon={IconPlus}
                        onClick={() => addStageAfter(item)}
                      >
                        Nova etapa depois de {item.name}
                      </Button>
                    </PermissionGate>
                  )}
                </div>
              ))
            )}
            {/* Fórmulas do produto: recurso avançado. A porta de entrada é
              "Nova fórmula…" no tipo de cálculo da linha; a lista só aparece
              depois da primeira, aqui dentro da Composição (03/10/2026) */}
            {assembly.formulas.length > 0 && (
              <ProductFormulas
                bare
                productId={productId}
                fields={assembly.fields}
                formulas={assembly.formulas}
                lineRefs={Object.keys(allRefs)}
                testVars={{ ...testVars, ...allRefs }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. O fluxo de produção (FL-1 a FL-5): cada caixa é a etapa de um
          setor, ligada às que vêm antes dela. Nasce recolhido, em uma linha
          na ordem das etapas (03/10/2026); abre para quem quer mudar a ordem,
          dividir o fluxo ou juntar caminhos */}
      {(embedded || pageTab === 'composition') &&
        assembly.blocks.length > 0 && (
          <Card className={cn(embedded && 'order-first')}>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 space-y-0">
              <div className="min-w-0">
                <CardTitle>Fluxo de produção</CardTitle>
                <CardDescription>
                  {flowOpen
                    ? inVariation
                      ? `O que você acrescentar aqui existe só em ${variation?.name}. As etapas da base continuam valendo.`
                      : 'Cada caixa é a etapa de um setor. O "+" acrescenta a etapa seguinte; o menu da caixa liga, desliga e troca.'
                    : flowSummary}
                </CardDescription>
              </div>
              <Button
                type="button"
                size="md"
                variant="neutralOutline"
                RightIcon={flowOpen ? IconChevronUp : IconChevronDown}
                onClick={() => setFlowOpen((open) => !open)}
              >
                {flowOpen ? 'Recolher' : 'Ver e alterar o fluxo'}
              </Button>
            </CardHeader>
            {flowOpen && (
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
                        setExpandedPart((current) =>
                          current === id ? null : id,
                        )
                      }
                      empty={readOnlyEmpty}
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
                    empty={ownStageEmpty}
                  />
                </PermissionGate>
              </CardContent>
            )}
          </Card>
        )}

      {/* O que o produto consome, cada recurso uma vez (IP-34) */}
      {(embedded || pageTab === 'composition') &&
        assembly.resourceSummary.length > 0 && (
          <Card className={cn(embedded && 'order-first')}>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 space-y-0">
              <div className="min-w-0">
                <CardTitle>Resumo por recurso</CardTitle>
                <CardDescription>
                  Cada recurso uma vez, somado de todas as etapas, na medida
                  simulada. É a lista do que o produto consome.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="md"
                variant="neutralOutline"
                RightIcon={summaryOpen ? IconChevronUp : IconChevronDown}
                onClick={() => setSummaryOpen((open) => !open)}
              >
                {summaryOpen ? 'Recolher' : 'Ver o resumo'}
              </Button>
            </CardHeader>
            {summaryOpen && (
              <CardContent>
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[40%]">Recurso</TableHead>
                      <TableHead className="w-[15%]">Tipo</TableHead>
                      <TableHead numeric className="w-[15%]">
                        Quantidade
                      </TableHead>
                      <TableHead numeric className="w-[15%]">
                        Custo
                      </TableHead>
                      <TableHead className="w-[15%] text-right">
                        Venda
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assembly.resourceSummary.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="text-sm font-medium text-gray-800">
                          {resource.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          <ResourceKindLabel
                            kind={resource.kind}
                            label={resourceKindObj[resource.kind]}
                          />
                        </TableCell>
                        <TableCell
                          numeric
                          className="whitespace-nowrap text-sm"
                        >
                          {amount(resource.quantity, resource.unit)}
                          {(resource.people || 1) > 1 && (
                            <span className="block text-xs text-gray">
                              até {resource.people} pessoas ao mesmo tempo
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          numeric
                          className="whitespace-nowrap text-sm"
                        >
                          <PermissionGate
                            permissions={['values:values:view']}
                            fallback={<span>•••</span>}
                          >
                            {money(resource.cost)}
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
                            {money(resource.sale)}
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        )}

      {/* Rodapé da página (pedido do time, 03/10/2026): mesmo com a gravação
          por ação (IP-40), a pessoa precisa de um Salvar e um Fechar para não
          ficar perdida. Salvar grava o que ainda estiver pendente (o
          descritivo) e volta para a lista; Fechar avisa se houver pendência.
          No diálogo do produto o rodapé já existe */}

      {!embedded && (
        <Card className="sticky bottom-0 z-10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            {/* A gravação é por ação (IP-40): a situação aparece só aqui,
                com o relógio, para não repetir no cabeçalho (03/10/2026) */}
            <p className="inline-flex items-center gap-1.5 text-sm text-gray">
              <IconClock size={ICON_SIZE.sm} aria-hidden="true" />
              {pendingDescription
                ? 'Descritivo técnico ainda não salvo. O resto já está gravado.'
                : savedAt
                  ? `Salvo automaticamente às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Salvo automaticamente a cada alteração'}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="neutralOutline"
                onClick={closeComposition}
              >
                Fechar
              </Button>
              <PermissionGate permissions={EDIT}>
                <Button
                  type="button"
                  RightIcon={IconCircleCheck}
                  onClick={saveComposition}
                  isLoading={!!savingComposition}
                >
                  Salvar
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>
      )}

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
            addAssemblyBlock({
              productId,
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
        initialKind={dialog?.kind === 'newLine' ? dialog.lineKind : undefined}
        resources={resources?.resources || []}
        fields={assembly.fields}
        formulas={assembly.formulas}
        lineRefs={Object.keys(dialogRefs)}
        testVars={{ ...testVars, ...dialogRefs }}
        onCreateFormula={createFormula}
        onOpenChange={() => setDialog(null)}
        onSave={(values) => {
          if (dialog?.kind !== 'newLine') return
          const target = dialog.block
          setDialog(null)
          run(
            addAssemblyLine({ productId, blockId: target.id, values }),
            'Recurso acrescentado à etapa',
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
        fields={assembly.fields}
        formulas={assembly.formulas}
        lineRefs={Object.keys(dialogRefs)}
        testVars={{ ...testVars, ...dialogRefs }}
        onCreateFormula={createFormula}
        onOpenChange={() => setDialog(null)}
        variationName={variation?.name}
        ownStage={dialog?.kind === 'line' && dialog.block.processId === null}
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
            'Recurso ajustado neste produto',
          )
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * As variações do produto (P, M, G…) como abas (decisão de 03/10/2026). A
 * variação nasce como cópia da composição aberta e, depois, as duas são
 * independentes. Cada aba é outra composição, com o mesmo editor
 * ------------------------------------------------------------------------- */

export function AssemblyEditor(props: EditorProps) {
  const { productId } = props
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(EDIT[0])
  const [activeId, setActiveId] = useState(productId)
  const [variantDialog, setVariantDialog] = useState<
    { kind: 'new' } | { kind: 'rename'; id: string; name: string } | null
  >(null)
  const [variantName, setVariantName] = useState('')

  useEffect(() => {
    setActiveId(productId)
  }, [productId])

  const { data: variantsRes } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => getProductVariants({ productId }),
  })
  const variants = variantsRes?.data?.variants || []
  const variantIdOf = (id: string) => `${productId}::v:${id}`
  const activeVariant = variants.find(
    (item) => variantIdOf(item.id) === activeId,
  )
  const refreshVariants = () =>
    queryClient.invalidateQueries({ queryKey: ['product-variants', productId] })

  const submitVariant = async () => {
    if (!variantDialog) return
    if (variantDialog.kind === 'new') {
      const res = await createProductVariant({
        productId: activeId,
        name: variantName,
      })
      if (!res.success || !res.data) return toast.error(res.message)
      toast.success(`Variação ${variantName.trim()} criada como cópia`)
      await refreshVariants()
      setActiveId(res.data)
    } else {
      const res = await renameProductVariant({
        productId,
        variantId: variantDialog.id,
        name: variantName,
      })
      if (!res.success) return toast.error(res.message)
      await refreshVariants()
    }
    setVariantDialog(null)
  }

  const removeVariant = (variant: { id: string; name: string }) =>
    alertDialog.open({
      title: `Remover a variação ${variant.name}?`,
      description:
        'A composição desta variação some. As outras variações e a composição padrão não mudam.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeProductVariant({
          productId,
          variantId: variant.id,
        })
        if (!res.success) throw new Error(res.message)
        if (activeId === variantIdOf(variant.id)) setActiveId(productId)
        await refreshVariants()
      },
      toastMsg: {
        success: 'Variação removida',
        error: 'Erro ao remover a variação',
      },
    })

  const tab = (id: string, label: string, isActive: boolean) => (
    <button
      key={id}
      type="button"
      aria-pressed={isActive}
      onClick={() => setActiveId(id)}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
        isActive
          ? 'border-brand-500 bg-brand-25 font-medium text-brand-700'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
      )}
    >
      {label}
    </button>
  )

  const addButton = canEdit ? (
    <Button
      type="button"
      size="md"
      variant="neutralOutline"
      LeftIcon={IconPlus}
      onClick={() => {
        setVariantName('')
        setVariantDialog({ kind: 'new' })
      }}
    >
      Variação
    </Button>
  ) : null

  // Sem variação, não há abas: a tela fica como sempre foi
  const tabs =
    variants.length > 0 ? (
      <div className="flex flex-wrap items-center gap-2">
        {tab(productId, 'Padrão', activeId === productId)}
        {variants.map((variant) =>
          tab(
            variantIdOf(variant.id),
            variant.name,
            activeId === variantIdOf(variant.id),
          ),
        )}
        {activeVariant && canEdit && (
          <TooltipProvider>
            <ActionButton
              Icon={IconPencil}
              variant="neutralGhost"
              tooltip={`Renomear ${activeVariant.name}`}
              onClick={() => {
                setVariantName(activeVariant.name)
                setVariantDialog({
                  kind: 'rename',
                  id: activeVariant.id,
                  name: activeVariant.name,
                })
              }}
            />
            <ActionButton
              Icon={IconTrash}
              variant="errorGhost"
              tooltip={`Remover ${activeVariant.name}`}
              onClick={() => removeVariant(activeVariant)}
            />
          </TooltipProvider>
        )}
        {props.embedded && addButton}
      </div>
    ) : props.embedded && addButton ? (
      <div className="flex justify-end">{addButton}</div>
    ) : null

  return (
    <>
      <AssemblyEditorBody
        key={activeId}
        {...props}
        productId={activeId}
        variantTabs={tabs}
        topbarExtra={addButton}
      />
      <Dialog
        open={!!variantDialog}
        onOpenChange={(open) => {
          if (!open) setVariantDialog(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle>
                  {variantDialog?.kind === 'rename'
                    ? 'Renomear variação'
                    : 'Nova variação'}
                </DialogTitle>
                <DialogDescription>
                  {variantDialog?.kind === 'rename'
                    ? 'O nome aparece na aba e na escolha do vendedor.'
                    : `A variação nasce como cópia do que está montado em ${activeVariant ? activeVariant.name : 'Padrão'}: etapas, recursos, campos do orçamento, fórmulas, faixas e valor de venda. Depois de criada, as duas são independentes: mudar uma não muda a outra.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col">
              <Label htmlFor="variant-name" className="mb-2">
                Nome da variação
              </Label>
              <Input
                id="variant-name"
                autoFocus
                autoComplete="off"
                placeholder="Ex.: P, M, G, GG"
                value={variantName}
                onChange={(event) => setVariantName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitVariant()
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVariantDialog(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!variantName.trim()}
              onClick={submitVariant}
            >
              {variantDialog?.kind === 'rename'
                ? 'Salvar'
                : 'Cadastrar variação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

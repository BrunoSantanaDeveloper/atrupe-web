// O produto composto montado por etapas — o "item pronto" do legado na nova
// versão (área 8, §3.4.1, IP-14 a IP-24, e MS-3 a MS-8). Valores em
// centavos; medidas em metros.
//
// Vocabulário: "base" é o que recebe o acabamento (a lona impressa do
// banner). O legado chamava de "item pai".

// Types
import type {
  FormulaKey,
  ResourceKind,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Situação do produto composto (IP-14): compor leva tempo, e o vendedor não
// pode pegar no orçamento um produto pela metade
export type AssemblyStatus = 'DRAFT' | 'RELEASED' | 'PART'

// A cobrança segue o cadastro de produtos do START (IP-17): a unidade
// comercial, o valor de venda por essa unidade e o padrão de medidas. A
// composição só acrescenta o custo e o preço sugerido, na mesma unidade
export type UnitKind =
  | 'AREA'
  | 'LENGTH'
  | 'WEIGHT'
  | 'CAPACITY'
  | 'DISTANCE'
  | 'DURATION'
  | 'UNITY'

// Os mesmos rótulos do cadastro do START (UnitOfMeasureField)
export const unitKindObj: { [key in UnitKind]: string } = {
  LENGTH: 'Metro Linear (m)',
  WEIGHT: 'Peso (kg)',
  CAPACITY: 'Litro (l)',
  DISTANCE: 'Distância (km)',
  DURATION: 'Tempo (h)',
  UNITY: 'Unidade (un)',
  AREA: 'Metro Quadrado (m²)',
}

// "Valor de venda m²", como no START (UnitCostInput)
export const unitSaleLabel: { [key in UnitKind]: string } = {
  AREA: 'Valor de venda m²',
  LENGTH: 'Valor de venda metro',
  CAPACITY: 'Valor de venda litro',
  WEIGHT: 'Valor de venda kg',
  DISTANCE: 'Valor de venda km',
  DURATION: 'Valor de venda hora',
  UNITY: 'Valor de venda unitário',
}

export const unitSymbol: { [key in UnitKind]: string } = {
  AREA: 'm²',
  LENGTH: 'm',
  CAPACITY: 'l',
  WEIGHT: 'kg',
  DISTANCE: 'km',
  DURATION: 'h',
  UNITY: 'un',
}

// O campo do padrão de medidas quando a unidade não é m² nem unidade
export const unitAmountLabel: { [key in UnitKind]: string } = {
  AREA: 'Área total',
  LENGTH: 'Medida',
  CAPACITY: 'Quantidade',
  WEIGHT: 'Peso',
  DISTANCE: 'Distância',
  DURATION: 'Tempo',
  UNITY: '',
}

// A medida do produto no orçamento (IP-16)
export type ProductDimension = 'SALE' | 'FIXED'

export const productDimensionObj: { [key in ProductDimension]: string } = {
  SALE: 'Medida informada na venda',
  FIXED: 'Medida fixa',
}

// Regras de venda do processo (MS-3 a MS-6). O processo define; o produto
// pode sobrescrever só para ele (IP-18)
export type QuantityMode = 'HIDDEN_ONE' | 'FREE' | 'AREA_RATIO'

export const quantityModeObj: { [key in QuantityMode]: string } = {
  HIDDEN_ONE: 'Uma unidade, sem perguntar ao vendedor',
  FREE: 'O vendedor informa',
  AREA_RATIO: 'Quantas cabem na base (área da base ÷ área desta etapa)',
}

export type ExtraFieldKind = 'NONE' | 'DECIMAL' | 'INTEGER'

export const extraFieldKindObj: { [key in ExtraFieldKind]: string } = {
  NONE: 'Sem campo extra',
  DECIMAL: 'Número com casas decimais',
  INTEGER: 'Número inteiro',
}

export type SaleRules = {
  quantityMode: QuantityMode
  // Acompanha a quantidade da base (500 cartões → 500 laminações) ou entra
  // uma vez por pedido (a arte, o preparo)
  followsBase: boolean
  dimension: DimensionRule
  timeField: boolean
  // Tempo padrão da etapa, em minutos: a criação com 1 h já preenchida
  // (IP-32). O vendedor ajusta no orçamento, em hh:mm (IP-33)
  timeFieldDefault: number
  extraField: ExtraFieldKind
  extraFieldName: string
  extraFieldDefault: number
  descriptionEditable: boolean
}

// Uma linha da etapa: um recurso, ou um grupo de recursos (IP-21)
export type LineMode = 'SINGLE' | 'CHOOSE' | 'LIST'

export const lineModeObj: { [key in LineMode]: string } = {
  SINGLE: 'Recurso único',
  CHOOSE: 'Escolha de um',
  LIST: 'Lista para o vendedor preencher',
}

export type ResourceOption = {
  // Identidade da opção dentro da linha
  id: string
  // O recurso de verdade, quando a opção é uma configuração dele: o mesmo
  // refile aparece como "Refile lona", "Refile PVC" e "Refile ACM" (IP-27)
  resourceId?: string
  configName?: string
  name: string
  unit: string
  // Custo por unidade do recurso. Mão de obra: por minuto
  unitCost: number
  // Preço de venda por unidade do recurso, como no legado (IP-25): o do
  // cadastro do material, ou a hora vendida da mão de obra e da máquina.
  // Sem ele, vale o custo com o markup de referência da Precificação
  unitSale?: number
  // Papel e chapa têm medida (AP-2), em metros: é o que permite o
  // aproveitamento de folha
  sheet?: { width: number; height: number }
  // Consumo, perda e mínimo próprios desta opção (IP-26): no mesmo grupo,
  // o ACM usa 1,0 e o PVC 1,2 com mínimo de 0,5. Vazio, vale o da linha
  perUnit?: number
  lossPercent?: number
  minimum?: number | null
}

// O aproveitamento de folha (AP-1): as duas posições da peça na folha
export type SheetYield = {
  sheetName: string
  firstFit: number
  secondFit: number
  perSheet: number
  sheets: number
  leftover: number
  // Folhas cobradas: inteiras, ou só a fração aproveitada (AP-4)
  charged: number
  marginMm: number
  gapMm: number
}

// Preço por faixa de quantidade (FQ-1): tabela, não desconto. A faixa vale
// para o total da venda, não em degraus (FQ-2)
export type PriceTier = {
  from: number
  unitPrice: number
}

export type AssemblyLine = {
  id: string
  name: string
  kind: ResourceKind
  mode: LineMode
  options: ResourceOption[]
  selectedId: string
  // Consumo por unidade da fórmula (2,2 m de madeira por metro de largura)
  perUnit: number
  formula: FormulaKey
  // Perda e mínimo são de cada linha, não regra do sistema (CP-8)
  lossPercent: number
  minimum: number | null
  // Ajustada neste produto: deixa de acompanhar o processo e fica como está
  // quando o processo muda (CP-21)
  overridden: boolean
  // A linha do processo de onde esta veio: é o que liga a etapa ao processo
  // e deixa a mudança do processo chegar ao produto (CP-21)
  sourceLineId?: string
  // Acrescentada neste produto numa etapa que veio de um processo
  addedHere?: boolean
  // Opcional (IP-28): o vendedor decide no orçamento se entra — a cantoneira
  // do quadro com lona. Não confundir com linha vazia, que é erro de cadastro
  optional?: boolean
  // Se a opcional já vem marcada no orçamento; é também o que o custo e o
  // sugerido da composição consideram
  optionalDefault?: boolean
  // Aproveitamento de folha (AP-3, AP-4), na linha que escolhe a folha:
  // margem da borda e espaçamento entre peças, em milímetros; e se cobra a
  // folha inteira ou só o que foi aproveitado
  sheetMargin?: number
  sheetGap?: number
  chargeWholeSheets?: boolean
}

export type BlockRole = 'BASE' | 'FINISHING'

// A etapa é do produto: o trabalho de um setor, com os recursos e o tempo
// que ele usa. Pode ser montada ali mesmo ou incluída de um processo já
// cadastrado — o processo é um cadastro à parte, não a origem obrigatória
export type AssemblyBlock = {
  id: string
  // O processo de onde a etapa foi incluída; nulo na etapa montada no produto
  processId: string | null
  name: string
  // Nome desta etapa só neste produto, quando veio de um processo (IP-30)
  localName?: string
  // Parte (IP-9): a etapa é outro produto com composição — a estrutura de
  // metalon dentro da placa. O custo vem da composição dela, na medida da
  // etapa, e ela não tem linhas próprias aqui
  partProductId?: string
  sector: string
  role: BlockRole
  // A composição é o caminho da produção (FL-1): cada etapa depende de
  // nenhuma, uma ou várias etapas anteriores. É o que desenha o fluxo, e o
  // que a produção vai seguir (FL-10, FL-13)
  dependsOn: string[]
  // A etapa cuja medida esta usa quando a regra é "mesma medida da base"
  // (MS-5): a primeira de que ela depende, por padrão
  baseBlockId: string | null
  setupMinutes: number
  // Custo-hora do setor, para o preparo. Vem da Base de custos
  sectorHourCost: number
  taskType: string
  // Tipo de tarefa escolhido só neste produto; sem ele, vale o do processo
  localTaskType?: string
  // Linhas do processo tiradas só deste produto: não voltam quando o
  // processo muda, até alguém restaurar (CP-21)
  removedSourceLineIds?: string[]
  // As regras do processo e, quando houver, as deste produto
  originalRules: SaleRules
  localRules: SaleRules | null
  lines: AssemblyLine[]
}

export type AssemblyMeasure = {
  quantity: number
  width: number
  height: number
}

// Variação do produto (PV-1 a PV-7): P, M, G; 4x0, 4x4; com ou sem
// laminação. Nasce igual à base, e só o que for mudado passa a ser dela
// (PV-2). O preço próprio é opcional: sem ele vale o do produto (PV-4)
export type VariationOverride = {
  blockId: string
  lineId: string
  selectedId?: string
  perUnit?: number
}

export type ProductVariation = {
  id: string
  name: string
  unitPrice: number | null
  // Faixas próprias da variação (FQ-4); sem elas, vale a tabela do produto
  priceTiers?: PriceTier[]
  // Etapas que só esta variação tem (PV-7): a laminação do "com laminação"
  extraBlocks?: AssemblyBlock[]
  overrides: VariationOverride[]
}

export type ProductAssembly = {
  productId: string
  name: string
  code: string
  status: AssemblyStatus
  dimension: ProductDimension
  unitKind: UnitKind
  // Valor de venda por unidade comercial, como no START
  unitPrice: number | null
  // Padrão de medidas: no m², largura × altura; nas outras unidades, a
  // quantidade nelas (3 m, 2 kg). Largura e altura também alimentam a
  // composição, mesmo quando o produto é vendido por unidade
  measure: AssemblyMeasure
  unitAmount: number
  allowEditValues: boolean
  allowEditDescription: boolean
  priceTiers: PriceTier[]
  technicalDescription: string
  blocks: AssemblyBlock[]
  variations: ProductVariation[]
}

// O que o servidor devolve depois de calcular (SEG-1)
export type ComputedLine = AssemblyLine & {
  // Mudada na variação que está sendo vista (PV-2)
  variationOverride: boolean
  sheetYield: SheetYield | null
  selected: ResourceOption | null
  quantity: number | null
  // O mínimo substituiu a conta (IP-35): a peça pequena pagou o mínimo
  minimumApplied: boolean
  // O que vale para a opção escolhida: o dela, ou o da linha (IP-26)
  effective: {
    perUnit: number
    lossPercent: number
    minimum: number | null
    own: boolean
  }
  cost: number | null
  // Quantidade × preço de venda do recurso (IP-25)
  sale: number | null
}

// Uma caixa do fluxo, como a tela desenha (FL-5): serve à composição do
// produto, ao que a parte tem por dentro (IP-9) e ao item montado no
// orçamento (ORC-11)
export type FlowStage = {
  id: string
  name: string
  sector: string
  dependsOn: string[]
  processId: string | null
  partProductId: string | null
  // O que a parte tem por dentro, até três níveis (IP-9)
  partFlow: FlowStage[] | null
}

export type ComputedBlock = Omit<AssemblyBlock, 'lines'> & {
  rules: SaleRules
  measure: AssemblyMeasure
  setupCost: number
  setupSale: number
  cost: number
  sale: number
  lines: ComputedLine[]
  // A parte calculada: nome e quantas etapas ela tem
  part: { productId: string; name: string; stages: number } | null
  // O fluxo da parte, para a caixa que abre (FL-5, IP-9)
  partFlow: FlowStage[] | null
  // As linhas e o preparo das etapas da parte, para a produção saber o que
  // ela consome (GP-16)
  partLines: ComputedLine[]
  partSetupMinutes: number
  // Etapa que só a variação vista tem (PV-7)
  variationOnly: boolean
}

// Cada recurso uma vez, somado de todas as etapas (IP-34): a lista do que o
// produto consome, para a produção e o estoque
export type ResourceSummary = {
  id: string
  name: string
  kind: ResourceKind
  unit: string
  quantity: number
  cost: number
  sale: number
}

export type ComputedAssembly = Omit<ProductAssembly, 'blocks'> & {
  area: number
  blocks: ComputedBlock[]
  resourceSummary: ResourceSummary[]
  cost: number
  // A soma do preço de venda de cada recurso, como o "valor sugerido" do
  // legado (IP-25). Não muda o valor de venda: adotá-lo é decisão do usuário
  suggestedPrice: number
  // Quanto de unidade comercial há na medida (1,08 m², 3 m, 1 un)
  saleAmount: number
  // O valor de venda aplicado à medida: é o "Valor" do START
  priceForMeasure: number | null
  // O sugerido pela composição, na unidade comercial (por m², por metro…)
  suggestedUnitPrice: number
  margin: number | null
  // A variação calculada, quando há uma escolhida
  activeVariation: ProductVariation | null
  // Custo e preço de cada variação na medida padrão, para comparar a margem
  // A faixa vigente para a quantidade simulada, e cada faixa com o custo
  // naquela quantidade, para ver se a tabela aperta a margem (FQ-3)
  activeTier: PriceTier | null
  // A tabela que vale: a da variação vista, ou a do produto (FQ-4)
  effectiveTiers: PriceTier[]
  tiersFromVariation: boolean
  tierSummary: {
    from: number
    unitPrice: number
    unitCost: number
    margin: number | null
  }[]
  variationSummary: {
    id: string
    name: string
    cost: number
    priceForMeasure: number | null
    margin: number | null
  }[]
}

// Um processo do catálogo, para adicionar ao produto
export type ProcessCatalogItem = {
  id: string
  name: string
  sector: string
  role: BlockRole
  // Setor da base de que ele é acabamento
  finishingOf: string | null
}

// O que "+ etapa seguinte" oferece (FL-7): primeiro os processos marcados
// como usuais depois desta etapa, e "ver todos" para o resto. Sem marcação,
// valem os acabamentos do setor da etapa, como no legado
export type NextStepCandidates = {
  usual: ProcessCatalogItem[]
  all: ProcessCatalogItem[]
  // true quando os usuais vieram do setor, por falta de marcação
  bySector: boolean
}

// A marcação "costuma vir depois de" entre dois processos (FL-7), vista de
// um dos lados: a lista de todos os outros processos, com a marca
export type UsualNeighbor = ProcessCatalogItem & { usual: boolean }

// O item montado no orçamento (ORC-11), como o vendedor vê: etapas com o
// preço de venda de cada recurso e NUNCA o custo (ORC-7). O custo continua
// sendo calculado e gravado no retrato da venda (ORC-10), mas não sai daqui
export type ComposedItemView = {
  productId: string
  name: string
  measure: AssemblyMeasure
  stages: {
    id: string
    name: string
    sector: string
    dependsOn: string[]
    processId: string | null
    partProductId: string | null
    partFlow: FlowStage[] | null
    sale: number
    setupMinutes: number
    lines: {
      id: string
      name: string
      kind: ResourceKind
      resource: string | null
      quantity: number | null
      unit: string
      sale: number | null
    }[]
  }[]
  // Soma do preço de venda de todas as etapas
  total: number
}

// Os recursos que uma etapa montada no produto pode usar
export type AssemblyResource = ResourceOption & { kind: ResourceKind }

export type AssemblyResources = {
  sectors: string[]
  resources: AssemblyResource[]
}

export type NewLineValues = {
  name: string
  kind: ResourceKind
  mode: LineMode
  optionIds: string[]
  perUnit: number
  formula: FormulaKey
  lossPercent: number
  minimum: number | null
  optional: boolean
  optionalDefault: boolean
}

/* ---------------------------------------------------------------------------
 * O produto na venda (IP-36): o vendedor preenche só o que é editável, e a
 * composição completa fica num relatório de consulta, sem custo (ORC-7)
 * ------------------------------------------------------------------------- */

export type SaleChoice = { blockId: string; lineId: string; optionId: string }
export type SaleListEntry = SaleChoice & { quantity: number }
export type SaleExtra = { blockId: string; value: number }
export type SaleTime = { blockId: string; minutes: number }
export type SaleOptional = {
  blockId: string
  lineId: string
  included: boolean
}

export type SaleForm = {
  // As etapas, para a observação de produção de cada uma (MS-13)
  stages: { blockId: string; name: string; sector: string }[]
  // Campos extras nomeados de cada etapa (nº de letras, distância dos ilhoses)
  extras: {
    blockId: string
    name: string
    kind: ExtraFieldKind
    defaultValue: number
  }[]
  // Campo tempo das etapas que pedem (a criação da arte), em minutos
  times: {
    blockId: string
    name: string
    defaultMinutes: number
  }[]
  // Linhas de escolha: o vendedor troca o recurso (a lona 380 ou 440)
  choices: {
    blockId: string
    lineId: string
    name: string
    stage: string
    defaultId: string
    options: { id: string; name: string }[]
  }[]
  // Opcionais: o vendedor marca se entram nesta venda
  optionals: {
    blockId: string
    lineId: string
    name: string
    stage: string
    defaultIncluded: boolean
  }[]
  // Listas: o vendedor informa quanto usou de cada item
  lists: {
    blockId: string
    lineId: string
    name: string
    stage: string
    options: { id: string; name: string; unit: string }[]
  }[]
}

export type SaleCompositionReport = {
  name: string
  // O texto que a proposta resumida mostra (IP-12, IP-24)
  technicalDescription: string
  measure: AssemblyMeasure
  variation: string | null
  blocks: {
    id: string
    name: string
    // Peso da etapa no preço sugerido: é o que reparte o valor do item entre
    // as etapas na proposta detalhada com valores (IP-12)
    sale: number
    sector: string
    // O tipo de tarefa que a etapa gera na produção (IP-23)
    taskType: string
    role: BlockRole
    baseName: string | null
    measure: AssemblyMeasure
    extra: string | null
    // Observação de produção deixada na venda (MS-13)
    note: string | null
    // Preparo da etapa, em minutos: entra no tempo estimado da tarefa
    setupMinutes: number
    lines: {
      id: string
      name: string
      kind: ResourceKind
      resource: string | null
      quantity: number | null
      unit: string
      // Na lista, os itens que o vendedor informou
      entries: { name: string; quantity: number; unit: string }[] | null
    }[]
  }[]
}

// Tempo digitado em hh:mm, como no legado (IP-33): "1:30" → 90 minutos.
// Aceita também só minutos ("45")
export const hhmmToMinutes = (value: string) => {
  const text = value.trim()
  if (!text) return 0
  if (!text.includes(':')) return Math.max(0, Math.round(Number(text) || 0))
  const [hours, minutes] = text.split(':')
  return Math.max(0, (Number(hours) || 0) * 60 + (Number(minutes) || 0))
}

export const minutesToHhmm = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(Math.round(minutes % 60)).padStart(2, '0')}`

// O que cada fórmula consome da etapa (IP-35): é o que a tela destaca, e o
// que vira alerta quando está zerado
export type FormulaInput =
  | 'quantidade'
  | 'largura'
  | 'altura'
  | 'área'
  | 'perímetro'
  | 'campo extra'
  | 'tempo'
  | 'folha'

export const formulaInputs: { [key in FormulaKey]: FormulaInput[] } = {
  FIXED: [],
  SELLER: [],
  PER_AREA: ['área', 'quantidade'],
  PER_UNIT: ['quantidade'],
  PER_PERIMETER: ['perímetro', 'quantidade'],
  PER_WIDTH: ['largura', 'quantidade'],
  PER_HEIGHT: ['altura', 'quantidade'],
  PER_EXTRA: ['campo extra', 'quantidade'],
  PER_TIME: ['tempo', 'quantidade'],
  PER_PERIMETER_DIV_EXTRA: ['perímetro', 'campo extra', 'quantidade'],
  TIME_TIMES_EXTRA: ['tempo', 'campo extra'],
  EQUAL_TIME: ['tempo'],
  PER_WIDTH_EXTRA: ['largura', 'campo extra', 'quantidade'],
  PER_HEIGHT_EXTRA: ['altura', 'campo extra', 'quantidade'],
  EXTRA_ONLY: ['campo extra'],
  PER_AREA_DIV_EXTRA: ['área', 'campo extra', 'quantidade'],
  PER_PERIMETER_EXTRA: ['perímetro', 'campo extra', 'quantidade'],
  DIV_EXTRA: ['campo extra'],
  AREA_EXTRA: ['área', 'campo extra'],
  PER_AREA_EXTRA: ['área', 'campo extra', 'quantidade'],
  SHEET_YIELD: ['folha', 'largura', 'altura', 'quantidade'],
}

// Biblioteca de composições prontas (IP-7): curadoria do Atrupe, importada
// para o produto do cliente já com etapas e materiais. É o passo 2 do
// caminho do produto até o PRO (CP-16)
export type LibraryEntry = {
  id: string
  name: string
  segment: string
  description: string
  stages: { name: string; sector: string; role: BlockRole }[]
  resources: number
}

// Os tipos de tarefa que a etapa gera na produção (IP-23, MS-8)
export const TASK_TYPES = [
  'Criação',
  'Impressão',
  'Produção',
  'Acabamento',
  'Instalação',
]

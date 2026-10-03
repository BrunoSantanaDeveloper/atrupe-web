'use server'

// PROVISÓRIO: a API ainda não tem a composição por etapas (recurso do PRO).
// Dados de exemplo em memória. O cálculo fica aqui, no servidor, e a tela só
// mostra o resultado (SEG-1): quem monta o produto não vê a fórmula rodando
// no navegador.
//
// Os números do Banner são os do legado (pro.atrupe.com.br, ITP1), para a
// tela poder ser conferida contra ele.

// Types
import type {
  SaleRules,
  AfterBase,
  AssemblyLine,
  QuoteField,
  ProductFormula,
  AssemblyBlock,
  AssemblyMeasure,
  ComputedLine,
  ComputedBlock,
  ProductAssembly,
  AssemblySeed,
  ComputedAssembly,
  ProductVariation,
  ProcessCatalogItem,
  AssemblyResource,
  NewLineValues,
  ResourceSummary,
  LibraryEntry,
  SaleForm,
  SaleExtra,
  SaleTime,
  SaleOptional,
  SaleChoice,
  SaleListEntry,
  SaleCompositionReport,
  PriceTier,
  SheetYield,
  ResourceOption,
  FlowStage,
  UsualNeighbor,
  ComposedItemView,
  NextStepCandidates,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'
import {
  evaluateFormula,
  formulaUsesName,
  type FormulaVars,
} from '@/lib/formula'
import { materialResources } from './materials-data'

// Markup de referência da empresa, vindo da Precificação (PR-1)
const REFERENCE_MARKUP = 1.68

const uid = () => Math.random().toString(36).slice(2, 9)

// Custo por minuto da mão de obra do setor, a partir do custo-hora da Base de
// custos (em centavos)
const HOUR: { [sector: string]: number } = {
  Criação: 3000,
  Impressão: 2890,
  Produção: 1649,
  Instalação: 4200,
  Gráfica: 2500,
}
const perMinute = (sector: string) => (HOUR[sector] || 1800) / 60

// A hora vendida de cada setor (IP-25), como a do legado: Produção custa
// R$ 16,49 e é vendida a R$ 60,00
const HOUR_SALE: { [sector: string]: number } = {
  Criação: 9000,
  Impressão: 8000,
  Produção: 6000,
  Instalação: 12000,
  Gráfica: 7000,
}
const salePerMinute = (sector: string) => (HOUR_SALE[sector] || 6000) / 60

// O preço de venda do recurso; sem ele, o custo com o markup de referência
const unitSaleOf = (option: ResourceOption) =>
  option.unitSale ?? option.unitCost * REFERENCE_MARKUP

const baseRules: SaleRules = {
  quantityMode: 'FREE',
  followsBase: true,
  dimension: 'FREE_SIZE',
  timeField: false,
  timeFieldDefault: 0,
  extraField: 'NONE',
  extraFieldName: '',
  extraFieldDefault: 0,
  descriptionEditable: true,
}

// O acabamento herda a medida da base, esconde a quantidade e acompanha a
// quantidade da base — o padrão que o legado mostra (MS-3 a MS-5)
const finishingRules: SaleRules = {
  ...baseRules,
  quantityMode: 'HIDDEN_ONE',
  dimension: 'SAME_AS_PARENT',
  descriptionEditable: false,
}

// O processo não sabe se é base ou acabamento: isso é a posição dele no
// produto (FL-2, 03/10/2026). Ele só diz o que prefere quando entra depois
// de outra etapa: herdar a medida da base ou pedir a própria
type Template = Omit<
  AssemblyBlock,
  | 'id'
  | 'dependsOn'
  | 'baseBlockId'
  | 'localRules'
  | 'lines'
  | 'processId'
  | 'role'
> & {
  processId: string
  afterBase: AfterBase
  lines: Omit<AssemblyLine, 'id' | 'overridden'>[]
}

const labor = (sector: string) => ({
  id: `mo-${sector}`,
  name: `Mão de obra · ${sector}`,
  unit: 'min',
  unitCost: perMinute(sector),
  unitSale: salePerMinute(sector),
})

const substrates = [
  {
    id: 'lona440',
    name: 'Lona 440 g',
    unit: 'm²',
    unitCost: 1250,
    unitSale: 2500,
  },
  {
    id: 'lona380',
    name: 'Lona 380 g',
    unit: 'm²',
    unitCost: 980,
    unitSale: 1960,
  },
  {
    id: 'adbranco',
    name: 'Adesivo branco brilho',
    unit: 'm²',
    unitCost: 1100,
    unitSale: 2500,
  },
  {
    id: 'adtransp',
    name: 'Adesivo transparente',
    unit: 'm²',
    unitCost: 1300,
    unitSale: 2600,
  },
  {
    id: 'perfurado',
    name: 'Perfurado',
    unit: 'm²',
    unitCost: 1500,
    unitSale: 3000,
  },
]

const catalog: Template[] = [
  {
    processId: 'impressao-digital',
    name: 'Impressão digital',
    sector: 'Gráfica',
    afterBase: 'OWN',
    setupMinutes: 10,
    sectorHourCost: HOUR['Gráfica'],
    taskType: 'Impressão',
    originalRules: baseRules,
    lines: [
      {
        name: 'Papel',
        kind: 'MATERIAL',
        mode: 'CHOOSE',
        options: [
          {
            id: 'couche300a3',
            name: 'Couchê 300 g · A3',
            unit: 'folha',
            unitCost: 150,
            sheet: { width: 0.297, height: 0.42 },
          },
          {
            id: 'couche300a4',
            name: 'Couchê 300 g · A4',
            unit: 'folha',
            unitCost: 90,
            sheet: { width: 0.21, height: 0.297 },
          },
        ],
        selectedId: 'couche300a3',
        perUnit: 1,
        formula: 'SHEET_YIELD',
        lossPercent: 0,
        minimum: null,
      },
      {
        // Cada passada na impressora é uma impressão: no 4x4 são duas por
        // folha (PV-7)
        name: 'Impressão colorida',
        kind: 'MACHINE',
        mode: 'SINGLE',
        options: [
          {
            id: 'clique',
            name: 'Impressora digital · clique colorido',
            unit: 'impressão',
            unitCost: 60,
          },
        ],
        selectedId: 'clique',
        perUnit: 1,
        formula: 'SHEET_YIELD',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'corte-guilhotina',
    name: 'Corte na guilhotina',
    sector: 'Produção',
    afterBase: 'INHERIT',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: {
      ...baseRules,
      followsBase: false,
      descriptionEditable: false,
    },
    lines: [
      {
        name: 'Tempo de corte',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 15,
        formula: 'FIXED',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'impressao-solvente',
    name: 'Impressão solvente',
    sector: 'Impressão',
    afterBase: 'OWN',
    setupMinutes: 10,
    sectorHourCost: HOUR['Impressão'],
    taskType: 'Impressão',
    originalRules: baseRules,
    lines: [
      {
        name: 'Qualidade',
        kind: 'MACHINE',
        mode: 'CHOOSE',
        options: [
          {
            id: 'solv4',
            name: 'Impressora solvente · 4 passes',
            unit: 'm²',
            unitCost: 289,
          },
          {
            id: 'solv6',
            name: 'Impressora solvente · 6 passes',
            unit: 'm²',
            unitCost: 410,
          },
        ],
        selectedId: 'solv4',
        perUnit: 1,
        formula: 'PER_AREA',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Material',
        kind: 'MATERIAL',
        mode: 'CHOOSE',
        // O perfurado rasga mais no refile: perda própria (IP-26)
        options: substrates.map((option) =>
          option.id === 'perfurado' ? { ...option, lossPercent: 30 } : option,
        ),
        selectedId: 'lona440',
        perUnit: 1,
        formula: 'PER_AREA',
        // Os 1,2 m² por m² do legado, como percentual explícito
        lossPercent: 20,
        minimum: 0.5,
      },
    ],
  },
  {
    processId: 'acabamento-banner',
    name: 'Acabamento de banner',
    sector: 'Produção',
    afterBase: 'INHERIT',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: { ...baseRules, descriptionEditable: false },
    lines: [
      {
        name: 'Tempo por banner',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 10,
        formula: 'PER_UNIT',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Madeira',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          {
            id: 'madeira',
            name: 'Madeira de banner',
            unit: 'm',
            unitCost: 200,
          },
        ],
        selectedId: 'madeira',
        perUnit: 2.2,
        formula: 'PER_WIDTH',
        lossPercent: 0,
        minimum: 1,
      },
      {
        name: 'Ponteira',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'ponteira', name: 'Ponteira', unit: 'un', unitCost: 20 },
        ],
        selectedId: 'ponteira',
        perUnit: 4,
        formula: 'PER_UNIT',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Cordão',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [{ id: 'cordao', name: 'Cordão', unit: 'm', unitCost: 100 }],
        selectedId: 'cordao',
        perUnit: 1.2,
        formula: 'PER_WIDTH',
        lossPercent: 0,
        minimum: null,
        // O banner pode ir sem cordão: o vendedor decide (IP-28)
        optional: true,
        optionalDefault: true,
      },
    ],
  },
  {
    processId: 'bainha',
    name: 'Bainha',
    sector: 'Produção',
    afterBase: 'INHERIT',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: { ...baseRules, descriptionEditable: false },
    lines: [
      {
        name: 'Tempo por metro de bainha',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 3,
        formula: 'PER_PERIMETER',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Cola',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'cola', name: 'Cola de contato', unit: 'kg', unitCost: 14000 },
        ],
        selectedId: 'cola',
        perUnit: 0.05,
        formula: 'PER_PERIMETER',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'ilhos',
    name: 'Ilhós',
    sector: 'Produção',
    afterBase: 'INHERIT',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    // O campo extra do ilhós é o espaçamento, com casas decimais (IP-19)
    originalRules: {
      ...baseRules,
      descriptionEditable: false,
      extraField: 'DECIMAL',
      extraFieldName: 'Distância entre ilhoses (m)',
      extraFieldDefault: 0.5,
    },
    lines: [
      {
        name: 'Tempo por ilhós',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 1,
        formula: 'PER_PERIMETER_DIV_EXTRA',
        fieldName: 'Distância entre ilhoses (m)',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Ilhós',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'ilhos', name: 'Ilhós nº 0', unit: 'un', unitCost: 20 },
        ],
        selectedId: 'ilhos',
        perUnit: 1,
        formula: 'PER_PERIMETER_DIV_EXTRA',
        fieldName: 'Distância entre ilhoses (m)',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'laminacao',
    name: 'Laminação',
    sector: 'Produção',
    afterBase: 'INHERIT',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: { ...baseRules, descriptionEditable: false },
    lines: [
      {
        name: 'Filme',
        kind: 'MATERIAL',
        mode: 'CHOOSE',
        options: [
          {
            id: 'lambrilho',
            name: 'Laminação brilho',
            unit: 'm²',
            unitCost: 700,
          },
          {
            id: 'lamfosco',
            name: 'Laminação fosca',
            unit: 'm²',
            unitCost: 780,
          },
        ],
        selectedId: 'lambrilho',
        perUnit: 1,
        formula: 'PER_AREA',
        lossPercent: 10,
        minimum: null,
      },
    ],
  },
  {
    processId: 'arte',
    name: 'Criação da arte',
    sector: 'Criação',
    afterBase: 'OWN',
    setupMinutes: 0,
    sectorHourCost: HOUR['Criação'],
    taskType: 'Criação',
    // A arte é uma por pedido, não por peça, e sem medida
    originalRules: {
      ...baseRules,
      quantityMode: 'HIDDEN_ONE',
      followsBase: false,
      dimension: 'NONE',
      timeField: true,
      // 1 h de criação já preenchida; o vendedor ajusta (IP-32)
      timeFieldDefault: 60,
    },
    lines: [
      {
        name: 'Tempo de criação',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Criação')],
        selectedId: 'mo-Criação',
        perUnit: 1,
        formula: 'EQUAL_TIME',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'instalacao',
    name: 'Instalação',
    sector: 'Instalação',
    afterBase: 'OWN',
    setupMinutes: 0,
    sectorHourCost: HOUR['Instalação'],
    taskType: 'Instalação',
    originalRules: {
      ...baseRules,
      quantityMode: 'HIDDEN_ONE',
      followsBase: false,
      dimension: 'NONE',
    },
    lines: [
      {
        name: 'Equipe de instalação',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Instalação')],
        selectedId: 'mo-Instalação',
        perUnit: 60,
        formula: 'FIXED',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Material de fixação',
        kind: 'MATERIAL',
        mode: 'LIST',
        options: [
          {
            id: 'parafuso',
            name: 'Parafuso com bucha',
            unit: 'un',
            unitCost: 35,
          },
          { id: 'abracadeira', name: 'Abraçadeira', unit: 'un', unitCost: 50 },
          { id: 'fitadf', name: 'Fita dupla face', unit: 'm', unitCost: 120 },
        ],
        selectedId: '',
        perUnit: 0,
        formula: 'SELLER',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
]

// A regra de medida nasce da posição da etapa no produto (decidido em
// 03/10/2026). Depois de outra etapa, o processo que prefere herdar passa a
// usar a medida da base e a quantidade dela; o que prefere a própria entra
// como está. Começando um caminho, pede medida e quantidade próprias
const rulesByPosition = (
  rules: SaleRules,
  afterBase: AfterBase,
  dependsOn: string[],
): SaleRules => {
  if (dependsOn.length && afterBase === 'INHERIT') {
    return { ...rules, dimension: 'SAME_AS_PARENT', quantityMode: 'HIDDEN_ONE' }
  }
  if (rules.dimension !== 'SAME_AS_PARENT') return { ...rules }
  return {
    ...rules,
    dimension: 'FREE_SIZE',
    quantityMode:
      rules.quantityMode === 'HIDDEN_ONE' ? 'FREE' : rules.quantityMode,
  }
}

const fromTemplate = (
  template: Template,
  // As etapas de que esta depende (FL-1). A primeira é a referência de
  // medida (MS-5)
  dependsOn: string[],
): AssemblyBlock => {
  const { afterBase, lines, ...rest } = template
  return {
    ...rest,
    id: `b${uid()}`,
    role: dependsOn.length ? 'FINISHING' : 'BASE',
    dependsOn: [...dependsOn],
    baseBlockId: dependsOn[0] ?? null,
    originalRules: rulesByPosition(rest.originalRules, afterBase, dependsOn),
    localRules: null,
    lines: lines.map((line) => ({
      ...structuredClone(line),
      id: `l${uid()}`,
      // O molde vem do processo (templateOf), que já tem o id de cada linha
      sourceLineId: (line as Partial<AssemblyLine>).id,
      overridden: false,
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Processos (MS-11): o processo é guardado no mesmo formato da etapa da
 * composição — linhas de escolha e lista, opções com consumo próprio, regras
 * de venda, tempo e tipo de tarefa. A tela de Processos edita esse formato,
 * e o produto que inclui o processo acompanha a montagem dele (CP-21)
 * ------------------------------------------------------------------------- */

type ProcessMeta = {
  afterBase: AfterBase
  sellerInstructions: string
  active: boolean
}

const PROCESS_PREFIX = 'processo:'
const processStore = new Map<
  string,
  { block: AssemblyBlock; meta: ProcessMeta }
>()

catalog.forEach((template) => {
  const { afterBase, lines, processId, ...rest } = template
  processStore.set(processId, {
    block: {
      ...rest,
      id: `p-${processId}`,
      role: 'BASE',
      processId: null,
      dependsOn: [],
      baseBlockId: null,
      localRules: null,
      lines: lines.map((line) => ({
        ...line,
        id: `l${uid()}`,
        overridden: false,
      })),
    },
    meta: { afterBase, sellerInstructions: '', active: true },
  })
})

// As etapas seguintes usuais (FL-7): um par (processo → processo seguinte),
// guardado uma vez e editável dos dois lados. "+ etapa seguinte" mostra
// primeiro os marcados; "ver todos" abre o resto. Nada é bloqueado
const pairKey = (fromProcessId: string, toProcessId: string) =>
  `${fromProcessId}→${toProcessId}`
const usualNext = new Set<string>(
  [
    ['impressao-solvente', 'acabamento-banner'],
    ['impressao-solvente', 'bainha'],
    ['impressao-solvente', 'ilhos'],
    ['impressao-solvente', 'laminacao'],
    ['bainha', 'ilhos'],
    ['impressao-digital', 'corte-guilhotina'],
    ['arte', 'impressao-solvente'],
    ['arte', 'impressao-digital'],
    ['acabamento-banner', 'instalacao'],
    ['laminacao', 'instalacao'],
  ].map(([from, to]) => pairKey(from, to)),
)

const templateOf = (processId: string): Template | undefined => {
  const entry = processStore.get(processId)
  if (!entry) return undefined
  return {
    ...entry.block,
    processId,
    afterBase: entry.meta.afterBase,
    lines: entry.block.lines,
  } as Template
}

const processTemplates = (onlyActive = true) =>
  Array.from(processStore.keys())
    .filter((id) => !onlyActive || processStore.get(id)!.meta.active)
    .map((id) => templateOf(id)!)

// O Banner do legado (ITP1): impressão solvente + acabamento de banner
const bannerBase = fromTemplate(templateOf('impressao-solvente')!, [])
const assemblies: ProductAssembly[] = [
  {
    productId: 'banner',
    name: 'Banner 440 com bastão',
    code: 'PRD-01',
    status: 'RELEASED',
    dimension: 'SALE',
    unitKind: 'AREA',
    unitPrice: 4500,
    measure: { quantity: 1, width: 0.9, height: 1.2 },
    unitAmount: 1,
    allowEditValues: true,
    allowEditDescription: true,
    priceTiers: [],
    technicalDescription:
      'Lona 440 g impressa em solvente, com bastão de madeira, ponteiras e cordão.',
    blocks: [
      bannerBase,
      fromTemplate(templateOf('acabamento-banner')!, [bannerBase.id]),
    ],
    variations: [
      {
        // A mesma composição com a lona mais barata e preço próprio
        id: 'v-economica',
        name: 'Econômico · lona 380',
        unitPrice: 3900,
        overrides: [
          {
            blockId: bannerBase.id,
            lineId: bannerBase.lines[1].id,
            selectedId: 'lona380',
          },
        ],
      },
      {
        // Mais qualidade de impressão, e o preço do produto
        id: 'v-alta',
        name: 'Alta definição · 6 passes',
        unitPrice: null,
        overrides: [
          {
            blockId: bannerBase.id,
            lineId: bannerBase.lines[0].id,
            selectedId: 'solv6',
          },
        ],
      },
    ],
  },
]

// O cartão de visita da regra AP-1: 5 × 9 cm, mil unidades. Na A3 cabem
// 24 na melhor posição (20 na outra) e são 42 folhas; o 4x4 passa cada
// folha duas vezes (PV-7). A tabela por faixa é a da gráfica (FQ-1)
const cartaoBase = fromTemplate(templateOf('impressao-digital')!, [])
assemblies.push({
  productId: 'cartao',
  name: 'Cartão de visita',
  code: 'PRD-02',
  status: 'RELEASED',
  dimension: 'SALE',
  unitKind: 'UNITY',
  unitPrice: 30,
  measure: { quantity: 1000, width: 0.05, height: 0.09 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [
    { from: 1, unitPrice: 35 },
    { from: 101, unitPrice: 28 },
    { from: 501, unitPrice: 22 },
    { from: 2001, unitPrice: 18 },
  ],
  technicalDescription: 'Cartão 5 × 9 cm em couchê 300 g, impressão colorida.',
  blocks: [
    cartaoBase,
    fromTemplate(templateOf('corte-guilhotina')!, [cartaoBase.id]),
  ],
  variations: [
    {
      id: 'v-4x4',
      name: '4x4 · frente e verso',
      unitPrice: null,
      overrides: [
        { blockId: cartaoBase.id, lineId: cartaoBase.lines[1].id, perUnit: 2 },
      ],
    },
  ],
})

// O quadro de metalon é uma parte (IP-9): produto que não se vende sozinho e
// entra na composição de outros — a placa em lona com quadro de ferro
const metalon = (
  id: string,
  name: string,
  unitCost: number,
  x: number,
  y: number,
) => ({
  id,
  name,
  unit: 'm',
  unitCost,
  unitSale: unitCost * 2,
  // Lados do perfil (MT-10.1), para a fórmula descontar o certo
  profile: { x, y, barLength: 6000 },
})

assemblies.push({
  productId: 'quadro-metalon',
  name: 'Quadro de metalon',
  code: 'PRT-01',
  status: 'PART',
  dimension: 'SALE',
  unitKind: 'UNITY',
  unitPrice: null,
  measure: { quantity: 1, width: 2, height: 1 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [],
  technicalDescription: 'Quadro em metalon 20 × 20, soldado, com fundo.',
  blocks: [
    {
      id: `b${uid()}`,
      processId: null,
      name: 'Estrutura soldada',
      sector: 'Produção',
      role: 'BASE',
      dependsOn: [],
      baseBlockId: null,
      setupMinutes: 20,
      sectorHourCost: HOUR['Produção'],
      taskType: 'Produção',
      originalRules: { ...baseRules },
      localRules: null,
      lines: [
        {
          id: `l${uid()}`,
          name: 'Metalon',
          kind: 'MATERIAL',
          mode: 'CHOOSE',
          options: [
            metalon('metalon20', 'Metalon 20 × 20', 1000, 20, 20),
            metalon('metalon30', 'Metalon 30 × 30', 1600, 30, 30),
          ],
          selectedId: 'metalon20',
          perUnit: 1,
          formula: 'PER_PERIMETER',
          lossPercent: 10,
          minimum: null,
          overridden: false,
        },
        {
          id: `l${uid()}`,
          name: 'Solda',
          kind: 'LABOR',
          mode: 'SINGLE',
          options: [labor('Produção')],
          selectedId: 'mo-Produção',
          perUnit: 15,
          formula: 'PER_PERIMETER',
          lossPercent: 0,
          minimum: null,
          overridden: false,
        },
      ],
    },
  ],
  variations: [],
})

// A placa é o exemplo do time para o fluxo (FL-4): dois caminhos que correm
// em paralelo — criação → impressão da lona, e a estrutura → pintura, com a
// cantoneira opcional (IP-28) — e se encontram na instalação, que depende
// dos dois. O quadro entra como parte (IP-9)
const placaArte = fromTemplate(templateOf('arte')!, [])
const placaPrint = fromTemplate(templateOf('impressao-solvente')!, [
  placaArte.id,
])
const placaFrame: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  partProductId: 'quadro-metalon',
  name: 'Quadro de metalon',
  sector: 'Produção',
  role: 'BASE',
  dependsOn: [],
  baseBlockId: null,
  setupMinutes: 0,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...baseRules },
  localRules: null,
  lines: [],
}
const placaPaint: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  name: 'Pintura da estrutura',
  sector: 'Produção',
  role: 'FINISHING',
  dependsOn: [placaFrame.id],
  baseBlockId: placaFrame.id,
  setupMinutes: 10,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...finishingRules },
  localRules: null,
  lines: [
    {
      id: `l${uid()}`,
      name: 'Tinta',
      kind: 'MATERIAL',
      mode: 'SINGLE',
      options: [
        {
          id: 'tinta-esmalte',
          name: 'Esmalte sintético preto',
          unit: 'l',
          unitCost: 3200,
          unitSale: 5500,
        },
      ],
      selectedId: 'tinta-esmalte',
      perUnit: 0.05,
      formula: 'PER_PERIMETER',
      lossPercent: 10,
      minimum: 0.1,
      overridden: false,
    },
    {
      id: `l${uid()}`,
      name: 'Pintura',
      kind: 'LABOR',
      mode: 'SINGLE',
      options: [labor('Produção')],
      selectedId: 'mo-Produção',
      perUnit: 4,
      formula: 'PER_PERIMETER',
      lossPercent: 0,
      minimum: null,
      overridden: false,
    },
  ],
}
const placaEdge: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  name: 'Acabamento lateral',
  sector: 'Produção',
  role: 'FINISHING',
  dependsOn: [placaPaint.id],
  baseBlockId: placaFrame.id,
  setupMinutes: 0,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...finishingRules },
  localRules: null,
  lines: [
    {
      id: `l${uid()}`,
      name: 'Cantoneira',
      kind: 'MATERIAL',
      mode: 'SINGLE',
      options: [
        {
          id: 'cantoneira',
          name: 'Cantoneira de alumínio',
          unit: 'm',
          unitCost: 1000,
          unitSale: 2000,
        },
      ],
      selectedId: 'cantoneira',
      perUnit: 1.1,
      formula: 'PER_PERIMETER',
      lossPercent: 0,
      minimum: null,
      overridden: false,
      optional: true,
      optionalDefault: false,
    },
  ],
}
// O ponto de encontro (FL-4): a instalação espera a lona e a estrutura
const placaInstall = fromTemplate(templateOf('instalacao')!, [
  placaPrint.id,
  placaEdge.id,
])
assemblies.push({
  productId: 'placa-quadro',
  name: 'Placa em lona com quadro de ferro',
  code: 'PRD-03',
  status: 'RELEASED',
  dimension: 'SALE',
  unitKind: 'AREA',
  unitPrice: 18000,
  measure: { quantity: 1, width: 2, height: 1 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [],
  technicalDescription: 'Lona impressa esticada em quadro de metalon.',
  blocks: [
    placaArte,
    placaPrint,
    placaFrame,
    placaPaint,
    placaEdge,
    placaInstall,
  ],
  variations: [],
})

// O painel de ACM é uma parte que tem outra parte por dentro (IP-9, três
// níveis): o quadro de metalon, com a chapa aplicada em cima
const acmFrame: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  partProductId: 'quadro-metalon',
  name: 'Quadro de metalon',
  sector: 'Produção',
  role: 'BASE',
  dependsOn: [],
  baseBlockId: null,
  setupMinutes: 0,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...baseRules },
  localRules: null,
  lines: [],
}
assemblies.push({
  productId: 'painel-acm',
  name: 'Painel de ACM',
  code: 'PRT-02',
  status: 'PART',
  dimension: 'SALE',
  unitKind: 'AREA',
  unitPrice: null,
  measure: { quantity: 1, width: 3, height: 1 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [],
  technicalDescription: 'Chapa de ACM aplicada sobre quadro de metalon.',
  blocks: [
    acmFrame,
    {
      id: `b${uid()}`,
      processId: null,
      name: 'Aplicação do ACM',
      sector: 'Produção',
      role: 'FINISHING',
      dependsOn: [acmFrame.id],
      baseBlockId: acmFrame.id,
      setupMinutes: 15,
      sectorHourCost: HOUR['Produção'],
      taskType: 'Produção',
      originalRules: { ...finishingRules },
      localRules: null,
      lines: [
        {
          id: `l${uid()}`,
          name: 'Chapa',
          kind: 'MATERIAL',
          mode: 'CHOOSE',
          options: [
            {
              id: 'acm-branco',
              name: 'ACM 3 mm branco',
              unit: 'm²',
              unitCost: 9800,
              unitSale: 16000,
            },
            {
              id: 'acm-preto',
              name: 'ACM 3 mm preto',
              unit: 'm²',
              unitCost: 10400,
              unitSale: 17000,
            },
          ],
          selectedId: 'acm-branco',
          perUnit: 1,
          formula: 'PER_AREA',
          lossPercent: 15,
          minimum: null,
          overridden: false,
        },
        {
          id: `l${uid()}`,
          name: 'Montagem',
          kind: 'LABOR',
          mode: 'SINGLE',
          options: [labor('Produção')],
          selectedId: 'mo-Produção',
          perUnit: 30,
          formula: 'PER_AREA',
          lossPercent: 0,
          minimum: null,
          overridden: false,
        },
      ],
    },
  ],
  variations: [],
})

// A fachada (IP-9.1): a criação abre o trabalho; as partes correm em
// paralelo, cada uma com a composição dela; a montagem junta tudo e a
// instalação fecha. É o segundo produto que o time pediu para validar o
// fluxo (FL-5)
const fachadaArte = fromTemplate(templateOf('arte')!, [])
const fachadaPanel: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  partProductId: 'painel-acm',
  name: 'Painel de ACM',
  sector: 'Produção',
  role: 'BASE',
  dependsOn: [fachadaArte.id],
  baseBlockId: fachadaArte.id,
  setupMinutes: 0,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...baseRules },
  localRules: null,
  lines: [],
}
const fachadaLetters = fromTemplate(templateOf('impressao-solvente')!, [
  fachadaArte.id,
])
fachadaLetters.localName = 'Adesivo das letras'
const fachadaAssembly: AssemblyBlock = {
  id: `b${uid()}`,
  processId: null,
  name: 'Montagem da fachada',
  sector: 'Produção',
  role: 'FINISHING',
  dependsOn: [fachadaPanel.id, fachadaLetters.id],
  baseBlockId: fachadaPanel.id,
  setupMinutes: 30,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...finishingRules },
  localRules: null,
  lines: [
    {
      id: `l${uid()}`,
      name: 'Montagem',
      kind: 'LABOR',
      mode: 'SINGLE',
      options: [labor('Produção')],
      selectedId: 'mo-Produção',
      perUnit: 40,
      formula: 'PER_AREA',
      lossPercent: 0,
      minimum: null,
      overridden: false,
    },
  ],
}
assemblies.push({
  productId: 'fachada-acm',
  name: 'Fachada em ACM com letras',
  code: 'PRD-04',
  status: 'RELEASED',
  dimension: 'SALE',
  unitKind: 'AREA',
  unitPrice: 65000,
  measure: { quantity: 1, width: 6, height: 1.2 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [],
  technicalDescription:
    'Painel de ACM sobre estrutura metálica, com letras em adesivo e instalação.',
  blocks: [
    fachadaArte,
    fachadaPanel,
    fachadaLetters,
    fachadaAssembly,
    fromTemplate(templateOf('instalacao')!, [fachadaAssembly.id]),
  ],
  variations: [],
})

// Cada processo tem um "produto" técnico com uma etapa só: é o que deixa as
// ações da composição (linhas, opções, regras) valerem também para ele
const processWrapper = (processId: string, block: AssemblyBlock) => ({
  productId: PROCESS_PREFIX + processId,
  name: block.name,
  code: '',
  status: 'DRAFT' as const,
  dimension: 'SALE' as const,
  unitKind: 'AREA' as const,
  unitPrice: null,
  measure: { quantity: 1, width: 1, height: 1 },
  unitAmount: 1,
  allowEditValues: true,
  allowEditDescription: true,
  priceTiers: [],
  technicalDescription: '',
  blocks: [block],
  variations: [],
})
processStore.forEach((entry, processId) =>
  assemblies.push(processWrapper(processId, entry.block)),
)

const isProcessHost = (productId: string) =>
  productId.startsWith(PROCESS_PREFIX)

// O item montado no orçamento (ORC-11) vive aqui como um produto técnico,
// para usar as mesmas ações da composição. Não é cadastro: não aparece como
// parte, não conta como produto composto e não entra em "Usado em"
const DRAFT_PREFIX = 'orcamento:'
const isDraft = (productId: string) => productId.startsWith(DRAFT_PREFIX)
// Variação do produto (03/10/2026): outra composição, cópia independente,
// com id "<produto>::v:<id>". Não é cadastro: não aparece nas listas
const VARIANT_SEP = '::v:'
const isVariant = (productId: string) => productId.includes(VARIANT_SEP)
const baseOf = (productId: string) => productId.split(VARIANT_SEP)[0]
const isHidden = (productId: string) =>
  isProcessHost(productId) || isDraft(productId) || isVariant(productId)

/* ---------------------------------------------------------------------------
 * O fluxo (FL-1): cada etapa depende de nenhuma, uma ou várias anteriores
 * ------------------------------------------------------------------------- */

// As etapas na ordem do fluxo: toda etapa vem depois das que ela depende e,
// entre as que já podem entrar, vale a ordem em que foram criadas
const orderBlocks = (blocks: AssemblyBlock[]) => {
  const ids = new Set(blocks.map((block) => block.id))
  const done = new Set<string>()
  const result: AssemblyBlock[] = []
  let pending = [...blocks]
  while (pending.length) {
    const ready = pending.filter((block) =>
      block.dependsOn.every((id) => !ids.has(id) || done.has(id)),
    )
    // Um laço não deveria existir; se existir, segue a ordem gravada
    const batch = ready.length ? ready : [pending[0]]
    batch.forEach((block) => {
      done.add(block.id)
      result.push(block)
    })
    pending = pending.filter((block) => !done.has(block.id))
  }
  return result
}

// `from` chega em `target` seguindo as dependências? Serve para impedir que
// "ligar a…" feche um laço
const dependsTransitively = (
  blocks: AssemblyBlock[],
  from: string,
  target: string,
  seen = new Set<string>(),
): boolean => {
  if (from === target) return true
  if (seen.has(from)) return false
  seen.add(from)
  const block = blocks.find((item) => item.id === from)
  return !!block?.dependsOn.some((id) =>
    dependsTransitively(blocks, id, target, seen),
  )
}

// Inserir no meio da ligação (FL-5): a etapa nova passa a depender de `after`
// e `before`, que dependia de `after`, passa a depender da nova
const wireBetween = (
  blocks: AssemblyBlock[],
  block: AssemblyBlock,
  before: string | undefined,
) => {
  if (!before) return
  const next = blocks.find((item) => item.id === before)
  if (!next) return
  const replaced = block.dependsOn.filter((id) => next.dependsOn.includes(id))
  if (!replaced.length) return
  next.dependsOn = Array.from(
    new Set(
      next.dependsOn.map((id) => (replaced.includes(id) ? block.id : id)),
    ),
  )
  if (next.baseBlockId && replaced.includes(next.baseBlockId)) {
    next.baseBlockId = block.id
  }
}

// Tirar uma etapa do meio: quem dependia dela passa a depender do que ela
// dependia, para o fluxo não se partir
const unwire = (blocks: AssemblyBlock[], removedId: string) => {
  const removed = blocks.find((item) => item.id === removedId)
  if (!removed) return blocks
  return blocks
    .filter((item) => item.id !== removedId)
    .map((item) => {
      if (!item.dependsOn.includes(removedId)) return item
      const dependsOn = Array.from(
        new Set([
          ...item.dependsOn.filter((id) => id !== removedId),
          ...removed.dependsOn,
        ]),
      )
      return {
        ...item,
        dependsOn,
        baseBlockId:
          item.baseBlockId === removedId
            ? (removed.baseBlockId ?? removed.dependsOn[0] ?? null)
            : item.baseBlockId,
      }
    })
}

// O fluxo como a tela desenha (FL-5), com o que a parte tem por dentro até
// três níveis (IP-9)
const flowOf = (assembly: ProductAssembly, depth = 0): FlowStage[] =>
  orderBlocks(assembly.blocks).map((block) => {
    const partSource = block.partProductId
      ? assemblies.find((item) => item.productId === block.partProductId)
      : null
    return {
      id: block.id,
      name: block.localName || block.name,
      sector: block.sector,
      dependsOn: block.dependsOn,
      processId: block.processId,
      partProductId: block.partProductId ?? null,
      partFlow: partSource && depth < 2 ? flowOf(partSource, depth + 1) : null,
    }
  })

/* ---------------------------------------------------------------------------
 * Vínculo com o processo (CP-21): a etapa incluída de um processo acompanha a
 * montagem dele. Mudar o processo muda os produtos que o usam; o que o produto
 * ajustou só para ele (linha ajustada, linha só dele, linha tirada, nome,
 * regras e tipo de tarefa) continua sendo do produto. O custo nunca dependeu
 * disso: ele vem do recurso
 * ------------------------------------------------------------------------- */

const syncBlock = (block: AssemblyBlock) => {
  if (!block.processId || block.partProductId) return
  const source = processStore.get(block.processId)?.block
  if (!source) return

  block.name = source.name
  block.sector = source.sector
  block.sectorHourCost = source.sectorHourCost
  block.setupMinutes = source.setupMinutes
  block.taskType = block.localTaskType ?? source.taskType
  block.originalRules = source.originalRules

  const removed = new Set(block.removedSourceLineIds || [])
  const sourceById = new Map(source.lines.map((line) => [line.id, line]))
  const lines: AssemblyLine[] = []

  block.lines.forEach((line) => {
    if (!line.sourceLineId) {
      lines.push(line)
      return
    }
    const origin = sourceById.get(line.sourceLineId)
    if (!origin) {
      // O processo tirou a linha: a que foi ajustada aqui fica como deste produto
      if (line.overridden) {
        lines.push({
          ...line,
          sourceLineId: undefined,
          overridden: false,
          addedHere: true,
        })
      }
      return
    }
    if (line.overridden) {
      lines.push(line)
      return
    }
    const next = structuredClone(origin)
    lines.push({
      ...next,
      id: line.id,
      sourceLineId: origin.id,
      overridden: false,
      addedHere: undefined,
      // A opção escolhida é o uso normal da linha neste produto
      selectedId: next.options.some((option) => option.id === line.selectedId)
        ? line.selectedId
        : next.selectedId,
    })
  })

  // Linha nova no processo entra na mesma posição que tem lá
  source.lines.forEach((origin, index) => {
    if (removed.has(origin.id)) return
    if (lines.some((line) => line.sourceLineId === origin.id)) return
    const before = new Set(source.lines.slice(0, index).map((line) => line.id))
    let at = 0
    lines.forEach((line, position) => {
      if (line.sourceLineId && before.has(line.sourceLineId)) at = position + 1
    })
    lines.splice(at, 0, {
      ...structuredClone(origin),
      id: `l${uid()}`,
      sourceLineId: origin.id,
      overridden: false,
      addedHere: undefined,
    })
  })

  block.lines = lines
  // A linha que o processo também tirou não precisa mais do registro
  block.removedSourceLineIds = Array.from(removed).filter((id) =>
    sourceById.has(id),
  )
}

const syncLinks = () =>
  assemblies.forEach((assembly) => {
    if (isProcessHost(assembly.productId)) return
    assembly.blocks.forEach(syncBlock)
    assembly.variations.forEach((variation) =>
      variation.extraBlocks?.forEach(syncBlock),
    )
  })

// A composição nasce com o que o cadastro do produto já tem (CP-16). Só a
// primeira vez: depois que alguém mexeu (etapa, valor, nome), a semente não
// sobrescreve mais
/* ---------------------------------------------------------------------------
 * Campos do orçamento (IP-4): do produto, lidos pelas linhas pelo nome
 * ------------------------------------------------------------------------- */

const fieldKey = (name: string) => name.trim().toLowerCase()

const findField = (assembly: ProductAssembly, name: string) =>
  (assembly.fields || []).find(
    (field) => fieldKey(field.name) === fieldKey(name),
  )

// Garante o campo que a linha lê e devolve ele
const ensureField = (
  assembly: ProductAssembly,
  name: string,
  defaultValue = 0,
) => {
  assembly.fields = assembly.fields || []
  const found = findField(assembly, name)
  if (found) return found
  const field: QuoteField = { id: `f${uid()}`, name: name.trim(), defaultValue }
  assembly.fields.push(field)
  return field
}

// Toda linha que lê um campo garante que ele exista no produto: vale para o
// processo incluído, a biblioteca importada e os exemplos. O padrão vem do
// campo extra legado da etapa, quando houver
const ensureFields = (assembly: ProductAssembly) => {
  assembly.blocks.forEach((block) => {
    const rules = block.localRules ?? block.originalRules
    block.lines.forEach((line) => {
      if (!line.fieldName) return
      ensureField(
        assembly,
        line.fieldName,
        rules.extraField === 'NONE' ? 0 : rules.extraFieldDefault,
      )
    })
  })
}

// Em que etapas cada campo é lido: pela linha que aponta para ele ou pela
// fórmula do produto que o cita
const fieldUsage = (assembly: ProductAssembly) =>
  (assembly.fields || []).map((field) => ({
    ...field,
    usedBy: assembly.blocks
      .filter((block) =>
        block.lines.some((line) => {
          if (
            line.fieldName &&
            fieldKey(line.fieldName) === fieldKey(field.name)
          )
            return true
          if (line.formula !== 'CUSTOM' || !line.formulaId) return false
          const formula = (assembly.formulas || []).find(
            (item) => item.id === line.formulaId,
          )
          return !!formula && formulaUsesName(formula.expression, field.name)
        }),
      )
      .map((block) => block.localName || block.name),
  }))

/* ---------------------------------------------------------------------------
 * Fórmulas do produto (IP-2): a conta escrita, só deste produto
 * ------------------------------------------------------------------------- */

// O que a fórmula pode ler nesta etapa: as medidas, o tempo e os campos
// As referências do material escolhido em cada linha (MT-10.1, CP-18):
// "montante · X" e "montante · Y" em metros, para a travessa descontar o
// lado do perfil que estiver na linha, seja ele qual for
const lineRefVars = (blocks: AssemblyBlock[]): FormulaVars => {
  const vars: FormulaVars = {}
  blocks.forEach((block) =>
    block.lines.forEach((line) => {
      const selected =
        line.options.find((option) => option.id === line.selectedId) ||
        line.options[0]
      if (!selected) return
      if (selected.profile) {
        vars[`${line.name} · X`] = selected.profile.x / 1000
        vars[`${line.name} · Y`] = selected.profile.y / 1000
      }
      if (selected.sheet) {
        vars[`${line.name} · largura`] = selected.sheet.width
        vars[`${line.name} · altura`] = selected.sheet.height
      }
      if (selected.weight) vars[`${line.name} · peso`] = selected.weight
    }),
  )
  return vars
}

const formulaVars = (
  assembly: ProductAssembly,
  measure: AssemblyMeasure,
  time: number | null,
  // A etapa que está calculando; sem ela, as linhas de todas as etapas
  block?: AssemblyBlock,
): FormulaVars => ({
  largura: measure.width,
  altura: measure.height,
  área: measure.width * measure.height,
  perímetro: 2 * (measure.width + measure.height),
  quantidade: measure.quantity,
  tempo: time ?? 0,
  ...Object.fromEntries(
    (assembly.fields || []).map((field) => [field.name, field.defaultValue]),
  ),
  ...lineRefVars(block ? [block] : assembly.blocks),
})

// Onde cada fórmula é usada, e se ela calcula na medida padrão do produto
const formulaUsage = (assembly: ProductAssembly) =>
  (assembly.formulas || []).map((formula) => ({
    ...formula,
    usedBy: assembly.blocks
      .filter((block) =>
        block.lines.some(
          (line) => line.formula === 'CUSTOM' && line.formulaId === formula.id,
        ),
      )
      .map((block) => block.localName || block.name),
    error: evaluateFormula(
      formula.expression,
      formulaVars(assembly, assembly.measure, 0),
    ).error,
  }))

// A etapa tem linha cujo tipo de cálculo é o tempo informado pelo vendedor
const TIME_FORMULAS = ['PER_TIME', 'EQUAL_TIME', 'TIME_TIMES_EXTRA']
const blockHasTimeLine = (block: AssemblyBlock) =>
  block.lines.some((line) => TIME_FORMULAS.includes(line.formula))

const untouched = (assembly: ProductAssembly) =>
  assembly.name === 'Produto' &&
  assembly.unitPrice === null &&
  assembly.blocks.length === 0

const applySeed = (assembly: ProductAssembly, seed: AssemblySeed) => {
  assembly.name = seed.name || assembly.name
  assembly.code = seed.code || assembly.code
  assembly.unitKind = seed.unitKind || assembly.unitKind
  assembly.unitPrice = seed.unitPrice
  assembly.measure = {
    quantity: 1,
    width: seed.width && seed.width > 0 ? seed.width : 1,
    height: seed.height && seed.height > 0 ? seed.height : 1,
  }
  assembly.technicalDescription = seed.technicalDescription || ''
  assembly.allowEditValues = seed.allowEditValues ?? true
  assembly.allowEditDescription = seed.allowEditDescription ?? true
}

const findOrCreate = (productId: string, seed?: AssemblySeed) => {
  syncLinks()
  let found = assemblies.find((item) => item.productId === productId)
  if (!found) {
    found = {
      productId,
      name: 'Produto',
      code: '',
      status: 'DRAFT',
      dimension: 'SALE',
      unitKind: 'UNITY',
      unitPrice: null,
      measure: { quantity: 1, width: 1, height: 1 },
      unitAmount: 1,
      allowEditValues: true,
      allowEditDescription: true,
      priceTiers: [],
      technicalDescription: '',
      blocks: [],
      variations: [],
      fields: [],
      formulas: [],
    }
    assemblies.push(found)
  }
  if (seed && untouched(found)) applySeed(found, seed)
  return found
}

/* ---------------------------------------------------------------------------
 * O cálculo
 * ------------------------------------------------------------------------- */

const round = (value: number, digits = 2) =>
  Math.round(value * 10 ** digits) / 10 ** digits

const lineQuantity = (
  line: AssemblyLine,
  measure: AssemblyMeasure,
  extra: number,
  // Campo tempo da etapa, em minutos; sem ele, o consumo faz o papel (IP-32)
  time: number | null = null,
) => {
  const { quantity: n, width: w, height: h } = measure
  const area = w * h
  const perimeter = 2 * (w + h)
  const k = line.perUnit

  switch (line.formula) {
    case 'FIXED':
      return k
    case 'SELLER':
      return null
    case 'PER_AREA':
      return k * area * n
    case 'PER_UNIT':
      return k * n
    case 'PER_PERIMETER':
      return k * perimeter * n
    case 'PER_WIDTH':
      return k * w * n
    case 'PER_HEIGHT':
      return k * h * n
    case 'PER_EXTRA':
      return k * extra * n
    // As três do campo tempo, como no legado (11, 12 e 13)
    case 'PER_TIME':
      return time === null ? k * n : time * n
    case 'PER_PERIMETER_DIV_EXTRA':
      // Quantos cabem no perímetro: nunca fração de ilhós
      return extra > 0 ? Math.ceil(perimeter / extra) * k * n : null
    case 'TIME_TIMES_EXTRA':
      return time === null ? k * extra : k * time * extra
    case 'EQUAL_TIME':
      return time === null ? k : time
    case 'PER_WIDTH_EXTRA':
      return k * w * extra * n
    case 'PER_HEIGHT_EXTRA':
      return k * h * extra * n
    case 'EXTRA_ONLY':
      return k * extra
    case 'PER_AREA_DIV_EXTRA':
      return extra > 0 ? (k * area * n) / extra : null
    case 'PER_PERIMETER_EXTRA':
      return k * perimeter * extra * n
    case 'DIV_EXTRA':
      return extra > 0 ? k / extra : null
    case 'AREA_EXTRA':
      return k * area * extra
    case 'PER_AREA_EXTRA':
      return k * area * extra * n
    default:
      return null
  }
}

// Quantas peças cabem na folha, testando as duas posições (AP-1). Margem e
// espaçamento ficam em zero por padrão (AP-3), como no exemplo da regra
// Com margem na borda e espaçamento entre peças (AP-3), em metros
const fitCount = (
  sheetW: number,
  sheetH: number,
  pieceW: number,
  pieceH: number,
  margin = 0,
  gap = 0,
) => {
  const usableW = sheetW - 2 * margin
  const usableH = sheetH - 2 * margin
  if (pieceW <= 0 || pieceH <= 0 || usableW <= 0 || usableH <= 0) return 0
  return (
    Math.floor((usableW + gap) / (pieceW + gap) + 1e-9) *
    Math.floor((usableH + gap) / (pieceH + gap) + 1e-9)
  )
}

const sheetYieldOf = (
  option: ResourceOption,
  pieceW: number,
  pieceH: number,
  pieces: number,
  settings: { marginMm?: number; gapMm?: number; wholeSheets?: boolean } = {},
): SheetYield | null => {
  if (!option.sheet) return null
  const { width, height } = option.sheet
  const marginMm = settings.marginMm || 0
  const gapMm = settings.gapMm || 0
  const margin = marginMm / 1000
  const gap = gapMm / 1000
  const firstFit = fitCount(width, height, pieceW, pieceH, margin, gap)
  const secondFit = fitCount(width, height, pieceH, pieceW, margin, gap)
  const perSheet = Math.max(firstFit, secondFit)
  const sheets = perSheet ? Math.ceil(pieces / perSheet) : 0
  return {
    sheetName: option.name,
    firstFit,
    secondFit,
    perSheet,
    sheets,
    leftover: sheets * perSheet - pieces,
    // Padrão: cobra a folha inteira, porque a sobra raramente se aproveita
    charged:
      settings.wholeSheets === false && perSheet
        ? round(pieces / perSheet, 3)
        : sheets,
    marginMm,
    gapMm,
  }
}

// A faixa vale para o total da venda (FQ-2): a maior que a quantidade alcança
const tierFor = (tiers: PriceTier[], quantity: number) =>
  [...tiers]
    .sort((a, b) => b.from - a.from)
    .find((tier) => quantity >= tier.from) || null

const applyVariation = (
  assembly: ProductAssembly,
  variation: ProductVariation | null,
) =>
  variation
    ? {
        ...assembly,
        // As etapas só da variação entram depois das da base (PV-7)
        blocks: [...assembly.blocks, ...(variation.extraBlocks || [])].map(
          (block) => ({
            ...block,
            lines: block.lines.map((line) => {
              const override = variation.overrides.find(
                (item) => item.blockId === block.id && item.lineId === line.id,
              )
              return override
                ? {
                    ...line,
                    ...(override.selectedId !== undefined && {
                      selectedId: override.selectedId,
                    }),
                    // O consumo da variação vale para qualquer opção escolhida
                    ...(override.perUnit !== undefined && {
                      perUnit: override.perUnit,
                      options: line.options.map((option) => ({
                        ...option,
                        perUnit: undefined,
                      })),
                    }),
                  }
                : line
            }),
          }),
        ),
      }
    : assembly

const compute = (
  source: ProductAssembly,
  variation: ProductVariation | null = null,
  // Parte dentro de parte tem limite: evita laço se alguém se incluir
  depth = 0,
): ComputedAssembly => {
  ensureFields(source)
  const assembly = applyVariation(source, variation)
  // Sem preço próprio, a variação vale o preço do produto (PV-4); com
  // tabela por faixa, vale a faixa da quantidade (FQ-1)
  // A variação pode ter tabela própria (FQ-4); com ela, a faixa vale mais
  // que o preço único da variação
  const tiersFromVariation = !!variation?.priceTiers
  const effectiveTiers = variation?.priceTiers ?? assembly.priceTiers
  const tier = tierFor(effectiveTiers, assembly.measure.quantity)
  const unitPrice =
    (tiersFromVariation ? tier?.unitPrice : undefined) ??
    variation?.unitPrice ??
    tier?.unitPrice ??
    assembly.unitPrice
  const { measure } = assembly
  const area = round(measure.width * measure.height, 4)
  const blocks: ComputedBlock[] = []
  // O consumo das partes entra no resumo do produto
  const partSummaries: ResourceSummary[][] = []

  // Na ordem do fluxo: a etapa que usa a medida de outra vem depois dela
  for (const block of orderBlocks(assembly.blocks)) {
    const rules = block.localRules ?? block.originalRules
    const base = blocks.find((item) => item.id === block.baseBlockId)
    const reference = base?.measure ?? measure

    const size =
      rules.dimension === 'SAME_AS_PARENT'
        ? { width: reference.width, height: reference.height }
        : rules.dimension === 'NONE'
          ? { width: 0, height: 0 }
          : { width: measure.width, height: measure.height }

    const baseQuantity = rules.followsBase ? reference.quantity : 1
    const quantity =
      rules.quantityMode === 'FREE'
        ? measure.quantity
        : rules.quantityMode === 'AREA_RATIO'
          ? Math.max(
              1,
              Math.floor(
                (reference.width * reference.height) /
                  Math.max(size.width * size.height, 0.0001),
              ),
            ) * baseQuantity
          : baseQuantity

    const blockMeasure = { quantity, ...size }
    const extra = rules.extraField === 'NONE' ? 0 : rules.extraFieldDefault
    // O tempo é das linhas de mão de obra com tipo "tempo informado": sem
    // valor informado na venda, vale o consumo da linha (tempo padrão)
    const time =
      (rules.timeField || blockHasTimeLine(block)) && rules.timeFieldDefault
        ? rules.timeFieldDefault
        : null

    const lines: ComputedLine[] = block.lines.map((line) => {
      const selected =
        line.mode === 'LIST'
          ? null
          : line.options.find((option) => option.id === line.selectedId) ||
            line.options[0] ||
            null

      // Aproveitamento de folha (AP-1): as peças são a quantidade da etapa,
      // do tamanho da etapa; a folha vem da opção escolhida
      const referenceSheet =
        line.formula === 'SHEET_YIELD'
          ? selected?.sheet
            ? selected
            : block.lines
                .flatMap((item) => item.options)
                .find(
                  (option) =>
                    option.sheet &&
                    block.lines.some(
                      (item) =>
                        item.formula === 'SHEET_YIELD' &&
                        item.selectedId === option.id,
                    ),
                ) || null
          : null
      // As regras da folha ficam na linha que escolhe a folha (AP-3, AP-4)
      const sheetLine = referenceSheet
        ? block.lines.find(
            (item) =>
              item.formula === 'SHEET_YIELD' &&
              item.options.some((option) => option.id === referenceSheet.id),
          ) || line
        : null
      const sheetYield = referenceSheet
        ? sheetYieldOf(
            referenceSheet,
            blockMeasure.width,
            blockMeasure.height,
            blockMeasure.quantity,
            {
              marginMm: sheetLine?.sheetMargin,
              gapMm: sheetLine?.sheetGap,
              wholeSheets: sheetLine?.chargeWholeSheets,
            },
          )
        : null

      // Consumo, perda e mínimo da opção escolhida, ou os da linha (IP-26)
      const own =
        !!selected &&
        (selected.perUnit !== undefined ||
          selected.lossPercent !== undefined ||
          selected.minimum !== undefined)
      const effective = {
        perUnit: selected?.perUnit ?? line.perUnit,
        lossPercent: selected?.lossPercent ?? line.lossPercent,
        minimum:
          selected?.minimum !== undefined ? selected.minimum : line.minimum,
        own,
      }
      const calcLine = { ...line, ...effective }

      // A lista é preenchida pelo vendedor: aqui não tem quantidade (IP-8).
      // A opcional desmarcada fica fora da conta (IP-28)
      // O campo do orçamento que esta linha lê (IP-4); sem ele, vale o campo
      // extra legado da etapa
      const lineExtra = line.fieldName
        ? (findField(assembly, line.fieldName)?.defaultValue ?? extra)
        : extra
      // A fórmula do produto (IP-2): consumo × o resultado dela nesta etapa
      const custom =
        line.formula === 'CUSTOM'
          ? (assembly.formulas || []).find(
              (item) => item.id === line.formulaId,
            ) || null
          : null
      const customValue = custom
        ? evaluateFormula(
            custom.expression,
            formulaVars(assembly, blockMeasure, time, block),
          ).value
        : null
      const raw =
        line.mode === 'LIST' || (line.optional && !line.optionalDefault)
          ? null
          : line.formula === 'CUSTOM'
            ? customValue === null
              ? null
              : customValue * calcLine.perUnit
            : line.formula === 'SHEET_YIELD'
              ? sheetYield
                ? sheetYield.charged * calcLine.perUnit
                : null
              : lineQuantity(calcLine, blockMeasure, lineExtra, time)

      let qty =
        raw === null ? null : raw * (1 + (calcLine.lossPercent || 0) / 100)
      const minimumApplied =
        qty !== null && calcLine.minimum !== null && qty < calcLine.minimum
      if (qty !== null && calcLine.minimum !== null) {
        qty = Math.max(qty, calcLine.minimum)
      }
      qty = qty === null ? null : round(qty, 3)

      return {
        ...line,
        sheetYield,
        variationOverride: !!variation?.overrides.some(
          (item) => item.blockId === block.id && item.lineId === line.id,
        ),
        extraValue:
          line.fieldName || rules.extraField !== 'NONE' ? lineExtra : null,
        formulaName: custom?.name ?? null,
        selected,
        quantity: qty,
        minimumApplied,
        effective,
        cost:
          qty === null || !selected
            ? null
            : Math.round(qty * selected.unitCost),
        sale:
          qty === null || !selected
            ? null
            : Math.round(qty * unitSaleOf(selected)),
      }
    })

    // O preparo entra uma vez por pedido (CP-15)
    const setupCost = Math.round(
      (block.setupMinutes * block.sectorHourCost) / 60,
    )

    const setupSale = Math.round(
      block.setupMinutes * salePerMinute(block.sector),
    )

    // A parte calcula a composição dela na medida desta etapa (IP-9)
    const partSource = block.partProductId
      ? assemblies.find((item) => item.productId === block.partProductId)
      : null
    const part =
      partSource && depth < 3
        ? compute({ ...partSource, measure: blockMeasure }, null, depth + 1)
        : null
    if (part) partSummaries.push(part.resourceSummary)

    blocks.push({
      ...block,
      variationOnly: !!variation?.extraBlocks?.some(
        (item) => item.id === block.id,
      ),
      part: part
        ? {
            productId: part.productId,
            name: part.name,
            stages: part.blocks.length,
          }
        : null,
      partFlow: partSource && depth < 2 ? flowOf(partSource, depth + 1) : null,
      partLines: part
        ? part.blocks.flatMap((item) => [...item.partLines, ...item.lines])
        : [],
      partSetupMinutes: part
        ? part.blocks.reduce(
            (sum, item) => sum + item.setupMinutes + item.partSetupMinutes,
            0,
          )
        : 0,
      name: block.localName || block.name,
      rules,
      measure: blockMeasure,
      setupCost,
      setupSale,
      lines,
      cost:
        setupCost +
        (part?.cost || 0) +
        lines.reduce((sum, line) => sum + (line.cost || 0), 0),
      sale:
        setupSale +
        (part?.suggestedPrice || 0) +
        lines.reduce((sum, line) => sum + (line.sale || 0), 0),
    })
  }

  // Cada recurso uma vez, somado de todas as etapas (IP-34). O preparo entra
  // como mão de obra do setor
  const summary = new Map<string, ResourceSummary>()
  const addUse = (entry: ResourceSummary) => {
    const current = summary.get(entry.id)
    if (current) {
      current.quantity = round(current.quantity + entry.quantity, 3)
      current.cost += entry.cost
      current.sale += entry.sale
    } else {
      summary.set(entry.id, { ...entry })
    }
  }
  const catalogResources = resourceMap()
  blocks.forEach((block) => {
    if (block.setupMinutes) {
      addUse({
        id: `mo-${block.sector}`,
        name: `Mão de obra · ${block.sector}`,
        kind: 'LABOR',
        unit: 'min',
        quantity: block.setupMinutes,
        cost: block.setupCost,
        sale: block.setupSale,
      })
    }
    block.lines.forEach((line) => {
      if (!line.selected || line.quantity === null) return
      const resourceId = line.selected.resourceId || line.selected.id
      const resource = catalogResources.get(resourceId)
      addUse({
        id: resourceId,
        name: resource?.name || line.selected.name,
        kind: line.kind,
        unit: line.selected.unit,
        quantity: line.quantity,
        cost: line.cost || 0,
        sale: line.sale || 0,
      })
    })
  })
  partSummaries.flat().forEach(addUse)
  const resourceSummary = Array.from(summary.values())

  const cost = blocks.reduce((sum, block) => sum + block.cost, 0)
  // O sugerido é a soma do preço de venda de cada recurso, como no legado
  // (IP-25): cada recurso já traz a margem com que a empresa o vende
  const suggestedPrice = blocks.reduce((sum, block) => sum + block.sale, 0)

  // Quanto de unidade comercial a medida tem, como o "Valor" do START
  const saleAmount =
    assembly.unitKind === 'AREA'
      ? area * measure.quantity
      : assembly.unitKind === 'UNITY'
        ? measure.quantity
        : assembly.unitAmount * measure.quantity

  const priceForMeasure =
    unitPrice === null ? null : Math.round(unitPrice * saleAmount)

  return {
    ...assembly,
    area,
    fields: fieldUsage(assembly),
    formulas: formulaUsage(assembly),
    blocks,
    resourceSummary,
    cost,
    suggestedPrice,
    saleAmount: round(saleAmount, 4),
    priceForMeasure,
    suggestedUnitPrice: Math.round(
      suggestedPrice / Math.max(saleAmount, 0.0001),
    ),
    activeVariation: variation,
    activeTier:
      tiersFromVariation || variation?.unitPrice == null ? tier : null,
    effectiveTiers,
    tiersFromVariation,
    tierSummary: [],
    variationSummary: [],
    // Produto sem composição nunca aparece com margem zero (DC-15)
    margin:
      priceForMeasure && cost
        ? round(((priceForMeasure - cost) / priceForMeasure) * 100, 1)
        : null,
  }
}

const minutesText = (minutes: number) =>
  `${Math.floor(minutes / 60)}h${String(Math.round(minutes % 60)).padStart(2, '0')}`

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = (message: string) => ({ success: false, data: null, message })

/* ---------------------------------------------------------------------------
 * Leitura e alteração
 * ------------------------------------------------------------------------- */

// A simulação usa a medida pedida sem gravar nada: o produto só muda quando
// a pessoa salva a medida padrão
export const getAssembly = async ({
  productId,
  measure,
  variationId,
  seed,
}: {
  productId: string
  measure?: AssemblyMeasure
  variationId?: string | null
  // O cadastro do produto, para a composição nascer com ele (CP-16)
  seed?: AssemblySeed
}) => {
  const assembly = findOrCreate(productId, seed)
  const base = measure ? { ...assembly, measure } : assembly
  const variation =
    assembly.variations.find((item) => item.id === variationId) || null

  const result = compute(base, variation)
  // O custo muda por variação mesmo com preço único: é o que revela que o
  // GG dá menos margem que o P (PV-4)
  result.variationSummary = [null, ...assembly.variations].map((item) => {
    const computed = compute(base, item)
    return {
      id: item?.id || '',
      name: item?.name || 'Base',
      cost: computed.cost,
      priceForMeasure: computed.priceForMeasure,
      margin: computed.margin,
    }
  })

  // Cada faixa com o custo unitário naquela quantidade: a composição conta a
  // mesma história por outro caminho, e a diferença aparece (FQ-3)
  result.tierSummary = [...result.effectiveTiers]
    .sort((a, b) => a.from - b.from)
    .map((tier) => {
      const computed = compute(
        { ...base, measure: { ...base.measure, quantity: tier.from } },
        variation,
      )
      const unitCost = computed.cost / Math.max(tier.from, 1)
      return {
        from: tier.from,
        unitPrice: tier.unitPrice,
        unitCost: Math.round(unitCost * 100) / 100,
        margin: tier.unitPrice
          ? Math.round(((tier.unitPrice - unitCost) / tier.unitPrice) * 1000) /
            10
          : null,
      }
    })

  return ok(result)
}

export const getProcessCatalog = async () =>
  ok(
    processTemplates().map(
      (item): ProcessCatalogItem => ({
        id: item.processId,
        name: item.name,
        sector: item.sector,
        afterBase: item.afterBase,
      }),
    ),
  )

export const updateAssembly = async ({
  productId,
  values,
}: {
  productId: string
  values: Partial<
    Pick<
      ProductAssembly,
      | 'status'
      | 'dimension'
      | 'unitKind'
      | 'unitPrice'
      | 'measure'
      | 'unitAmount'
      | 'allowEditValues'
      | 'allowEditDescription'
      | 'allowRenameStages'
      | 'technicalDescription'
    >
  >
}) => {
  const assembly = findOrCreate(productId)

  if (values.status === 'RELEASED') {
    if (!assembly.blocks.length) {
      return fail('Monte a composição antes de liberar o produto para venda')
    }
    const openList = assembly.blocks.some((block) =>
      block.lines.some((line) => line.mode === 'CHOOSE' && !line.selectedId),
    )
    if (openList) {
      return fail(
        'Há linhas de escolha sem opção padrão. Escolha antes de liberar',
      )
    }
  }

  Object.assign(assembly, values)
  return ok(null)
}

// A posição na lista não importa mais: o fluxo é desenhado pela dependência
// (FL-5). A etapa entra logo depois da última de que ela depende, para a
// leitura em lista continuar fazendo sentido
const insertBlock = (
  assembly: ProductAssembly,
  block: AssemblyBlock,
  insertBefore?: string,
) => {
  const last = Math.max(
    -1,
    ...block.dependsOn.map((id) =>
      assembly.blocks.findIndex((item) => item.id === id),
    ),
  )
  assembly.blocks.splice(last + 1, 0, block)
  wireBetween(assembly.blocks, block, insertBefore)
}

// A etapa nova que depende de outra começa com as regras de acabamento (FL-2,
// MS-5): mesma medida da base, acompanhando a quantidade dela. Quem monta
// ajusta depois, se precisar
const rulesFor = (dependsOn: string[]) =>
  dependsOn.length ? { ...finishingRules } : { ...baseRules }

// Mão de obra de todos os setores e os recursos que os processos já usam
const resourceMap = () => {
  const map = new Map<string, AssemblyResource>()
  Object.keys(HOUR).forEach((sector) =>
    map.set(`mo-${sector}`, { ...labor(sector), kind: 'LABOR' }),
  )
  processTemplates(false).forEach((template) =>
    template.lines.forEach((line) =>
      line.options.forEach((option) => {
        if (!map.has(option.id))
          map.set(option.id, { ...option, kind: line.kind })
      }),
    ),
  )
  // Os materiais do cadastro, com as medidas do perfil e da chapa
  materialResources().forEach((resource) => {
    if (!map.has(resource.id))
      map.set(resource.id, { ...resource, kind: 'MATERIAL' })
  })
  return map
}

export const getAssemblyResources = async () =>
  ok({
    sectors: Object.keys(HOUR),
    resources: Array.from(resourceMap().values()),
  })

// A etapa montada no próprio produto: o trabalho de um setor, com os
// recursos e o tempo que ele usa. Não passa por Processos
export const addOwnBlock = async ({
  productId,
  name,
  sector,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  name: string
  sector: string
  // As etapas de que a nova depende (FL-1); vazio é um caminho novo
  dependsOn?: string[]
  // Inserir no meio da ligação: a etapa que passa a depender da nova
  insertBefore?: string
}) => {
  if (!name.trim()) return fail('Informe o nome da etapa')
  const assembly = findOrCreate(productId)
  const block: AssemblyBlock = {
    id: `b${uid()}`,
    processId: null,
    name: name.trim(),
    sector,
    role: dependsOn.length ? 'FINISHING' : 'BASE',
    dependsOn: [...dependsOn],
    baseBlockId: dependsOn[0] ?? null,
    setupMinutes: 0,
    sectorHourCost: HOUR[sector] || 1800,
    taskType: sector,
    originalRules: rulesFor(dependsOn),
    localRules: null,
    lines: [],
  }
  insertBlock(assembly, block, insertBefore)
  return ok(block.id)
}

export const addAssemblyLine = async ({
  productId,
  blockId,
  values,
}: {
  productId: string
  blockId: string
  values: NewLineValues
}) => {
  const assembly = findOrCreate(productId)
  const block = assembly.blocks.find((item) => item.id === blockId)
  if (!block) return fail('Etapa não encontrada')
  if (!values.name.trim()) return fail('Informe o nome da linha')
  const fieldName = values.fieldName?.trim() || undefined
  if (fieldName) ensureField(assembly, fieldName, values.fieldDefault ?? 0)
  if (
    values.formula === 'CUSTOM' &&
    !(assembly.formulas || []).some((item) => item.id === values.formulaId)
  ) {
    return fail('Escolha a fórmula do produto')
  }

  const map = resourceMap()
  const options = values.optionIds
    .map((id) => map.get(id))
    .filter((item): item is AssemblyResource => !!item)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ kind, ...option }) => option)
  if (!options.length) return fail('Escolha ao menos um recurso')
  if (values.mode === 'SINGLE' && options.length > 1) {
    return fail('Recurso único leva um recurso só')
  }
  // As opções de uma escolha são trocadas entre si: precisam medir igual (IP-39)
  if (
    values.mode === 'CHOOSE' &&
    new Set(options.map((option) => option.unit)).size > 1
  ) {
    return fail('As opções de uma escolha precisam ter a mesma unidade')
  }

  const list = values.mode === 'LIST'
  block.lines.push({
    id: `l${uid()}`,
    name: values.name.trim(),
    kind: values.kind,
    mode: values.mode,
    options,
    selectedId: list ? '' : options[0].id,
    perUnit: list ? 0 : values.perUnit,
    formula: list ? 'SELLER' : values.formula,
    lossPercent: list ? 0 : values.lossPercent,
    minimum: list ? null : values.minimum,
    optional: values.optional,
    optionalDefault: values.optional ? values.optionalDefault : undefined,
    fieldName,
    formulaId: values.formula === 'CUSTOM' ? values.formulaId : undefined,
    overridden: false,
    // Numa etapa vinda de processo, a linha a mais é só deste produto
    addedHere: block.processId !== null,
  })
  return ok(null)
}

// Os campos do orçamento são do PRODUTO (IP-4, IP-6): um nome, um valor,
// um lugar para preencher. A linha aponta para o campo pelo nome
export const addProductField = async ({
  productId,
  name,
  defaultValue,
}: {
  productId: string
  name: string
  defaultValue: number
}) => {
  if (!name?.trim()) return fail('Informe o nome do campo')
  const assembly = findOrCreate(productId)
  if (findField(assembly, name)) {
    return fail('Já existe um campo com esse nome neste produto')
  }
  ensureField(assembly, name, defaultValue)
  return ok(null)
}

export const updateProductField = async ({
  productId,
  fieldId,
  name,
  defaultValue,
}: {
  productId: string
  fieldId: string
  name?: string
  defaultValue?: number
}) => {
  const assembly = findOrCreate(productId)
  const field = (assembly.fields || []).find((item) => item.id === fieldId)
  if (!field) return fail('Campo não encontrado')
  if (name !== undefined) {
    if (!name.trim()) return fail('Informe o nome do campo')
    const other = findField(assembly, name)
    if (other && other.id !== field.id) {
      return fail('Já existe um campo com esse nome neste produto')
    }
    // As linhas que leem o campo acompanham o nome novo
    assembly.blocks.forEach((block) =>
      block.lines.forEach((line) => {
        if (
          line.fieldName &&
          fieldKey(line.fieldName) === fieldKey(field.name)
        ) {
          line.fieldName = name.trim()
        }
      }),
    )
    field.name = name.trim()
  }
  if (defaultValue !== undefined) field.defaultValue = defaultValue
  return ok(null)
}

export const removeProductField = async ({
  productId,
  fieldId,
}: {
  productId: string
  fieldId: string
}) => {
  const assembly = findOrCreate(productId)
  const field = (assembly.fields || []).find((item) => item.id === fieldId)
  if (!field) return fail('Campo não encontrado')
  const usedBy =
    fieldUsage(assembly).find((item) => item.id === fieldId)?.usedBy || []
  if (usedBy.length) {
    return fail(
      `Este campo é lido em ${usedBy.join(', ')}. Troque o campo nessas linhas antes de removê-lo`,
    )
  }
  assembly.fields = (assembly.fields || []).filter(
    (item) => item.id !== fieldId,
  )
  return ok(null)
}

// As fórmulas são do PRODUTO (IP-2, 03/10/2026): a conta depende dos campos
// dele, então não vira cadastro da empresa. Para reaproveitar, copia-se a
// composição de outro produto
export const addProductFormula = async ({
  productId,
  name,
  expression,
}: {
  productId: string
  name: string
  expression: string
}) => {
  if (!name?.trim()) return fail('Dê um nome à fórmula')
  const assembly = findOrCreate(productId)
  const check = evaluateFormula(
    expression,
    formulaVars(assembly, assembly.measure, 0),
  )
  if (check.error) return fail(check.error)
  if (
    (assembly.formulas || []).some(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    return fail('Já existe uma fórmula com esse nome neste produto')
  }
  const formula: ProductFormula = {
    id: `fx${uid()}`,
    name: name.trim(),
    expression: expression.trim(),
  }
  assembly.formulas = [...(assembly.formulas || []), formula]
  return ok(formula.id)
}

export const updateProductFormula = async ({
  productId,
  formulaId,
  name,
  expression,
}: {
  productId: string
  formulaId: string
  name?: string
  expression?: string
}) => {
  const assembly = findOrCreate(productId)
  const formula = (assembly.formulas || []).find(
    (item) => item.id === formulaId,
  )
  if (!formula) return fail('Fórmula não encontrada')
  if (name !== undefined && !name.trim()) return fail('Dê um nome à fórmula')
  if (expression !== undefined) {
    const check = evaluateFormula(
      expression,
      formulaVars(assembly, assembly.measure, 0),
    )
    if (check.error) return fail(check.error)
    formula.expression = expression.trim()
  }
  if (name !== undefined) formula.name = name.trim()
  return ok(null)
}

export const removeProductFormula = async ({
  productId,
  formulaId,
}: {
  productId: string
  formulaId: string
}) => {
  const assembly = findOrCreate(productId)
  const usedBy =
    formulaUsage(assembly).find((item) => item.id === formulaId)?.usedBy || []
  if (usedBy.length) {
    return fail(
      `Esta fórmula é usada em ${usedBy.join(', ')}. Troque o tipo de cálculo nessas linhas antes de removê-la`,
    )
  }
  assembly.formulas = (assembly.formulas || []).filter(
    (item) => item.id !== formulaId,
  )
  return ok(null)
}

// Duplicar produto (03/10/2026): a composição do produto de origem vai para
// o produto novo — etapas, campos e fórmulas, com ids novos, como cópia
// independente. Chamado pelo botão Duplicar da lista de produtos
export const copyCompositionFrom = async ({
  productId,
  sourceProductId,
}: {
  productId: string
  sourceProductId: string
}) => {
  if (productId === sourceProductId) return fail('Escolha outro produto')
  syncLinks()
  const source = assemblies.find((item) => item.productId === sourceProductId)
  if (!source || !source.blocks.length) {
    return fail('Esse produto não tem composição para copiar')
  }
  const target = findOrCreate(productId)
  ensureFields(source)
  ;(source.fields || []).forEach((field) =>
    ensureField(target, field.name, field.defaultValue),
  )
  const formulaIds = new Map<string, string>()
  ;(source.formulas || []).forEach((formula) => {
    const existing = (target.formulas || []).find(
      (item) =>
        item.name.trim().toLowerCase() === formula.name.trim().toLowerCase(),
    )
    if (existing && existing.expression === formula.expression) {
      formulaIds.set(formula.id, existing.id)
      return
    }
    const copy: ProductFormula = {
      id: `fx${uid()}`,
      name: existing ? `${formula.name} (cópia)` : formula.name,
      expression: formula.expression,
    }
    target.formulas = [...(target.formulas || []), copy]
    formulaIds.set(formula.id, copy.id)
  })
  const blockIds = new Map(
    source.blocks.map((block) => [block.id, `b${uid()}`]),
  )
  const copied: AssemblyBlock[] = source.blocks.map((block) => ({
    ...structuredClone(block),
    id: blockIds.get(block.id) as string,
    dependsOn: block.dependsOn.map((id) => blockIds.get(id) || id),
    baseBlockId: block.baseBlockId
      ? blockIds.get(block.baseBlockId) || null
      : null,
    lines: block.lines.map((line) => ({
      ...structuredClone(line),
      id: `l${uid()}`,
      formulaId: line.formulaId
        ? formulaIds.get(line.formulaId) || line.formulaId
        : undefined,
    })),
  }))
  target.blocks.push(...copied)
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Variações como cópias independentes (03/10/2026). A variação nasce igual
 * à composição de onde foi criada e, daí em diante, as duas não se falam
 * ------------------------------------------------------------------------- */

export const getProductVariants = async ({
  productId,
}: {
  productId: string
}) =>
  ok({
    baseProductId: baseOf(productId),
    variants: findOrCreate(baseOf(productId)).variants || [],
  })

export const createProductVariant = async ({
  productId,
  name,
}: {
  // O produto (ou a variação) que está na tela: a cópia parte dele
  productId: string
  name: string
}) => {
  if (!name.trim()) return fail('Dê um nome à variação (P, M, G…)')
  syncLinks()
  const base = findOrCreate(baseOf(productId))
  const source = findOrCreate(productId)
  base.variants = base.variants || []
  if (
    base.variants.some(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    return fail('Já existe uma variação com esse nome')
  }
  const id = `v${uid()}`
  const variantProductId = `${base.productId}${VARIANT_SEP}${id}`
  // Cópia inteira: etapas, linhas, campos, fórmulas, faixas e valor de venda
  const copy: ProductAssembly = {
    ...structuredClone(source),
    productId: variantProductId,
    variants: undefined,
    variations: [],
  }
  assemblies.push(copy)
  base.variants.push({ id, name: name.trim() })
  return ok(variantProductId)
}

export const renameProductVariant = async ({
  productId,
  variantId,
  name,
}: {
  productId: string
  variantId: string
  name: string
}) => {
  if (!name.trim()) return fail('Dê um nome à variação')
  const base = findOrCreate(baseOf(productId))
  const variant = (base.variants || []).find((item) => item.id === variantId)
  if (!variant) return fail('Variação não encontrada')
  variant.name = name.trim()
  return ok(null)
}

export const removeProductVariant = async ({
  productId,
  variantId,
}: {
  productId: string
  variantId: string
}) => {
  const base = findOrCreate(baseOf(productId))
  const index = assemblies.findIndex(
    (item) => item.productId === `${base.productId}${VARIANT_SEP}${variantId}`,
  )
  if (index >= 0) assemblies.splice(index, 1)
  base.variants = (base.variants || []).filter((item) => item.id !== variantId)
  return ok(null)
}

export const removeAssemblyLine = async ({
  productId,
  blockId,
  lineId,
}: {
  productId: string
  blockId: string
  lineId: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  if (!block) return fail('Etapa não encontrada')
  const line = block.lines.find((item) => item.id === lineId)
  // Tirada só deste produto: não volta quando o processo muda (CP-21)
  if (block.processId && line?.sourceLineId) {
    block.removedSourceLineIds = [
      ...(block.removedSourceLineIds || []),
      line.sourceLineId,
    ]
  }
  block.lines = block.lines.filter((item) => item.id !== lineId)
  return ok(null)
}

// Traz de volta as linhas do processo tiradas deste produto (CP-21)
export const restoreProcessLines = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  if (!block?.processId) return fail('Etapa não encontrada')
  block.removedSourceLineIds = []
  syncBlock(block)
  return ok(null)
}

export const addAssemblyBlock = async ({
  productId,
  processId,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  processId: string
  dependsOn?: string[]
  insertBefore?: string
}) => {
  const assembly = findOrCreate(productId)
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')

  const block = fromTemplate(template, dependsOn)
  insertBlock(assembly, block, insertBefore)
  return ok(block.id)
}

// Tirar a etapa do fluxo: quem dependia dela passa a depender do que ela
// dependia. O fluxo continua ligado (FL-12)
export const removeAssemblyBlock = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const assembly = findOrCreate(productId)
  assembly.blocks = unwire(assembly.blocks, blockId)
  assembly.variations.forEach((variation) => {
    if (!variation.extraBlocks) return
    variation.extraBlocks = variation.extraBlocks.map((block) =>
      block.dependsOn.includes(blockId)
        ? {
            ...block,
            dependsOn: block.dependsOn.filter((id) => id !== blockId),
            baseBlockId:
              block.baseBlockId === blockId ? null : block.baseBlockId,
          }
        : block,
    )
  })
  return ok(null)
}

// "Ligar a…" (FL-5): a etapa passa a depender também de outra — é o ponto
// de encontro, a instalação que espera os dois caminhos (FL-4)
export const linkBlock = async ({
  productId,
  blockId,
  toId,
}: {
  productId: string
  blockId: string
  toId: string
}) => {
  const assembly = findOrCreate(productId)
  const block = assembly.blocks.find((item) => item.id === blockId)
  const target = assembly.blocks.find((item) => item.id === toId)
  if (!block || !target) return fail('Etapa não encontrada')
  if (blockId === toId) return fail('A etapa não pode depender dela mesma')
  if (block.dependsOn.includes(toId)) return ok(null)
  if (dependsTransitively(assembly.blocks, toId, blockId)) {
    return fail(
      `${target.localName || target.name} já vem depois de ${block.localName || block.name}: ligar as duas fecharia um laço`,
    )
  }
  block.dependsOn = [...block.dependsOn, toId]
  if (!block.baseBlockId) block.baseBlockId = toId
  return ok(null)
}

export const unlinkBlock = async ({
  productId,
  blockId,
  fromId,
}: {
  productId: string
  blockId: string
  fromId: string
}) => {
  const assembly = findOrCreate(productId)
  const block = assembly.blocks.find((item) => item.id === blockId)
  if (!block) return fail('Etapa não encontrada')
  block.dependsOn = block.dependsOn.filter((id) => id !== fromId)
  if (block.baseBlockId === fromId) {
    block.baseBlockId = block.dependsOn[0] ?? null
  }
  return ok(null)
}

// Trocar o processo que preenche a etapa (FL-6): a caixa continua no mesmo
// lugar do fluxo, com as mesmas ligações; o que muda é a montagem
export const replaceBlockProcess = async ({
  productId,
  blockId,
  processId,
}: {
  productId: string
  blockId: string
  processId: string
}) => {
  const assembly = findOrCreate(productId)
  const index = assembly.blocks.findIndex((item) => item.id === blockId)
  if (index < 0) return fail('Etapa não encontrada')
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')
  const current = assembly.blocks[index]
  const next = fromTemplate(template, current.dependsOn)
  next.id = current.id
  next.baseBlockId = current.baseBlockId
  assembly.blocks[index] = next
  return ok(null)
}

// O que "+ etapa seguinte" oferece depois desta etapa (FL-7)
export const getNextStepCandidates = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string | null
}) => {
  const assembly = findOrCreate(productId)
  const block = blockId
    ? assembly.blocks.find((item) => item.id === blockId)
    : null
  const toItem = (item: Template): ProcessCatalogItem => ({
    id: item.processId,
    name: item.name,
    sector: item.sector,
    afterBase: item.afterBase,
  })
  const all = processTemplates()
    .map(toItem)
    .sort(
      (a, b) =>
        a.sector.localeCompare(b.sector) || a.name.localeCompare(b.name),
    )
  if (!block) return ok<NextStepCandidates>({ usual: [], all })

  // Só as marcações valem (FL-7, 03/10/2026). Sem marcação, a lista inteira,
  // agrupada por setor; o "acabamento do setor" do legado saiu
  const marked = block.processId
    ? all.filter((item) => usualNext.has(pairKey(block.processId!, item.id)))
    : []
  return ok<NextStepCandidates>({ usual: marked, all })
}

export const moveAssemblyBlock = async ({
  productId,
  blockId,
  direction,
}: {
  productId: string
  blockId: string
  direction: 'UP' | 'DOWN'
}) => {
  const assembly = findOrCreate(productId)
  const index = assembly.blocks.findIndex((block) => block.id === blockId)
  const target = direction === 'UP' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= assembly.blocks.length) {
    return ok(null)
  }
  const [block] = assembly.blocks.splice(index, 1)
  assembly.blocks.splice(target, 0, block)
  return ok(null)
}

// Ajustar a linha só neste produto (IP-22). O processo não muda
export const updateAssemblyLine = async ({
  productId,
  blockId,
  lineId,
  values,
}: {
  productId: string
  blockId: string
  lineId: string
  values: Partial<
    Pick<
      AssemblyLine,
      | 'selectedId'
      | 'perUnit'
      | 'formula'
      | 'lossPercent'
      | 'minimum'
      | 'optional'
      | 'optionalDefault'
      | 'sheetMargin'
      | 'sheetGap'
      | 'chargeWholeSheets'
      | 'fieldName'
      | 'formulaId'
    >
  > & {
    // Padrão do campo do orçamento, se ele ainda não existir no produto
    fieldDefault?: number
    // Consumo, perda e mínimo por opção (IP-26); vazio volta ao da linha
    optionValues?: {
      id: string
      perUnit?: number
      lossPercent?: number
      minimum?: number | null
    }[]
  }
}) => {
  const assembly = findOrCreate(productId)
  const block = assembly.blocks.find((item) => item.id === blockId)
  const line = block?.lines.find((item) => item.id === lineId)
  if (!line) return fail('Linha não encontrada')

  // Trocar a opção escolhida não é ajuste: é o uso normal da linha
  const onlyChoice = Object.keys(values).every((key) => key === 'selectedId')
  const { optionValues, fieldDefault, ...lineValues } = values
  Object.assign(line, lineValues)
  if ('fieldName' in lineValues) {
    line.fieldName = lineValues.fieldName?.trim() || undefined
    if (line.fieldName) ensureField(assembly, line.fieldName, fieldDefault ?? 0)
  }
  if (line.formula !== 'CUSTOM') line.formulaId = undefined
  // Lista nova: a mesma lista de opções pode ser de outros produtos
  if (optionValues) {
    line.options = line.options.map((option) => {
      const next = optionValues.find((item) => item.id === option.id)
      // Campo ausente volta a valer o da linha (o undefined some na ida)
      return next
        ? {
            ...option,
            perUnit: next.perUnit ?? undefined,
            lossPercent: next.lossPercent ?? undefined,
            minimum: next.minimum ?? undefined,
          }
        : option
    })
  }
  if (!onlyChoice) line.overridden = true

  return ok(null)
}

// Volta a linha a acompanhar o processo
export const resetAssemblyLine = async ({
  productId,
  blockId,
  lineId,
}: {
  productId: string
  blockId: string
  lineId: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const line = block?.lines.find((item) => item.id === lineId)
  const origin =
    block?.processId && line?.sourceLineId
      ? processStore
          .get(block.processId)
          ?.block.lines.find((item) => item.id === line.sourceLineId)
      : undefined
  if (!block || !line || !origin) return fail('Linha não encontrada')

  // Volta a acompanhar o processo (CP-21)
  line.overridden = false
  syncBlock(block)
  return ok(null)
}

// Regras de venda só para este produto (IP-18). null volta às do processo
export const setBlockLocalRules = async ({
  productId,
  blockId,
  rules,
  name,
  taskType,
}: {
  productId: string
  blockId: string
  rules: SaleRules | null
  // Nome da etapa; na que veio de processo, vale só neste produto (IP-30)
  name?: string
  // Tipo de tarefa que a etapa gera na produção (IP-23)
  taskType?: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  if (!block) return fail('Etapa não encontrada')
  if (taskType) {
    block.taskType = taskType
    // Na etapa vinda de processo, o tipo diferente do processo é deste produto
    if (block.processId) {
      block.localTaskType =
        taskType === processStore.get(block.processId)?.block.taskType
          ? undefined
          : taskType
    }
  }
  if (name !== undefined) {
    if (!name.trim()) return fail('Informe o nome da etapa')
    if (block.processId === null) block.name = name.trim()
    else block.localName = name.trim() === block.name ? undefined : name.trim()
  }
  // Na etapa montada no produto, as regras são dela mesma: não há original
  if (block.processId === null) {
    if (rules) block.originalRules = rules
    block.localRules = null
    return ok(null)
  }
  block.localRules = rules
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Variações (PV-1 a PV-7)
 * ------------------------------------------------------------------------- */

export const addVariation = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  if (!name.trim()) return fail('Dê um nome para a variação')
  const assembly = findOrCreate(productId)
  const variation: ProductVariation = {
    id: `v${uid()}`,
    name: name.trim(),
    unitPrice: null,
    overrides: [],
  }
  assembly.variations.push(variation)
  return ok(variation.id)
}

export const removeVariation = async ({
  productId,
  variationId,
}: {
  productId: string
  variationId: string
}) => {
  const assembly = findOrCreate(productId)
  assembly.variations = assembly.variations.filter(
    (item) => item.id !== variationId,
  )
  return ok(null)
}

export const setVariationPrice = async ({
  productId,
  variationId,
  unitPrice,
}: {
  productId: string
  variationId: string
  unitPrice: number | null
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  variation.unitPrice = unitPrice
  return ok(null)
}

// O que muda na variação vira exceção dela; o resto continua acompanhando a
// base (PV-2)
export const setVariationLine = async ({
  productId,
  variationId,
  blockId,
  lineId,
  values,
}: {
  productId: string
  variationId: string
  blockId: string
  lineId: string
  values: { selectedId?: string; perUnit?: number }
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')

  const current = variation.overrides.find(
    (item) => item.blockId === blockId && item.lineId === lineId,
  )
  if (current) Object.assign(current, values)
  else variation.overrides.push({ blockId, lineId, ...values })
  return ok(null)
}

export const clearVariationLine = async ({
  productId,
  variationId,
  blockId,
  lineId,
}: {
  productId: string
  variationId: string
  blockId: string
  lineId: string
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  variation.overrides = variation.overrides.filter(
    (item) => !(item.blockId === blockId && item.lineId === lineId),
  )
  return ok(null)
}

// Tabela de preço por faixa (FQ-1). Vazia, vale o valor de venda do produto
// A tabela por faixa do produto, para o cadastro (LITE) e para a venda
export const getPriceTiers = async ({ productId }: { productId: string }) =>
  ok<PriceTier[]>(findOrCreate(productId).priceTiers)

export const setPriceTiers = async ({
  productId,
  tiers,
  variationId,
  inherit,
}: {
  productId: string
  tiers: PriceTier[]
  // Na variação: grava a tabela dela, ou volta à do produto (FQ-4)
  variationId?: string
  inherit?: boolean
}) => {
  if (variationId) {
    const variation = findOrCreate(productId).variations.find(
      (item) => item.id === variationId,
    )
    if (!variation) return fail('Variação não encontrada')
    if (inherit) {
      variation.priceTiers = undefined
      return ok(null)
    }
  }
  const clean = tiers
    .filter((tier) => tier.from > 0 && tier.unitPrice >= 0)
    .sort((a, b) => a.from - b.from)
  if (new Set(clean.map((tier) => tier.from)).size !== clean.length) {
    return fail('Duas faixas começam na mesma quantidade')
  }
  const assembly = findOrCreate(productId)
  const variation = variationId
    ? assembly.variations.find((item) => item.id === variationId)
    : null
  if (variation) variation.priceTiers = clean
  else assembly.priceTiers = clean
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * O produto na venda (IP-36)
 * ------------------------------------------------------------------------- */

// Só o que o vendedor pode mudar: campos extras, escolhas e listas
export const getSaleForm = async ({ productId }: { productId: string }) => {
  syncLinks()
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly || !assembly.blocks.length) return ok<SaleForm | null>(null)

  const form: SaleForm = {
    stages: assembly.blocks.map((block) => ({
      blockId: block.id,
      name: block.localName || block.name,
      sector: block.sector,
    })),
    extras: [],
    times: [],
    choices: [],
    optionals: [],
    lists: [],
  }
  // Os campos do produto, uma vez só, na ordem em que foram declarados (IP-6)
  ensureFields(assembly)
  fieldUsage(assembly)
    .filter((field) => field.usedBy.length)
    .forEach((field) =>
      form.extras.push({
        fieldId: field.id,
        name: field.name,
        kind: 'DECIMAL',
        defaultValue: field.defaultValue,
      }),
    )
  assembly.blocks.forEach((block) => {
    const rules = block.localRules ?? block.originalRules
    if (rules.timeField || blockHasTimeLine(block)) {
      const timeLine = block.lines.find((line) =>
        TIME_FORMULAS.includes(line.formula),
      )
      form.times.push({
        blockId: block.id,
        name: `Tempo · ${block.localName || block.name}`,
        defaultMinutes: rules.timeFieldDefault || timeLine?.perUnit || 0,
      })
    }
    // Legado: etapa com campo extra próprio e nenhuma linha lendo um campo
    // do produto. Some quando as linhas passarem a apontar para o campo
    if (
      rules.extraField !== 'NONE' &&
      !block.lines.some((line) => line.fieldName)
    ) {
      form.extras.push({
        fieldId: `block:${block.id}`,
        name: rules.extraFieldName || block.name,
        kind: rules.extraField,
        defaultValue: rules.extraFieldDefault,
      })
    }
    block.lines.forEach((line) => {
      // Linha vazia é erro de cadastro: não chega ao orçamento (IP-37)
      if (!line.options.length) return
      if (line.optional) {
        form.optionals.push({
          blockId: block.id,
          lineId: line.id,
          name: line.name,
          stage: block.name,
          defaultIncluded: !!line.optionalDefault,
        })
      }
      if (line.mode === 'CHOOSE') {
        form.choices.push({
          blockId: block.id,
          lineId: line.id,
          name: line.name,
          stage: block.name,
          defaultId: line.selectedId,
          options: line.options.map(({ id, name }) => ({ id, name })),
        })
      }
      if (line.mode === 'LIST') {
        form.lists.push({
          blockId: block.id,
          lineId: line.id,
          name: line.name,
          stage: block.name,
          options: line.options.map(({ id, name, unit }) => ({
            id,
            name,
            unit,
          })),
        })
      }
    })
  })
  return ok<SaleForm | null>(form)
}

// A composição completa do item vendido, para consulta. Não leva custo nem
// preço de recurso: a tela do orçamento mostra preço, não método (ORC-7)
export const getSaleComposition = async ({
  productId,
  measure,
  variationName,
  extras = [],
  times = [],
  choices = [],
  optionals = [],
  lists = [],
  notes = [],
}: {
  productId: string
  measure: AssemblyMeasure
  variationName?: string | null
  notes?: { blockId: string; text: string }[]
  extras?: SaleExtra[]
  times?: SaleTime[]
  choices?: SaleChoice[]
  optionals?: SaleOptional[]
  lists?: SaleListEntry[]
}) => {
  syncLinks()
  const original = assemblies.find((item) => item.productId === productId)
  if (!original || !original.blocks.length) {
    return fail('Este produto não tem composição')
  }

  // Cópia: o que o vendedor escolheu vale só para esta venda
  const source: ProductAssembly = structuredClone({ ...original, measure })
  // O que o vendedor informou nos campos do produto vale nesta venda
  ensureFields(source)
  extras.forEach((item) => {
    const field = (source.fields || []).find((f) => f.id === item.fieldId)
    if (field) field.defaultValue = item.value
  })
  source.blocks.forEach((block) => {
    const extra = extras.find((item) => item.fieldId === `block:${block.id}`)
    if (extra) {
      block.localRules = {
        ...(block.localRules ?? block.originalRules),
        extraFieldDefault: extra.value,
      }
    }
    const time = times.find((item) => item.blockId === block.id)
    if (time) {
      block.localRules = {
        ...(block.localRules ?? block.originalRules),
        timeFieldDefault: time.minutes,
      }
    }
    block.lines.forEach((line) => {
      const choice = choices.find(
        (item) => item.blockId === block.id && item.lineId === line.id,
      )
      if (choice) line.selectedId = choice.optionId
      const optional = optionals.find(
        (item) => item.blockId === block.id && item.lineId === line.id,
      )
      if (optional) line.optionalDefault = optional.included
    })
    // O relatório mostra o que foi vendido: sem linha vazia e sem a opcional
    // que ficou de fora
    block.lines = block.lines.filter(
      (line) => line.options.length && (!line.optional || line.optionalDefault),
    )
  })
  const variation =
    source.variations.find((item) => item.name === variationName) || null
  const computed = compute(source, variation)

  const report: SaleCompositionReport = {
    name: original.name,
    technicalDescription: original.technicalDescription,
    measure,
    variation: variation?.name || null,
    blocks: computed.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      sale: block.sale,
      sector: block.sector,
      taskType: block.taskType,
      role: block.role,
      baseName:
        computed.blocks.find((item) => item.id === block.baseBlockId)?.name ||
        null,
      measure: block.measure,
      note:
        notes.find((item) => item.blockId === block.id)?.text.trim() || null,
      setupMinutes: block.setupMinutes + block.partSetupMinutes,
      extra:
        [
          block.rules.timeField
            ? `tempo ${minutesText(block.rules.timeFieldDefault || 0)}`
            : null,
          block.rules.extraField === 'NONE' ||
          block.lines.some((line) => line.fieldName)
            ? null
            : `${block.rules.extraFieldName}: ${block.rules.extraFieldDefault}`,
          ...Array.from(
            new Set(
              block.lines
                .filter((line) => line.fieldName)
                .map((line) => line.fieldName as string),
            ),
          ).map(
            (name) => `${name}: ${findField(source, name)?.defaultValue ?? 0}`,
          ),
        ]
          .filter(Boolean)
          .join(' · ') || null,
      lines: [...block.partLines, ...block.lines].map((line) => ({
        id: line.id,
        name: line.name,
        kind: line.kind,
        resource: line.mode === 'LIST' ? null : line.selected?.name || null,
        quantity: line.quantity,
        unit: line.selected?.unit || line.options[0]?.unit || '',
        entries:
          line.mode === 'LIST'
            ? line.options
                .map((option) => ({
                  name: option.name,
                  unit: option.unit,
                  quantity:
                    lists.find(
                      (item) =>
                        item.blockId === block.id &&
                        item.lineId === line.id &&
                        item.optionId === option.id,
                    )?.quantity || 0,
                }))
                .filter((entry) => entry.quantity > 0)
            : null,
      })),
    })),
  }
  return ok(report)
}

/* ---------------------------------------------------------------------------
 * Opções de uma linha de escolha ou de lista (IP-27, IP-31)
 * ------------------------------------------------------------------------- */

export const addLineOption = async ({
  productId,
  blockId,
  lineId,
  resourceId,
  configName,
  perUnit,
}: {
  productId: string
  blockId: string
  lineId: string
  resourceId: string
  configName?: string
  perUnit?: number
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const line = block?.lines.find((item) => item.id === lineId)
  if (!block || !line) return fail('Linha não encontrada')
  if (line.mode === 'SINGLE') {
    return fail('Recurso único não tem opções')
  }

  const resource = resourceMap().get(resourceId)
  if (!resource) return fail('Recurso não encontrado')
  // As opções de uma escolha são trocadas entre si: precisam medir igual
  const unit = line.options[0]?.unit
  if (line.mode === 'CHOOSE' && unit && resource.unit !== unit) {
    return fail(`As opções desta linha são em ${unit}`)
  }

  const name = configName?.trim() || ''
  const repeated = line.options.some(
    (option) => (option.resourceId || option.id) === resourceId,
  )
  // O mesmo recurso duas vezes só com nome de configuração para diferenciar
  if (repeated && !name) {
    return fail('Este recurso já está na linha: dê um nome à configuração')
  }
  if (
    name &&
    line.options.some(
      (option) =>
        (option.resourceId || option.id) === resourceId &&
        option.configName?.toLowerCase() === name.toLowerCase(),
    )
  ) {
    return fail('Já existe uma configuração com esse nome')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, ...base } = resource
  line.options = [
    ...line.options,
    {
      ...base,
      id: name ? `${resourceId}~${uid()}` : resourceId,
      resourceId: name ? resourceId : undefined,
      configName: name || undefined,
      name: name ? `${resource.name} · ${name}` : resource.name,
      perUnit,
    },
  ]
  if (!line.selectedId && line.mode === 'CHOOSE') {
    line.selectedId = line.options[0].id
  }
  if (block.processId) line.overridden = true
  return ok(null)
}

export const removeLineOption = async ({
  productId,
  blockId,
  lineId,
  optionId,
}: {
  productId: string
  blockId: string
  lineId: string
  optionId: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const line = block?.lines.find((item) => item.id === lineId)
  if (!block || !line) return fail('Linha não encontrada')
  // Linha sem recurso é erro de cadastro (IP-37): a última opção fica
  if (line.options.length <= 1) {
    return fail('A linha precisa de ao menos um recurso; remova a linha')
  }
  line.options = line.options.filter((option) => option.id !== optionId)
  if (line.selectedId === optionId) line.selectedId = line.options[0].id
  if (block.processId) line.overridden = true
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Partes: produto usado dentro de outro (IP-9)
 * ------------------------------------------------------------------------- */

// Produtos com composição que podem entrar como parte: os marcados como
// parte primeiro, mas qualquer produto composto serve
export const getPartCandidates = async ({ productId }: { productId: string }) =>
  ok(
    assemblies
      .filter(
        (item) =>
          item.productId !== productId &&
          !isHidden(item.productId) &&
          item.blocks.length,
      )
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        code: item.code,
        status: item.status,
        stages: item.blocks.length,
      }))
      .sort((a, b) => (a.status === 'PART' ? -1 : b.status === 'PART' ? 1 : 0)),
  )

// Um produto não pode conter a si mesmo, nem por dentro de outra parte
const containsProduct = (
  productId: string,
  target: string,
  depth = 0,
): boolean => {
  if (depth > 5) return true
  syncLinks()
  const assembly = assemblies.find((item) => item.productId === productId)
  return !!assembly?.blocks.some(
    (block) =>
      block.partProductId === target ||
      (block.partProductId &&
        containsProduct(block.partProductId, target, depth + 1)),
  )
}

export const addPartBlock = async ({
  productId,
  partProductId,
  dependsOn = [],
  insertBefore,
}: {
  productId: string
  partProductId: string
  dependsOn?: string[]
  insertBefore?: string
}) => {
  const assembly = findOrCreate(productId)
  const part = assemblies.find((item) => item.productId === partProductId)
  if (!part || !part.blocks.length) return fail('Parte sem composição')
  if (
    partProductId === productId ||
    containsProduct(partProductId, productId)
  ) {
    return fail('Um produto não pode ser parte dele mesmo')
  }

  const first = orderBlocks(part.blocks)[0]
  const block: AssemblyBlock = {
    id: `b${uid()}`,
    processId: null,
    partProductId,
    name: part.name,
    sector: first.sector,
    role: dependsOn.length ? 'FINISHING' : 'BASE',
    dependsOn: [...dependsOn],
    baseBlockId: dependsOn[0] ?? null,
    setupMinutes: 0,
    sectorHourCost: first.sectorHourCost,
    taskType: first.taskType,
    // A parte acompanha a medida e a quantidade do produto por padrão
    originalRules: rulesFor(dependsOn),
    localRules: null,
    lines: [],
  }
  insertBlock(assembly, block, insertBefore)
  return ok(block.id)
}

// Os produtos que já têm composição (CP-17): alimenta o filtro "com / sem
// composição" da lista de produtos até a API filtrar (hasComposition)
export const getComposedProductIds = async () =>
  ok(
    assemblies
      .filter((item) => !isHidden(item.productId) && item.blocks.length)
      .map((item) => item.productId),
  )

/* ---------------------------------------------------------------------------
 * Biblioteca de composições prontas (IP-7)
 * ------------------------------------------------------------------------- */

// Cada entrada é uma sequência de processos: a base e os acabamentos dela
const library: (Omit<LibraryEntry, 'stages' | 'resources'> & {
  processes: string[]
})[] = [
  {
    id: 'lib-banner',
    name: 'Banner com bastão e cordão',
    segment: 'Comunicação visual',
    description: 'Impressão solvente em lona, com madeira, ponteira e cordão.',
    processes: ['impressao-solvente', 'acabamento-banner'],
  },
  {
    id: 'lib-lona-ilhos',
    name: 'Lona com bainha e ilhós',
    segment: 'Comunicação visual',
    description: 'Impressão em lona com bainha no perímetro e ilhoses.',
    processes: ['impressao-solvente', 'bainha', 'ilhos'],
  },
  {
    id: 'lib-adesivo-laminado',
    name: 'Adesivo impresso laminado',
    segment: 'Comunicação visual',
    description: 'Impressão em adesivo com laminação brilho ou fosca.',
    processes: ['impressao-solvente', 'laminacao'],
  },
  {
    id: 'lib-adesivo-instalado',
    name: 'Adesivo com criação e instalação',
    segment: 'Comunicação visual',
    description: 'Arte, impressão e instalação no local do cliente.',
    processes: ['arte', 'impressao-solvente', 'instalacao'],
  },
  {
    id: 'lib-cartao',
    name: 'Cartão de visita',
    segment: 'Gráfica rápida',
    description: 'Couchê 300 g com aproveitamento de folha e corte.',
    processes: ['impressao-digital', 'corte-guilhotina'],
  },
  {
    id: 'lib-panfleto-arte',
    name: 'Panfleto com criação',
    segment: 'Gráfica rápida',
    description: 'Arte e impressão digital com corte na guilhotina.',
    processes: ['arte', 'impressao-digital', 'corte-guilhotina'],
  },
]

export const getLibrary = async () =>
  ok(
    library.map(({ processes, ...entry }): LibraryEntry => {
      const templates = processes
        .map((id) => templateOf(id))
        .filter((item): item is Template => !!item)
      return {
        ...entry,
        stages: templates.map((item, index) => ({
          name: item.name,
          sector: item.sector,
          role: index ? 'FINISHING' : 'BASE',
        })),
        resources: templates.reduce((sum, item) => sum + item.lines.length, 0),
      }
    }),
  )

// Importar é copiar: a composição passa a ser do produto e muda sem afetar a
// biblioteca. Os acabamentos se ligam à base que veio antes deles
export const importFromLibrary = async ({
  productId,
  libraryId,
}: {
  productId: string
  libraryId: string
}) => {
  const entry = library.find((item) => item.id === libraryId)
  if (!entry) return fail('Composição não encontrada na biblioteca')
  const assembly = findOrCreate(productId)

  // A biblioteca é uma sequência (FL-1): cada processo vem depois do
  // anterior, e o fluxo nasce ligado
  let previous: AssemblyBlock | null = null
  entry.processes.forEach((processId) => {
    const template = templateOf(processId)
    if (!template) return
    const block = fromTemplate(template, previous ? [previous.id] : [])
    insertBlock(assembly, block)
    previous = block
  })
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Etapa só da variação (PV-7): "com laminação" é a mesma composição com uma
 * etapa a mais. Entra de um processo cadastrado e sai inteira
 * ------------------------------------------------------------------------- */

export const addVariationBlock = async ({
  productId,
  variationId,
  processId,
  dependsOn = [],
}: {
  productId: string
  variationId: string
  processId: string
  dependsOn?: string[]
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')
  variation.extraBlocks = [
    ...(variation.extraBlocks || []),
    fromTemplate(template, dependsOn),
  ]
  return ok(null)
}

export const removeVariationBlock = async ({
  productId,
  variationId,
  blockId,
}: {
  productId: string
  variationId: string
  blockId: string
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  variation.extraBlocks = unwire(variation.extraBlocks || [], blockId)
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Tela de Processos (MS-11)
 * ------------------------------------------------------------------------- */

// A categoria sai do que o processo tem, não é campo a digitar (MS-7). Desde
// 03/10/2026 "acabamento de" é lido das ligações "costuma vir depois de"
// (FL-7); sem ligação, serviço de máquina ou primário
const processCategory = (processId: string, block: AssemblyBlock) => {
  const before = Array.from(processStore.entries())
    .filter(([id]) => usualNext.has(pairKey(id, processId)))
    .map(([, entry]) => entry.block.name)
  if (before.length) return `Depois de ${before.join(', ')}`
  return block.lines.some((line) => line.kind === 'MACHINE')
    ? 'Serviço de máquina'
    : 'Primário'
}

const usedIn = (processId: string) =>
  assemblies
    .filter(
      (item) =>
        !isHidden(item.productId) &&
        (item.blocks.some((block) => block.processId === processId) ||
          item.variations.some((variation) =>
            variation.extraBlocks?.some(
              (block) => block.processId === processId,
            ),
          )),
    )
    .map((item) => ({ productId: item.productId, name: item.name }))

export const getProcessList = async () =>
  ok(
    Array.from(processStore.entries()).map(([id, { block, meta }]) => ({
      id,
      name: block.name,
      sector: block.sector,
      category: processCategory(id, block),
      afterBase: meta.afterBase,
      taskType: block.taskType,
      setupMinutes: block.setupMinutes,
      rules: block.originalRules,
      lines: block.lines.length,
      kinds: Array.from(new Set(block.lines.map((line) => line.kind))),
      // Linha sem recurso é erro de cadastro (IP-37, MS-8)
      incomplete:
        !block.lines.length || block.lines.some((line) => !line.options.length),
      active: meta.active,
      usedIn: usedIn(id).length,
    })),
  )

export const getProcessDetail = async ({
  processId,
  measure,
}: {
  processId: string
  measure?: AssemblyMeasure
}) => {
  const entry = processStore.get(processId)
  if (!entry) return fail('Processo não encontrado')
  const host = findOrCreate(PROCESS_PREFIX + processId)
  const computed = compute({ ...host, measure: measure ?? host.measure })
  return ok({
    id: processId,
    hostId: host.productId,
    meta: entry.meta,
    category: processCategory(processId, entry.block),
    block: computed.blocks[0],
    // Os campos que as linhas do processo leem (IP-4)
    fields: computed.fields,
    cost: computed.cost,
    sale: computed.suggestedPrice,
    resourceSummary: computed.resourceSummary,
    measure: measure ?? host.measure,
    usedIn: usedIn(processId),
  })
}

export const createProcessDef = async ({
  name,
  sector,
  afterBase = 'INHERIT',
}: {
  name: string
  sector: string
  afterBase?: AfterBase
}) => {
  if (!name.trim()) return fail('Informe o nome do processo')
  const processId = `proc-${uid()}`
  const block: AssemblyBlock = {
    id: `p-${processId}`,
    processId: null,
    name: name.trim(),
    sector,
    role: 'BASE',
    dependsOn: [],
    baseBlockId: null,
    setupMinutes: 0,
    sectorHourCost: HOUR[sector] || 1800,
    taskType: sector,
    originalRules: { ...baseRules },
    localRules: null,
    lines: [],
  }
  processStore.set(processId, {
    block,
    meta: { afterBase, sellerInstructions: '', active: true },
  })
  assemblies.push(processWrapper(processId, block))
  return ok(processId)
}

export const updateProcessMeta = async ({
  processId,
  values,
}: {
  processId: string
  values: {
    sector?: string
    afterBase?: AfterBase
    setupMinutes?: number
    sellerInstructions?: string
    active?: boolean
  }
}) => {
  const entry = processStore.get(processId)
  if (!entry) return fail('Processo não encontrado')
  const { block, meta } = entry
  if (values.sector) {
    block.sector = values.sector
    block.sectorHourCost = HOUR[values.sector] || block.sectorHourCost
  }
  if (values.afterBase) meta.afterBase = values.afterBase
  if (values.setupMinutes !== undefined) {
    block.setupMinutes = Math.max(0, values.setupMinutes)
  }
  if (values.sellerInstructions !== undefined) {
    meta.sellerInstructions = values.sellerInstructions
  }
  // Processo usado em produto é inativado, não excluído: os produtos que o
  // usam continuam acompanhando a montagem dele; ele só deixa de ser oferecido
  if (values.active !== undefined) meta.active = values.active
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Etapas seguintes usuais (FL-7): o par é editável dos dois lados
 * ------------------------------------------------------------------------- */

const neighborsOf = (processId: string, direction: 'before' | 'after') =>
  processTemplates(false)
    .filter((item) => item.processId !== processId)
    .map(
      (item): UsualNeighbor => ({
        id: item.processId,
        name: item.name,
        sector: item.sector,
        afterBase: item.afterBase,
        usual: usualNext.has(
          direction === 'after'
            ? pairKey(processId, item.processId)
            : pairKey(item.processId, processId),
        ),
      }),
    )
    .sort(
      (a, b) =>
        Number(b.usual) - Number(a.usual) ||
        a.sector.localeCompare(b.sector) ||
        a.name.localeCompare(b.name),
    )

// Visto do processo: de quem ele "costuma vir depois", e quais são as
// "etapas seguintes usuais" dele
export const getUsualNext = async ({ processId }: { processId: string }) => {
  if (!processStore.has(processId)) return fail('Processo não encontrado')
  return ok({
    before: neighborsOf(processId, 'before'),
    after: neighborsOf(processId, 'after'),
  })
}

export const setUsualNext = async ({
  fromProcessId,
  toProcessId,
  usual,
}: {
  fromProcessId: string
  toProcessId: string
  usual: boolean
}) => {
  if (!processStore.has(fromProcessId) || !processStore.has(toProcessId)) {
    return fail('Processo não encontrado')
  }
  if (fromProcessId === toProcessId) {
    return fail('Um processo não vem depois dele mesmo')
  }
  const key = pairKey(fromProcessId, toProcessId)
  if (usual) usualNext.add(key)
  else usualNext.delete(key)
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * O item montado no orçamento (ORC-11): o mesmo editor de fluxo do produto,
 * só naquele item. Não vira cadastro, a não ser que o vendedor peça
 * ------------------------------------------------------------------------- */

export const createDraftAssembly = async ({
  name,
  measure,
}: {
  name?: string
  measure?: AssemblyMeasure
}) => {
  const productId = `${DRAFT_PREFIX}${uid()}`
  assemblies.push({
    productId,
    name: name?.trim() || 'Item composto',
    code: '',
    status: 'DRAFT',
    dimension: 'SALE',
    unitKind: 'UNITY',
    unitPrice: null,
    measure: measure ?? { quantity: 1, width: 1, height: 1 },
    unitAmount: 1,
    allowEditValues: true,
    allowEditDescription: true,
    priceTiers: [],
    technicalDescription: '',
    blocks: [],
    variations: [],
  })
  return ok(productId)
}

// O que o vendedor vê ao montar: as etapas e o preço de venda de cada
// recurso, como no legado ("Lona 440 g – R$ 25,00"). O custo não sai daqui
// (ORC-7): ele existe no cálculo e vai para o retrato da venda (ORC-10)
export const getComposedItemView = async ({
  productId,
  measure,
}: {
  productId: string
  measure?: AssemblyMeasure
}) => {
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly) return fail('Item não encontrado')
  const computed = compute(measure ? { ...assembly, measure } : assembly)
  const view: ComposedItemView = {
    productId,
    name: assembly.name,
    measure: computed.measure,
    stages: computed.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      sector: block.sector,
      dependsOn: block.dependsOn,
      processId: block.processId,
      partProductId: block.partProductId ?? null,
      partFlow: block.partFlow,
      sale: block.sale,
      setupMinutes: block.setupMinutes + block.partSetupMinutes,
      lines: [...block.partLines, ...block.lines].map((line) => ({
        id: line.id,
        name: line.name,
        kind: line.kind,
        resource: line.mode === 'LIST' ? null : line.selected?.name || null,
        quantity: line.quantity,
        unit: line.selected?.unit || line.options[0]?.unit || '',
        sale: line.sale,
      })),
    })),
    total: computed.suggestedPrice,
  }
  return ok(view)
}

// O retrato da venda do item montado (ORC-10): custo e preço de cada etapa,
// gravados na linha do orçamento. É leitura de servidor para servidor; a tela
// do orçamento não chama isto (ORC-7)
export const resolveComposedItem = async ({
  productId,
  measure,
}: {
  productId: string
  measure: AssemblyMeasure
}) => {
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly) return fail('Item não encontrado')
  const computed = compute({ ...assembly, measure })
  return ok(
    computed.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      sector: block.sector,
      kind: block.partProductId ? ('PART' as const) : ('PROCESS' as const),
      cost: block.cost,
      sale: block.sale,
      measure: block.measure,
      resolved: [...block.partLines, ...block.lines]
        .filter((line) => line.selected && line.quantity !== null)
        .map((line) => ({
          id: line.id,
          kind: line.kind,
          name: line.selected!.name,
          unit: line.selected!.unit,
          quantity: line.quantity!,
          unitCost: line.selected!.unitCost,
          cost: line.cost || 0,
        })),
    })),
  )
}

export const updateDraftAssembly = async ({
  productId,
  values,
}: {
  productId: string
  values: { name?: string; measure?: AssemblyMeasure }
}) => {
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly || !isDraft(productId)) return fail('Item não encontrado')
  if (values.name !== undefined)
    assembly.name = values.name.trim() || assembly.name
  if (values.measure) assembly.measure = values.measure
  return ok(null)
}

// "Salvar como produto" (ORC-11): o produto nasce "Em edição" (IP-14), para
// ser revisado antes de liberado para venda. O item do orçamento continua
// sendo o que foi montado nele
export const saveDraftAsProduct = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  const draft = assemblies.find((item) => item.productId === productId)
  if (!draft) return fail('Item não encontrado')
  if (!draft.blocks.length) return fail('Monte ao menos uma etapa antes')
  const newId = `prd-${uid()}`
  assemblies.push({
    ...structuredClone(draft),
    productId: newId,
    name: name.trim() || draft.name,
    code: '',
    status: 'DRAFT',
  })
  return ok(newId)
}

// O fluxo de um produto, para a parte que abre (IP-9) e para quem só precisa
// desenhar
export const getFlow = async ({ productId }: { productId: string }) => {
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly) return fail('Produto não encontrado')
  return ok<FlowStage[]>(flowOf(assembly))
}

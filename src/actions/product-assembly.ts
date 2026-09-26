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
  AssemblyLine,
  AssemblyBlock,
  AssemblyMeasure,
  ComputedLine,
  ComputedBlock,
  ProductAssembly,
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
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

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

type Template = Omit<
  AssemblyBlock,
  'id' | 'baseBlockId' | 'localRules' | 'lines' | 'processId'
> & {
  processId: string
  finishingOf: string | null
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
    role: 'BASE',
    finishingOf: null,
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
    role: 'FINISHING',
    finishingOf: 'Gráfica',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: { ...finishingRules, followsBase: false },
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
    role: 'BASE',
    finishingOf: null,
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
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
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
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
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
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    // O campo extra do ilhós é o espaçamento, com casas decimais (IP-19)
    originalRules: {
      ...finishingRules,
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
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'laminacao',
    name: 'Laminação',
    sector: 'Produção',
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
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
    role: 'BASE',
    finishingOf: null,
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
    role: 'BASE',
    finishingOf: null,
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

const fromTemplate = (
  template: Template,
  baseBlockId: string | null,
): AssemblyBlock => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { finishingOf, lines, ...rest } = template
  return {
    ...rest,
    id: `b${uid()}`,
    baseBlockId,
    localRules: null,
    lines: lines.map((line) => ({
      ...line,
      id: `l${uid()}`,
      overridden: false,
    })),
  }
}

const templateOf = (processId: string) =>
  catalog.find((item) => item.processId === processId)

// O Banner do legado (ITP1): impressão solvente + acabamento de banner
const bannerBase = fromTemplate(templateOf('impressao-solvente')!, null)
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
      fromTemplate(templateOf('acabamento-banner')!, bannerBase.id),
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
const cartaoBase = fromTemplate(templateOf('impressao-digital')!, null)
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
    fromTemplate(templateOf('corte-guilhotina')!, cartaoBase.id),
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
const metalon = (id: string, name: string, unitCost: number) => ({
  id,
  name,
  unit: 'm',
  unitCost,
  unitSale: unitCost * 2,
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
            metalon('metalon20', 'Metalon 20 × 20', 1000),
            metalon('metalon30', 'Metalon 30 × 30', 1600),
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

// A placa: a parte (o quadro) + a impressão da lona, com cantoneira
// opcional nas laterais — o exemplo do time para o IP-28
const placaFrame = {
  id: `b${uid()}`,
  processId: null,
  partProductId: 'quadro-metalon',
  name: 'Quadro de metalon',
  sector: 'Produção',
  role: 'BASE' as const,
  baseBlockId: null,
  setupMinutes: 0,
  sectorHourCost: HOUR['Produção'],
  taskType: 'Produção',
  originalRules: { ...baseRules },
  localRules: null,
  lines: [],
}
const placaPrint = fromTemplate(templateOf('impressao-solvente')!, null)
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
    placaFrame,
    placaPrint,
    {
      id: `b${uid()}`,
      processId: null,
      name: 'Acabamento lateral',
      sector: 'Produção',
      role: 'FINISHING',
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
    },
  ],
  variations: [],
})

const findOrCreate = (productId: string) => {
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
    }
    assemblies.push(found)
  }
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

  for (const block of assembly.blocks) {
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
    const time = rules.timeField ? rules.timeFieldDefault || 0 : null

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
      const raw =
        line.mode === 'LIST' || (line.optional && !line.optionalDefault)
          ? null
          : line.formula === 'SHEET_YIELD'
            ? sheetYield
              ? sheetYield.charged * calcLine.perUnit
              : null
            : lineQuantity(calcLine, blockMeasure, extra, time)

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
}: {
  productId: string
  measure?: AssemblyMeasure
  variationId?: string | null
}) => {
  const assembly = findOrCreate(productId)
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
    catalog.map(
      (item): ProcessCatalogItem => ({
        id: item.processId,
        name: item.name,
        sector: item.sector,
        role: item.role,
        finishingOf: item.finishingOf,
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

// O acabamento entra logo depois da base e dos acabamentos que ela já tem
const insertBlock = (assembly: ProductAssembly, block: AssemblyBlock) => {
  if (block.baseBlockId) {
    let index = assembly.blocks.findIndex(
      (item) => item.id === block.baseBlockId,
    )
    while (assembly.blocks[index + 1]?.baseBlockId === block.baseBlockId) {
      index++
    }
    assembly.blocks.splice(index + 1, 0, block)
  } else {
    assembly.blocks.push(block)
  }
}

// Mão de obra de todos os setores e os recursos que os processos já usam
const resourceMap = () => {
  const map = new Map<string, AssemblyResource>()
  Object.keys(HOUR).forEach((sector) =>
    map.set(`mo-${sector}`, { ...labor(sector), kind: 'LABOR' }),
  )
  catalog.forEach((template) =>
    template.lines.forEach((line) =>
      line.options.forEach((option) => {
        if (!map.has(option.id))
          map.set(option.id, { ...option, kind: line.kind })
      }),
    ),
  )
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
  baseBlockId,
}: {
  productId: string
  name: string
  sector: string
  baseBlockId: string | null
}) => {
  if (!name.trim()) return fail('Informe o nome da etapa')
  const assembly = findOrCreate(productId)
  const block: AssemblyBlock = {
    id: `b${uid()}`,
    processId: null,
    name: name.trim(),
    sector,
    role: baseBlockId ? 'FINISHING' : 'BASE',
    baseBlockId,
    setupMinutes: 0,
    sectorHourCost: HOUR[sector] || 1800,
    taskType: sector,
    originalRules: baseBlockId ? { ...finishingRules } : { ...baseRules },
    localRules: null,
    lines: [],
  }
  insertBlock(assembly, block)
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
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  if (!block) return fail('Etapa não encontrada')
  if (!values.name.trim()) return fail('Informe o nome da linha')

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
    overridden: false,
    // Numa etapa vinda de processo, a linha a mais é só deste produto
    addedHere: block.processId !== null,
  })
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
  block.lines = block.lines.filter((line) => line.id !== lineId)
  return ok(null)
}

export const addAssemblyBlock = async ({
  productId,
  processId,
  baseBlockId,
}: {
  productId: string
  processId: string
  baseBlockId: string | null
}) => {
  const assembly = findOrCreate(productId)
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')

  const block = fromTemplate(template, baseBlockId)
  insertBlock(assembly, block)
  return ok(block.id)
}

export const removeAssemblyBlock = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const assembly = findOrCreate(productId)
  // A base sai com os acabamentos dela: acabamento sem base não existe
  assembly.blocks = assembly.blocks.filter(
    (block) => block.id !== blockId && block.baseBlockId !== blockId,
  )
  return ok(null)
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
    >
  > & {
    // Consumo, perda e mínimo por opção (IP-26); vazio volta ao da linha
    optionValues?: {
      id: string
      perUnit?: number
      lossPercent?: number
      minimum?: number | null
    }[]
  }
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const line = block?.lines.find((item) => item.id === lineId)
  if (!line) return fail('Linha não encontrada')

  // Trocar a opção escolhida não é ajuste: é o uso normal da linha
  const onlyChoice = Object.keys(values).every((key) => key === 'selectedId')
  const { optionValues, ...lineValues } = values
  Object.assign(line, lineValues)
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

// Volta a linha ao que o processo define
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
  const index = block?.lines.findIndex((item) => item.id === lineId) ?? -1
  const template = block?.processId ? templateOf(block.processId) : null
  if (!block || index < 0 || !template) return fail('Linha não encontrada')

  const original = template.lines[index]
  block.lines[index] = {
    ...original,
    id: block.lines[index].id,
    selectedId: block.lines[index].selectedId || original.selectedId,
    overridden: false,
  }
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
  if (taskType) block.taskType = taskType
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
  const assembly = assemblies.find((item) => item.productId === productId)
  if (!assembly || !assembly.blocks.length) return ok<SaleForm | null>(null)

  const form: SaleForm = {
    extras: [],
    times: [],
    choices: [],
    optionals: [],
    lists: [],
  }
  assembly.blocks.forEach((block) => {
    const rules = block.localRules ?? block.originalRules
    if (rules.timeField) {
      form.times.push({
        blockId: block.id,
        name: `Tempo · ${block.localName || block.name}`,
        defaultMinutes: rules.timeFieldDefault || 0,
      })
    }
    if (rules.extraField !== 'NONE') {
      form.extras.push({
        blockId: block.id,
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
}: {
  productId: string
  measure: AssemblyMeasure
  variationName?: string | null
  extras?: SaleExtra[]
  times?: SaleTime[]
  choices?: SaleChoice[]
  optionals?: SaleOptional[]
  lists?: SaleListEntry[]
}) => {
  const original = assemblies.find((item) => item.productId === productId)
  if (!original || !original.blocks.length) {
    return fail('Este produto não tem composição')
  }

  // Cópia: o que o vendedor escolheu vale só para esta venda
  const source: ProductAssembly = structuredClone({ ...original, measure })
  source.blocks.forEach((block) => {
    const extra = extras.find((item) => item.blockId === block.id)
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
    measure,
    variation: variation?.name || null,
    blocks: computed.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      sector: block.sector,
      role: block.role,
      baseName:
        computed.blocks.find((item) => item.id === block.baseBlockId)?.name ||
        null,
      measure: block.measure,
      extra:
        [
          block.rules.timeField
            ? `tempo ${minutesText(block.rules.timeFieldDefault || 0)}`
            : null,
          block.rules.extraField === 'NONE'
            ? null
            : `${block.rules.extraFieldName}: ${block.rules.extraFieldDefault}`,
        ]
          .filter(Boolean)
          .join(' · ') || null,
      lines: block.lines.map((line) => ({
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
      .filter((item) => item.productId !== productId && item.blocks.length)
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
  baseBlockId,
}: {
  productId: string
  partProductId: string
  baseBlockId: string | null
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

  const first = part.blocks[0]
  insertBlock(assembly, {
    id: `b${uid()}`,
    processId: null,
    partProductId,
    name: part.name,
    sector: first.sector,
    role: baseBlockId ? 'FINISHING' : 'BASE',
    baseBlockId,
    setupMinutes: 0,
    sectorHourCost: first.sectorHourCost,
    taskType: first.taskType,
    // A parte acompanha a medida e a quantidade do produto por padrão
    originalRules: baseBlockId ? { ...finishingRules } : { ...baseRules },
    localRules: null,
    lines: [],
  })
  return ok(null)
}

// Os produtos que já têm composição (CP-17): alimenta o filtro "com / sem
// composição" da lista de produtos até a API filtrar (hasComposition)
export const getComposedProductIds = async () =>
  ok(
    assemblies
      .filter((item) => item.blocks.length)
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
        stages: templates.map((item) => ({
          name: item.name,
          sector: item.sector,
          role: item.role,
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

  let base: AssemblyBlock | null = null
  entry.processes.forEach((processId) => {
    const template = templateOf(processId)
    if (!template) return
    const finishing = template.role === 'FINISHING'
    const block = fromTemplate(template, finishing ? base?.id || null : null)
    if (finishing && !base) block.role = 'BASE'
    insertBlock(assembly, block)
    if (!finishing) base = block
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
  baseBlockId,
}: {
  productId: string
  variationId: string
  processId: string
  baseBlockId: string | null
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')
  variation.extraBlocks = [
    ...(variation.extraBlocks || []),
    fromTemplate(template, baseBlockId),
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
  variation.extraBlocks = (variation.extraBlocks || []).filter(
    (block) => block.id !== blockId && block.baseBlockId !== blockId,
  )
  return ok(null)
}

// Types
import type {
  FormulaKey,
  ResourceKind,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

export const resourceKindObj: { [key in ResourceKind]: string } = {
  MACHINE: 'Máquina',
  MATERIAL: 'Material',
  LABOR: 'Mão de obra',
  OUTSOURCED: 'Terceirizado',
}

export const resourceKindOptions = (
  Object.keys(resourceKindObj) as ResourceKind[]
).map((kind) => ({ value: kind, label: resourceKindObj[kind] }))

// Nomes no lugar dos códigos de fórmula do legado (D3 §9.2)
export const formulaObj: {
  [key in FormulaKey]: { label: string; help: string }
} = {
  FIXED: {
    label: 'Valor fixo',
    help: 'Usa a quantidade informada, sem depender da medida do item.',
  },
  SELLER: {
    label: 'Definido pelo vendedor',
    help: 'O vendedor informa a quantidade no orçamento.',
  },
  PER_AREA: {
    label: 'Por metro quadrado',
    help: 'Consumo × área do item × quantidade.',
  },
  PER_UNIT: {
    label: 'Por unidade',
    help: 'Consumo × quantidade do item.',
  },
  PER_PERIMETER: {
    label: 'Por perímetro',
    help: 'Consumo × perímetro do item × quantidade.',
  },
  PER_WIDTH: {
    label: 'Por largura',
    help: 'Consumo × largura do item × quantidade.',
  },
  PER_HEIGHT: {
    label: 'Por altura',
    help: 'Consumo × altura do item × quantidade.',
  },
  PER_EXTRA: {
    label: 'Por campo extra',
    help: 'Consumo × valor de um campo extra × quantidade.',
  },
  PER_TIME: {
    label: 'Por tempo',
    help: 'Tempo informado × quantidade.',
  },
  // A conta do ilhós: perímetro ÷ espaçamento = quantas peças (CP-14)
  PER_PERIMETER_DIV_EXTRA: {
    label: 'Por perímetro ÷ campo extra',
    help: 'Perímetro do item ÷ valor do campo extra × consumo × quantidade. Ex.: ilhoses a cada 50 cm.',
  },
  TIME_TIMES_EXTRA: {
    label: 'Tempo × campo extra',
    help: 'Tempo informado × valor do campo extra. Não multiplica pela quantidade.',
  },
  EQUAL_TIME: {
    label: 'Igual ao tempo',
    help: 'Usa o tempo informado, uma vez só.',
  },
  PER_WIDTH_EXTRA: {
    label: 'Por largura × campo extra',
    help: 'Consumo × largura × campo extra × quantidade.',
  },
  PER_HEIGHT_EXTRA: {
    label: 'Por altura × campo extra',
    help: 'Consumo × altura × campo extra × quantidade.',
  },
  EXTRA_ONLY: {
    label: 'Por campo extra, uma vez',
    help: 'Consumo × campo extra. Não multiplica pela quantidade.',
  },
  PER_AREA_DIV_EXTRA: {
    label: 'Por m² ÷ campo extra',
    help: 'Consumo × área × quantidade ÷ campo extra. Ex.: peças que cabem numa chapa.',
  },
  PER_PERIMETER_EXTRA: {
    label: 'Por perímetro × campo extra',
    help: 'Consumo × perímetro × quantidade × campo extra.',
  },
  DIV_EXTRA: {
    label: 'Dividido pelo campo extra',
    help: 'Consumo ÷ campo extra, uma vez.',
  },
  AREA_EXTRA: {
    label: 'Por m² × campo extra, uma vez',
    help: 'Consumo × área × campo extra. Não multiplica pela quantidade.',
  },
  PER_AREA_EXTRA: {
    label: 'Por m² × campo extra',
    help: 'Consumo × área × quantidade × campo extra.',
  },
  SHEET_YIELD: {
    label: 'Por aproveitamento de folha',
    help: 'Quantas peças cabem na folha, nas duas posições, e quantas folhas são precisas. A folha tem a medida do material.',
  },
}

export const formulaOptions = (Object.keys(formulaObj) as FormulaKey[]).map(
  (key) => ({ value: key, label: formulaObj[key].label }),
)

export const dimensionRuleObj: { [key in DimensionRule]: string } = {
  NONE: 'Sem dimensão',
  FREE_SIZE: 'Largura e altura livres',
  FREE_AREA: 'Área livre',
  FIXED_SIZE: 'Dimensão fixa',
  // "Base" é o que recebe o acabamento; o legado chamava de "item pai"
  SAME_AS_PARENT: 'Mesma medida da base',
}

export const dimensionRuleOptions = (
  Object.keys(dimensionRuleObj) as DimensionRule[]
).map((rule) => ({ value: rule, label: dimensionRuleObj[rule] }))

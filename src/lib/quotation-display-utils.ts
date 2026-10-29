import { millimetersToMeters, calculateAreaFromMillimeters } from '@/lib/utils'

// Funções de conversão auxiliares
function milligramsToKilograms(milligrams: number): number {
  return milligrams / 1_000_000
}

function millilitersToLiters(milliliters: number): number {
  return milliliters / 1000
}

function metersToKilometers(meters: number): number {
  return meters / 1000
}

function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Tipos para as medidas que podem ser exibidas
export type MeasurementValues = {
  width?: number | null
  height?: number | null
  length?: number | null
  volume?: number | null
  weight?: number | null
  distance?: number | null
  duration?: number | null
  unitKind?: string
}

export type UnitOfMeasure = {
  id: string
  code: string
  name: string
  kind?: string
}

/**
 * Número de medida como se lê: vírgula decimal e até três casas, sem zeros
 * à direita (0,5 · 1,25 · 2).
 */
export function formatMeasureNumber(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

/**
 * Detalhamento da linha: quantidade e medida de cada unidade, no padrão do
 * sistema (design.md §18): "4 un · 1 × 0,5 m", "2 un · 3 m", "1 un".
 * Antes saía "4 un 1x0.5", com ponto decimal e sem a unidade da medida.
 */
export function generateFormattedQuantityDetails(
  composition: {
    quantity?: number | null
    originalQuantity?: number | null
  } & MeasurementValues,
): string {
  const compositionQty =
    composition.quantity || composition.originalQuantity || 1
  const num = formatMeasureNumber
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'

  const area =
    composition.width && composition.height
      ? `${num(millimetersToMeters(composition.width))} × ${num(millimetersToMeters(composition.height))} m`
      : ''
  const length = composition.length
    ? `${num(millimetersToMeters(composition.length))} m`
    : ''

  let measure = ''
  switch (unitKind) {
    case 'AREA':
      measure = area
      break
    case 'LENGTH':
      measure = length
      break
    case 'CAPACITY':
      if (composition.volume)
        measure = `${num(millilitersToLiters(composition.volume))} l`
      break
    case 'WEIGHT':
      if (composition.weight)
        measure = `${num(milligramsToKilograms(composition.weight))} kg`
      break
    case 'DISTANCE':
      if (composition.distance)
        measure = `${num(metersToKilometers(composition.distance))} km`
      break
    case 'DURATION':
      if (composition.duration)
        measure = secondsToTimeString(composition.duration)
      break
    case 'UNITY':
    default:
      // Unidade simples também pode trazer a medida do arquivo: é assim que a
      // venda vem do sistema legado — cobrada por unidade, com o tamanho
      // anotado na linha. Sem isto a medida existe no banco e não aparece em
      // lugar nenhum: nem na tela do documento, nem na proposta impressa.
      measure = area || length
      break
  }

  const quantity = `${num(compositionQty)} un`
  return measure ? `${quantity} · ${measure}` : quantity
}

/**
 * Obtém o código da unidade inferido das dimensões
 */
export function getInferredUnitCode(composition: MeasurementValues): string {
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'
  return getUnitCodeFromKind(unitKind)
}

/**
 * Código da unidade como aparece na tela: minúsculo e sem ponto final, para
 * "un" sair igual em todo lugar (o cadastro da API às vezes traz "UN.").
 */
export function unitCodeLabel(code?: string | null): string {
  return (code || 'un').trim().toLowerCase().replace(/\.+$/, '')
}

/**
 * Obtém o código da unidade baseado no tipo
 */
function getUnitCodeFromKind(unitKind: string): string {
  switch (unitKind.toUpperCase()) {
    case 'AREA':
      return 'm²'
    case 'LENGTH':
      return 'm'
    case 'CAPACITY':
      return 'l'
    case 'WEIGHT':
      return 'kg'
    case 'DISTANCE':
      return 'km'
    case 'DURATION':
      return 'h'
    case 'UNITY':
    default:
      return 'un'
  }
}

/**
 * Calcula a quantidade total considerando as medidas
 */
export function calculateTotalQuantity(
  itemQuantity: number | null | undefined,
  composition: {
    quantity?: number | null
    originalQuantity?: number | null
    unitCode?: string
  } & MeasurementValues,
): { value: number; unit: string; formatted: string } {
  const baseQuantity = itemQuantity || 1
  const compositionQuantity =
    composition.quantity || composition.originalQuantity || 1

  // Usar unitKind da API
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'
  const unitCode = composition.unitCode || getUnitCodeFromKind(unitKind)

  // Para produtos simples (unity), multiplicar as quantidades
  if (unitKind === 'UNITY' || !unitKind) {
    const totalQty = baseQuantity * compositionQuantity
    return {
      value: totalQty,
      unit: unitCode.toLowerCase(),
      formatted: `${totalQty} ${unitCode.toLowerCase()}.`,
    }
  }

  // Para outros tipos, calcular a medida total
  let totalMeasurement = 0
  let unit = unitCode.toLowerCase()

  switch (unitKind) {
    case 'AREA': {
      if (composition.width && composition.height) {
        const areaPerUnit = calculateAreaFromMillimeters(
          composition.width,
          composition.height,
        )
        totalMeasurement = areaPerUnit * compositionQuantity * baseQuantity
        unit = 'm²'
      }
      break
    }

    case 'LENGTH': {
      if (composition.length) {
        const lengthPerUnit = millimetersToMeters(composition.length)
        totalMeasurement = lengthPerUnit * compositionQuantity * baseQuantity
        unit = 'm'
      }
      break
    }

    case 'CAPACITY': {
      if (composition.volume) {
        const volumePerUnit = millilitersToLiters(composition.volume)
        totalMeasurement = volumePerUnit * compositionQuantity * baseQuantity
        unit = 'l'
      }
      break
    }

    case 'WEIGHT': {
      if (composition.weight) {
        const weightPerUnit = milligramsToKilograms(composition.weight)
        totalMeasurement = weightPerUnit * compositionQuantity * baseQuantity
        unit = 'kg'
      }
      break
    }

    case 'DISTANCE': {
      if (composition.distance) {
        const distancePerUnit = composition.distance / 1000 // Assumindo que distance está em metros
        totalMeasurement = distancePerUnit * compositionQuantity * baseQuantity
        unit = 'km'
      }
      break
    }

    case 'DURATION': {
      if (composition.duration) {
        const totalSeconds =
          composition.duration * compositionQuantity * baseQuantity
        // Retornar valor em horas para cálculo correto do valor unitário
        const totalHours = totalSeconds / 3600
        return {
          value: totalHours,
          unit: 'h',
          formatted: `${secondsToTimeString(totalSeconds)}`,
        }
      }
      break
    }
  }

  const formattedValue = totalMeasurement.toFixed(3).replace(/\.?0+$/, '')
  return {
    value: totalMeasurement,
    unit,
    formatted: `${formattedValue} ${unit}`,
  }
}

/**
 * Valor unitário exibido na coluna "Valor un." do orçamento e da O.S.
 * Divide pela quantidade total da medida (m², hora, metro...), não pela
 * quantidade do item — senão itens medidos mostram o valor cheio no unitário.
 */
export function calculateItemDisplayUnitValue(
  item: {
    totalValue?: number | null
    product?: { quantity?: number | null } | null
  },
  composition: Parameters<typeof calculateTotalQuantity>[1],
): number {
  const totalQuantity = calculateTotalQuantity(
    item?.product?.quantity,
    composition,
  ).value

  if (!totalQuantity) return 0

  return (item?.totalValue || 0) / totalQuantity
}

/**
 * Calcula o valor unitario comercial para exibicao.
 * As medidas ficam em Qtd. Total; Valor Un. divide o total pelas quantidades.
 */
export function calculateDisplayUnitValue(
  itemQuantity: number,
  composition: {
    unitValue?: number | null
    totalValue?: number | null
    finalValue?: number | null
    quantity?: number | null
    originalQuantity?: number | null
  } & MeasurementValues,
): number {
  const value = composition.finalValue ?? composition.totalValue
  const compositionQty =
    composition.quantity || composition.originalQuantity || 1

  const totalCommercialQuantity = compositionQty * (itemQuantity || 1)

  if (value !== null && value !== undefined && totalCommercialQuantity > 0) {
    return value / totalCommercialQuantity
  }

  return composition.unitValue || 0
}

/**
 * Obtém o código da unidade para exibição
 */
export function getUnitDisplayCode(unitOfMeasure?: UnitOfMeasure): string {
  if (!unitOfMeasure) return 'UN'

  const unitKind = unitOfMeasure.kind?.toUpperCase()

  // Mapear para códigos de exibição mais amigáveis
  switch (unitKind) {
    case 'AREA':
      return 'M2'
    case 'LENGTH':
      return 'MT'
    case 'CAPACITY':
      return 'LT'
    case 'WEIGHT':
      return 'KG'
    case 'DISTANCE':
      return 'KM'
    case 'DURATION':
      return 'HR'
    case 'UNITY':
    default:
      return unitOfMeasure.code?.replace(/\.+$/, '') || 'UN'
  }
}

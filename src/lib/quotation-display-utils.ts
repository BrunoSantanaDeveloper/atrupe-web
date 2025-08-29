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
 * Formata uma medida individual com base no tipo de unidade
 */
export function formatMeasurementValue(
  value: number | null | undefined,
  unitKind: string,
  showUnit = true,
): string {
  if (!value || value === 0) return '-'

  let formattedValue: string
  let unit: string

  switch (unitKind?.toUpperCase()) {
    case 'AREA': {
      // Área já deve vir calculada em mm², converter para m²
      const areaInM2 = value / 1_000_000 // mm² para m²
      formattedValue = areaInM2.toFixed(3).replace(/\.?0+$/, '')
      unit = 'm²'
      break
    }

    case 'LENGTH': {
      // Comprimento em mm, exibir em metros
      const lengthInM = millimetersToMeters(value)
      formattedValue = lengthInM.toFixed(3).replace(/\.?0+$/, '')
      unit = 'm'
      break
    }

    case 'CAPACITY': {
      // Volume em ml, exibir em litros
      const volumeInL = millilitersToLiters(value)
      formattedValue = volumeInL.toFixed(2).replace(/\.?0+$/, '')
      unit = 'L'
      break
    }

    case 'WEIGHT': {
      // Peso em mg, exibir em kg
      const weightInKg = milligramsToKilograms(value)
      formattedValue = weightInKg.toFixed(3).replace(/\.?0+$/, '')
      unit = 'kg'
      break
    }

    case 'DISTANCE': {
      // Distância em metros, exibir em km
      const distanceInKm = metersToKilometers(value)
      formattedValue = distanceInKm.toFixed(3).replace(/\.?0+$/, '')
      unit = 'km'
      break
    }

    case 'DURATION': {
      // Duração em segundos, exibir em HH:MM:SS
      formattedValue = secondsToTimeString(value)
      unit = 'h'
      break
    }

    case 'UNITY':
    default: {
      // Unidade simples
      formattedValue = value.toString()
      unit = 'un'
      break
    }
  }

  return showUnit ? `${formattedValue} ${unit}` : formattedValue
}

/**
 * Gera o detalhamento das quantidades para exibição na tabela
 * Formato: [Qtd Item] x [Qtd Composition] x [Dimensões da unidade]
 * Exemplo: 3x2x3x3 (para área), 3x2x2 (para volume)
 */
export function generateQuantityDetails(
  itemQuantity: number,
  composition: {
    quantity?: number | null
    originalQuantity?: number | null
  } & MeasurementValues,
): string {
  const compositionQty =
    composition.quantity || composition.originalQuantity || 1

  // Usar unitKind da API
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'

  let dimensionDetails = ''

  switch (unitKind) {
    case 'AREA':
      if (composition.width && composition.height) {
        const widthM = millimetersToMeters(composition.width)
        const heightM = millimetersToMeters(composition.height)
        dimensionDetails = `x${widthM}x${heightM}`
      }
      break

    case 'LENGTH':
      if (composition.length) {
        const lengthM = millimetersToMeters(composition.length)
        dimensionDetails = `x${lengthM}`
      }
      break

    case 'CAPACITY':
      if (composition.volume) {
        const volumeL = millilitersToLiters(composition.volume)
        dimensionDetails = `x${volumeL}`
      }
      break

    case 'WEIGHT':
      if (composition.weight) {
        const weightKg = milligramsToKilograms(composition.weight)
        dimensionDetails = `x${weightKg}`
      }
      break

    case 'DISTANCE':
      if (composition.distance) {
        const distanceKm = metersToKilometers(composition.distance)
        dimensionDetails = `x${distanceKm}`
      }
      break

    case 'DURATION':
      if (composition.duration) {
        const timeStr = secondsToTimeString(composition.duration)
        dimensionDetails = `x${timeStr}`
      }
      break

    case 'UNITY':
    default:
      // Para unidade simples, sem dimensões extras
      break
  }

  return `${itemQuantity}x${compositionQty}${dimensionDetails}`
}

/**
 * Gera o detalhamento das medidas no formato correto para a tabela
 * Formato: [Qtd Item] x [Qtd Composition] x [Dimensões]
 * Exemplo: 3x2x3x3 para área, 3x2x2 para volume
 */
export function generateFormattedQuantityDetails(
  composition: {
    quantity?: number | null
    originalQuantity?: number | null
  } & MeasurementValues,
  // itemQuantity?: number,
): string {
  const compositionQty =
    composition.quantity || composition.originalQuantity || 1

  // Usar unitKind da API
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'

  // let details = `${itemQuantity}x${compositionQty}`
  let details = `${compositionQty} un `

  switch (unitKind) {
    case 'AREA':
      if (composition.width && composition.height) {
        const widthM = millimetersToMeters(composition.width)
        const heightM = millimetersToMeters(composition.height)
        details += `${widthM}x${heightM}`
      }
      break

    case 'LENGTH':
      if (composition.length) {
        const lengthM = millimetersToMeters(composition.length)
        details += `${lengthM} m`
      }
      break

    case 'CAPACITY':
      if (composition.volume) {
        const volumeL = millilitersToLiters(composition.volume)
        details += `${volumeL} l`
      }
      break

    case 'WEIGHT':
      if (composition.weight) {
        const weightKg = milligramsToKilograms(composition.weight)
        details += `${weightKg} kg`
      }
      break

    case 'DISTANCE':
      if (composition.distance) {
        const distanceKm = metersToKilometers(composition.distance)
        details += `${distanceKm} km`
      }
      break

    case 'DURATION':
      if (composition.duration) {
        const timeStr = secondsToTimeString(composition.duration)
        details += `${timeStr}`
      }
      break

    case 'UNITY':
    default:
      // Para unidade simples, sem dimensões extras
      break
  }

  return details
}

/**
 * Obtém o código da unidade inferido das dimensões
 */
export function getInferredUnitCode(composition: MeasurementValues): string {
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'
  return getUnitCodeFromKind(unitKind)
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
 * Gera o detalhamento das medidas para exibição na tabela (versão antiga)
 * Mantida para compatibilidade
 */
export function generateMeasurementDetails(
  composition: {
    quantity?: number | null
    unitOfMeasure?: UnitOfMeasure
  } & MeasurementValues,
): string {
  if (!composition.unitOfMeasure) return '-'

  const { unitOfMeasure, quantity = 1 } = composition
  const unitKind = unitOfMeasure.kind?.toUpperCase()

  // Para quantidade simples, mostrar apenas a quantidade
  if (unitKind === 'UNITY' || !unitKind) {
    return `${quantity} ${unitOfMeasure.code.toLowerCase()}`
  }

  const details: string[] = []

  switch (unitKind) {
    case 'AREA':
      // Para área, mostrar largura x altura
      if (composition.width && composition.height) {
        const width = formatMeasurementValue(composition.width, 'LENGTH', false)
        const height = formatMeasurementValue(
          composition.height,
          'LENGTH',
          false,
        )
        details.push(`${quantity}un ${width} x ${height}m`)
      }
      break

    case 'LENGTH':
      // Para comprimento, mostrar a medida linear
      if (composition.length) {
        const length = formatMeasurementValue(
          composition.length,
          'LENGTH',
          false,
        )
        details.push(`${quantity}un ${length}m`)
      }
      break

    case 'CAPACITY':
      // Para volume, mostrar a capacidade
      if (composition.volume) {
        const volume = formatMeasurementValue(
          composition.volume,
          'CAPACITY',
          false,
        )
        details.push(`${quantity}un ${volume}L`)
      }
      break

    case 'WEIGHT':
      // Para peso, mostrar o peso unitário
      if (composition.weight) {
        const weight = formatMeasurementValue(
          composition.weight,
          'WEIGHT',
          false,
        )
        details.push(`${quantity}un ${weight}kg`)
      }
      break

    case 'DISTANCE':
      // Para distância, mostrar a distância
      if (composition.distance) {
        const distance = formatMeasurementValue(
          composition.distance,
          'DISTANCE',
          false,
        )
        details.push(`${quantity}un ${distance}km`)
      }
      break

    case 'DURATION':
      // Para duração, mostrar o tempo
      if (composition.duration) {
        const duration = formatMeasurementValue(
          composition.duration,
          'DURATION',
          false,
        )
        details.push(`${quantity}un ${duration}`)
      }
      break
  }

  return details.length > 0
    ? details.join(', ')
    : `${quantity} ${unitOfMeasure.code.toLowerCase()}`
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
        return {
          value: totalSeconds,
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
 * Calcula o valor unitário correto para exibição baseado no totalValue
 * dividido pela quantidade total de unidades de medida
 */
export function calculateDisplayUnitValue(
  itemQuantity: number,
  composition: {
    unitValue?: number | null
    totalValue?: number | null
    quantity?: number | null
    originalQuantity?: number | null
  } & MeasurementValues,
): number {
  const totalValue = composition.totalValue || 0
  const compositionQty =
    composition.quantity || composition.originalQuantity || 1

  // Usar unitKind da API
  const unitKind = composition.unitKind?.toUpperCase() || 'UNITY'

  switch (unitKind) {
    case 'AREA': {
      if (composition.width && composition.height) {
        // Para área: calcular valor por m²
        const areaPerUnit = calculateAreaFromMillimeters(
          composition.width,
          composition.height,
        )
        const totalArea = areaPerUnit * compositionQty * itemQuantity
        return totalValue / totalArea
      }
      break
    }

    case 'LENGTH': {
      if (composition.length) {
        // Para comprimento: calcular valor por metro
        const lengthPerUnit = millimetersToMeters(composition.length)
        const totalLength = lengthPerUnit * compositionQty * itemQuantity
        return totalValue / totalLength
      }
      break
    }

    case 'CAPACITY': {
      if (composition.volume) {
        // Para volume: calcular valor por litro
        const volumePerUnit = millilitersToLiters(composition.volume)
        const totalVolume = volumePerUnit * compositionQty * itemQuantity
        return totalValue / totalVolume
      }
      break
    }

    case 'WEIGHT': {
      if (composition.weight) {
        // Para peso: calcular valor por kg
        const weightPerUnit = milligramsToKilograms(composition.weight)
        const totalWeight = weightPerUnit * compositionQty * itemQuantity
        return totalValue / totalWeight
      }
      break
    }

    case 'DISTANCE': {
      if (composition.distance) {
        // Para distância: calcular valor por km
        const distancePerUnit = composition.distance / 1000
        const totalDistance = distancePerUnit * compositionQty * itemQuantity
        return totalValue / totalDistance
      }
      break
    }

    case 'DURATION': {
      if (composition.duration) {
        // Para duração: calcular valor por hora
        const hoursPerUnit = composition.duration / 3600
        const totalHours = hoursPerUnit * compositionQty * itemQuantity
        return totalValue / totalHours
      }
      break
    }

    case 'UNITY':
    default: {
      // Para unidade simples: valor por unidade
      const totalUnits = compositionQty * itemQuantity
      return totalValue / totalUnits
    }
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
      return unitOfMeasure.code || 'UN'
  }
}

/* eslint-disable  @typescript-eslint/no-unused-vars */

// Third-party Imports
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

// Consts Imports
import { SecondaryNavigationType, secondaryNavRoutes } from '@/consts/nav'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Set vertical navigation as secondary if the preset route is included in pathname
// export function secondaryNavMatcher(pathname: string | null, server?: string) {
//   if (!pathname) return undefined

//   const matchedRoute = secondaryNavRoutes.find((route) =>
//     pathname?.includes(route.path),
//   )

//   if (!matchedRoute || !matchedRoute.nav) return undefined

//   const matchedNav: SecondaryNavigationType = matchedRoute?.nav

//   if (server) {
//     const newItems = matchedNav.items.map(
//       ({ icon, ...restOfItem }) => restOfItem,
//     )
//     return { ...matchedNav, items: newItems }
//   }

//   return matchedNav
// }

// TODO : Excluir e substituir por floatToBrl
export function formatNumberToDecimal(value?: number | null) {
  if (!value) return ''

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: 'accurate' | 'normal'
  } = {},
) {
  const { decimals = 0, sizeType = 'normal' } = opts

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`
}

export function truncateString(length: number, string?: string | null) {
  if (!string) return '-'

  return string?.length > length
    ? string?.slice(0, length).trim() + '...'
    : string
}

// Remover
export function brlToFloat(value: string) {
  if (!value) return 0

  return parseFloat(value.replace(/\./g, '').replace(',', '.'))
}

export function floatToBrl(value: number): string {
  if (!value) return '0,00'

  return value
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function maskCpf(value: string | null | undefined) {
  value = value?.replace(/\D/g, '')
  if (!value) return ''
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function maskCnpj(value: string | null | undefined) {
  value = value?.replace(/\D/g, '')
  if (!value) return ''
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Retorna 000.000.000-00 ou 00.000.000/0000-00
export function maskCpfCnpj(value: string | null | undefined) {
  value = value?.replace(/\D/g, '')

  if (!value) return ''
  if (value.length === 11) {
    return maskCpf(value)
  } else {
    return maskCnpj(value)
  }
}

// Retorna o valor formatado em (99) 99999-9999 ou (99) 9999-9999
export function MaskPhoneNumber(phone?: string | number | null) {
  if (!phone) return ''

  phone = phone.toString().replace(/\D/g, '')
  if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else {
    return phone
  }
}

// Retorna o valor formatado em HH:MM
export function maskCep(value: string | null | undefined) {
  value = value?.replace(/\D/g, '')
  if (!value) return ''
  if (value.length <= 5) {
    return value.replace(/(\d{2})(\d{3})/, '$1.$2')
  }
  return value.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2-$3')
}

export function maskTime(value: string) {
  value = value.replace(/\D/g, '')

  value = value.slice(0, 4)

  if (value.length >= 3) {
    value = value.replace(/(\d{1,2})(\d{2})/, '$1:$2')
  } else if (value.length === 2) {
    value = value.replace(/(\d{1})(\d{1})/, '$1:$2')
  }

  if (value.length >= 5) {
    const hours = parseInt(value.slice(0, 2), 10)
    const minutes = parseInt(value.slice(3, 5), 10)

    if (hours > 23 || minutes > 59) {
      return '23:59'
    }
  }

  return value
}

// Retorna o valor formatado em HH:MM ou HH:MM:SS
export function maskDuration(
  value: string,
  limitHours: boolean = false,
  includeSeconds: boolean = false,
) {
  value = value.replace(/\D/g, '')

  if (includeSeconds) {
    // Para duração com segundos, permitir mais dígitos para horas (até 4 dígitos = 9999 horas)
    const maxLength = limitHours ? 6 : 8
    value = value.slice(0, maxLength)

    if (value.length >= 5) {
      if (limitHours) {
        value = value.replace(/(\d{1,2})(\d{2})(\d{2})/, '$1:$2:$3')
      } else {
        value = value.replace(/(\d{1,4})(\d{2})(\d{2})/, '$1:$2:$3')
      }
    } else if (value.length >= 3) {
      if (limitHours) {
        value = value.replace(/(\d{1,2})(\d{2})/, '$1:$2:')
      } else {
        value = value.replace(/(\d{1,4})(\d{2})/, '$1:$2:')
      }
    } else if (value.length >= 2) {
      value = value.replace(/(\d{1,4})/, '$1:')
    }

    // Validar limites com segundos
    if (value.includes(':')) {
      const parts = value.split(':')
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      const seconds = parseInt(parts[2], 10)

      // Só limitar horas se limitHours for true (para horários de relógio)
      if (limitHours && hours > 23) parts[0] = '23'
      if (minutes > 59) parts[1] = '59'
      if (seconds > 59) parts[2] = '59'

      return parts.join(':')
    }
  } else {
    // Para duração sem segundos (HH:MM), limitado a 4 dígitos
    const maxLength = 4
    value = value.slice(0, maxLength)

    if (value.length >= 3) {
      value = value.replace(/(\d{1,2})(\d{2})/, '$1:$2')
    }

    // Validar limites sem segundos
    if (value.includes(':')) {
      const parts = value.split(':')
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)

      // Só limitar horas se limitHours for true (para horários de relógio)
      if (limitHours && hours > 23) parts[0] = '23'
      if (minutes > 59) parts[1] = '59'

      return parts.join(':')
    }
  }

  return value
}

export function getRandomValue([min, max]: [number, number]) {
  const randomValue = (Math.random() * (max - min) + min).toFixed(2)

  return parseFloat(randomValue)
}

export function getInitials(name?: string) {
  if (!name) return ''

  return name
    ?.split(' ')
    .filter(Boolean)
    .map((n, i, arr) => (i === 0 || i === arr.length - 1 ? n.charAt(0) : ''))
    .join('')
}

export function getFirstAndLastName(name?: string) {
  if (!name) return ''

  const nameParts = name.split(' ').filter(Boolean)

  if (nameParts.length === 0) return ''
  if (nameParts.length === 1) return nameParts[0]

  return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
}

export function parseCurrency(value: string): number {
  const trimmed = value.trim()
  if (trimmed === '') return 0
  if (trimmed.includes(',') && trimmed.includes('.')) {
    // Ex: "1.234,56": remove os pontos (separador de milhar) e troca a vírgula pelo ponto.
    const noThousand = trimmed.replace(/\./g, '')
    const normalized = noThousand.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  } else if (trimmed.includes(',')) {
    // Ex: "0,32": substitui vírgula por ponto.
    const normalized = trimmed.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  } else if (trimmed.includes('.')) {
    // Ex: "0.32": mantém o ponto como separador decimal.
    const parsed = parseFloat(trimmed)
    return isNaN(parsed) ? 0 : parsed
  }
  // Se não houver separadores, presume que o valor está em centavos.
  const cleaned = value.replace(/\D/g, '')
  return cleaned ? Number(cleaned) / 100 : 0
}

// Retorna valor em centavos (ex: 100,00 -> 10000) - enviar
export function parseCurrencyToCent(currencyStr: string): number {
  const normalizedStr = currencyStr.replace('R$', '').trim()
  if (normalizedStr === '') return 0

  // Remove separadores de milhar (.) e converte o separador decimal (,) para ponto.
  const numberString = normalizedStr.replace(/\./g, '').replace(',', '.')
  const parsedValue = parseFloat(numberString) * 100

  return isNaN(parsedValue) ? 0 : parsedValue
}

// Retorna string formatada em BRL com valor dividido por 100 (ex: 10000 -> 100,00) - receber
export function parseCurrencyToBrl(cents: number): string {
  // Verifica se o valor é um número finito para garantir consistência.
  if (!Number.isFinite(cents)) return '0,00'

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)

  // Remove o símbolo da moeda "R$" e elimina espaços extras.
  return formatted.replace('R$', '').trim()
}

// Retorna string formatada em BRL com valor dividido por 100 (ex: 10000 -> R$ 100,00)
export function formatCurrencyToBrl(value?: number | null) {
  if (!value || isNaN(Number(value)) || typeof value === 'boolean') {
    return 'R$ 0,00'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

declare global {
  interface Window {
    log: (log1: unknown, log2?: unknown) => void
  }
}

if (typeof window !== 'undefined') {
  window.log = (log1: unknown, log2?: unknown) => {
    if (!log1) return
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀', new Date().toLocaleString(), log1, log2 || '')
    }
  }
}

// ==========================================
// FUNÇÕES DE CÁLCULO DE DESCONTO
// ==========================================

/**
 * Calcula o valor do desconto baseado no tipo (percentual ou valor absoluto)
 * @param originalValue - Valor original em centavos
 * @param discountType - Tipo do desconto ('PERCENT' ou 'VALUE')
 * @param discountValue - Valor do desconto (percentual ou valor em centavos)
 * @returns Valor do desconto aplicado em centavos
 */
export function calculateDiscountValue(
  originalValue: number,
  discountType: 'PERCENT' | 'VALUE',
  discountValue: number,
): number {
  if (!originalValue || originalValue <= 0) return 0
  if (!discountValue || discountValue <= 0) return 0

  if (discountType === 'PERCENT') {
    // Para percentual, o valor do desconto já está como percentual (ex: 10 para 10%)
    return Math.round((originalValue * discountValue) / 100)
  } else {
    // Para valor absoluto, o desconto já está em centavos
    return Math.min(discountValue, originalValue) // Não pode ser maior que o valor original
  }
}

/**
 * Calcula o valor final após aplicação do desconto
 * @param originalValue - Valor original em centavos
 * @param discountType - Tipo do desconto ('PERCENT' ou 'VALUE')
 * @param discountValue - Valor do desconto (percentual ou valor em centavos)
 * @returns Valor final após desconto em centavos
 */
export function calculateFinalValueWithDiscount(
  originalValue: number,
  discountType: 'PERCENT' | 'VALUE',
  discountValue: number,
): number {
  const discountAmount = calculateDiscountValue(
    originalValue,
    discountType,
    discountValue,
  )
  return Math.max(0, originalValue - discountAmount)
}

/**
 * Calcula o percentual de desconto aplicado
 * @param originalValue - Valor original em centavos
 * @param discountedValue - Valor do desconto aplicado em centavos
 * @returns Percentual de desconto (ex: 10.5 para 10.5%)
 */
export function calculateDiscountPercentage(
  originalValue: number,
  discountedValue: number,
): number {
  if (!originalValue || originalValue <= 0) return 0
  if (!discountedValue || discountedValue <= 0) return 0

  return Number(((discountedValue / originalValue) * 100).toFixed(2))
}

/**
 * Formata a exibição do desconto para PDF/UI
 * @param discountType - Tipo do desconto ('PERCENT' ou 'VALUE')
 * @param discountValue - Valor do desconto
 * @param discountedValue - Valor calculado do desconto em centavos
 * @returns Objeto com formatações para exibição
 */
export function formatDiscountDisplay(
  discountType: 'PERCENT' | 'VALUE',
  discountValue: number,
  discountedValue: number,
) {
  return {
    // Exibe o valor/percentual do desconto
    label:
      discountType === 'PERCENT'
        ? `${discountValue}%`
        : formatCurrencyToBrl(discountValue),

    // Exibe o valor monetário do desconto aplicado
    value: `-${formatCurrencyToBrl(discountedValue)}`,

    // Valor do desconto sem formatação (para cálculos)
    rawValue: discountedValue,

    // Percentual equivalente (útil para relatórios)
    percentage:
      discountType === 'VALUE'
        ? calculateDiscountPercentage(
            discountValue + discountedValue,
            discountedValue,
          )
        : discountValue,
  }
}

/**
 * Valida se os cálculos de desconto estão corretos
 * @param originalValue - Valor original
 * @param discountType - Tipo do desconto
 * @param discountValue - Valor do desconto
 * @param expectedDiscountedValue - Valor esperado do desconto
 * @param expectedFinalValue - Valor final esperado
 * @returns boolean indicando se os cálculos estão corretos
 */
export function validateDiscountCalculation(
  originalValue: number,
  discountType: 'PERCENT' | 'VALUE',
  discountValue: number,
  expectedDiscountedValue: number,
  expectedFinalValue: number,
): boolean {
  const calculatedDiscount = calculateDiscountValue(
    originalValue,
    discountType,
    discountValue,
  )
  const calculatedFinal = calculateFinalValueWithDiscount(
    originalValue,
    discountType,
    discountValue,
  )

  return (
    Math.abs(calculatedDiscount - expectedDiscountedValue) < 1 &&
    Math.abs(calculatedFinal - expectedFinalValue) < 1
  )
}

/**
 * Calcula o percentual total de desconto aplicado
 * @param subtotal - Valor subtotal em centavos
 * @param totalDiscount - Valor total do desconto em centavos
 * @returns Percentual total de desconto (ex: 10 para 10%)
 */
export function calculateTotalDiscountPercentage(
  subtotal: number,
  totalDiscount: number,
): number {
  if (!subtotal || subtotal <= 0) return 0
  if (!totalDiscount || totalDiscount <= 0) return 0

  return Math.round((totalDiscount / subtotal) * 100)
}

// ==========================================
// FUNÇÕES DE CÁLCULO DE TOTAIS
// ==========================================

/**
 * Tipo para representar um item de orçamento para cálculos
 */
export type QuotationItemForCalculation = {
  id: string
  image: string
  description: string
  composition: Array<{
    id: string
    name: string
    quantity: number
    unitOfMeasure: string
    unitPrice: number
    totalPrice: number
  }>
  totalQuantity: number
  totalUnitPrice: number
  discount: {
    type: 'PERCENT' | 'VALUE'
    value: number
    discountedValue: number
  }
  finalPrice: number
}

/**
 * Calcula todos os totais de um orçamento baseado nos itens individuais
 * @param items - Array de itens do orçamento
 * @returns Objeto com todos os totais calculados
 */
export function calculateQuotationTotals(items: QuotationItemForCalculation[]) {
  // Corrigir valores de desconto inconsistentes primeiro
  // const correctedItems = items.map((item) => correctItemDiscountValues(item))
  const correctedItems = items // TEMP: usar dados da API sem "correção"

  const subtotal = correctedItems.reduce(
    (sum, item) => sum + item.totalUnitPrice * item.totalQuantity,
    0,
  )

  const totalDiscount = Math.max(
    0,
    correctedItems.reduce(
      (sum, item) => sum + item.discount.discountedValue,
      0,
    ),
  )

  // Para itens com desconto já aplicado em totalUnitPrice, finalTotal = soma dos finalPrice
  const finalTotal = correctedItems.reduce(
    (sum, item) => sum + item.finalPrice,
    0,
  )

  const discountPercentage = calculateTotalDiscountPercentage(
    subtotal,
    totalDiscount,
  )

  return {
    subtotal,
    totalDiscount,
    finalTotal,
    discountPercentage,
    correctedItems, // Retorna os itens corrigidos para uso no PDF
    // Valores formatados para exibição
    formatted: {
      subtotal: formatCurrencyToBrl(subtotal),
      totalDiscount: formatCurrencyToBrl(totalDiscount),
      finalTotal: formatCurrencyToBrl(finalTotal),
      discountLabel: formatCurrencyToBrl(totalDiscount),
    },
  }
}

/**
 * Valida se os totais calculados estão consistentes com os valores esperados
 * @param items - Array de itens do orçamento
 * @param expectedTotals - Totais esperados do backend
 * @returns Objeto indicando se há inconsistências e quais são
 */
export function validateQuotationTotals(
  items: QuotationItemForCalculation[],
  expectedTotals: {
    subtotal?: number
    totalDiscount?: number
    finalTotal?: number
  },
) {
  const calculated = calculateQuotationTotals(items)

  const tolerance = 1 // 1 centavo de tolerância para arredondamentos

  const subtotalValid =
    !expectedTotals.subtotal ||
    Math.abs(calculated.subtotal - expectedTotals.subtotal) <= tolerance

  const discountValid =
    !expectedTotals.totalDiscount ||
    Math.abs(calculated.totalDiscount - expectedTotals.totalDiscount) <=
      tolerance

  const finalTotalValid =
    !expectedTotals.finalTotal ||
    Math.abs(calculated.finalTotal - expectedTotals.finalTotal) <= tolerance

  return {
    isValid: subtotalValid && discountValid && finalTotalValid,
    inconsistencies: {
      subtotal: !subtotalValid
        ? {
            calculated: calculated.subtotal,
            expected: expectedTotals.subtotal,
            difference: calculated.subtotal - (expectedTotals.subtotal || 0),
          }
        : null,
      totalDiscount: !discountValid
        ? {
            calculated: calculated.totalDiscount,
            expected: expectedTotals.totalDiscount,
            difference:
              calculated.totalDiscount - (expectedTotals.totalDiscount || 0),
          }
        : null,
      finalTotal: !finalTotalValid
        ? {
            calculated: calculated.finalTotal,
            expected: expectedTotals.finalTotal,
            difference:
              calculated.finalTotal - (expectedTotals.finalTotal || 0),
          }
        : null,
    },
    correctedTotals: calculated,
  }
}

/**
 * Corrige os valores de desconto de um item quando há inconsistências
 * @param item - Item do orçamento
 * @returns Item com valores de desconto corrigidos
 */
export function correctItemDiscountValues(
  item: QuotationItemForCalculation,
): QuotationItemForCalculation {
  const totalValue = item.totalUnitPrice * item.totalQuantity
  const expectedDiscountValue = calculateDiscountValue(
    totalValue,
    item.discount.type,
    item.discount.value,
  )

  // Verifica se há inconsistência (tolerância de 1 centavo)
  const hasInconsistency =
    Math.abs(item.discount.discountedValue - expectedDiscountValue) > 1

  if (hasInconsistency) {
    console.warn(`🔧 Corrigindo desconto inconsistente:`, {
      item: `Valor: ${formatCurrencyToBrl(totalValue)}, Desconto: ${item.discount.type === 'PERCENT' ? item.discount.value + '%' : formatCurrencyToBrl(item.discount.value)}`,
      errado: formatCurrencyToBrl(item.discount.discountedValue),
      correto: formatCurrencyToBrl(expectedDiscountValue),
    })

    return {
      ...item,
      discount: {
        ...item.discount,
        discountedValue: expectedDiscountValue,
      },
      finalPrice: totalValue - expectedDiscountValue,
    }
  }

  return item
}

/**
 * Tipo para representar um item de orçamento da nova API para cálculos
 */
export type NewQuotationItemForCalculation = {
  id: string
  description: string
  image: {
    url: string
    original: boolean
  }
  product: {
    originalProductId: string
    name: string
    quantity: number
    unitValue: number
    finalValue: number
    compositions: Array<{
      id: string
      originalCompositionId: string
      name: string
      unitOfMeasure: string
      quantity: number
      originalQuantity: number
      unitValue: number
      totalValue: number
      weight: number
      width: number
      height: number
      duration: number
      length: number
      distance: number
      volume: number
    }>
  }
  discountType: 'VALUE' | 'PERCENT'
  discount: number
  unitValue: number
  totalValue: number
  finalValue: number
}

/**
 * Adapta os itens da nova API para o formato antigo para cálculos de totais
 * @param newItems - Array de itens da nova API
 * @returns Array no formato antigo para cálculos
 */
export function adaptNewItemsToOldFormat(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newItems: NewQuotationItemForCalculation[] | any[],
): QuotationItemForCalculation[] {
  if (!Array.isArray(newItems)) {
    console.error(
      '❌ adaptNewItemsToOldFormat: newItems não é um array:',
      newItems,
    )
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return newItems.map((item: any) => {
    try {
      const quantity = item.product?.quantity || item.totalQuantity || 1
      const finalValue = item.finalValue || item.finalPrice || 0
      const totalUnitPrice = finalValue / quantity

      return {
        id: item.id || '',
        image: item.image?.url || item.image || '',
        description: item.description || '',
        composition: (item.product?.compositions || item.compositions || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((comp: any) => ({
            id: comp.id || '',
            name: comp.name || '',
            quantity: comp.quantity || 0,
            unitOfMeasure: comp.unitOfMeasure || '',
            unitPrice: comp.unitValue || comp.unitPrice || 0,
            totalPrice: comp.totalValue || comp.totalPrice || 0,
          })),
        totalQuantity: quantity,
        totalUnitPrice,
        discount: {
          type: (item.discountType || item.discount?.type || 'VALUE') as
            | 'PERCENT'
            | 'VALUE',
          value: item.discount || item.discount?.value || 0,
          discountedValue:
            (item.totalValue || 0) - (item.finalValue || 0) ||
            item.discount?.discountedValue ||
            0,
        },
        finalPrice: item.finalValue || item.finalPrice || 0,
      }
    } catch (error) {
      console.error('❌ Erro ao adaptar item:', item, error)
      return {
        id: '',
        image: '',
        description: '',
        composition: [],
        totalQuantity: 0,
        totalUnitPrice: 0,
        discount: { type: 'VALUE' as const, value: 0, discountedValue: 0 },
        finalPrice: 0,
      }
    }
  })
}

/**
 * Converte metros para milímetros
 * @param meters - Valor em metros
 * @returns Valor em milímetros
 */
export function metersToMillimeters(meters: number): number {
  return meters * 1000
}

/**
 * Converte milímetros para metros
 * @param millimeters - Valor em milímetros
 * @returns Valor em metros
 */
export function millimetersToMeters(millimeters: number): number {
  return millimeters / 1000
}

/**
 * Calcula área em metros quadrados a partir de dimensões em milímetros
 * @param widthMm - Largura em milímetros
 * @param heightMm - Altura em milímetros
 * @returns Área em metros quadrados
 */
export function calculateAreaFromMillimeters(
  widthMm: number,
  heightMm: number,
): number {
  const widthM = millimetersToMeters(widthMm)
  const heightM = millimetersToMeters(heightMm)
  return widthM * heightM
}

/**
 * Calcula área em milímetros quadrados a partir de dimensões em milímetros
 * @param widthMm - Largura em milímetros
 * @param heightMm - Altura em milímetros
 * @returns Área em milímetros quadrados
 */
export function calculateAreaInMillimeters(
  widthMm: number,
  heightMm: number,
): number {
  return widthMm * heightMm
}

export function capitalize(text?: string): string {
  if (!text) return ''

  return text
    .split(/(\s|\.|\/|-)/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

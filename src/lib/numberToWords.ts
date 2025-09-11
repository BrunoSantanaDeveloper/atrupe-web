// Função para converter números para extenso em português
export function numberToWords(
  value: number,
  isInCents: boolean = false,
): string {
  // Se o valor está em centavos, converte para reais
  if (isInCents) {
    value = value / 100
  }
  const units = [
    '',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
    'dez',
    'onze',
    'doze',
    'treze',
    'catorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ]

  const tens = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
  ]

  const hundreds = [
    '',
    'cento',
    'duzentos',
    'trezentos',
    'quatrocentos',
    'quinhentos',
    'seiscentos',
    'setecentos',
    'oitocentos',
    'novecentos',
  ]

  if (value === 0) return 'zero'

  function convertGroup(num: number): string {
    if (num === 0) return ''

    let result = ''

    // Centenas
    if (num >= 100) {
      if (num === 100) {
        result += 'cem'
      } else {
        result += hundreds[Math.floor(num / 100)]
      }
      num %= 100
      if (num > 0) result += ' e '
    }

    // Dezenas e unidades
    if (num >= 20) {
      result += tens[Math.floor(num / 10)]
      num %= 10
      if (num > 0) result += ' e '
    }

    if (num > 0) {
      result += units[num]
    }

    return result
  }

  let result = ''
  let integerPart = Math.floor(value)
  const decimalPart = Math.round((value - integerPart) * 100)

  // Parte inteira
  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000)
    result += convertGroup(millions)
    result += millions === 1 ? ' milhão' : ' milhões'
    integerPart %= 1000000
    if (integerPart > 0) result += ' e '
  }

  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000)
    if (thousands === 1) {
      result += 'um mil'
    } else {
      result += convertGroup(thousands) + ' mil'
    }
    integerPart %= 1000
    if (integerPart > 0) result += ' e '
  }

  if (integerPart > 0) {
    result += convertGroup(integerPart)
  }

  // Parte decimal (centavos)
  if (decimalPart > 0) {
    result += ' reais e '
    result += convertGroup(decimalPart)
    result += decimalPart === 1 ? ' centavo' : ' centavos'
  } else {
    result += ' reais'
  }

  return result
}

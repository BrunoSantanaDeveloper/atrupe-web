export function HandleValidateCnpj(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '')

  // Verifica se o CNPJ está vazio ou possui tamanho diferente de 14
  if (!cnpj || cnpj.length !== 14) return false

  // Elimina CNPJs com todos os dígitos iguais
  const invalidCnpjs = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999',
  ]

  if (invalidCnpjs.includes(cnpj)) return false

  // Cálculo do primeiro dígito verificador
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)

  let sum = 0
  let pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number(digits.charAt(0))) return false

  // Cálculo do segundo dígito verificador
  length += 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number(digits.charAt(1))) return false

  return true
}

export function HandleValidateCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '')

  if (!cpf || cpf.length !== 11) {
    return false
  }

  const invalidCpfs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ]

  if (invalidCpfs.includes(cpf)) {
    return false
  }

  let sum = 0
  let remainder = 0
  let firstDigit = 0
  let secondDigit = 0
  let cpfPartial = cpf.substring(0, 9)

  // Cálculo do primeiro dígito verificador
  for (let i = 0, weight = 10; i < 9; i++, weight--) {
    sum += Number(cpfPartial[i]) * weight
  }

  remainder = sum % 11
  firstDigit = remainder < 2 ? 0 : 11 - remainder

  // Cálculo do segundo dígito verificador
  cpfPartial += firstDigit
  sum = 0

  for (let i = 0, weight = 11; i < 10; i++, weight--) {
    sum += Number(cpfPartial[i]) * weight
  }

  remainder = sum % 11
  secondDigit = remainder < 2 ? 0 : 11 - remainder

  cpfPartial += secondDigit

  return cpf === cpfPartial
}

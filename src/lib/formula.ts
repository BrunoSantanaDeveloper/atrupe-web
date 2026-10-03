// Fórmula do produto (IP-2, decidida em 03/10/2026): a conta escrita por quem
// monta a composição, quando nenhum tipo de cálculo pronto serve. Lê as
// medidas do item, o tempo e os campos do orçamento do produto, pelo nome.
// Nada de eval: a expressão é lida e calculada aqui, só com o que ela pode
// usar.

export type FormulaVars = { [name: string]: number }

// O que toda fórmula pode ler, além dos campos do produto
export const MEASURE_NAMES = [
  'largura',
  'altura',
  'área',
  'perímetro',
  'quantidade',
  'tempo',
]

// Funções: arredondar para cima (ilhoses nunca saem quebrados), para baixo
// (peças que cabem) e ao mais próximo
const FUNCTIONS: { [name: string]: (value: number) => number } = {
  cima: Math.ceil,
  baixo: Math.floor,
  arredondar: Math.round,
}

export const normalizeName = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: string }
  | { type: 'var'; name: string }
  | { type: 'fn'; name: string }

const isWord = (char: string) => /[A-Za-zÀ-ÿ0-9_]/.test(char)

const tokenize = (
  expression: string,
  names: string[],
): { tokens: Token[]; error: string | null } => {
  const tokens: Token[] = []
  // Nome mais longo primeiro: "nr de letras" antes de "nr"
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let i = 0
  while (i < expression.length) {
    const char = expression[i]
    if (/\s/.test(char)) {
      i += 1
      continue
    }
    const rest = expression.slice(i)
    const number = rest.match(/^(\d+(?:[.,]\d+)?|[.,]\d+)/)
    if (number) {
      tokens.push({ type: 'num', value: Number(number[0].replace(',', '.')) })
      i += number[0].length
      continue
    }
    const op = {
      '×': '*',
      '÷': '/',
      x: null,
      '*': '*',
      '/': '/',
      '+': '+',
      '-': '-',
      '−': '-',
      '(': '(',
      ')': ')',
      '^': '^',
    }[char]
    if (op) {
      tokens.push({ type: 'op', value: op })
      i += 1
      continue
    }
    const normalizedRest = normalizeName(rest)
    const fn = Object.keys(FUNCTIONS).find(
      (name) =>
        normalizedRest.startsWith(name) &&
        /^\s*\(/.test(normalizedRest.slice(name.length)),
    )
    if (fn) {
      tokens.push({ type: 'fn', name: fn })
      i += fn.length
      continue
    }
    const variable = sorted.find((name) => {
      const normalized = normalizeName(name)
      if (!normalized || !normalizedRest.startsWith(normalized)) return false
      const next = normalizedRest[normalized.length]
      return next === undefined || !isWord(next)
    })
    if (variable) {
      tokens.push({ type: 'var', name: variable })
      i += variable.length
      continue
    }
    const unknown = rest.match(/^[A-Za-zÀ-ÿ0-9_ ]+/)?.[0].trim() || char
    return {
      tokens,
      error: `Não reconheci "${unknown}". Use as medidas, os campos do orçamento, números e + − × ÷ ( ).`,
    }
  }
  return { tokens, error: null }
}

// expr := term (('+'|'-') term)* · term := factor (('*'|'/') factor)* ·
// factor := '-' factor | atom ('^' factor)? · atom := num | var | fn(expr) | (expr)
const parse = (
  tokens: Token[],
  vars: FormulaVars,
): { value: number; error: string | null } => {
  let position = 0
  const peek = () => tokens[position]
  const take = () => tokens[position++]
  const fail = (message: string) => {
    throw new Error(message)
  }

  const atom = (): number => {
    const token = take()
    if (!token) fail('A fórmula terminou antes da hora.')
    if (token.type === 'num') return token.value
    if (token.type === 'var') {
      const key = Object.keys(vars).find(
        (name) => normalizeName(name) === normalizeName(token.name),
      )
      return key ? vars[key] : 0
    }
    if (token.type === 'fn') {
      const open = take()
      if (!open || open.type !== 'op' || open.value !== '(') {
        fail(`${token.name} precisa de parênteses: ${token.name}(…)`)
      }
      const inner = expr()
      const close = take()
      if (!close || close.type !== 'op' || close.value !== ')') {
        fail('Falta fechar um parêntese.')
      }
      return FUNCTIONS[token.name](inner)
    }
    if (token.type === 'op' && token.value === '(') {
      const inner = expr()
      const close = take()
      if (!close || close.type !== 'op' || close.value !== ')') {
        fail('Falta fechar um parêntese.')
      }
      return inner
    }
    return fail(`Não esperava "${token.value}" aqui.`) as never
  }

  const factor = (): number => {
    const token = peek()
    if (token?.type === 'op' && token.value === '-') {
      take()
      return -factor()
    }
    const base = atom()
    const next = peek()
    if (next?.type === 'op' && next.value === '^') {
      take()
      return base ** factor()
    }
    return base
  }

  const term = (): number => {
    let value = factor()
    for (;;) {
      const token = peek()
      if (token?.type !== 'op' || (token.value !== '*' && token.value !== '/'))
        return value
      take()
      const right = factor()
      if (token.value === '/') {
        if (right === 0)
          fail('Divisão por zero: confira o campo que está no divisor.')
        value /= right
      } else {
        value *= right
      }
    }
  }

  const expr = (): number => {
    let value = term()
    for (;;) {
      const token = peek()
      if (token?.type !== 'op' || (token.value !== '+' && token.value !== '-'))
        return value
      take()
      const right = term()
      value = token.value === '+' ? value + right : value - right
    }
  }

  try {
    const value = expr()
    if (position < tokens.length) {
      const token = tokens[position]
      fail(
        `Sobrou "${token.type === 'op' ? token.value : token.type === 'num' ? token.value : token.name}" no fim da fórmula.`,
      )
    }
    if (!Number.isFinite(value)) fail('A conta não deu um número.')
    return { value, error: null }
  } catch (error) {
    return { value: 0, error: (error as Error).message }
  }
}

// Calcula a fórmula com os valores dados. `vars` traz as medidas e os campos
// do produto; os nomes são comparados sem acento e sem maiúscula
export const evaluateFormula = (
  expression: string,
  vars: FormulaVars,
): { value: number | null; error: string | null } => {
  if (!expression.trim()) return { value: null, error: 'Escreva a fórmula.' }
  const { tokens, error } = tokenize(expression, Object.keys(vars))
  if (error) return { value: null, error }
  const result = parse(tokens, vars)
  return result.error
    ? { value: null, error: result.error }
    : { value: result.value, error: null }
}

// A fórmula lê este nome? (para "usado em" dos campos do orçamento)
export const formulaUsesName = (expression: string, name: string) => {
  const { tokens } = tokenize(expression, [...MEASURE_NAMES, name])
  return tokens.some(
    (token) =>
      token.type === 'var' && normalizeName(token.name) === normalizeName(name),
  )
}

// Extração dos textos visíveis ao usuário (variação de idioma, 07/10/2026).
// Lê src/**/*.ts(x) sem alterar nada e grava src/i18n/extracao.json:
// um registro por ocorrência, com o texto em português, o arquivo, a linha,
// o tipo de ocorrência e as marcas fiscal-br / pais-br.
// Uso: node scripts/i18n/extract.mjs [--out arquivo] [--quiet]
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { createHash } from 'node:crypto'

const require = createRequire(import.meta.url)
const ts = require('typescript')
// fileURLToPath, e não .pathname: no Windows o .pathname vem como /C:/...
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const SRC = join(ROOT, 'src')

const TEXT_ATTRS = new Set([
  'placeholder',
  'title',
  'label',
  'description',
  'tooltip',
  'aria-label',
  'alt',
  'emptyMessage',
  'emptyText',
  'confirmLabel',
  'cancelLabel',
  'subtitle',
  'helperText',
  'helper',
  'hint',
  'message',
  'heading',
  'caption',
  'loadingText',
  'successMessage',
  'errorMessage',
  'buttonLabel',
  'actionLabel',
  'searchPlaceholder',
  'noResultsText',
  'text',
])
const TEXT_PROPS = new Set([
  ...TEXT_ATTRS,
  'message',
  'required_error',
  'invalid_type_error',
  'success',
  'error',
  'loading',
])
const ZOD_METHODS = new Set([
  'min',
  'max',
  'length',
  'email',
  'url',
  'regex',
  'refine',
  'superRefine',
  'nonempty',
  'positive',
  'nonnegative',
  'int',
  'gte',
  'lte',
  'gt',
  'lt',
  'datetime',
  'date',
  'uuid',
  'cuid',
  'includes',
  'startsWith',
  'endsWith',
  'multipleOf',
  'finite',
  'safe',
  'string',
  'number',
])

const FISCAL =
  /\b(NF-?e|NFC-?e|NFS-?e|CFOP|ICMS|IPI|PIS|COFINS|CST|CSOSN|NCM|CEST|SEFAZ|DANFE|Invoicy|substitui[cç][aã]o tribut|nota fiscal|notas fiscais|regime tribut|al[ií]quota)\b/i
const PAIS =
  /\b(CNPJ|CPF|CEP|PIX|boleto|IBGE|inscri[cç][aã]o (estadual|municipal)|Simples Nacional|INSS|FGTS|13[ºo]|d[eé]cimo terceiro|Receita Federal|UF)\b/i

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (!['i18n', 'node_modules'].includes(name)) walk(p, out)
    } else if (
      /\.(tsx?|jsx?)$/.test(name) &&
      !/\.(test|spec|d)\.tsx?$/.test(name)
    )
      out.push(p)
  }
  return out
}

const looksTechnical = (s) =>
  !/\p{L}/u.test(s) ||
  (/^[\w.:/#@?&=%+-]+$/.test(s) &&
    !/^[\p{Lu}][\p{Ll}]+$/u.test(s) &&
    !/[À-ÿ]/.test(s) &&
    !/^\p{Lu}{2,}$/u.test(s)) ||
  /^(https?:|mailto:|\/|#|\.\/|@\/)/.test(s) ||
  /^[a-z]+(-[a-z0-9]+)+(\s+[a-z0-9:[\]/.-]+)*$/.test(s) || // classes CSS
  /^(sm|md|lg|xl|flex|grid|text|bg|border|p[xytrbl]?|m[xytrbl]?|w|h|gap|rounded)[-:]/.test(
    s,
  ) ||
  /^[a-z]+:[a-z:_-]+$/.test(s) // permissões
const isUserText = (s) => s && s.trim() && !looksTechnical(s.trim())

function templateToIcu(node, sf) {
  // `Olá ${user.name}` -> "Olá {name}"
  let out = node.head.text
  const vars = []
  for (const span of node.templateSpans) {
    const raw = span.expression.getText(sf)
    let name = (raw.match(/([A-Za-z_]\w*)\)?\s*$/) || ['', 'valor'])[1]
    if (/^\d/.test(name) || ['toString', 'length'].includes(name))
      name = 'valor'
    let n = name
    let k = 2
    while (vars.includes(n)) n = name + k++
    vars.push(n)
    out += `{${n}}` + span.literal.text
  }
  return { text: out, vars }
}

const entries = []
const files = walk(SRC)
for (const file of files) {
  const code = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  // Caminho com / em qualquer sistema: as marcas, a área e o mapa usam /
  const rel = relative(ROOT, file).split(sep).join('/')
  const add = (node, raw, kind, vars = []) => {
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!isUserText(text)) return
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
    const marks = []
    if (
      FISCAL.test(text) ||
      /nota-fiscal|fiscal|invoice|nfe|nfse|nfce/i.test(rel)
    )
      marks.push('fiscal-br')
    if (PAIS.test(text)) marks.push('pais-br')
    if (/^src\/app\/sandbox\//.test(rel)) marks.push('vitrine')
    if (/^src\/app\/\(app-sidebar\)\/admin\//.test(rel)) marks.push('interno')
    if (
      /assinatura\/components\/Subscript|termos|contrato/i.test(rel) &&
      /^\d+(\.\d+)*[.)]?\s|CONTRATANTE|CONTRATADA|cl[aá]usula/i.test(text)
    )
      marks.push('juridico')
    entries.push({ text, file: rel, line, kind, vars, marks })
  }
  const strOf = (n) => {
    if (!n) return null
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
      return { text: n.text, vars: [] }
    if (ts.isTemplateExpression(n)) return templateToIcu(n, sf)
    return null
  }
  const isPlainExpr = (c) =>
    ts.isJsxExpression(c) &&
    (!c.expression ||
      !(
        ts.isJsxElement(c.expression) ||
        ts.isJsxSelfClosingElement(c.expression) ||
        ts.isJsxFragment(c.expression) ||
        ts.isConditionalExpression(c.expression) ||
        ts.isBinaryExpression(c.expression) ||
        (ts.isCallExpression(c.expression) &&
          /\.map$/.test(c.expression.expression.getText(sf)))
      ))
  const mixed = (el) => {
    const kids = el.children.filter((c) => !(ts.isJsxText(c) && !c.text.trim()))
    if (
      kids.length < 2 ||
      !kids.every((c) => ts.isJsxText(c) || isPlainExpr(c))
    )
      return null
    if (!kids.some((c) => ts.isJsxText(c) && /\p{L}{2,}/u.test(c.text)))
      return null
    if (
      !kids.some(
        (c) => ts.isJsxExpression(c) && c.expression && !strOf(c.expression),
      )
    )
      return null
    let text = ''
    const vars = []
    for (const c of el.children) {
      if (ts.isJsxText(c)) text += c.text
      else if (c.expression) {
        const s = strOf(c.expression)
        if (s) {
          text += s.text
          continue
        }
        const raw = c.expression.getText(sf)
        let name = (raw.match(/([A-Za-z_]\w*)\)?\s*$/) || ['', 'valor'])[1]
        if (/^\d/.test(name) || ['toString', 'length'].includes(name))
          name = 'valor'
        let n = name
        let k = 2
        while (vars.includes(n)) n = name + k++
        vars.push(n)
        text += `{${n}}`
      }
    }
    return { text, vars }
  }
  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const m = mixed(node)
      if (m) {
        add(node, m.text, 'frase', m.vars)
        return
      }
    }
    if (ts.isJsxText(node)) add(node, node.text, 'jsx')
    else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      const s = strOf(node.expression)
      if (s) add(node, s.text, 'jsx', s.vars)
      if (node.expression && ts.isConditionalExpression(node.expression))
        for (const b of [node.expression.whenTrue, node.expression.whenFalse]) {
          const t = strOf(b)
          if (t) add(b, t.text, 'jsx', t.vars)
        }
    } else if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sf)
      if (TEXT_ATTRS.has(name)) {
        let s = strOf(node.initializer)
        if (!s && ts.isJsxExpression(node.initializer)) {
          const e = node.initializer.expression
          s = strOf(e)
          if (!s && e && ts.isConditionalExpression(e))
            for (const b of [e.whenTrue, e.whenFalse]) {
              const t = strOf(b)
              if (t) add(b, t.text, 'atributo:' + name, t.vars)
            }
        }
        if (s) add(node, s.text, 'atributo:' + name, s.vars)
      }
    } else if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sf).replace(/['"]/g, '')
      if (TEXT_PROPS.has(name)) {
        const s = strOf(node.initializer)
        if (s) add(node, s.text, 'propriedade:' + name, s.vars)
      }
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf)
      const first = strOf(node.arguments[0])
      if (
        /^toast(\.\w+)?$/.test(callee) ||
        /(^|\.)(setError|alert|confirm)$/.test(callee)
      ) {
        if (first) add(node, first.text, 'aviso', first.vars)
      } else if (
        ts.isPropertyAccessExpression(node.expression) &&
        ZOD_METHODS.has(node.expression.name.text)
      ) {
        for (const a of node.arguments) {
          const s = strOf(a)
          if (s) add(a, s.text, 'validacao', s.vars)
        }
      } else if (/^(throw|new Error|Error)$/.test(callee) && first)
        add(node, first.text, 'erro', first.vars)
    } else if (
      ts.isNewExpression(node) &&
      node.expression.getText(sf) === 'Error'
    ) {
      const s = strOf(node.arguments?.[0])
      if (s) add(node, s.text, 'erro', s.vars)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

// área e tela a partir do caminho: src/app/(grupo)/vendas/orcamentos/... -> vendas / orcamentos
function areaOf(file) {
  const parts = file
    .replace(/^src\//, '')
    .split('/')
    .filter((p) => !/^\(.*\)$/.test(p) && !/^\[.*\]$/.test(p))
  if (parts[0] === 'app') {
    const segs = parts
      .slice(1)
      .filter((p) => !/\.(tsx?|jsx?)$/.test(p) && p !== 'components')
    return { area: segs[0] || 'app', tela: segs[1] || 'inicio' }
  }
  return { area: 'comum', tela: parts[0] }
}

const byText = new Map()
for (const e of entries) {
  const { area, tela } = areaOf(e.file)
  const id = createHash('sha1').update(e.text).digest('hex').slice(0, 10)
  if (!byText.has(id))
    byText.set(id, {
      id,
      text: e.text,
      vars: e.vars,
      marks: new Set(),
      usos: [],
    })
  const r = byText.get(id)
  e.marks.forEach((m) => r.marks.add(m))
  r.usos.push({ area, tela, file: e.file, line: e.line, kind: e.kind })
}
const textos = [...byText.values()]
  .map((r) => ({ ...r, marks: [...r.marks] }))
  .sort(
    (a, b) =>
      a.usos[0].file.localeCompare(b.usos[0].file) ||
      a.usos[0].line - b.usos[0].line,
  )
// --out <arquivo> grava em outro lugar (usado por check.mjs, sem tocar no versionado)
const outArg = process.argv.indexOf('--out')
const OUT =
  outArg > 0 ? process.argv[outArg + 1] : join(ROOT, 'src/i18n/extracao.json')
writeFileSync(
  OUT,
  JSON.stringify({
    arquivos: files.length,
    ocorrencias: entries.length,
    textos,
  }) + '\n',
)
if (process.argv.includes('--quiet')) process.exit(0)
const areas = {}
for (const t of textos) {
  const a = t.usos[0].area
  areas[a] = (areas[a] || 0) + 1
}
console.log(
  `arquivos: ${files.length} | ocorrências: ${entries.length} | textos únicos: ${textos.length}`,
)
const fora = (t) =>
  t.marks.some((m) =>
    ['fiscal-br', 'vitrine', 'interno', 'juridico'].includes(m),
  )
console.log(
  'a traduzir:',
  textos.filter((t) => !fora(t)).length,
  '| vitrine:',
  textos.filter((t) => t.marks.includes('vitrine')).length,
  '| interno:',
  textos.filter((t) => t.marks.includes('interno')).length,
  '| juridico:',
  textos.filter((t) => t.marks.includes('juridico')).length,
)
console.log(
  'fiscal-br:',
  textos.filter((t) => t.marks.includes('fiscal-br')).length,
  '| pais-br:',
  textos.filter((t) => t.marks.includes('pais-br')).length,
)
console.log(
  Object.entries(areas)
    .sort((a, b) => b[1] - a[1])
    .map(([a, n]) => `${a}:${n}`)
    .join(' '),
)

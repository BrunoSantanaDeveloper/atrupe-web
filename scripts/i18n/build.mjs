// Monta as mensagens por idioma e o mapa de origem (07/10/2026).
// Entrada: src/i18n/extracao.json (gerado por extract.mjs) e
//          src/i18n/traducoes.json ({ id: { es, en } }, mantido à mão ou por tradutor).
// Saída:   src/i18n/messages/<idioma>/<area>.json  (formato ICU, next-intl)
//          src/i18n/mapa.json  (chave -> texto, marcas e onde aparece)
// Uso: node scripts/i18n/build.mjs
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// fileURLToPath, e não .pathname: no Windows o .pathname vem como /C:/...
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const I18N = join(ROOT, 'src/i18n')
const { textos } = JSON.parse(readFileSync(join(I18N, 'extracao.json'), 'utf8'))
const traducoes = JSON.parse(readFileSync(join(I18N, 'traducoes.json'), 'utf8'))
const FORA = ['fiscal-br', 'vitrine', 'interno', 'juridico']
const LOCALES = ['pt-BR', 'es', 'en']

const camel = (s) => {
  const words = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
  const k = words
    .map((w, i) =>
      i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase(),
    )
    .join('')
  return /^[a-z]/.test(k) ? k : 'texto' + k
}
const slugSeg = (s) =>
  s
    .replace(/[^A-Za-z0-9-]/g, '')
    .replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) || 'inicio'

// Texto usado em três áreas ou mais vai para "comum".
const keys = new Map() // id -> 'area.tela.chave'
const taken = new Set()
for (const t of textos) {
  const areas = new Set(t.usos.map((u) => u.area))
  const area = areas.size >= 3 ? 'comum' : slugSeg(t.usos[0].area)
  const tela = areas.size >= 3 ? 'geral' : slugSeg(t.usos[0].tela)
  const base = camel(traducoes[t.id]?.en || t.text)
  let key = `${area}.${tela}.${base}`
  let n = 2
  while (taken.has(key)) key = `${area}.${tela}.${base}${n++}`
  taken.add(key)
  keys.set(t.id, key)
}

const set = (obj, path, value) => {
  const parts = path.split('.')
  let o = obj
  for (const p of parts.slice(0, -1)) o = o[p] ??= {}
  o[parts.at(-1)] = value
}
rmSync(join(I18N, 'messages'), { recursive: true, force: true })
const stats = Object.fromEntries(LOCALES.map((l) => [l, 0]))
const porArea = {}
const files = Object.fromEntries(LOCALES.map((l) => [l, {}]))
for (const t of textos) {
  const key = keys.get(t.id)
  const area = key.split('.')[0]
  const fora = t.marks.some((m) => FORA.includes(m))
  for (const l of LOCALES) {
    const value = l === 'pt-BR' ? t.text : fora ? null : traducoes[t.id]?.[l]
    if (value == null) continue
    files[l][area] ??= {}
    set(files[l][area], key.split('.').slice(1).join('.'), value)
    stats[l]++
    if (l !== 'pt-BR') {
      porArea[area] ??= { es: 0, en: 0, total: 0 }
      porArea[area][l]++
    }
  }
  if (!fora) {
    porArea[area] ??= { es: 0, en: 0, total: 0 }
    porArea[area].total++
  }
}
for (const l of LOCALES)
  for (const [area, obj] of Object.entries(files[l])) {
    mkdirSync(join(I18N, 'messages', l), { recursive: true })
    writeFileSync(
      join(I18N, 'messages', l, `${area}.json`),
      JSON.stringify(obj, null, 2) + '\n',
    )
  }
const mapa = {}
for (const t of textos)
  mapa[keys.get(t.id)] = {
    pt: t.text,
    ...(t.vars.length ? { vars: t.vars } : {}),
    ...(t.marks.length ? { marcas: t.marks } : {}),
    usos: t.usos.map((u) => `${u.file}:${u.line} (${u.kind})`),
  }
writeFileSync(
  join(I18N, 'mapa.json'),
  JSON.stringify(Object.fromEntries(Object.entries(mapa).sort()), null, 1) +
    '\n',
)
const semTraducao = textos.filter(
  (t) => !t.marks.some((m) => FORA.includes(m)) && !traducoes[t.id],
).length
console.log(
  'mensagens por idioma:',
  JSON.stringify(stats),
  '| sem tradução:',
  semTraducao,
)
console.log('por área (traduzidos es/en de total):')
for (const [a, v] of Object.entries(porArea).sort(
  (x, y) => y[1].total - x[1].total,
))
  console.log(`  ${a}: ${v.es}/${v.en} de ${v.total}`)

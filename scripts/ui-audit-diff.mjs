#!/usr/bin/env node
// Compara dois audit.json gerados por e2e/ui/capturas.spec.ts.
//
//   node scripts/ui-audit-diff.mjs antes.json depois.json
//
// Mostra o agregado de tamanhos de fonte e, por rota, o que mudou em
// tamanhos de fonte, h1, botões sem nome, title nativo e altura de linhas.

import fs from 'node:fs'

const [beforePath, afterPath] = process.argv.slice(2)
if (!beforePath || !afterPath) {
  console.error('uso: node scripts/ui-audit-diff.mjs antes.json depois.json')
  process.exit(1)
}

const load = (file) =>
  new Map(
    JSON.parse(fs.readFileSync(file, 'utf8'))
      // Só páginas que renderizaram (sem 404 nem redirecionamento ao login)
      .filter(
        (entry) =>
          entry.metrics &&
          entry.status === 200 &&
          !entry.finalUrl?.startsWith('/login'),
      )
      .map((entry) => [entry.route, entry.metrics]),
  )

const before = load(beforePath)
const after = load(afterPath)

const share = (routes) => {
  const total = {}
  for (const m of routes.values())
    for (const [size, n] of m.fontSizes) total[size] = (total[size] ?? 0) + n
  const sum = Object.values(total).reduce((a, b) => a + b, 0) || 1
  return Object.entries(total)
    .sort((a, b) => b[1] - a[1])
    .map(([size, n]) => `${size} ${((100 * n) / sum).toFixed(1)}%`)
    .join(' · ')
}

const sizesOf = (m) => new Set(m.fontSizes.map(([size]) => size))
const sum = (routes, key) =>
  [...routes.values()].reduce((acc, m) => acc + (m[key] ?? 0), 0)

console.log(`Rotas: antes ${before.size}, depois ${after.size}`)
console.log(`Fontes antes:  ${share(before)}`)
console.log(`Fontes depois: ${share(after)}`)
console.log(
  `Botões sem nome: ${sum(before, 'unnamedButtons')} → ${sum(after, 'unnamedButtons')}`,
)
console.log(
  `title nativo:    ${sum(before, 'nativeTitle')} → ${sum(after, 'nativeTitle')}`,
)
console.log('')

for (const [route, a] of after) {
  const b = before.get(route)
  if (!b) {
    console.log(`${route}: nova`)
    continue
  }
  const lines = []
  const bs = sizesOf(b)
  const as = sizesOf(a)
  const gone = [...bs].filter((s) => !as.has(s))
  const added = [...as].filter((s) => !bs.has(s))
  if (gone.length || added.length)
    lines.push(`fontes −[${gone.join(', ')}] +[${added.join(', ')}]`)
  if (JSON.stringify(b.h1) !== JSON.stringify(a.h1))
    lines.push(`h1 ${JSON.stringify(b.h1)} → ${JSON.stringify(a.h1)}`)
  const h1Size = (m) => m.headings?.find((h) => h.tag === 'H1')?.size ?? '—'
  if (h1Size(b) !== h1Size(a))
    lines.push(`tamanho do h1 ${h1Size(b)} → ${h1Size(a)}`)
  if (b.unnamedButtons !== a.unnamedButtons)
    lines.push(`sem nome ${b.unnamedButtons} → ${a.unnamedButtons}`)
  if (b.nativeTitle !== a.nativeTitle)
    lines.push(`title ${b.nativeTitle} → ${a.nativeTitle}`)
  const rows = (m) => m.rowHeights.map(([h]) => h).join('/')
  if (rows(b) !== rows(a))
    lines.push(`linhas ${rows(b) || '—'} → ${rows(a) || '—'}`)
  if (lines.length) console.log(`${route}: ${lines.join('; ')}`)
}

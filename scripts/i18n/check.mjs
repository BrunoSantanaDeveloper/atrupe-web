// Confere se as traduções acompanham as telas (regra IN-7, 07/10/2026).
// Relê o código, sem alterar nada, e lista:
//   - textos novos ou alterados que ainda não têm tradução;
//   - traduções de textos que não existem mais (obsoletas).
// Uso: node scripts/i18n/check.mjs [--strict]
//   --strict  termina com erro quando há texto sem tradução (para hook ou CI)
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ROOT = new URL('../..', import.meta.url).pathname
const FORA = ['fiscal-br', 'vitrine', 'interno', 'juridico']
const tmp = join(mkdtempSync(join(tmpdir(), 'i18n-')), 'extracao.json')
execFileSync(
  process.execPath,
  [join(ROOT, 'scripts/i18n/extract.mjs'), '--out', tmp, '--quiet'],
  { stdio: 'inherit' },
)
const { textos } = JSON.parse(readFileSync(tmp, 'utf8'))
const traducoes = JSON.parse(
  readFileSync(join(ROOT, 'src/i18n/traducoes.json'), 'utf8'),
)

const aTraduzir = textos.filter((t) => !t.marks.some((m) => FORA.includes(m)))
const novos = aTraduzir.filter(
  (t) => !traducoes[t.id]?.es || !traducoes[t.id]?.en,
)
const vivos = new Set(textos.map((t) => t.id))
const obsoletos = Object.keys(traducoes).filter((id) => !vivos.has(id))

console.log(
  `textos a traduzir: ${aTraduzir.length} | sem tradução: ${novos.length} | traduções obsoletas: ${obsoletos.length}`,
)
for (const t of novos.slice(0, 40))
  console.log(
    `  + ${t.usos[0].file}:${t.usos[0].line}  "${t.text.slice(0, 80)}"`,
  )
if (novos.length > 40) console.log(`  … e mais ${novos.length - 40}`)
if (novos.length)
  console.log(
    '\nPara traduzir: node scripts/i18n/translate.mjs  (ou traduza à mão em src/i18n/traducoes.json e rode build.mjs)',
  )
if (novos.length && process.argv.includes('--strict')) process.exit(1)

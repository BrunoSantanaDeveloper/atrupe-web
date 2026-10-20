// Tradução automática dos textos novos ou alterados (regra IN-7, 07/10/2026).
// 1. relê as telas (extract.mjs);
// 2. manda ao Claude só o que está sem tradução, com o glossário do ramo;
// 3. confere as variáveis ({nome}) de cada tradução e grava src/i18n/traducoes.json;
// 4. remove traduções obsoletas (com --limpar) e remonta as mensagens (build.mjs).
//
// Requer a biblioteca oficial (npm install -D @anthropic-ai/sdk, na ligação) e a
// chave ANTHROPIC_API_KEY no ambiente. Custo baixo: só o texto novo vai à API.
// Uso: node scripts/i18n/translate.mjs [--limpar] [--modelo claude-opus-5-5]
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// fileURLToPath, e não .pathname: no Windows o .pathname vem como /C:/...
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const I18N = join(ROOT, 'src/i18n')
const FORA = ['fiscal-br', 'vitrine', 'interno', 'juridico']
const LOTE = 80
const modeloArg = process.argv.indexOf('--modelo')
const MODEL =
  modeloArg > 0
    ? process.argv[modeloArg + 1]
    : process.env.I18N_MODEL || 'claude-opus-5-5'

let Anthropic
try {
  Anthropic = (await import('@anthropic-ai/sdk')).default
} catch {
  console.error(
    'Falta a biblioteca do Claude: npm install -D @anthropic-ai/sdk',
  )
  process.exit(1)
}

execFileSync(
  process.execPath,
  [join(ROOT, 'scripts/i18n/extract.mjs'), '--quiet'],
  { stdio: 'inherit' },
)
const { textos } = JSON.parse(readFileSync(join(I18N, 'extracao.json'), 'utf8'))
const traducoes = JSON.parse(readFileSync(join(I18N, 'traducoes.json'), 'utf8'))
const glossario = readFileSync(join(I18N, 'glossario.md'), 'utf8')

const pendentes = textos.filter(
  (t) =>
    !t.marks.some((m) => FORA.includes(m)) &&
    (!traducoes[t.id]?.es || !traducoes[t.id]?.en),
)
console.log(`sem tradução: ${pendentes.length}`)

const vars = (s) => (s.match(/\{[^}]*\}/g) || []).sort().join('|')
const SYSTEM = `You translate user-interface texts of Atrupe, a Brazilian ERP for print shops and visual-communication (signage) companies, from Brazilian Portuguese into Latin-American neutral Spanish ("es") and American English ("en").

Follow this glossary and tone guide exactly:

${glossario}

Rules: keep every placeholder in braces ({name}) exactly as written; keep HTML entities, units (m², m, km, h, min) and product names (Atrupe, START, LITE, PRO, ELITE, FULL); translate fragments so they still fit in their sentence; if a text is not user-facing Portuguese, copy it unchanged.
Answer with JSON only: {"<id>": {"es": "...", "en": "..."}} with every id you received.`

const client = new Anthropic()
for (let i = 0; i < pendentes.length; i += LOTE) {
  const lote = pendentes.slice(i, i + LOTE).map((t) => ({
    id: t.id,
    pt: t.text,
    ctx: `${t.usos[0].kind} · ${t.usos[0].file}`,
  }))
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [
        { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: JSON.stringify(lote) }],
    })
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
    let saida
    try {
      saida = JSON.parse(
        text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1),
      )
    } catch {
      console.warn(
        `lote ${i / LOTE + 1}: resposta não é JSON (tentativa ${tentativa})`,
      )
      continue
    }
    let ok = 0
    for (const t of lote) {
      const r = saida[t.id]
      if (
        r?.es &&
        r?.en &&
        vars(r.es) === vars(t.pt) &&
        vars(r.en) === vars(t.pt)
      ) {
        traducoes[t.id] = { es: r.es, en: r.en }
        ok++
      }
    }
    console.log(`lote ${i / LOTE + 1}: ${ok} de ${lote.length} traduzidos`)
    if (ok === lote.length) break
  }
}

if (process.argv.includes('--limpar')) {
  const vivos = new Set(textos.map((t) => t.id))
  for (const id of Object.keys(traducoes))
    if (!vivos.has(id)) delete traducoes[id]
}
writeFileSync(
  join(I18N, 'traducoes.json'),
  JSON.stringify(
    Object.fromEntries(Object.entries(traducoes).sort()),
    null,
    1,
  ) + '\n',
)
execFileSync(process.execPath, [join(ROOT, 'scripts/i18n/build.mjs')], {
  stdio: 'inherit',
})

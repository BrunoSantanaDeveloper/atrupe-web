import { test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Capturas e métricas renderizadas de todas as rotas estáticas da área
// autenticada (design/openspec/design/sistema-visual.md §6).
// Não compara nada sozinho: grava PNG e audit.json para o "antes/depois" de
// cada mudança de design. Compare dois audit.json com scripts/ui-audit-diff.mjs.
//
//   UI_ROUTES=/vendas,/cadastros npx playwright test e2e/ui/capturas.spec.ts
//
// Leva @captura no título para ficar fora da CI (e2e.yml usa --grep-invert).
//
// UI_ROUTES filtra por prefixo; UI_SHOTS_DIR muda a pasta de saída.

const OUT = process.env.UI_SHOTS_DIR ?? 'test-results/ui'
const APP_DIR = path.join(process.cwd(), 'src/app/(app-sidebar)')
const SETTLE_MS = 1500

function staticRoutes(): string[] {
  const routes: string[] = []
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('[') || entry.name.startsWith('_')) continue
        const next = entry.name.startsWith('(')
          ? segments
          : [...segments, entry.name]
        walk(path.join(dir, entry.name), next)
      } else if (entry.name === 'page.tsx') {
        routes.push('/' + segments.join('/'))
      }
    }
  }
  walk(APP_DIR, [])
  const only = process.env.UI_ROUTES?.split(',').filter(Boolean)
  return routes
    .filter((r) => !only || only.some((prefix) => r.startsWith(prefix)))
    .sort()
}

type RouteMetrics = Awaited<ReturnType<typeof collect>>

// Roda no navegador: só usa APIs do DOM.
async function collect(page: Page) {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      )
    }
    const tally = (map: Record<string, number>, key: string) => {
      map[key] = (map[key] ?? 0) + 1
    }
    const sorted = (map: Record<string, number>) =>
      Object.entries(map).sort((a, b) => b[1] - a[1])

    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(visible)
      .map((h) => {
        const style = getComputedStyle(h)
        return {
          tag: h.tagName,
          text: (h.textContent ?? '').trim().slice(0, 60),
          size: style.fontSize,
          weight: style.fontWeight,
        }
      })

    const buttons = Array.from(
      document.querySelectorAll('button,[role=button],a[role=button]'),
    ).filter(visible)
    const buttonLabels: Record<string, number> = {}
    let unnamedButtons = 0
    for (const b of buttons) {
      const text = (b.textContent ?? '').trim().replace(/\s+/g, ' ')
      const aria = b.getAttribute('aria-label')
      if (!text && !aria && !b.getAttribute('aria-labelledby')) unnamedButtons++
      tally(
        buttonLabels,
        text.slice(0, 40) || (aria ? `[aria] ${aria}` : '[sem nome]'),
      )
    }

    const fontSizes: Record<string, number> = {}
    const fontWeights: Record<string, number> = {}
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    )
    let node: Node | null
    let counted = 0
    while ((node = walker.nextNode()) && counted < 5000) {
      if (!node.textContent?.trim()) continue
      const el = node.parentElement
      if (!el || !visible(el)) continue
      const style = getComputedStyle(el)
      tally(fontSizes, style.fontSize)
      tally(fontWeights, style.fontWeight)
      counted++
    }

    const svgSizes: Record<string, number> = {}
    for (const svg of Array.from(document.querySelectorAll('svg')).filter(
      visible,
    )) {
      const r = svg.getBoundingClientRect()
      tally(svgSizes, `${Math.round(r.width)}x${Math.round(r.height)}`)
    }

    const rowHeights: Record<string, number> = {}
    for (const tr of Array.from(document.querySelectorAll('tbody tr')).slice(
      0,
      40,
    )) {
      tally(rowHeights, String(Math.round(tr.getBoundingClientRect().height)))
    }

    return {
      h1: headings.filter((h) => h.tag === 'H1').map((h) => h.text),
      headings,
      fontSizes: sorted(fontSizes),
      fontWeights: sorted(fontWeights),
      buttonCount: buttons.length,
      unnamedButtons,
      repeatedButtons: sorted(buttonLabels).filter(([, n]) => n >= 3),
      nativeTitle: Array.from(document.querySelectorAll('[title]')).filter(
        visible,
      ).length,
      svgSizes: sorted(svgSizes),
      tableRows: document.querySelectorAll('tbody tr').length,
      rowHeights: sorted(rowHeights),
    }
  })
}

type Entry = {
  route: string
  status?: number
  finalUrl?: string
  error?: string
  metrics?: RouteMetrics
}

const routes = staticRoutes()
const AUDIT = path.join(OUT, 'audit.json')

// Grava a rota no audit.json assim que termina: depois de uma falha o
// Playwright troca de worker, e um afterAll por worker sobrescreveria o que
// os anteriores já tinham medido. Rodar de novo uma rota substitui a entrada.
function record(entry: Entry) {
  const previous: Entry[] = fs.existsSync(AUDIT)
    ? JSON.parse(fs.readFileSync(AUDIT, 'utf8'))
    : []
  const next = previous
    .filter((e) => e.route !== entry.route)
    .concat(entry)
    .sort((x, y) => x.route.localeCompare(y.route))
  fs.writeFileSync(AUDIT, JSON.stringify(next, null, 1))
}

// Sem modo serial: uma rota lenta não pode impedir as outras de rodar.

test.describe('Capturas de UI @captura', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeAll(() => fs.mkdirSync(OUT, { recursive: true }))

  for (const route of routes) {
    test(route, async ({ page }) => {
      test.setTimeout(300_000)
      const entry: Entry = { route }
      const slug = route.replace(/^\//, '').replace(/\//g, '__') || 'raiz'
      try {
        const response = await page.goto(route, {
          waitUntil: 'load',
          timeout: 240_000,
        })
        entry.status = response?.status()
        // Telas que buscam dados mostram o título só depois de carregar; sem
        // esperar, a captura registra "sem h1" por lentidão, não por defeito.
        await page
          .locator('main h1')
          .first()
          .waitFor({ timeout: 10_000 })
          .catch(() => undefined)
        await page.waitForTimeout(SETTLE_MS)
        // Rotas que só redirecionam (ex.: /configuracoes) trocam de página no
        // meio da coleta; espera a nova carregar e tenta mais uma vez.
        entry.metrics = await collect(page).catch(async () => {
          await page.waitForLoadState('load')
          await page.waitForTimeout(SETTLE_MS)
          return collect(page)
        })
        entry.finalUrl = new URL(page.url()).pathname
      } catch (error) {
        entry.error = String((error as Error).message).slice(0, 200)
      }
      await page
        .screenshot({ path: path.join(OUT, `${slug}.png`) })
        .catch(() => undefined)
      record(entry)
    })
  }
})

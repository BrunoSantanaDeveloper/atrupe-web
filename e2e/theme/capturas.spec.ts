import { test, expect, type Page } from '@playwright/test'

// Capturas para conferência visual do tema claro/escuro
// (design/openspec/changes/tema-claro-escuro, tarefas 6.3 e 6.4).
// Não compara nada sozinho: grava as imagens em test-results/tema/ para revisão.
// Usa a sessão da conta de teste (global-setup), exceto no login.

const STORAGE_KEY = 'atrupe-tema'
const OUT = process.env.THEME_SHOTS_DIR ?? 'test-results/tema'

const PAGES = [
  { name: 'vitrine', path: '/sandbox/tema' },
  { name: 'painel', path: '/dashboard' },
  { name: 'orcamentos', path: '/vendas/orcamentos' },
  { name: 'vitrine-orcamento', path: '/sandbox/orcamento' },
  { name: 'vitrine-fluxo', path: '/sandbox/fluxo' },
]

async function capture(page: Page, name: string, theme: 'light' | 'dark') {
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [STORAGE_KEY, theme],
  )
  await page.reload({ waitUntil: 'networkidle' })
  await page.screenshot({ path: `${OUT}/${name}-${theme}.png`, fullPage: true })
}

test.describe('Capturas de tema', () => {
  test('login', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const page = await context.newPage()
    await page.goto('/login')
    for (const theme of ['light', 'dark'] as const)
      await capture(page, 'login', theme)
    await context.close()
  })

  for (const { name, path } of PAGES) {
    test(name, async ({ page }) => {
      await page.goto(path)
      for (const theme of ['light', 'dark'] as const)
        await capture(page, name, theme)
    })
  }

  test('vitrine com camadas abertas (escuro)', async ({ page }) => {
    await page.goto('/sandbox/tema')
    await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY)
    await page.reload({ waitUntil: 'networkidle' })

    // Espera a animação de abertura terminar antes de cada captura
    const settle = () => page.waitForTimeout(500)

    await page.getByRole('button', { name: 'Aviso de sucesso' }).click()
    await expect(page.getByText('Orçamento salvo')).toBeVisible()
    await settle()
    await page.screenshot({ path: `${OUT}/vitrine-aviso-dark.png` })

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    await settle()
    await page.screenshot({ path: `${OUT}/vitrine-menu-dark.png` })
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Abrir modal' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await settle()
    await page.screenshot({ path: `${OUT}/vitrine-modal-dark.png` })
  })
})

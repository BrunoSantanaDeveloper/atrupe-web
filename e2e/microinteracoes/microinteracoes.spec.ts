import { test, expect, type Page } from '@playwright/test'

// Movimento e carregamento — design/openspec/changes/archive/2026-10-07-microinteracoes.
// Roda na vitrine /sandbox/microinteracoes: nada aqui grava no backend.

async function openShowcase(page: Page) {
  await page.goto('/sandbox/microinteracoes')
  await expect(
    page.getByRole('heading', { name: 'Microinterações' }),
  ).toBeVisible({ timeout: 60_000 })
}

test.describe('Microinterações', () => {
  test('botão em progresso mantém largura e cor e bloqueia o clique', async ({
    page,
  }) => {
    // Transições instantâneas: a cor lida é a final, não um quadro do meio
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openShowcase(page)
    const button = page.getByRole('button', { name: 'Salvar alterações' })
    const before = await button.boundingBox()
    const colorBefore = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )

    await page.locator('#buttons-loading').click()

    await expect(button).toHaveAttribute('aria-busy', 'true')
    await expect(button).toBeDisabled()
    const after = await button.boundingBox()
    expect(after?.width).toBe(before?.width)
    expect(
      await button.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(colorBefore)
  })

  test('confirmação fica aberta com o botão em progresso até a ação terminar', async ({
    page,
  }) => {
    await openShowcase(page)
    await page.getByRole('button', { name: 'Confirmar exclusão' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    const confirm = dialog.getByRole('button', { name: 'Excluir' })
    await confirm.click()

    // A ação da vitrine leva 1,5 s
    await expect(confirm).toHaveAttribute('aria-busy', 'true')
    await expect(
      dialog.getByRole('button', { name: 'Cancelar' }),
    ).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await expect(dialog).toBeHidden({ timeout: 5_000 })
  })

  test('troca de página na listagem mantém os dados anteriores esmaecidos', async ({
    page,
  }) => {
    await openShowcase(page)
    const section = page.locator('section', { hasText: 'Listagem' })
    await section.getByRole('button', { name: /Ir para a página/ }).click()

    const region = section.locator('[aria-busy="true"]')
    await expect(region).toBeVisible()
    await expect(region.getByText('Gráfica Central')).toBeVisible()
    await expect(section.locator('[aria-busy="true"]')).toHaveCount(0, {
      timeout: 5_000,
    })
    await expect(
      section.getByText(/Gráfica Central \(página 2\)/),
    ).toBeVisible()
  })

  test('barra de navegação só aparece em troca lenta e some ao terminar', async ({
    page,
  }) => {
    await openShowcase(page)
    const bar = page.locator('div.fixed.top-0.z-\\[100\\]')

    await page.getByRole('button', { name: 'Troca lenta (1,5 s)' }).click()
    await expect(bar).toHaveCSS('opacity', '0')
    await expect(bar).toHaveCSS('opacity', '1', { timeout: 1_000 })
    await expect(page).toHaveURL(/troca=/, { timeout: 15_000 })
    await expect(bar).toHaveCSS('opacity', '0', { timeout: 5_000 })
  })

  test('movimento reduzido desliga animações, mas o spinner continua', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      storageState: './e2e/.auth/user.json',
      baseURL: test.info().project.use.baseURL,
    })
    const page = await context.newPage()
    await openShowcase(page)
    await page.locator('#buttons-loading').click()

    const skeleton = page.locator('.animate-skeleton').first()
    expect(
      await skeleton.evaluate((el) => getComputedStyle(el).animationDuration),
    ).toBe('1e-05s')
    const spinner = page.locator('.animate-spin').first()
    expect(
      await spinner.evaluate(
        (el) => getComputedStyle(el).animationIterationCount,
      ),
    ).toBe('infinite')
    await context.close()
  })
})

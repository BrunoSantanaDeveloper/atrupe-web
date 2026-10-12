import { test, expect } from '@playwright/test'

import { hasTestCredentials, planStorageState } from '../helpers/credentials'

/**
 * A composição do produto contra a API (/product/:id/assembly), com a conta
 * do PRO (E2E_PRO_EMAIL/PASSWORD; sem ela, o arquivo é pulado). Confere que a
 * composição é ação da linha do produto (CP-17), que o filtro "Composição" vai
 * à API e que a página abre com a Simulação (PAD-6). Não grava nada: abrir a
 * composição vazia de um produto não é feito aqui, porque a tela cria a
 * etapa do setor do produto (pedido do time, 03/10/2026).
 *
 * Os processos têm o e2e deles em e2e/processes.
 */

const PRODUCTS = '/configuracoes/produtos'

test.describe('Composição do produto (PRO)', () => {
  test.skip(
    !hasTestCredentials('PRO'),
    'Sem credencial do plano PRO (E2E_PRO_EMAIL/PASSWORD).',
  )
  test.use({ storageState: planStorageState('PRO') })

  test('a composição é ação da linha, sem aba própria (CP-17)', async ({
    page,
  }) => {
    await page.goto(PRODUCTS)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('tab', { name: 'Composições' })).toHaveCount(0)
    await expect(page.getByLabel('Composição')).toBeVisible()
  })

  test('o filtro "Com composição" lista só os compostos', async ({ page }) => {
    await page.goto(`${PRODUCTS}?composicao=com`)
    await page.waitForLoadState('networkidle')

    const rows = page.getByRole('row').filter({ has: page.getByRole('cell') })
    const count = await rows.count()
    test.skip(count === 0, 'A conta do PRO ainda não tem produto composto.')
    for (let index = 0; index < count; index++) {
      await expect(rows.nth(index)).toContainText('Com composição')
    }
  })

  test('a página da composição abre com a Simulação', async ({ page }) => {
    await page.goto(`${PRODUCTS}?composicao=com`)
    await page.waitForLoadState('networkidle')
    const link = page.locator(`a[href$="/composicao"]`).first()
    test.skip(
      (await link.count()) === 0,
      'A conta do PRO ainda não tem produto composto.',
    )

    await link.click()
    await expect(page.getByText('Simulação').first()).toBeVisible()
  })
})

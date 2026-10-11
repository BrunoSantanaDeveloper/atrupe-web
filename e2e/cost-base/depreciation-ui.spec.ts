import { test, expect, type Page } from '@playwright/test'

// Confere a aba Patrimônios contra as decisões P-9 (ciclo de vida), P-26
// (inconsistência) e P-29 (agrupamento), em
// openspec/regras-de-negocio/areas/01-patrimonios.md.

const ROUTE = '/base-de-custos/patrimonios'

async function openDepreciation(page: Page, status = '') {
  await page.goto(`${ROUTE}${status ? `?status=${status}` : ''}`)
  await expect(
    page.getByRole('heading', { name: 'Relatório de depreciação' }),
  ).toBeVisible()
}

const assetRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Patrimônios — estrutura @mock', () => {
  test('tem as quatro situações como abas', async ({ page }) => {
    await openDepreciation(page)

    for (const label of [
      'Ativos',
      'Em revisão',
      'Inconsistências',
      'Inativos',
    ]) {
      await expect(
        page.getByRole('tab', { name: new RegExp(label) }),
      ).toBeVisible()
    }
  })

  test('agrupa por tipo de bem (P-29)', async ({ page }) => {
    await openDepreciation(page)

    await expect(page.getByText('Máquinas e equipamentos')).toBeVisible()
    await expect(page.getByText('Móveis e utensílios')).toBeVisible()
    await expect(page.getByText('Veículos e frota')).toBeVisible()
  })

  test('mostra os cartões de depreciação', async ({ page }) => {
    await openDepreciation(page)

    for (const label of [
      'Valor total investido',
      'Valor já depreciado',
      'Valor restante a depreciar',
      'Depreciação mensal atual',
      'Patrimônios ativos',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })
})

test.describe('Patrimônios — situações e regras @mock', () => {
  test('a depreciação segue a fórmula de aquisição, residual e vida útil', async ({
    page,
  }) => {
    await openDepreciation(page)

    // Sublimática: R$ 40.000 − R$ 12.000 = R$ 28.000 depreciáveis
    await expect(assetRow(page, 'Impressora Sublimática')).toContainText(
      'R$ 28.000,00',
    )
    await expect(assetRow(page, 'Impressora Sublimática')).toContainText(
      'R$ 233,33',
    )
  })

  test('bem sem depreciação calculada mostra "-", nunca R$ 0,00', async ({
    page,
  }) => {
    await openDepreciation(page, 'inconsistencias')

    await expect(assetRow(page, 'Ilhoseira')).toContainText('-')
    await expect(assetRow(page, 'Ilhoseira')).toContainText('Inconsistência')
  })

  test('cada aba mostra só os bens da sua situação', async ({ page }) => {
    await openDepreciation(page, 'em-revisao')
    await expect(assetRow(page, 'Plotter de recorte')).toContainText(
      'Revisão necessária',
    )

    await openDepreciation(page, 'inativos')
    await expect(assetRow(page, 'Impressora antiga')).toContainText('Inativo')
  })

  test('a vida útil aparece com barra de progresso', async ({ page }) => {
    await openDepreciation(page)

    await expect(
      page.getByRole('img', { name: /Vida útil de Impressora Sublimática/ }),
    ).toBeVisible()
  })
})

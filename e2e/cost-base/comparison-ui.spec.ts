import { test, expect, type Page } from '@playwright/test'

// Confere a aba Comparativo contra a proposta registrada em
// openspec/regras-de-negocio/areas/05-base-de-custos.md §10 e §10.1:
// previsto (estimativa × volume) contra realizado, por período, sem médias.

const ROUTE = '/base-de-custos/comparativo'

async function openComparison(page: Page, period = '') {
  await page.goto(`${ROUTE}${period ? `?period=${period}` : ''}`)
  await expect(
    page.getByRole('heading', { name: 'Previsto e realizado' }),
  ).toBeVisible()
}

const accountRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Comparativo — estrutura @mock', () => {
  test('compara período contra período, sem médias', async ({ page }) => {
    await openComparison(page)

    await expect(
      page.getByRole('columnheader', { name: 'Previsto no período' }),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Realizado no período' }),
    ).toBeVisible()

    // As médias são da aba Despesas administrativas, não desta
    await expect(page.getByRole('columnheader', { name: /Média/ })).toHaveCount(
      0,
    )
  })

  test('oferece períodos maiores, que são mais precisos', async ({ page }) => {
    await openComparison(page)

    for (const label of ['Último mês', '3 meses', '6 meses', '12 meses']) {
      await expect(page.getByRole('tab', { name: label })).toBeVisible()
    }

    await expect(
      page.getByText('Períodos maiores são mais precisos'),
    ).toBeVisible()
  })

  test('o previsto acompanha o período escolhido', async ({ page }) => {
    await openComparison(page, '1')
    // Combustível: R$ 1,20 por km × 1.000 km em um mês
    await expect(accountRow(page, 'Combustível')).toContainText('R$ 1.200,00')

    await openComparison(page, '12')
    await expect(accountRow(page, 'Combustível')).toContainText('R$ 14.400,00')
  })
})

test.describe('Comparativo — leitura da diferença @mock', () => {
  test('a diferença é informação, não erro', async ({ page }) => {
    await openComparison(page, '1')

    await expect(accountRow(page, 'Manutenção de máquina')).toContainText(
      'acima do previsto',
    )
    await expect(accountRow(page, 'Combustível')).toContainText(
      'abaixo do previsto',
    )
  })

  test('conta sem estimativa aparece como candidata a cadastro', async ({
    page,
  }) => {
    await openComparison(page, '1')

    await expect(accountRow(page, 'Ferramentas e consumíveis')).toContainText(
      'sem comparação',
    )

    await page
      .getByRole('button', { name: 'Detalhar Ferramentas e consumíveis' })
      .click()

    await expect(
      page.getByText('candidata a virar custo de cadastro'),
    ).toBeVisible()
  })

  test('a linha abre e mostra de onde vem o previsto', async ({ page }) => {
    await openComparison(page, '1')

    await page
      .getByRole('button', { name: 'Detalhar Manutenção de máquina' })
      .click()

    await expect(page.getByText('Impressora Solvente')).toBeVisible()
    await expect(page.getByText(/R\$ 0,01 por m²/)).toBeVisible()
  })
})

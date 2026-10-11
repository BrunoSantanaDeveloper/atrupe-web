import { test, expect, type Page } from '@playwright/test'

// Confere o gerenciador de produção contra a documentação funcional §12
// (recurso do ELITE): etapas por setor, dependências, liberação antecipada,
// capacidade e produtividade.

const BOARD = '/producao/gerenciador'
const PRODUCTIVITY = '/producao/produtividade'

const card = (page: Page, name: string) =>
  page.locator('div').filter({ hasText: name }).first()

test.describe('Gerenciador de produção — quadro por setor', () => {
  test('as etapas ficam em colunas por situação', async ({ page }) => {
    await page.goto(BOARD)

    await expect(
      page.getByRole('heading', { name: 'Gerenciador de produção' }),
    ).toBeVisible()

    for (const label of [
      'Aguardando',
      'Liberadas',
      'Em produção',
      'Concluídas',
    ]) {
      await expect(
        page.getByRole('heading', { name: label, exact: true }),
      ).toBeVisible()
    }
  })

  test('mostra a capacidade de cada setor', async ({ page }) => {
    await page.goto(BOARD)

    await expect(
      page.getByRole('img', { name: /Impressão: \d+% da capacidade/ }),
    ).toBeVisible()
  })

  test('filtra por setor', async ({ page }) => {
    await page.goto(`${BOARD}?sector=Impress%C3%A3o`)

    await expect(page.getByText('Impressão em lona')).toBeVisible()
    await expect(page.getByText('Corte e acabamento')).toHaveCount(0)
  })

  test('avisa quando alguma etapa passou da data', async ({ page }) => {
    await page.goto(BOARD)

    await expect(page.getByText(/precisam ser reagendadas/)).toBeVisible()
  })

  test('a etapa bloqueada explica que espera a anterior', async ({ page }) => {
    await page.goto(BOARD)

    await expect(
      page.getByText('Aguardando a etapa anterior').first(),
    ).toBeVisible()
  })

  test('o tempo realizado acima do previsto aparece destacado', async ({
    page,
  }) => {
    await page.goto(`${BOARD}?sector=Cria%C3%A7%C3%A3o`)

    await expect(card(page, 'Criação')).toContainText('Previsto')
    await expect(card(page, 'Criação')).toContainText('Realizado')
  })
})

test.describe('Produtividade — previsto × realizado', () => {
  test('compara por setor e por colaborador', async ({ page }) => {
    await page.goto(PRODUCTIVITY)

    await expect(page.getByRole('heading', { name: 'Por setor' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Por colaborador' }),
    ).toBeVisible()

    await expect(
      page.getByRole('columnheader', { name: 'Eficiência' }).first(),
    ).toBeVisible()
  })

  test('explica que eficiência baixa não é erro por si', async ({ page }) => {
    await page.goto(PRODUCTIVITY)

    await expect(page.getByText(/Isso não é erro por si/)).toBeVisible()
    await expect(page.getByText(/não para ranquear pessoas/)).toBeVisible()
  })
})

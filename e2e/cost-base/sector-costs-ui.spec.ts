import { test, expect, type Page } from '@playwright/test'

// Confere a aba Por setor contra a proposta registrada em
// openspec/regras-de-negocio/areas/05-base-de-custos.md §9 e o método do custo
// puro. Dados provisórios em src/actions/cost-base.ts.

const ROUTE = '/base-de-custos/por-setor'

async function openSectorCosts(page: Page) {
  await page.goto(ROUTE)
  await expect(
    page.getByRole('heading', { name: 'Custo por setor' }),
  ).toBeVisible()
}

const productiveRow = (page: Page, name: string) =>
  page.getByRole('table').first().getByRole('row').filter({ hasText: name })

test.describe('Por setor — estrutura @mock', () => {
  test('separa setores produtivos e administrativos', async ({ page }) => {
    await openSectorCosts(page)

    await expect(
      page.getByRole('columnheader', { name: 'Setores produtivos' }),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Setores administrativos' }),
    ).toBeVisible()
  })

  test('as colunas mostram a origem de cada parcela', async ({ page }) => {
    await openSectorCosts(page)

    for (const label of [
      'Mão de obra',
      'Patrimônios',
      'Depreciação',
      'Outros custos',
      'Custo próprio',
    ]) {
      await expect(
        page.getByRole('columnheader', { name: label }).first(),
      ).toBeVisible()
    }
  })

  test('a tela para no custo: não mostra produtividade nem custo unitário', async ({
    page,
  }) => {
    await openSectorCosts(page)

    await expect(
      page.getByRole('columnheader', { name: /Produtividade/ }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('columnheader', { name: /Custo unitário/ }),
    ).toHaveCount(0)
  })
})

test.describe('Por setor — números e detalhamento @mock', () => {
  test('o custo próprio soma as parcelas do setor', async ({ page }) => {
    await openSectorCosts(page)

    // Impressão: depreciações + manutenção = R$ 1.834,17, como no PRO legado
    await expect(productiveRow(page, 'Impressão')).toContainText('R$ 1.834,17')
  })

  test('a linha abre e mostra de onde vem cada valor', async ({ page }) => {
    await openSectorCosts(page)

    await page.getByRole('button', { name: 'Detalhar Impressão' }).click()

    await expect(page.getByText('Impressora Sublimática').first()).toBeVisible()
    await expect(page.getByText('Depreciação mensal').first()).toBeVisible()
  })

  test('setor sem custo mostra "-", nunca R$ 0,00', async ({ page }) => {
    await openSectorCosts(page)

    await expect(productiveRow(page, 'Marcenaria')).toContainText('-')
    await expect(productiveRow(page, 'Marcenaria')).not.toContainText('R$ 0,00')
  })

  test('cada setor informa o critério do rateio interno', async ({ page }) => {
    await openSectorCosts(page)

    await expect(productiveRow(page, 'Impressão')).toContainText(
      'Rateio interno por tempo de atividade',
    )
    await expect(productiveRow(page, 'CNC')).toContainText(
      'Rateio interno por valor de aquisição',
    )
  })
})

test.describe('Por setor — método do custo puro @mock', () => {
  test('sem distribuição, o rodapé explica onde está o administrativo', async ({
    page,
  }) => {
    await openSectorCosts(page)

    await expect(
      page.getByText(
        'O custo administrativo não está dentro do custo dos setores',
      ),
    ).toBeVisible()

    // A coluna de administrativo recebido só existe quando há distribuição
    await expect(
      page.getByRole('columnheader', { name: 'Administrativo recebido' }),
    ).toHaveCount(0)
  })
})

import { test, expect, type Page } from '@playwright/test'

// Confere a aba Distribuição contra as decisões BC-5, BC-6 e BC-7
// (openspec/regras-de-negocio/areas/05-base-de-custos.md) e o checklist do
// openspec/design.md §15. Os dados vêm das actions provisórias de
// src/actions/cost-base.ts.

const ROUTE = '/base-de-custos/distribuicao'

// brand-500 do globals.css (design.md §3.1)
const BRAND_500 = 'rgb(9, 146, 96)'

async function openDistribution(page: Page) {
  await page.goto(ROUTE)
  await expect(
    page.getByRole('heading', { name: 'Distribuição dos custos indiretos' }),
  ).toBeVisible()
}

const productiveRow = (page: Page, name: string) =>
  page.getByRole('table').nth(1).getByRole('row').filter({ hasText: name })

const adminRow = (page: Page, name: string) =>
  page.getByRole('table').first().getByRole('row').filter({ hasText: name })

const percentInput = (page: Page, sector: string) =>
  page.getByRole('spinbutton', {
    name: `Quanto recebe em porcentagem — ${sector}`,
  })

test.describe('Distribuição — estrutura (BC-6, BC-7)', () => {
  test('a aba abre pela rota e fica ativa', async ({ page }) => {
    await openDistribution(page)

    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`))
    await expect(
      page.getByRole('tab', { name: 'Distribuição' }),
    ).toHaveAttribute('data-state', 'active')
  })

  test('duas tabelas, separadas por natureza do setor', async ({ page }) => {
    await openDistribution(page)

    await expect(
      page.getByRole('columnheader', { name: 'Setores administrativos' }),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Setores produtivos' }),
    ).toBeVisible()
  })

  test('os nomes das colunas seguem a decisão BC-6', async ({ page }) => {
    await openDistribution(page)

    await expect(
      page.getByRole('columnheader', { name: 'Quanto recebe' }),
    ).toBeVisible()

    // "Balanceamento" era o nome do legado e não deve aparecer
    await expect(page.getByText('Balanceamento')).toHaveCount(0)
  })

  test('os administrativos formam um total único, sem percentual (BC-7)', async ({
    page,
  }) => {
    await openDistribution(page)

    // Administração R$ 16.190,99 + Comercial R$ 4.800,00
    await expect(
      adminRow(page, 'Total administrativo a distribuir'),
    ).toContainText('R$ 20.990,99')

    // nenhum controle de percentual do lado administrativo
    await expect(
      page.getByRole('columnheader', { name: 'Quanto distribuir' }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('spinbutton', { name: /Administração/ }),
    ).toHaveCount(0)
  })
})

test.describe('Distribuição — regras de cálculo (BC-5)', () => {
  test('nasce sem distribuir nada, pelo método do custo puro', async ({
    page,
  }) => {
    await openDistribution(page)

    await expect(page.getByText('Faltam 100%')).toBeVisible()
    await expect(
      page.getByText('Nenhum custo administrativo está sendo distribuído.'),
    ).toBeVisible()
  })

  test('o que sai do administrativo chega ao setor produtivo', async ({
    page,
  }) => {
    await openDistribution(page)

    // Impressão recebe metade do total administrativo (R$ 20.990,99)
    await percentInput(page, 'Impressão').fill('50')

    await expect(productiveRow(page, 'Impressão')).toContainText('R$ 10.495,50')
    // custo direto R$ 1.834,17 + recebido R$ 10.495,50
    await expect(productiveRow(page, 'Impressão')).toContainText('R$ 12.329,67')
  })

  test('o rodapé acompanha o total distribuído', async ({ page }) => {
    await openDistribution(page)

    await percentInput(page, 'Impressão').fill('60')
    await expect(page.getByText('Faltam 40%')).toBeVisible()

    await percentInput(page, 'Produção').fill('40')
    await expect(page.getByText('100% distribuído')).toBeVisible()
  })

  test('passar de 100% bloqueia o salvamento', async ({ page }) => {
    await openDistribution(page)

    await percentInput(page, 'Impressão').fill('70')
    await percentInput(page, 'Produção').fill('50')

    await expect(page.getByText('Excede em 20%')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Salvar distribuição' }),
    ).toBeDisabled()
  })

  test('setor sem custo mostra "-", nunca R$ 0,00', async ({ page }) => {
    await openDistribution(page)

    await expect(productiveRow(page, 'Marcenaria')).toContainText('-')
    await expect(productiveRow(page, 'Marcenaria')).not.toContainText('R$ 0,00')
  })
})

test.describe('Distribuição — padrões da interface (design.md)', () => {
  test('a ação primária usa o verde de marca e grava com toast', async ({
    page,
  }) => {
    await openDistribution(page)

    const save = page.getByRole('button', { name: 'Salvar distribuição' })
    await expect(save).toHaveCSS('background-color', BRAND_500)

    await percentInput(page, 'Impressão').fill('100')
    await save.click()

    await expect(page.getByText('Distribuição salva')).toBeVisible()
  })

  test('os cartões de totais aparecem no topo', async ({ page }) => {
    await openDistribution(page)

    for (const label of [
      'Custo administrativo',
      'Distribuído aos setores',
      'Não distribuído',
      'Setores que recebem',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('funciona em 390px, sem rolagem horizontal da página', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openDistribution(page)

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})

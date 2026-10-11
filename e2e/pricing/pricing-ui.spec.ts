import { test, expect, type Page } from '@playwright/test'

// Confere a área de Precificação contra as decisões PR-1 a PR-4 e a revisão
// crítica da tela Resumo, em
// openspec/regras-de-negocio/areas/06-precificacao.md §8, §8.1 e §9.

const BASE = '/precificacao'

const TABS = [
  ['Resumo', 'resumo'],
  ['Mão de obra', 'mao-de-obra'],
  ['Máquinas', 'maquinas'],
  ['Materiais', 'materiais'],
  ['Produtos', 'produtos'],
] as const

async function openSummary(page: Page) {
  await page.goto(`${BASE}/resumo`)
  await expect(
    page.getByRole('heading', { name: 'Parâmetros de referência' }),
  ).toBeVisible()
}

test.describe('Precificação — estrutura (PR-1) @mock', () => {
  test('reúne os quatro grupos num lugar só', async ({ page }) => {
    await openSummary(page)

    const tabs = page.getByRole('tablist').first().getByRole('tab')
    await expect(tabs).toHaveText(TABS.map(([label]) => label))

    for (const [label, slug] of TABS) {
      await page.getByRole('tab', { name: label }).first().click()
      await expect(page).toHaveURL(new RegExp(`${BASE}/${slug}`))
    }
  })
})

test.describe('Precificação — parâmetros e markup (PR-4) @mock', () => {
  test('mostra os quatro parâmetros oficiais, sem "despesas gerais"', async ({
    page,
  }) => {
    await openSummary(page)

    for (const label of [
      'Tributação de referência',
      'Comissão de referência',
      'Custo financeiro de referência',
      'Margem desejada',
    ]) {
      await expect(page.getByText(label)).toBeVisible()
    }

    await expect(page.getByText('Despesas gerais')).toHaveCount(0)
  })

  test('o markup segue o método divisor', async ({ page }) => {
    await openSummary(page)

    // 6% + 3% + 1,5% + 30% = 40,5% → 1 ÷ (1 − 0,405) = 1,68
    await expect(page.getByText('Markup de referência')).toBeVisible()
    await expect(page.getByText('1,68', { exact: true })).toBeVisible()
    await expect(page.getByText(/Custo 59,5% \+ encargos 40,5%/)).toBeVisible()
  })

  test('os números dos cartões de grupo fecham', async ({ page }) => {
    await openSummary(page)

    const card = page.getByRole('link', { name: /Materiais/ }).first()

    // total = com preço + pendentes
    await expect(card).toContainText('3')
    await expect(card).toContainText('Com preço')
    await expect(card).toContainText('Pendentes')
  })

  test('o alerta de preço abaixo do custo aparece e leva à lista', async ({
    page,
  }) => {
    await openSummary(page)

    const alert = page.getByRole('link', { name: /abaixo do custo/ }).first()
    await expect(alert).toBeVisible()
    await expect(alert).toHaveAttribute('href', /status=BELOW_COST/)
  })
})

test.describe('Precificação — listas por grupo (PR-3) @mock', () => {
  test('a coluna de resultado é a margem, e não o markup', async ({ page }) => {
    await page.goto(`${BASE}/materiais`)

    await expect(
      page.getByRole('columnheader', { name: 'Margem atual' }),
    ).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'MKM' })).toHaveCount(0)
  })

  test('produto sem composição mostra custo não calculado', async ({
    page,
  }) => {
    await page.goto(`${BASE}/produtos`)

    const row = page.getByRole('row').filter({ hasText: 'Adesivo recortado' })
    await expect(row).toContainText('Custo não calculado')
    await expect(row).not.toContainText('R$ 0,00')
  })

  test('preço abaixo do custo aparece com margem negativa', async ({
    page,
  }) => {
    await page.goto(`${BASE}/mao-de-obra`)

    const row = page.getByRole('row').filter({ hasText: 'Criação' })
    await expect(row).toContainText('-20,8%')
    await expect(row).toContainText('Preço abaixo do custo')
  })

  test('filtrar por situação muda a lista', async ({ page }) => {
    await page.goto(`${BASE}/materiais?status=PENDING`)

    await expect(
      page.getByRole('row').filter({ hasText: 'Ilhós' }),
    ).toBeVisible()
    await expect(
      page.getByRole('row').filter({ hasText: 'Lona 440' }),
    ).toHaveCount(0)
  })
})

test.describe('Precificação — modal do item (PR-2) @mock', () => {
  test('alterna entre preço fixo e variável e decompõe o preço', async ({
    page,
  }) => {
    await page.goto(`${BASE}/maquinas`)

    await page
      .getByRole('button', {
        name: 'Precificar Impressora Sublimática · Standart',
      })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Resumo de precificação')).toBeVisible()

    for (const label of [
      'Custo',
      'Tributação',
      'Comissão',
      'Custo financeiro',
      'Margem',
    ]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible()
    }

    await dialog.getByRole('button', { name: /Preço variável/ }).click()
    // custo R$ 1,52 × markup 1,68 = R$ 2,55
    await expect(dialog.getByText('R$ 2,55')).toBeVisible()
  })

  test('item sem custo não pode ser precificado', async ({ page }) => {
    await page.goto(`${BASE}/produtos`)

    await page
      .getByRole('button', { name: 'Precificar Adesivo recortado' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Custo não calculado')).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: 'Salvar preço' }),
    ).toBeDisabled()
  })
})

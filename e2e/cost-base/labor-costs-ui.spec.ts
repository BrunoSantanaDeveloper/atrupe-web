import { test, expect, type Page } from '@playwright/test'

// Confere a aba Mão de obra contra as decisões F-11 (carga por colaborador),
// PR-3 (margem no lugar do markup) e MO-1, registradas em
// openspec/regras-de-negocio/areas/02-folha-de-pagamento.md.

const ROUTE = '/base-de-custos/mao-de-obra'

async function openLabor(page: Page) {
  await page.goto(ROUTE)
  await expect(
    page.getByRole('heading', { name: 'Mão de obra por setor' }),
  ).toBeVisible()
}

const sectorRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Mão de obra — listagem @mock', () => {
  test('a coluna de resultado é a margem, e não o MKM (PR-3)', async ({
    page,
  }) => {
    await openLabor(page)

    await expect(
      page.getByRole('columnheader', { name: 'Margem atual' }),
    ).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'MKM' })).toHaveCount(0)
  })

  test('o custo hora sai do custo do setor dividido pela carga', async ({
    page,
  }) => {
    await openLabor(page)

    // Produção: R$ 4.057,50 em 246 h = R$ 16,49
    await expect(sectorRow(page, 'Produção')).toContainText('246 h')
    await expect(sectorRow(page, 'Produção')).toContainText('R$ 16,49')
  })

  test('setor sem colaborador não inventa custo hora', async ({ page }) => {
    await openLabor(page)

    await expect(sectorRow(page, 'Marcenaria')).toContainText('-')
    await expect(sectorRow(page, 'Marcenaria')).not.toContainText('R$ 0,00')
  })

  test('margem negativa aparece destacada', async ({ page }) => {
    await openLabor(page)

    // Criação: custo R$ 36,23 e preço R$ 30,00 — vende abaixo do custo
    await expect(sectorRow(page, 'Criação')).toContainText('%')
  })
})

test.describe('Mão de obra — carga por colaborador (F-11) @mock', () => {
  test('o modal soma as horas de cada colaborador', async ({ page }) => {
    await openLabor(page)

    await page
      .getByRole('button', { name: 'Carga de produção — Produção' })
      .click()

    await expect(
      page.getByRole('dialog').getByText('Carga de produção por colaborador'),
    ).toBeVisible()
    await expect(page.getByText('Gerente de produção')).toBeVisible()
    await expect(page.getByText('246 h')).toBeVisible()
  })

  test('mudar as horas recalcula o custo hora estimado', async ({ page }) => {
    await openLabor(page)

    await page
      .getByRole('button', { name: 'Carga de produção — Produção' })
      .click()

    const hours = page.getByRole('textbox', {
      name: 'Carga horária em horas e minutos — João',
    })
    await hours.fill('54')
    await hours.press('Enter')

    // 54 + 146 = 200 h
    await expect(page.getByText('200 h')).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText('R$ 20,29')
  })

  test('as horas aceitam minutos (design.md §6.8)', async ({ page }) => {
    await openLabor(page)

    await page
      .getByRole('button', { name: 'Carga de produção — Produção' })
      .click()

    const hours = page.getByRole('textbox', {
      name: 'Carga horária em horas e minutos — João',
    })
    await hours.fill('54:30')
    await hours.press('Enter')

    // 54h30 + 146 h = 200h30
    await expect(hours).toHaveValue('54:30')
    await expect(page.getByRole('dialog')).toContainText('200h30')
  })

  test('setor sem colaborador explica o que falta', async ({ page }) => {
    await openLabor(page)

    await page
      .getByRole('button', { name: 'Carga de produção — Marcenaria' })
      .click()

    await expect(
      page.getByText('Nenhum colaborador ativo neste setor'),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Salvar carga' }),
    ).toBeDisabled()
  })
})

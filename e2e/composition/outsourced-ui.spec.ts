import { test, expect, type Page } from '@playwright/test'

// Confere o cadastro de terceirizados contra a documentação funcional §11 e a
// área 7 (openspec/regras-de-negocio/areas/07-terceirizados.md).

const ROUTE = '/configuracoes/produtos/terceirizados'

const row = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Terceirizados', () => {
  test('cadastra por fornecedor, serviço, unidade, custo e preço', async ({
    page,
  }) => {
    await page.goto(ROUTE)

    await expect(
      page.getByRole('heading', { name: 'Terceirizados' }),
    ).toBeVisible()
    await expect(row(page, 'Instalação em altura')).toContainText(
      'Alpinismo Industrial ME',
    )
    await expect(row(page, 'Instalação em altura')).toContainText('R$ 180,00')
    await expect(row(page, 'Instalação em altura')).toContainText('R$ 300,00')
  })

  test('serviço sem preço mostra "-", nunca R$ 0,00', async ({ page }) => {
    await page.goto(ROUTE)

    await expect(row(page, 'Costura de lona')).toContainText('-')
    await expect(row(page, 'Costura de lona')).not.toContainText('R$ 0,00')
  })

  test('a tela explica que o terceirizado não entra na Base de custos', async ({
    page,
  }) => {
    await page.goto(ROUTE)

    await expect(page.getByText(/não entra na Base de\s+custos/)).toBeVisible()
  })

  test('o modal mostra a margem enquanto o preço é informado', async ({
    page,
  }) => {
    await page.goto(ROUTE)

    await page.getByRole('button', { name: 'Novo terceirizado' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Serviço').fill('Pintura eletrostática')
    await dialog.getByLabel('Fornecedor').fill('Pintura Rápida')
    await dialog.getByLabel('Custo').fill('100')
    await dialog.getByLabel('Preço de venda').fill('250')

    await expect(dialog.getByText(/Margem de 60,0%/)).toBeVisible()
  })
})

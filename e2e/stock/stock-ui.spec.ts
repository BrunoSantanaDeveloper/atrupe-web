import { test, expect, type Page } from '@playwright/test'

// Confere o estoque e a entrada de nota contra a documentação funcional §13 e
// as decisões DC-9, DC-10 e DC-11 (recurso do FULL).

const STOCK = '/estoque'
const ENTRY = '/estoque/entrada-de-nota'

const row = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Estoque — saldo e movimentações @mock', () => {
  test('mostra saldo, mínimo e situação de cada material', async ({ page }) => {
    await page.goto(STOCK)

    await expect(page.getByRole('heading', { name: 'Estoque' })).toBeVisible()
    await expect(row(page, 'Lona 440')).toContainText('120 m²')
    await expect(row(page, 'Ilhós')).toContainText('Abaixo do mínimo')
    await expect(row(page, 'MDF 15 mm')).toContainText('Zerado')
  })

  test('material sem entrada não inventa custo de compra', async ({ page }) => {
    await page.goto(STOCK)

    await expect(row(page, 'MDF 15 mm')).toContainText('sem entrada')
  })

  test('as movimentações dizem de onde vieram', async ({ page }) => {
    await page.goto(STOCK)

    await expect(page.getByText(/NF 12.345 — Distribuidora Sul/)).toBeVisible()
    await expect(page.getByText(/OS #1042 — Impressão em lona/)).toBeVisible()
  })

  test('filtra por abaixo do mínimo', async ({ page }) => {
    await page.goto(`${STOCK}?status=abaixo-do-minimo`)

    await expect(row(page, 'Ilhós')).toBeVisible()
    await expect(row(page, 'Lona 440')).toHaveCount(0)
  })
})

test.describe('Entrada de nota — conciliação (DC-9) @mock', () => {
  test('o item chega com a descrição do fornecedor', async ({ page }) => {
    await page.goto(ENTRY)

    await expect(page.getByText('LONA BRILHO 440G 1,52M BRANCA')).toBeVisible()
    await expect(page.getByText('ILHOS 10MM LATAO PACOTE 500UN')).toBeVisible()
  })

  test('item sem vínculo bloqueia a entrada', async ({ page }) => {
    await page.goto(ENTRY)

    await expect(page.getByText('1 item(ns) sem vínculo')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Confirmar entrada' }),
    ).toBeDisabled()
  })

  test('o modal converte a unidade de compra para a do material', async ({
    page,
  }) => {
    await page.goto(ENTRY)

    await page.getByRole('button', { name: /Vincular ILHOS 10MM/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Material interno')).toBeVisible()
    await expect(dialog.getByText(/um rolo de lona com 76 m²/)).toBeVisible()
  })

  test('o vínculo guardado aparece na linha', async ({ page }) => {
    await page.goto(ENTRY)

    await expect(row(page, 'LONA BRILHO')).toContainText(
      'Lona 440 · Marca X · Branca',
    )
    await expect(row(page, 'LONA BRILHO')).toContainText('1 ROLO = 76')
  })
})

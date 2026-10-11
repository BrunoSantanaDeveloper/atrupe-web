import { test, expect, type Page } from '@playwright/test'

// Confere o cadastro de materiais contra as decisões MT-2 a MT-6 e MT-9, em
// openspec/regras-de-negocio/areas/03-materiais-e-produtos.md.

const ROUTE = '/configuracoes/produtos/materiais'

async function openMaterials(page: Page) {
  await page.goto(ROUTE)
  await expect(page.getByRole('heading', { name: 'Materiais' })).toBeVisible()
}

const materialRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Materiais — convivência com produtos (MT-9) @mock', () => {
  test('produtos e materiais ficam na mesma tela, em abas', async ({
    page,
  }) => {
    await openMaterials(page)

    await expect(page.getByRole('tab', { name: 'Produtos' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Materiais' })).toHaveAttribute(
      'data-state',
      'active',
    )

    await page.getByRole('tab', { name: 'Produtos' }).click()
    await expect(page).toHaveURL(/\/configuracoes\/produtos$/)
  })
})

test.describe('Materiais — variações (MT-3, MT-4) @mock', () => {
  test('material com variação mostra custo por variação', async ({ page }) => {
    await openMaterials(page)

    await expect(materialRow(page, 'Lona 440')).toContainText('por variação')
    await expect(materialRow(page, 'Lona 440')).toContainText('3 variações')
  })

  test('material sem variação mostra o próprio custo', async ({ page }) => {
    await openMaterials(page)

    // MDF 15 mm é material próprio, não variação do MDF 10 mm (MT-2)
    await expect(materialRow(page, 'MDF 15 mm')).toContainText('R$ 112,00')
  })

  test('a linha abre e mostra o cruzamento marca × cor', async ({ page }) => {
    await openMaterials(page)

    await page
      .getByRole('button', { name: 'Ver variações de Lona 440' })
      .click()

    await expect(page.getByText('Marca X · Branca')).toBeVisible()
    await expect(page.getByText('Marca Y · Branca')).toBeVisible()
  })

  test('o modal de variações cria uma linha por combinação', async ({
    page,
  }) => {
    await openMaterials(page)

    await page.getByRole('button', { name: 'Variações de Ilhós' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Marcas').fill('Marca A, Marca B')
    await dialog.getByLabel('Cores').fill('Dourado, Prata, Preto')

    await expect(dialog.getByText(/Serão criadas/)).toContainText('6')
  })
})

test.describe('Materiais — cadastro (MT-2, MT-6) @mock', () => {
  test('o novo material usa Unidade e explica o que vira variação', async ({
    page,
  }) => {
    await openMaterials(page)

    await page.getByRole('button', { name: 'Novo material' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Unidade')).toBeVisible()
    await expect(
      dialog.getByText(/Espessuras e tamanhos diferentes são materiais/),
    ).toBeVisible()

    // "Tipo de cálculo" era o nome do legado e não deve aparecer (MT-6)
    await expect(dialog.getByText('Tipo de Cálculo')).toHaveCount(0)
  })

  test('venda direta e material de produção são marcações do cadastro', async ({
    page,
  }) => {
    await openMaterials(page)

    await expect(materialRow(page, 'MDF 10 mm')).toContainText('Venda direta')
    await expect(materialRow(page, 'Lona 440')).toContainText('Produção')
  })
})

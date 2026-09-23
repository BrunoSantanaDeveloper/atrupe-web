import { test, expect, type Page } from '@playwright/test'

// Confere a composição contra a documentação funcional §9 e §10 e as decisões
// DC-2, DC-14, DC-15, P-16, P-18 e MT-5.

const PROCESSES = '/configuracoes/produtos/processos'
const COMPOSITIONS = '/configuracoes/produtos/composicoes'

const row = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Processos — etapa produtiva de um setor (§9)', () => {
  test('a lista agrupa por setor e mostra os tipos de recurso', async ({
    page,
  }) => {
    await page.goto(PROCESSES)

    await expect(page.getByRole('heading', { name: 'Processos' })).toBeVisible()
    await expect(row(page, 'Impressão em lona')).toContainText('Máquina')
    await expect(row(page, 'Impressão em lona')).toContainText('Material')
  })

  test('o processo calcula o custo pela medida simulada', async ({ page }) => {
    await page.goto(`${PROCESSES}/impressao-lona`)

    await expect(page.getByText('Simulação')).toBeVisible()

    // 1 m²: máquina R$ 2,89 + lona R$ 12,50 = R$ 15,39
    await expect(page.getByText('R$ 15,39')).toBeVisible()

    await page.getByLabel('Largura').fill('2')
    // 2 m²: R$ 30,78
    await expect(page.getByText('R$ 30,78')).toBeVisible()
  })

  test('as fórmulas aparecem por nome, não por código', async ({ page }) => {
    await page.goto(`${PROCESSES}/impressao-lona`)

    await expect(page.getByText('Por metro quadrado').first()).toBeVisible()
    await expect(
      page.getByText('Consumo × área do item × quantidade.').first(),
    ).toBeVisible()
  })

  test('o campo extra entra no cálculo', async ({ page }) => {
    await page.goto(`${PROCESSES}/acabamento-banner`)

    await expect(page.getByLabel('Ilhoses por metro')).toHaveValue('2')
    // ilhós 2 × R$ 0,12 = R$ 0,24 + mão de obra 0,25 h × R$ 16,49 = R$ 4,12
    await expect(page.getByText('R$ 4,36')).toBeVisible()
  })

  test('o recurso novo vem dos cadastros do PRO', async ({ page }) => {
    await page.goto(`${PROCESSES}/impressao-lona`)

    await page.getByRole('button', { name: 'Novo recurso' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Tipo de recurso')).toBeVisible()
    await expect(dialog.getByText('Como é consumido')).toBeVisible()
  })
})

test.describe('Composições — produto do START com custo (DC-2, DC-15)', () => {
  test('produto sem composição mostra custo não calculado', async ({
    page,
  }) => {
    await page.goto(COMPOSITIONS)

    const product = row(page, 'Adesivo recortado')
    await expect(product).toContainText('sem composição')
    await expect(product).toContainText('custo não calculado')
    await expect(product).not.toContainText('R$ 0,00')
  })

  test('produto composto mostra custo, preço e margem', async ({ page }) => {
    await page.goto(COMPOSITIONS)

    const product = row(page, 'Banner 440 com bastão')
    // impressão R$ 15,39 + acabamento R$ 4,36 = R$ 19,75
    await expect(product).toContainText('R$ 19,75')
    await expect(product).toContainText('R$ 45,00')
    await expect(product).toContainText('%')
  })

  test('margem negativa aparece destacada', async ({ page }) => {
    await page.goto(`${COMPOSITIONS}?status=abaixo-do-custo`)

    await expect(row(page, 'Placa PVC 3 mm')).toBeVisible()
  })

  test('a página mostra as etapas e permite adotar o preço sugerido', async ({
    page,
  }) => {
    await page.goto(`${COMPOSITIONS}/banner`)

    await expect(page.getByText('Etapas de produção')).toBeVisible()
    await expect(page.getByText('Impressão em lona')).toBeVisible()
    await expect(page.getByText('Tempo total previsto: 20 min')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Adotar preço sugerido' }),
    ).toBeEnabled()
  })

  test('produto sem composição explica que continua sendo vendido', async ({
    page,
  }) => {
    await page.goto(`${COMPOSITIONS}/adesivo`)

    await expect(
      page.getByText(/continua sendo\s+vendido normalmente/),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Adotar preço sugerido' }),
    ).toBeDisabled()
  })
})

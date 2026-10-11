import { test, expect, type Page } from '@playwright/test'

// Confere o cadastro de patrimônios contra as decisões P-12 (cadastro em duas
// etapas), P-14 (unidade no lugar do tipo), P-15 (detalhado x simplificado),
// P-25 (venda) e P-29 (agrupamento), em
// openspec/regras-de-negocio/areas/01-patrimonios.md.

const ROUTE = '/configuracoes/empresa-e-sistema/patrimonios'

async function openAssets(page: Page) {
  await page.goto(ROUTE)
  await expect(page.getByRole('heading', { name: 'Patrimônios' })).toBeVisible()
}

const assetRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Patrimônios — listagem', () => {
  test('agrupa por tipo de bem (P-29)', async ({ page }) => {
    await openAssets(page)

    await expect(page.getByText('Máquinas e equipamentos')).toBeVisible()
    await expect(page.getByText('Veículos e frota')).toBeVisible()
  })

  test('distingue cadastro detalhado e simplificado (P-15)', async ({
    page,
  }) => {
    await openAssets(page)

    await expect(assetRow(page, 'Impressora Sublimática')).toContainText(
      'Cadastro detalhado',
    )
    await expect(assetRow(page, 'Móveis do administrativo')).toContainText(
      'Cadastro simplificado',
    )
  })

  test('bem simplificado não mostra unidade nem produtividade', async ({
    page,
  }) => {
    await openAssets(page)

    const row = assetRow(page, 'Móveis do administrativo')
    await expect(row).toContainText('-')
    await expect(row).not.toContainText('R$ 0,00')
  })

  test('bem sem depreciação calculada aparece como inconsistência (P-26)', async ({
    page,
  }) => {
    await openAssets(page)

    await expect(assetRow(page, 'Ilhoseira')).toContainText('Inconsistência')
  })
})

test.describe('Patrimônios — cadastro rápido (P-12, P-14)', () => {
  test('o modal varia pela unidade, sem tipo de equipamento', async ({
    page,
  }) => {
    await openAssets(page)

    await page.getByRole('button', { name: 'Novo patrimônio' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Unidade')).toBeVisible()

    // Os tipos com nome de equipamento saíram (P-14)
    await expect(dialog.getByText('Impressora Com. Visual')).toHaveCount(0)
    await expect(dialog.getByText('Equipamento CNC')).toHaveCount(0)

    await expect(
      dialog.getByText(/Vida útil e valor residual entram com os padrões/),
    ).toBeVisible()
  })

  test('desligar o detalhamento esconde unidade e produtividade', async ({
    page,
  }) => {
    await openAssets(page)

    await page.getByRole('button', { name: 'Novo patrimônio' }).click()

    const dialog = page.getByRole('dialog')
    await dialog
      .getByRole('switch', { name: 'Detalhar custos deste bem' })
      .click()

    await expect(dialog.getByText('Unidade')).toHaveCount(0)
    await expect(dialog.getByText(/Produtividade de referência/)).toHaveCount(0)
  })
})

test.describe('Patrimônio — página do bem', () => {
  test('mostra resumo, custos e configurações produtivas', async ({ page }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await expect(
      page.getByRole('heading', { name: 'Impressora Sublimática' }),
    ).toBeVisible()
    await expect(page.getByText('Depreciação mensal')).toBeVisible()
    await expect(page.getByText('R$ 233,33')).toBeVisible()
    await expect(page.getByText('Centro de custos')).toBeVisible()
    await expect(page.getByText('Configurações produtivas')).toBeVisible()
    await expect(page.getByText('Usado nos processos')).toBeVisible()
  })

  test('a página não oferece criar processo (P-18)', async ({ page }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await expect(page.getByText('Novo serviço composto')).toHaveCount(0)
  })

  test('o bem simplificado explica o que falta para detalhar', async ({
    page,
  }) => {
    await page.goto(`${ROUTE}/moveis`)

    await expect(page.getByText('Cadastro simplificado')).toBeVisible()
    await expect(page.getByText('Centro de custos')).toHaveCount(0)
  })

  test('a venda sugere o valor restante e mostra o resultado (P-25)', async ({
    page,
  }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await page.getByRole('button', { name: 'Vender patrimônio' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/Sugerido: R\$ 28.000,00/)).toBeVisible()
    await expect(dialog.getByText('Resultado da venda')).toBeVisible()
    await expect(
      dialog.getByText(/gera uma receita no financeiro/),
    ).toBeVisible()
  })

  test('a edição calcula a depreciação pelo residual em percentual', async ({
    page,
  }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await page.getByRole('button', { name: 'Editar patrimônio' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Vida útil').fill('100')

    // (40.000 − 12.000) ÷ 100 = R$ 280,00
    await expect(dialog.getByText('R$ 280,00')).toBeVisible()
  })
})

test.describe('Patrimônio — custos e configurações (P-6, P-31)', () => {
  test('o custo fixo é diluído pela periodicidade', async ({ page }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await page.getByRole('button', { name: 'Novo custo' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Nome do custo').fill('Seguro anual')
    await dialog.getByLabel('Valor').fill('1200')
    await dialog.getByLabel('A cada quantos meses').fill('12')

    await expect(dialog.getByText('R$ 100,00')).toBeVisible()
  })

  test('a configuração calcula o tempo em atividade', async ({ page }) => {
    await page.goto(`${ROUTE}/sublimatica`)

    await page.getByRole('button', { name: 'Nova configuração' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Nome').fill('6 passes')
    await dialog.getByLabel(/Tempo por/).fill('10')
    await dialog.getByLabel(/Produtividade de referência/).fill('120')

    // 10 min × 120 m² = 1.200 min = 20 h
    await expect(dialog.getByText('20 h/mês')).toBeVisible()
  })
})

test.describe('Grupos de bens equivalentes (P-28)', () => {
  test('custo pela média e produtividade pela soma', async ({ page }) => {
    await page.goto(`${ROUTE}/grupos`)

    await expect(
      page.getByRole('heading', { name: 'Grupos de bens equivalentes' }),
    ).toBeVisible()

    const motos = page.getByRole('row').filter({ hasText: 'Motos' })
    await expect(motos).toContainText('R$ 210,00')
    await expect(motos).toContainText('1000 km/mês')
  })

  test('grupo vazio não inventa custo', async ({ page }) => {
    await page.goto(`${ROUTE}/grupos`)

    const carros = page.getByRole('row').filter({ hasText: 'Carros' })
    await expect(carros).toContainText('-')
    await expect(carros).not.toContainText('R$ 0,00')
  })

  test('os grupos de veículo vêm pré-cadastrados e são editáveis', async ({
    page,
  }) => {
    await page.goto(`${ROUTE}/grupos`)

    for (const name of ['Carros', 'Motos', 'Caminhões']) {
      await expect(page.getByText(name, { exact: true })).toBeVisible()
    }

    await page.getByRole('button', { name: 'Renomear Motos' }).click()
    await expect(page.getByLabel('Novo nome de Motos')).toBeVisible()
  })
})

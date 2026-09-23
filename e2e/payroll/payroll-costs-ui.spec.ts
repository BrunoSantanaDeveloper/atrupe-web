import { test, expect, type Page } from '@playwright/test'

// Confere os custos da folha contra as decisões F-1, F-7, F-9 e F-10, em
// openspec/regras-de-negocio/areas/02-folha-de-pagamento.md.

const ROUTE = '/configuracoes/financeiro/folhas-de-pagamento/custos'

async function openPayrollCosts(page: Page) {
  await page.goto(ROUTE)
  await expect(
    page.getByRole('heading', { name: 'Custo por colaborador' }),
  ).toBeVisible()
}

const employeeRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

test.describe('Custos da folha — cálculo automático (F-1, F-7)', () => {
  test('os encargos saem do salário base', async ({ page }) => {
    await openPayrollCosts(page)

    // Marcos: salário R$ 3.000, encargos 11% + 8% + 8,3% + 11,1% = R$ 1.152
    await expect(employeeRow(page, 'Marcos')).toContainText('R$ 3.000,00')
    await expect(employeeRow(page, 'Marcos')).toContainText('R$ 1.152,00')
  })

  test('a linha abre e mostra cada encargo com seu percentual', async ({
    page,
  }) => {
    await openPayrollCosts(page)

    await page.getByRole('button', { name: 'Detalhar Marcos' }).click()

    await expect(page.getByText('INSS')).toBeVisible()
    await expect(page.getByText('11,0% do salário')).toBeVisible()
    await expect(page.getByText('13º salário')).toBeVisible()
  })

  test('encargo editado aparece como informado manualmente (F-4)', async ({
    page,
  }) => {
    await openPayrollCosts(page)

    await page.getByRole('button', { name: 'Detalhar Allan' }).click()

    await expect(page.getByText('informado manualmente')).toBeVisible()
  })

  test('os percentuais da empresa são configuráveis', async ({ page }) => {
    await openPayrollCosts(page)

    await page.getByRole('button', { name: 'Percentuais dos encargos' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByLabel('INSS')).toHaveValue('11.0')
    await expect(dialog.getByLabel('FGTS')).toHaveValue('8.0')
  })
})

test.describe('Custos da folha — formas de contratação (F-9, F-10)', () => {
  test('mostra as três formas de contratação', async ({ page }) => {
    await openPayrollCosts(page)

    await expect(employeeRow(page, 'Marcos')).toContainText('Registrado')
    await expect(employeeRow(page, 'João')).toContainText('MEI ou PJ')
    await expect(employeeRow(page, 'Maicol')).toContainText(
      'Sócio com pró-labore',
    )
  })

  test('MEI não tem encargos calculados sobre o salário', async ({ page }) => {
    await openPayrollCosts(page)

    await expect(employeeRow(page, 'João')).toContainText('-')

    await page.getByRole('button', { name: 'Detalhar João' }).click()
    await expect(
      page.getByText(/não\s+tem encargos calculados sobre o salário/),
    ).toBeVisible()
  })

  test('o modal leva o custo ao setor do colaborador', async ({ page }) => {
    await openPayrollCosts(page)

    await page.getByRole('button', { name: 'Editar custo de Marcos' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Custo total do colaborador')).toBeVisible()
    await expect(
      dialog.getByText('Vai para o custo do setor Produção'),
    ).toBeVisible()
  })
})

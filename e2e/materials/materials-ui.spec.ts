import { expect, test, type Page } from '@playwright/test'

import { hasTestCredentials, planStorageState } from '../helpers/credentials'

/**
 * Cadastro de materiais contra a API (/material), com a conta do PRO
 * (E2E_PRO_EMAIL/PASSWORD; sem ela, o arquivo é pulado). Confere as decisões
 * MT-2 a MT-6 e MT-9 de openspec/regras-de-negocio/areas/03-materiais-e-produtos.md.
 *
 * O teste cria o próprio material, com nome único, e o deixa inativo no fim:
 * material tem histórico e não é excluído (MT-9).
 */

const ROUTE = '/configuracoes/produtos/materiais'

const materialRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

async function openMaterials(page: Page, status?: 'inativos') {
  await page.goto(status ? `${ROUTE}?status=${status}` : ROUTE)
  await expect(
    page.getByRole('heading', { level: 1, name: /^Materiais$/ }),
  ).toBeVisible()
  await page.waitForLoadState('networkidle')
}

test.describe('Materiais (PRO)', () => {
  test.skip(
    !hasTestCredentials('PRO'),
    'Sem credencial do plano PRO (E2E_PRO_EMAIL/PASSWORD).',
  )
  test.use({ storageState: planStorageState('PRO') })

  // Os passos dependem um do outro: um material só
  test.describe.configure({ mode: 'serial' })

  const name = `E2E Perfil ${Date.now()}`

  test('ativos e inativos são abas, como em Produtos', async ({ page }) => {
    await openMaterials(page)

    // O contador entra no nome da aba ("Ativos 8") quando há materiais
    await expect(page.getByRole('tab', { name: /^Ativos/ })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(page.getByRole('tab', { name: /^Inativos/ })).toBeVisible()
  })

  test('o novo material usa Unidade e explica o que vira variação (MT-2, MT-6)', async ({
    page,
  }) => {
    await openMaterials(page)
    await page.getByRole('button', { name: 'Novo material' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Unidade', { exact: true })).toBeVisible()
    await expect(
      dialog.getByText(/Espessuras e tamanhos diferentes são materiais/),
    ).toBeVisible()
    // "Tipo de cálculo" era o nome do legado e não deve aparecer (MT-6)
    await expect(dialog.getByText('Tipo de Cálculo')).toHaveCount(0)

    await dialog.getByLabel('Nome', { exact: true }).fill(name)
    await dialog.getByLabel('Custo por unidade').fill('18.50')
    await dialog.getByRole('switch', { name: 'Venda direta' }).click()
    await dialog.getByRole('button', { name: 'Cadastrar material' }).click()

    await expect(page.getByText('Material cadastrado')).toBeVisible()
    const row = materialRow(page, name)
    await expect(row).toBeVisible()
    // O código é do servidor, sequencial por empresa
    await expect(row).toContainText(/MAT-\d+/)
    await expect(row).toContainText('R$ 18,50')
    // As marcações do cadastro (MT-9)
    await expect(row).toContainText('Venda direta')
    await expect(row).toContainText('Produção')
  })

  test('o preço fixo é gravado no cadastro (DC-6, PR-2)', async ({ page }) => {
    await openMaterials(page)
    await page.getByRole('button', { name: `Precificar ${name}` }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Preço fixo' }).click()
    await dialog.getByLabel('Preço de venda').fill('30.00')
    await dialog.getByRole('button', { name: /^Salvar/ }).click()

    await expect(page.getByText('Preço salvo')).toBeVisible()
    await expect(materialRow(page, name)).toContainText('R$ 30,00')
  })

  test('as variações nascem em lote, marca × cor, e o custo passa a ser delas (MT-3, MT-4)', async ({
    page,
  }) => {
    await openMaterials(page)
    await page.getByRole('button', { name: `Editar ${name}` }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Marcas').fill('Marca A, Marca B')
    await dialog.getByLabel('Cores').fill('Dourado')
    await expect(dialog.getByText(/Serão criadas/)).toContainText('2')
    await dialog.getByLabel('Custo por combinação').fill('12.00')
    await dialog.getByRole('button', { name: 'Cadastrar variações' }).click()

    await expect(page.getByText('2 variações criadas')).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancelar' }).click()

    const row = materialRow(page, name)
    await expect(row).toContainText('2 variações')
    // Com variação, custo e preço vivem em cada combinação
    await expect(row).toContainText('por variação')

    await page.getByRole('button', { name: `Ver variações de ${name}` }).click()
    await expect(page.getByText('Marca A · Dourado')).toBeVisible()
    await expect(page.getByText('Marca B · Dourado')).toBeVisible()
  })

  test('inativar tira da lista de ativos; reativar devolve (MT-9)', async ({
    page,
  }) => {
    await openMaterials(page)
    await page.getByRole('button', { name: `Editar ${name}` }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Inativar' })
      .click()

    const confirm = page.getByRole('dialog', { name: `Inativar ${name}?` })
    await expect(
      confirm.getByText(/não está em nenhuma composição/),
    ).toBeVisible()
    await confirm.getByRole('button', { name: 'Inativar' }).click()

    await expect(page.getByText('Material inativado')).toBeVisible()
    await expect(materialRow(page, name)).toHaveCount(0)

    await openMaterials(page, 'inativos')
    await expect(materialRow(page, name)).toBeVisible()

    await page.getByRole('button', { name: `Editar ${name}` }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Reativar' })
      .click()
    await page
      .getByRole('dialog', { name: `Reativar ${name}?` })
      .getByRole('button', { name: 'Reativar' })
      .click()
    await expect(page.getByText('Material reativado')).toBeVisible()

    // Fica inativo no fim: material tem histórico e não é excluído
    await openMaterials(page)
    await page.getByRole('button', { name: `Editar ${name}` }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Inativar' })
      .click()
    await page
      .getByRole('dialog', { name: `Inativar ${name}?` })
      .getByRole('button', { name: 'Inativar' })
      .click()
    await expect(page.getByText('Material inativado')).toBeVisible()
  })
})

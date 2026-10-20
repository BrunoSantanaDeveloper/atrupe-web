import { expect, test, type Page } from '@playwright/test'

import { hasTestCredentials, planStorageState } from '../helpers/credentials'

/**
 * Processos contra a API (/process), com a conta do PRO
 * (E2E_PRO_EMAIL/PASSWORD; sem ela, o arquivo é pulado). Confere MS-1 (o
 * processo nasce vazio, com as regras de base), IP-37 (linha sem recurso é
 * aviso) e PAD-7 (processo não é excluído, é inativado).
 *
 * O teste cria o próprio processo, com nome único, e o deixa inativo no fim.
 */

const ROUTE = '/configuracoes/produtos/processos'

const processRow = (page: Page, name: string) =>
  page.getByRole('row').filter({ hasText: name })

async function openProcesses(page: Page, status?: 'inativos') {
  await page.goto(status ? `${ROUTE}?status=${status}` : ROUTE)
  await expect(
    page.getByRole('heading', { level: 1, name: /^Processos$/ }),
  ).toBeVisible()
  await page.waitForLoadState('networkidle')
}

test.describe('Processos (PRO)', () => {
  test.skip(
    !hasTestCredentials('PRO'),
    'Sem credencial do plano PRO (E2E_PRO_EMAIL/PASSWORD).',
  )
  test.use({ storageState: planStorageState('PRO') })

  // Os passos dependem um do outro: um processo só
  test.describe.configure({ mode: 'serial' })

  const name = `E2E Ilhós ${Date.now()}`

  test('ativos e inativos são abas', async ({ page }) => {
    await openProcesses(page)

    await expect(
      page.getByRole('tab', { name: 'Ativos', exact: true }),
    ).toHaveAttribute('data-state', 'active')
    await expect(page.getByRole('tab', { name: 'Inativos' })).toBeVisible()
  })

  test('o processo nasce vazio e abre na composição (MS-1)', async ({
    page,
  }) => {
    await openProcesses(page)
    await page.getByRole('button', { name: 'Novo processo' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Nome do processo').fill(name)
    await dialog.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Processo criado')).toBeVisible()
    // Reabre na aba Composição, com a simulação do servidor
    await expect(
      page.getByRole('dialog').getByText('Simulação').first(),
    ).toBeVisible()
    await page.keyboard.press('Escape')

    const row = processRow(page, name)
    await expect(row).toBeVisible()
    await expect(row).toContainText('Primário')
    await expect(row).toContainText('sem recursos')
    // Sem linha, o processo avisa (IP-37)
    await expect(row).toContainText('Há linhas sem recurso')
  })

  test('a página do processo mostra a simulação', async ({ page }) => {
    await openProcesses(page)
    await processRow(page, name).locator(`a[href^="${ROUTE}/"]`).click()

    await expect(page.getByRole('heading', { name })).toBeVisible()
    await expect(page.getByText('Simulação').first()).toBeVisible()
  })

  test('inativar tira o processo dos ativos (PAD-7)', async ({ page }) => {
    await openProcesses(page)
    await processRow(page, name).getByRole('button').last().click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Inativar' }).click()
    // O diálogo de inativar abre por cima, com o "onde é usado"
    await page
      .getByRole('dialog')
      .last()
      .getByRole('button', { name: 'Inativar' })
      .click()

    await expect(page.getByText('Processo inativado')).toBeVisible()
    await openProcesses(page, 'inativos')
    await expect(processRow(page, name)).toBeVisible()
  })
})

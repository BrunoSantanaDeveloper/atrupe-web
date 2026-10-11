import { Page, expect } from '@playwright/test'

/**
 * Inativa usuários de testes antigos e especificamente o 'Maycon João'
 * para liberar slots de quota no ambiente de homologação.
 */
export async function cleanupQuotaUsers(page: Page) {
  await page.goto('/configuracoes/empresa-e-sistema/colaboradores-e-usuarios')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000) // Aguarda React Query

  const searchInput = page.getByPlaceholder('Buscar por...')
  if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    // 1. Limpa usuários antigos de E2E
    await searchInput.fill('Diretor E2E')
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()
    await page.waitForTimeout(1500)
  }

  const oldRows = page.getByRole('row', { name: /Diretor E2E/i })
  const count = await oldRows.count()

  for (let i = 0; i < count; i++) {
    await oldRows.nth(i).getByRole('button').nth(1).click({ force: true })
    await page.waitForTimeout(500)

    const inativarBtn = page
      .getByRole('button', { name: /^Inativar$/i })
      .first()
    if (await inativarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await inativarBtn.click()
      await page
        .getByRole('alertdialog')
        .getByRole('button', { name: /^Inativar$/i })
        .click()
      await page.waitForTimeout(1000)
    } else {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
  }

  // 2. Libera cota inativando o 'Maycon João'
  await searchInput.fill('Maycon João')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await page.waitForTimeout(1500)

  const mayconRow = page.getByRole('row', { name: /Maycon João/i }).first()
  if (await mayconRow.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mayconRow.getByRole('button').nth(1).click({ force: true })
    await page.waitForTimeout(500)
    const inativarBtn = page
      .getByRole('button', { name: /^Inativar$/i })
      .first()
    if (await inativarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await inativarBtn.click()
      await page
        .getByRole('alertdialog')
        .getByRole('button', { name: /^Inativar$/i })
        .click()
      await page.waitForTimeout(1000)
    } else {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
  }
}

/**
 * Cria um cargo, atribui todas as permissões visíveis e cria um usuário E2E.
 * Retorna os dados para login do usuário criado.
 */
export async function setupE2EUserWithFullPermissions(
  page: Page,
  roleName: string,
  userEmail: string,
  userPassword = 'Password123!',
) {
  // ── 1. Criar o Cargo
  await page.goto('/configuracoes/empresa-e-sistema/cargos')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1500)

  await page.getByRole('button', { name: 'Novo cargo' }).click()
  await page.getByRole('combobox', { name: 'Setor' }).click()
  await page.getByRole('option', { name: 'Comercial' }).click()
  await page.getByPlaceholder('Cargo').fill(roleName)

  const insertOutro = page.getByRole('checkbox', { name: /inserir outro/i })
  if (await insertOutro.isChecked()) await insertOutro.uncheck()

  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText(/salvo|sucesso|criado/i).first()).toBeVisible({
    timeout: 10000,
  })

  // ── 1.5. Atribuir Permissões
  await page.getByPlaceholder('Buscar por...').fill(roleName)
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await page.waitForTimeout(1500)

  const cargoRow = page
    .locator('div')
    .filter({ hasText: roleName })
    .filter({ has: page.getByRole('button') })
    .last()
  await expect(cargoRow).toBeVisible({ timeout: 10000 })
  await cargoRow.getByRole('button').nth(1).click({ force: true })

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)

  await dialog.locator('button[role="checkbox"]').evaluateAll((checkboxes) => {
    checkboxes.forEach((cb) => {
      if (
        !cb.hasAttribute('disabled') &&
        cb.getAttribute('aria-checked') !== 'true'
      ) {
        ;(cb as HTMLElement).click()
      }
    })
  })

  await dialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText(/salvas?|sucesso|permiss/i).first()).toBeVisible({
    timeout: 10000,
  })

  // ── 2. Criar Colaborador
  await page.goto('/configuracoes/empresa-e-sistema/colaboradores-e-usuarios')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1500)

  await page.getByRole('button', { name: 'Novo colaborador' }).click()
  await page.getByLabel('Nome').fill(`Diretor E2E Test ${Date.now()}`)

  await page.getByRole('combobox', { name: 'Setor' }).click()
  await page.getByRole('option', { name: 'Comercial' }).click()

  await page.waitForTimeout(800)
  await page.getByRole('combobox', { name: 'Cargo' }).click()
  await page.getByRole('option', { name: roleName }).click()

  const insertOutroEmp = page.getByRole('checkbox', { name: /inserir outro/i })
  if (await insertOutroEmp.isChecked()) await insertOutroEmp.uncheck()

  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(
    page.getByText(/salvo|sucesso|criado|colaborador/i).first(),
  ).toBeVisible({ timeout: 10000 })

  // ── 3. Criar Usuário Vinculado
  const empSearch = page.getByPlaceholder('Buscar por...')
  if (await empSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
    await empSearch.fill('Diretor E2E Test')
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()
    await page.waitForTimeout(1500)
  }

  const employeeRow = page
    .getByRole('row', { name: /Diretor E2E Test/i })
    .first()
  await expect(employeeRow).toBeVisible({ timeout: 10000 })
  await employeeRow.getByRole('button').nth(1).click({ force: true })

  const userDialog = page.getByRole('dialog')
  await expect(userDialog).toBeVisible({ timeout: 10000 })
  await userDialog.getByLabel('Email').fill(userEmail)
  await userDialog.locator('input[name="password"]').fill(userPassword)
  await userDialog.locator('input[name="confirmPassword"]').fill(userPassword)

  await userDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(
    page.getByText(/usuário criado|sucesso|salvo/i).first(),
  ).toBeVisible({ timeout: 10000 })

  return { email: userEmail, password: userPassword, roleName }
}

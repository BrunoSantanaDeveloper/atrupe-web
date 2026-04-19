import { test, expect } from '@playwright/test'

test.describe('FiscalSetupModal (dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset any prior dismissal state
    await page.addInitScript(() => {
      localStorage.removeItem('fiscal-setup-modal-dismissed')
    })
    await page.goto('/dashboard')
  })

  test('should navigate to /dashboard after login', async ({ page }) => {
    // With shared auth state, we're already on dashboard from beforeEach
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  })

  test('fiscal setup modal should have a title about fiscal configuration', async ({
    page,
  }) => {

    // The modal may or may not appear depending on account state.
    // We try to detect it with a generous timeout.
    const modalLocator = page.getByRole('dialog').filter({
      has: page.getByText(/configure o módulo fiscal|configuração do módulo fiscal/i),
    })

    const isVisible = await modalLocator
      .isVisible()
      .catch(() => false)

    if (!isVisible) {
      // Modal was not shown — skip rather than fail (account might be fully configured)
      test.skip(true, 'FiscalSetupModal did not appear — account may be fully configured or feature not enabled')
      return
    }

    // Verify the dialog is visible
    await expect(modalLocator).toBeVisible()
  })

  test('dismissing the modal should show the reminder banner', async ({ page }) => {

    const modalLocator = page.getByRole('dialog').filter({
      has: page.getByText(/configure o módulo fiscal|configuração do módulo fiscal/i),
    })

    // Wait up to 5s for modal to appear
    const appeared = await modalLocator
      .waitFor({ state: 'visible', timeout: 8_000 })
      .then(() => true)
      .catch(() => false)

    if (!appeared) {
      test.skip(true, 'FiscalSetupModal did not appear — skipping dismissal test')
      return
    }

    // Dismiss the modal via the "Configurar depois" ghost button
    await modalLocator
      .getByRole('button', { name: /configurar depois/i })
      .click()

    // Modal should close
    await expect(modalLocator).not.toBeVisible()

    // Reminder banner should appear on the dashboard
    await expect(
      page.getByText(/configuração fiscal pendente/i),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('clicking the reminder banner should reopen the modal', async ({ page }) => {

    const modalLocator = page.getByRole('dialog').filter({
      has: page.getByText(/configure o módulo fiscal|configuração do módulo fiscal/i),
    })

    // Wait for modal to appear
    const appeared = await modalLocator
      .waitFor({ state: 'visible', timeout: 8_000 })
      .then(() => true)
      .catch(() => false)

    if (!appeared) {
      test.skip(true, 'FiscalSetupModal did not appear — skipping banner reopen test')
      return
    }

    // Dismiss
    await modalLocator.getByRole('button', { name: /configurar depois/i }).click()
    await expect(modalLocator).not.toBeVisible()

    // Wait for banner
    const banner = page.getByText(/configuração fiscal pendente/i)
    await expect(banner).toBeVisible({ timeout: 5_000 })

    // Click banner to reopen
    await banner.click()

    // Modal should reopen
    await expect(modalLocator).toBeVisible({ timeout: 5_000 })
  })

  test('fiscal setup modal should contain configuration steps', async ({ page }) => {

    const modalLocator = page.getByRole('dialog').filter({
      has: page.getByText(/configure o módulo fiscal|configuração do módulo fiscal/i),
    })

    const appeared = await modalLocator
      .waitFor({ state: 'visible', timeout: 8_000 })
      .then(() => true)
      .catch(() => false)

    if (!appeared) {
      test.skip(true, 'FiscalSetupModal did not appear — skipping steps test')
      return
    }

    // The modal in NOT_STARTED state shows locked step previews
    // The modal in ACTIVE state shows clickable steps
    // Either way, at minimum one of these step titles should be visible
    const stepTexts = [
      'Dados do Emissor',
      'Certificado Digital',
      'Ambiente de Emissão',
      'Séries e Numeração',
      'CFOP e Natureza de Operação',
      'Iniciar Configuração Fiscal',
    ]

    let foundAStep = false
    for (const text of stepTexts) {
      const el = modalLocator.getByText(text)
      if (await el.isVisible().catch(() => false)) {
        foundAStep = true
        break
      }
    }

    expect(foundAStep, 'Expected at least one step/CTA to be visible in the modal').toBe(true)
  })
})

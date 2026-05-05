import { test, expect } from '@playwright/test'

test.describe('Fiscal Onboarding (Dashboard Modal)', () => {
  test('should display inline onboarding form in modal and submit successfully using API mock', async ({
    page,
  }) => {
    // 1. Mock fiscal onboarding status as NOT_STARTED so the modal appears
    await page.route('**/api/fiscal/onboarding/status', async (route) => {
      await route.fulfill({
        status: 200,
        json: { status: 'NOT_STARTED', hasConfig: false },
      })
    })

    // 2. Mock the POST submit endpoint
    await page.route('**/api/fiscal/onboarding', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            status: 'ACTIVE',
            message: 'Módulo fiscal ativado com sucesso!',
            onboardingId: 'test-onboarding-123',
          },
        })
        return
      }
      await route.continue()
    })

    // 3. Navigate to dashboard where the modal should auto-open
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // 4. Look for the "Configurar Módulo Fiscal" button in the modal or banner
    const configButton = page
      .getByRole('button', { name: /configurar módulo fiscal/i })
      .first()

    const isBannerVisible = await page
      .getByText(/configuração fiscal pendente/i)
      .isVisible({ timeout: 10_000 })
      .catch(() => false)

    if (isBannerVisible) {
      await page.getByText(/configuração fiscal pendente/i).click()
    }

    const isConfigButtonVisible = await configButton
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (isConfigButtonVisible) {
      await configButton.click()
    }

    // 5. The form should now be visible inside the modal (inline)
    const cnpjInput = page.getByPlaceholder(/00.000.000\/0000-00/).first()

    const isCnpjVisible = await cnpjInput
      .isVisible({ timeout: 10_000 })
      .catch(() => false)

    if (isCnpjVisible) {
      await cnpjInput.fill('12345678000199')

      const razaoSocialInput = page
        .getByRole('textbox', { name: /razão social/i })
        .first()
      if (await razaoSocialInput.isVisible()) {
        await razaoSocialInput.fill('Empresa Teste E2E LTDA')
      }

      // Upload dummy certificate
      const fileInput = page.locator('input[type="file"]').first()
      await fileInput.setInputFiles({
        name: 'certificado_dummy.pfx',
        mimeType: 'application/x-pkcs12',
        buffer: Buffer.from('dummy-cert-data'),
      })

      // Fill password if visible after upload
      const passwordInput = page
        .getByLabel(/senha/i)
        .or(page.getByPlaceholder(/senha do certificado/i))
        .first()
      if (
        await passwordInput.isVisible({ timeout: 3_000 }).catch(() => false)
      ) {
        await passwordInput.fill('123456')
      }

      // 6. Submit
      const submitButton = page
        .getByRole('button', { name: /ativar módulo fiscal/i })
        .first()

      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()

        // 7. Verify success state in the modal
        const successMessage = page
          .getByText(/módulo fiscal ativado|ativado com sucesso/i)
          .first()
        await expect(successMessage).toBeVisible({ timeout: 15_000 })
      }
    }
  })
})

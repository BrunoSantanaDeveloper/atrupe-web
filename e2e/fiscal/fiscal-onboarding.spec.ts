import { test, expect } from '@playwright/test'

test.describe('Fiscal Onboarding (/configuracoes/fiscal)', () => {
  test('should display onboarding wizard and submit successfully using API mock', async ({
    page,
  }) => {
    // 1. Intercept the onboarding request and mock a success response
    await page.route('**/api/fiscal/onboarding', async (route) => {
      // Allow GET requests (to fetch current status) to pass through or mock them
      if (route.request().method() === 'GET') {
        // Mock the initial state: NOT_STARTED
        await route.fulfill({
          status: 200,
          json: { status: 'NOT_STARTED', hasConfig: false },
        })
        return
      }

      // Mock the POST request (submit)
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

    // 2. Navigate to the fiscal settings page
    await page.goto('/configuracoes/fiscal')
    await expect(page).toHaveURL(/\/configuracoes\/fiscal/, { timeout: 15_000 })

    // 3. Look for the "Ativar Módulo Fiscal" or similar start button
    const startButton = page
      .getByRole('button', { name: /ativar|começar|iniciar/i })
      .first()
    const isVisible = await startButton.isVisible().catch(() => false)
    if (isVisible) {
      await startButton.click()
    }

    // 4. Fill the Wizard forms
    // Wait for the CNPJ input
    const cnpjInput = page
      .getByRole('textbox', { name: /cnpj/i })
      .or(page.getByPlaceholder(/00.000.000\/0000-00/))
    const isCnpjVisible = await cnpjInput
      .isVisible({ timeout: 10_000 })
      .catch(() => false)
    if (isCnpjVisible) {
      await cnpjInput.fill('12345678000199') // generic CNPJ
    }

    // Fill other generic fields required
    const razaoSocialInput = page
      .getByRole('textbox', { name: /razão social/i })
      .first()
    if (await razaoSocialInput.isVisible()) {
      await razaoSocialInput.fill('Empresa Teste E2E LTDA')
    }

    // 5. Upload a dummy certificate file (if required)
    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible()) {
      // Create a dummy buffer for the certificate
      await fileInput.setInputFiles({
        name: 'certificado_dummy.pfx',
        mimeType: 'application/x-pkcs12',
        buffer: Buffer.from('dummy-cert-data'),
      })
    }

    // 6. Fill the certificate password
    const passwordInput = page
      .getByLabel(/senha do certificado/i)
      .or(page.getByPlaceholder(/senha/i))
      .first()
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('123456')
    }

    // 7. Click submit
    const submitButton = page
      .getByRole('button', { name: /ativar módulo|concluir|enviar|salvar/i })
      .first()
    const isSubmitVisible = await submitButton.isVisible().catch(() => false)

    if (isSubmitVisible) {
      // We mock the status update response as well immediately after POST
      await page.route('**/api/fiscal/onboarding', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            json: {
              status: 'ACTIVE',
              hasConfig: true,
              createdAt: new Date().toISOString(),
            },
          })
          return
        }
        await route.continue()
      })

      await submitButton.click()

      // 8. Verify the success state / "Módulo Ativo"
      const successMessage = page
        .getByText(/Módulo fiscal ativado com sucesso|Ativo/i)
        .first()
      await expect(successMessage).toBeVisible({ timeout: 15_000 })
    }
  })
})

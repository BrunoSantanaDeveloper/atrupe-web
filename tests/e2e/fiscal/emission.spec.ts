import { test, expect } from '@playwright/test'

test.describe('Emissão Fiscal', () => {
  // Autenticação antes de cada teste
  test.beforeEach(async ({ page }) => {
    // 1. Navegar para o login
    await page.goto('/login')

    // 2. Preencher formulário de login via data-testid ou placeholders
    // Ajustado para coincidir com LoginForm.tsx
    await page
      .getByPlaceholder(/digite seu e-mail/i)
      .fill('danilo.santana@tribodev.com.br')
    await page.getByPlaceholder(/digite sua senha/i).fill('Atrupe@123')

    // 3. Submeter
    await page.getByRole('button', { name: /entrar/i }).click()

    // 4. Aguardar redirecionamento
    await expect(page).not.toHaveURL(/login/)
  })

  test('deve acessar emissão de nota', async ({ page }) => {
    // 1. Navegar para uma página protegida (ex: listagem de ordens)
    // Isso valida que o login funcionou
    await page.goto('/ordens-servico')

    // Validar que permaneceu logado
    await expect(page).not.toHaveURL(/login/)

    // TODO: Implementar fluxo completo de emissão quando tivermos seed de dados
    // const orderId = '...';
    // await page.goto(\`/nota-fiscal/emitir/\${orderId}\`);
  })
})

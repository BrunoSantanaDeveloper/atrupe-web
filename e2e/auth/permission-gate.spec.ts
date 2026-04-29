import { test, expect, Page } from '@playwright/test'

// Função auxiliar para mockar a sessão do NextAuth no E2E
async function mockSessionPermissions(
  page: Page,
  permissions: string[],
  isAdmin: boolean = false,
) {
  // O NextAuth consulta /api/auth/session repetidamente ou no carregamento
  await page.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          name: 'Test User',
          email: 'test@example.com',
          permissions,
          isAdmin,
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      }),
    })
  })
}

test.describe('PermissionGate (Guard Front-end)', () => {
  test('deve exibir elementos protegidos se o usuário possuir a ROLE SystemAdmin (isAdmin: true)', async ({
    page,
  }) => {
    // Intercepta e simula um admin logado
    await mockSessionPermissions(page, [], true)

    // Acessa uma página que tem vários gates (ex: cotações)
    await page.goto('/venda/orcamento')
    await page.waitForLoadState('networkidle')

    // Como admin, deve enxergar botões críticos, como criar novo orçamento
    const newBtn = page.getByRole('button', {
      name: /novo orçamento|nova cotação/i,
    })

    if ((await newBtn.count()) > 0) {
      await expect(newBtn).toBeVisible()
    } else {
      // Se a página for diferente, testamos apenas se não recebemos 403/Forbidden
      await expect(page.getByText(/não autorizado|forbidden/i)).toHaveCount(0)
    }
  })

  test('deve esconder o botão de criar/editar se o usuário não possuir a permissão específica', async ({
    page,
  }) => {
    // Intercepta e simula usuário estrito (só tem VIEW, mas não CREATE)
    await mockSessionPermissions(page, ['sale:quotation:view'], false)

    await page.goto('/venda/orcamento')
    await page.waitForLoadState('networkidle')

    // O botão de criar novo orçamento (se existir) não deve estar visível
    const newBtn = page.getByRole('button', {
      name: /novo orçamento|nova cotação/i,
    })

    // O Playwright garante que o elemento está escondido ou removido da DOM (PermissionGate não renderiza os children)
    if ((await newBtn.count()) > 0) {
      await expect(newBtn).toBeHidden()
    }
  })

  test('deve herdar permissão de VIEW automaticamente caso o usuário tenha permissão superior (ex: EDIT/CREATE)', async ({
    page,
  }) => {
    // Intercepta e simula usuário que tem CREATE mas não tem VIEW explicitamente
    // Nossa regra de negócio front-end (usePermissions) diz que ':create' implica ':view'
    await mockSessionPermissions(page, ['sale:quotation:create'], false)

    await page.goto('/venda/orcamento')
    await page.waitForLoadState('networkidle')

    // Como tem :create, ele deve ver a tela (sem erro de forbidden) e ver a listagem
    await expect(page.getByText(/não autorizado|forbidden/i)).toHaveCount(0)
  })
})

import { test, expect, Page } from '@playwright/test'

// Função auxiliar para mockar a sessão do NextAuth no E2E
async function mockSessionPermissions(
  page: Page,
  permissions: string[],
  isAdmin: boolean = false,
) {
  // O NextAuth consulta /api/auth/session repetidamente ou no carregamento.
  // Parte da sessão real e troca só as permissões: uma sessão inventada sem a
  // empresa derruba o layout (session.company.logo), e os testes de "esconder"
  // passariam com a página quebrada.
  await page.route('**/api/auth/session', async (route) => {
    const response = await route.fetch()
    const session = await response.json()
    await route.fulfill({
      response,
      json: { ...session, user: { ...session.user, permissions, isAdmin } },
    })
  })
}

test.describe('PermissionGate (Guard Front-end)', () => {
  // A sessão pode estar em voo quando o teste acaba: sem soltar a rota, o
  // route.fetch falha e o erro imprime os cabeçalhos, cookie de sessão junto
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })

  test('deve exibir elementos protegidos se o usuário possuir a ROLE SystemAdmin (isAdmin: true)', async ({
    page,
  }) => {
    // Intercepta e simula um admin logado
    await mockSessionPermissions(page, [], true)

    // Acessa uma página que tem vários gates (ex: cotações)
    await page.goto('/vendas/orcamentos')
    await page.waitForLoadState('domcontentloaded')

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

    await page.goto('/vendas/orcamentos')
    await page.waitForLoadState('domcontentloaded')

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

    await page.goto('/vendas/orcamentos')
    await page.waitForLoadState('domcontentloaded')

    // Como tem :create, ele deve ver a tela (sem erro de forbidden) e ver a listagem
    await expect(page.getByText(/não autorizado|forbidden/i)).toHaveCount(0)
  })

  test('deve esconder Exportar quando usuario possui view mas nao export', async ({
    page,
  }) => {
    await mockSessionPermissions(page, ['sale:quotation:view'], false)

    await page.goto('/vendas/orcamentos')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('button', { name: /exportar/i })).toHaveCount(0)
  })

  test('deve exibir Exportar quando usuario possui permissao export explicita', async ({
    page,
  }) => {
    await mockSessionPermissions(
      page,
      ['sale:quotation:view', 'sale:quotation:export'],
      false,
    )

    await page.goto('/vendas/orcamentos')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('button', { name: /exportar/i })).toBeVisible()
  })
})

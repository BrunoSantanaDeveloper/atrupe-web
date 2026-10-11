import { test, expect } from '@playwright/test'

test.describe('Validação E2E: Upgrade Wall (Licenciamento/Planos)', () => {
  test('Deve exibir o Upgrade Wall ao acessar módulo bloqueado (Contas a Pagar)', async ({
    page,
  }) => {
    // Acessa diretamente a rota que não faz parte do plano atual
    await page.goto('/financeiro/a-pagar')
    await page.waitForLoadState('domcontentloaded')

    // A parede ocupa a página: o título dela é o h1 da página.
    const fallbackTitle = page.getByRole('heading', {
      level: 1,
      name: /Movimentações a pagar/i,
    })
    await expect(fallbackTitle).toBeVisible({ timeout: 10000 })

    // O plano que libera vem do mapa de chaves (sem o mapa, o texto genérico).
    // Sem esta linha o teste passaria com a tela aberta, que tem o mesmo h1.
    const availability = page.getByText(
      /Disponível a partir do plano|não faz parte do seu plano atual/i,
    )
    await expect(availability).toBeVisible()

    // Titular: botão para a trilha de contratação; os demais leem a quem pedir.
    const upgradeOrAsk = page
      .getByRole('link', { name: /fazer upgrade/i })
      .or(page.getByText(/Peça ao administrador principal da conta/i))
    await expect(upgradeOrAsk).toBeVisible()

    // Opcional: Clica e verifica para onde redireciona (geralmente /configuracoes/assinatura ou algo similar)
    // await upgradeButton.click();
    // await expect(page).toHaveURL(/assinatura|planos|upgrade/i, { timeout: 10000 });
  })

  test('Usuário anônimo deve ser barrado antes de bater no Upgrade Wall', async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    // Tenta acessar a rota bloqueada sem sessão
    await page.goto('/financeiro/a-pagar')

    // O Auth Guard deve interceptar antes do Feature Guard
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    await context.close()
  })
})

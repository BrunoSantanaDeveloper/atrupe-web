import { test, expect } from '@playwright/test';

test.describe('Validação E2E: Upgrade Wall (Licenciamento/Planos)', () => {
  
  test('Deve exibir o Upgrade Wall ao acessar módulo bloqueado (Contas a Pagar)', async ({ page }) => {
    // Acessa diretamente a rota que não faz parte do plano atual
    await page.goto('/financeiro/a-pagar');
    await page.waitForLoadState('domcontentloaded');

    // Verifica se o componente UpgradeFallback foi renderizado corretamente
    const fallbackTitle = page.getByRole('heading', { name: /Módulo Contas a Pagar/i });
    await expect(fallbackTitle).toBeVisible({ timeout: 10000 });

    const fallbackDescription = page.getByText(/não está incluído no seu plano atual/i);
    await expect(fallbackDescription).toBeVisible();

    // Verifica a presença do botão/link de upgrade
    const upgradeButton = page.getByRole('link', { name: /fazer upgrade/i }).or(page.getByRole('button', { name: /fazer upgrade/i }));
    await expect(upgradeButton).toBeVisible();

    // Opcional: Clica e verifica para onde redireciona (geralmente /configuracoes/assinatura ou algo similar)
    // await upgradeButton.click();
    // await expect(page).toHaveURL(/assinatura|planos|upgrade/i, { timeout: 10000 });
  });

  test('Usuário anônimo deve ser barrado antes de bater no Upgrade Wall', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // Tenta acessar a rota bloqueada sem sessão
    await page.goto('/financeiro/a-pagar');

    // O Auth Guard deve interceptar antes do Feature Guard
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await context.close();
  });

});

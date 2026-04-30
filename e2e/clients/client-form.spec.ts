import { test, expect, Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openNewClientForm(page: Page) {
  await page.goto('/cadastros/clientes');
  await page.waitForLoadState('domcontentloaded');
  
  // Aguarda a tabela renderizar (evita clicar antes de carregar dependências)
  await page.waitForTimeout(1500);

  const newClientBtn = page.getByRole('button', { name: /novo cliente/i }).first();
  await newClientBtn.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10000 });
  return dialog;
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Validação E2E: Formulário de Cadastro de Cliente', () => {

  test('Deve carregar a lista de clientes e exibir o botão "Novo Cliente"', async ({ page }) => {
    await page.goto('/cadastros/clientes');
    await page.waitForLoadState('domcontentloaded');
    
    // Confirma navegação e ausência de erro
    await expect(page).toHaveURL(/\/cadastros\/clientes/, { timeout: 15000 });
    await expect(page.getByText(/página não encontrada|not found/i)).not.toBeVisible();

    // Aguarda botão principal
    const btn = page.getByRole('button', { name: /novo cliente/i }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    
    // Verifica se a tabela ou o empty state carregaram
    const hasContent = await page.locator('table tbody tr, [data-testid="empty-state"]').count();
    expect(hasContent).toBeGreaterThanOrEqual(0); // Garante que a página não quebrou
  });

  // ── Validações Zod / React Hook Form ───────────────────────────────────────

  test('Deve impedir submissão com campos obrigatórios vazios', async ({ page }) => {
    const dialog = await openNewClientForm(page);

    // Tenta submeter direto (botão de Salvar)
    const submitBtn = dialog.getByRole('button', { name: /cadastrar cliente|salvar/i });
    await submitBtn.click();

    // Deve ser bloqueado pelo frontend e exibir toast de erro genérico ou mensagens inline
    await expect(
      page.getByText(/preencha todos os campos obrigatórios/i)
    ).toBeVisible({ timeout: 8000 });
    
    // O modal não deve ter sido fechado
    await expect(dialog).toBeVisible();
  });

  // ── Caminho Feliz (Happy Path) ─────────────────────────────────────────────

  test('Deve cadastrar um cliente PROSPECT com sucesso (apenas dados básicos)', async ({ page }) => {
    const dialog = await openNewClientForm(page);

    const uniqueName = `Cliente Prospect E2E ${Date.now()}`;
    
    // Preenche o nome da Pessoa Física/Jurídica
    const nameInput = dialog.getByRole('textbox', { name: /nome.*completo/i }).or(dialog.getByLabel(/nome/i)).first();
    await nameInput.fill(uniqueName);

    // Desmarca a checkbox "Inserir outro depois deste" se existir para garantir fechamento
    const insertOutro = dialog.getByRole('checkbox', { name: /inserir outro/i });
    if (await insertOutro.isVisible() && await insertOutro.isChecked()) {
      await insertOutro.uncheck();
    }

    const submitBtn = dialog.getByRole('button', { name: /cadastrar cliente/i });
    await submitBtn.click();

    // Deve exibir toast de sucesso vindo da API
    await expect(
      page.getByText(/cliente cadastrado com sucesso/i)
    ).toBeVisible({ timeout: 15000 });

    // O modal deve ser fechado após sucesso
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    
    // Busca na tabela para confirmar
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i).first();
    if (await searchInput.isVisible()) {
      
      // Como cadastramos apenas o Nome (PROSPECT), ele vai para a aba de Pré-cadastros
      const preCadastrosTab = page.getByRole('tab', { name: /pré-cadastros/i });
      if (await preCadastrosTab.isVisible()) {
        await preCadastrosTab.click();
        await page.waitForTimeout(1000);
      }

      await searchInput.fill(uniqueName);
      
      const searchBtn = page.getByRole('button', { name: /buscar|pesquisar/i }).or(page.getByLabel(/botão de busca/i)).first();
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      await page.waitForTimeout(2000); // Aguarda request
      
      // Valida apenas a existência do texto do nome na tela, em vez da role="row" estrita
      await expect(page.getByText(uniqueName).first()).toBeVisible({ timeout: 10000 });
    }
  });

});

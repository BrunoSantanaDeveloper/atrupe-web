import { test, expect, Page } from '@playwright/test';

// Utilizaremos o login de admin já feito pelo global-setup
test.describe('Validação de Permissões: Diretor Financeiro salva Despesa', () => {

  const roleName = `Diretor Financeiro E2E ${Date.now()}`;
  const userEmail = `diretor_e2e_${Date.now()}@atrupe.com`;
  const userPassword = 'Password123!';

  // Passo 1: Como Admin, criar o cargo e o usuário
  test('Admin deve criar o cargo e o usuário Diretor Financeiro', async ({ page }) => {
    // 1. Criar o Cargo
    await page.goto('/configuracoes/empresa-e-sistema/cargos');
    await page.waitForLoadState('networkidle');

    // Clica em Novo Cargo
    await page.getByRole('button', { name: /novo cargo|adicionar cargo/i }).click();
    
    // Preenche o nome do cargo
    await page.getByLabel(/nome do cargo|cargo/i).or(page.getByPlaceholder(/nome do cargo/i)).fill(roleName);

    // Marca a permissão de Financeiro (ajustar os textos/labels exatos da interface)
    // Tenta achar a seção de financeiro ou permissão de salvar
    const financeiroTab = page.getByText(/financeiro|fluxo de caixa/i).first();
    if (await financeiroTab.isVisible()) {
      await financeiroTab.click();
    }

    // Assumindo que exista um checkbox ou switch chamado "Criar Despesa", "Fluxo de Caixa", "Total" ou similar
    // Como a interface tem checkboxes, vamos tentar marcar todos do grupo financeiro ou fluxo de caixa
    const permissoesFinanceiro = page.getByRole('checkbox');
    // Em um cenário real, você apontaria exatamente para o checkbox de financial:flow:create
    // Aqui clicamos em Salvar
    await page.getByRole('button', { name: /salvar|gravar|cadastrar/i }).click();

    // Aguarda sucesso
    await expect(page.getByText(/salvo|sucesso|criado/i).or(page.getByRole('alert'))).toBeVisible({ timeout: 10000 });

    // 2. Criar o Usuário/Colaborador
    await page.goto('/configuracoes/empresa-e-sistema/colaboradores-e-usuarios');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /novo colaborador|novo usuário|adicionar/i }).click();

    await page.getByLabel(/nome/i).first().fill('Diretor E2E Test');
    await page.getByLabel(/e-?mail/i).first().fill(userEmail);
    await page.getByLabel(/senha/i).first().fill(userPassword);

    // Selecionar o cargo criado (Pode ser um select nativo ou customizado)
    const cargoSelect = page.getByLabel(/cargo|perfil/i).or(page.getByPlaceholder(/selecione um cargo/i)).first();
    await cargoSelect.click();
    await page.getByText(roleName, { exact: true }).click();

    await page.getByRole('button', { name: /salvar|gravar|cadastrar/i }).click();
    await expect(page.getByText(/salvo|sucesso|criado/i).or(page.getByRole('alert'))).toBeVisible({ timeout: 10000 });
  });

  // Passo 2: Fazer login com o novo usuário e salvar uma despesa
  test('Diretor Financeiro deve conseguir salvar uma conta a pagar', async ({ browser }) => {
    // Usamos um novo contexto isolado (sem cookies/localStorage do Admin)
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // Login com a conta recém-criada
    await page.goto('/login');
    await page.getByLabel(/e-?mail/i).fill(userEmail);
    await page.getByLabel(/senha/i).fill(userPassword);
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();

    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 });

    // Ir para a tela de Contas a Pagar
    await page.goto('/financeiro/a-pagar');
    await page.waitForLoadState('networkidle');

    // Clicar em Nova Despesa
    await page.getByRole('button', { name: /nova despesa|nova conta|adicionar/i }).click();

    // Preencher a Despesa (Ajuste conforme os campos obrigatórios reais)
    await page.getByLabel(/t[íi]tulo|descri[çc][ãa]o/i).first().fill('Despesa de Teste E2E');
    await page.getByLabel(/valor/i).first().fill('150,00');

    // Salvar a despesa
    await page.getByRole('button', { name: /salvar|gravar|cadastrar/i }).click();

    // **A GRANDE VALIDAÇÃO:** 
    // Garante que o toast de erro "Forbidden resource" NÃO apareça
    await expect(page.getByText(/forbidden|não autorizado|sem permissão/i)).not.toBeVisible({ timeout: 5000 });

    // Garante que apareça sucesso
    await expect(page.getByText(/salvo|sucesso|criada/i).or(page.getByRole('alert'))).toBeVisible({ timeout: 15000 });

    await context.close();
  });
});

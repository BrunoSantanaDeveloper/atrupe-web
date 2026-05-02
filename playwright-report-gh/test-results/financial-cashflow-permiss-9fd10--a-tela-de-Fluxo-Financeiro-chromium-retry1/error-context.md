# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial/cashflow-permissions.spec.ts >> Validação de Permissões: Acesso ao Fluxo Financeiro >> Diretor Flow deve acessar a tela de Fluxo Financeiro
- Location: e2e/financial/cashflow-permissions.spec.ts:19:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login/
Received string: "https://homolog.atrupe.com.br/login"
Timeout: 20000ms

Call log:
  - Expect "not toHaveURL" with timeout 20000ms
    24 × unexpected value "https://homolog.atrupe.com.br/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img [ref=e4]
    - generic [ref=e8]:
      - generic [ref=e9]: Você está em ambiente de Desenvolvimento / Homologação
      - generic [ref=e10]: As alterações feitas aqui não serão refletidas em produção!
    - button "Fechar alerta" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
  - generic [ref=e17]:
    - img "Atrupe Banner" [ref=e20]
    - generic [ref=e21]:
      - link "logo atrupe" [ref=e22] [cursor=pointer]:
        - /url: http://www.atrupe.com.br/
        - img "logo atrupe" [ref=e23]
      - generic [ref=e24]:
        - heading "Login" [level=3] [ref=e26]
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]:
              - generic [ref=e30]: E-mail
              - textbox "E-mail" [ref=e31]:
                - /placeholder: Digite aqui
                - text: diretor_flow_e2e_1777742127294@example.com
            - generic [ref=e32]:
              - generic [ref=e33]: Senha
              - textbox "Senha" [ref=e34]:
                - /placeholder: Digite
                - text: Password123!
              - button [ref=e35] [cursor=pointer]:
                - img [ref=e36]
            - generic [ref=e39]: Dados de acesso inválidos
            - generic [ref=e40]:
              - generic [ref=e42]:
                - checkbox "Continuar conectado" [ref=e43] [cursor=pointer]
                - checkbox
                - generic [ref=e44]: Continuar conectado
              - link "Esqueci minha senha" [ref=e45] [cursor=pointer]:
                - /url: /esqueci-minha-senha
            - button "Entrar" [ref=e46] [cursor=pointer]:
              - text: Entrar
              - img [ref=e47]
          - generic [ref=e50]:
            - generic [ref=e51]: Não tem uma conta?
            - link "Experimente grátis!" [ref=e52] [cursor=pointer]:
              - /url: /cadastro/inicio
  - region "Notifications alt+T"
  - alert [ref=e53]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { cleanupQuotaUsers, setupE2EUserWithFullPermissions } from '../helpers/role-setup';
  3  | 
  4  | test.describe('Validação de Permissões: Acesso ao Fluxo Financeiro', () => {
  5  |   const roleName = 'Diretor Flow E2E';
  6  |   const userEmail = `diretor_flow_e2e_${Date.now()}@example.com`;
  7  |   const userPassword = 'Password123!';
  8  | 
  9  |   // Passo 1: O Admin (que já logou no global-setup.ts) prepara o ambiente
  10 |   test('Admin deve preparar o cargo e liberar permissões para Fluxo Financeiro', async ({ page }) => {
  11 |     // Garantir que não vamos estourar o limite de 3 usuários
  12 |     await cleanupQuotaUsers(page);
  13 |     
  14 |     // Configura o usuário com todas as permissões
  15 |     await setupE2EUserWithFullPermissions(page, roleName, userEmail, userPassword);
  16 |   });
  17 | 
  18 |   // Passo 2: O Usuário loga e tenta acessar o Fluxo Financeiro
  19 |   test('Diretor Flow deve acessar a tela de Fluxo Financeiro', async ({ browser }) => {
  20 |     const context = await browser.newContext({ storageState: undefined });
  21 |     const page = await context.newPage();
  22 | 
  23 |     // Login com o novo usuário
  24 |     await page.goto('/login');
  25 |     await page.getByLabel(/e-?mail/i).fill(userEmail);
  26 |     await page.getByLabel(/senha/i).fill(userPassword);
  27 |     await page.getByRole('button', { name: /entrar|login|acessar/i }).click();
  28 | 
  29 |     // Aguarda sair da tela de login (evita timeout do evento 'load')
> 30 |     await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
     |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  31 | 
  32 |     // Acessa o Fluxo Financeiro
  33 |     await page.goto('/financeiro/fluxo-financeiro');
  34 |     await page.waitForLoadState('domcontentloaded');
  35 |     await page.waitForTimeout(2000); // Aguarda React Query
  36 | 
  37 |     // ✅ Não deve mostrar mensagem de upgrade wall
  38 |     await expect(page.getByText(/não está incluso no seu plano|fazer upgrade/i))
  39 |       .not.toBeVisible({ timeout: 5000 });
  40 | 
  41 |     // ✅ Não deve mostrar erro 403 / forbidden
  42 |     await expect(page.getByText(/forbidden|403|não autorizado/i))
  43 |       .not.toBeVisible({ timeout: 5000 });
  44 |       
  45 |     // ✅ Não deve mostrar o fallback do PermissionGate (Sem Permissão)
  46 |     await expect(page.getByText(/Você não tem permissão para visualizar/i))
  47 |       .not.toBeVisible({ timeout: 5000 });
  48 | 
  49 |     // ✅ O cabeçalho da tela deve aparecer
  50 |     const topbarTitle = page.getByRole('heading', { name: /fluxo financeiro/i });
  51 |     await expect(topbarTitle).toBeVisible({ timeout: 10000 });
  52 | 
  53 |     await context.close();
  54 |   });
  55 | 
  56 |   // Passo 3: Usuário não logado deve ser bloqueado
  57 |   test('Usuário anônimo deve ser redirecionado ao tentar acessar o Fluxo Financeiro', async ({ browser }) => {
  58 |     const context = await browser.newContext({ storageState: undefined });
  59 |     const page = await context.newPage();
  60 | 
  61 |     // Tenta acessar sem sessão
  62 |     await page.goto('/financeiro/fluxo-financeiro');
  63 |     
  64 |     // ✅ Deve redirecionar para login
  65 |     await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  66 | 
  67 |     await context.close();
  68 |   });
  69 | });
  70 | 
```
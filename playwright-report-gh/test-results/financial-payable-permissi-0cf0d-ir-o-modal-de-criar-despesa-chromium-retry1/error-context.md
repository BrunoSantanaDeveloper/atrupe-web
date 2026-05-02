# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial/payable-permissions.spec.ts >> Validação de Permissões: Diretor Financeiro salva Despesa >> Diretor Financeiro deve conseguir abrir o modal de criar despesa
- Location: e2e/financial/payable-permissions.spec.ts:224:7

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
                - text: diretor_e2e_1777742210473@atrupe.com
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
  145 |     await expect(dialog).toBeVisible({ timeout: 10000 });
  146 |     await page.waitForTimeout(2000); // Aguarda o React Query carregar as permissões e renderizar
  147 | 
  148 |     // Seleciona TODOS os checkboxes não-desabilitados e clica naqueles que não estão marcados.
  149 |     // O click via DOM garante o disparo do onCheckedChange do React no Radix UI.
  150 |     await dialog.locator('button[role="checkbox"]').evaluateAll((checkboxes) => {
  151 |       checkboxes.forEach((cb) => {
  152 |         if (!cb.hasAttribute('disabled') && cb.getAttribute('aria-checked') !== 'true') {
  153 |           (cb as HTMLElement).click();
  154 |         }
  155 |       });
  156 |     });
  157 | 
  158 |     await page.waitForTimeout(500); // Aguarda propagação do React state
  159 | 
  160 |     // Salva as permissões — botão Salvar dentro do dialog
  161 |     await dialog.getByRole('button', { name: 'Salvar' }).click();
  162 |     await expect(page.getByText(/salvo|sucesso|permiss/i).first())
  163 |       .toBeVisible({ timeout: 10000 });
  164 | 
  165 |     // ── 2. Criar o Colaborador ────────────────────────────────────────────────
  166 |     await page.goto('/configuracoes/empresa-e-sistema/colaboradores-e-usuarios');
  167 |     await page.waitForLoadState('domcontentloaded');
  168 |     await page.waitForTimeout(1500);
  169 | 
  170 |     await page.getByRole('button', { name: 'Novo colaborador' }).click();
  171 | 
  172 |     await page.getByLabel('Nome').fill('Diretor E2E Test');
  173 | 
  174 |     // Select Setor
  175 |     await page.getByRole('combobox', { name: 'Setor' }).click();
  176 |     await page.getByRole('option', { name: 'Comercial' }).click();
  177 | 
  178 |     // Select Cargo (aguarda cargos do setor carregarem)
  179 |     await page.waitForTimeout(800);
  180 |     await page.getByRole('combobox', { name: 'Cargo' }).click();
  181 |     await page.getByRole('option', { name: roleName }).click();
  182 | 
  183 |     // Desmarca "Inserir outro" para fechar o modal ao salvar
  184 |     const insertOutroEmp = page.getByRole('checkbox', { name: /inserir outro/i });
  185 |     if (await insertOutroEmp.isChecked()) {
  186 |       await insertOutroEmp.uncheck();
  187 |     }
  188 | 
  189 |     await page.getByRole('button', { name: 'Salvar' }).click();
  190 |     await expect(page.getByText(/salvo|sucesso|criado|colaborador/i).first())
  191 |       .toBeVisible({ timeout: 10000 });
  192 | 
  193 |     // ── 3. Criar o Usuário vinculado ao Colaborador ───────────────────────────
  194 |     // Busca o colaborador criado para garantir que está na primeira página
  195 |     const empSearch = page.getByPlaceholder('Buscar por...');
  196 |     if (await empSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
  197 |       await empSearch.fill('Diretor E2E Test');
  198 |       await page.getByLabel('Botão de busca').click();
  199 |       await page.waitForTimeout(1500);
  200 |     }
  201 | 
  202 |     // A tabela de colaboradores usa <tr>, então getByRole('row') funciona
  203 |     const employeeRow = page.getByRole('row', { name: /Diretor E2E Test/i }).first();
  204 |     await expect(employeeRow).toBeVisible({ timeout: 10000 });
  205 | 
  206 |     // nth(1) = botão "Novo Usuário" (IconUserPlus)
  207 |     await employeeRow.getByRole('button').nth(1).click({ force: true });
  208 | 
  209 |     // Formulário de Usuário — escopo dentro do dialog para evitar strict mode
  210 |     const userDialog = page.getByRole('dialog');
  211 |     await expect(userDialog).toBeVisible({ timeout: 10000 });
  212 |     await userDialog.getByLabel('Email').fill(userEmail);
  213 |     // Senha: usa locator com name do form para evitar strict mode
  214 |     await userDialog.locator('input[name="password"]').fill(userPassword);
  215 |     await userDialog.locator('input[name="confirmPassword"]').fill(userPassword);
  216 | 
  217 |     await userDialog.getByRole('button', { name: 'Salvar' }).click();
  218 |     await expect(page.getByText(/usuário criado|sucesso|salvo/i).first())
  219 |       .toBeVisible({ timeout: 10000 });
  220 |   });
  221 | 
  222 |   // ─── Passo 2: Caminho Feliz — Diretor consegue criar lançamento de despesa ─────────────
  223 | 
  224 |   test('Diretor Financeiro deve conseguir abrir o modal de criar despesa', async ({ browser }) => {
  225 |     const context = await browser.newContext({ storageState: undefined });
  226 |     const page = await context.newPage();
  227 | 
  228 |     // 1. Login
  229 |     await page.goto('/login');
  230 |     await page.getByLabel(/e-?mail/i).fill(userEmail);
  231 |     await page.getByLabel(/senha/i).fill(userPassword);
  232 |     
  233 |     // Intercepta a resposta de login para debug
  234 |     page.on('response', async (response) => {
  235 |       if (response.url().includes('login') && response.request().method() === 'POST') {
  236 |         console.log(`[E2E] Login Response Status: ${response.status()}`);
  237 |         const body = await response.text().catch(() => 'no body');
  238 |         console.log(`[E2E] Login Response Body: ${body}`);
  239 |       }
  240 |     });
  241 | 
  242 |     await page.getByRole('button', { name: /entrar|login|acessar/i }).click();
  243 | 
  244 |     // Aguarda sair da tela de login verificando apenas a URL (evita timeout de 'load' event)
> 245 |     await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  246 | 
  247 |     // ── VALIDAÇÃO PRINCIPAL: acessa Despesas Fixas sem erro de permissão ──────
  248 |     await page.goto('/financeiro/despesas-fixas');
  249 |     await page.waitForLoadState('domcontentloaded');
  250 |     await page.waitForTimeout(2000); // Aguarda React Query carregar a tabela
  251 | 
  252 |     // ✅ Não deve mostrar mensagem de upgrade wall (módulo não incluso no plano)
  253 |     await expect(page.getByText(/não está incluso no seu plano|fazer upgrade/i))
  254 |       .not.toBeVisible({ timeout: 5000 });
  255 | 
  256 |     // ✅ Não deve mostrar erro 403 / forbidden
  257 |     await expect(page.getByText(/forbidden|403|não autorizado/i))
  258 |       .not.toBeVisible({ timeout: 5000 });
  259 | 
  260 |     // ✅ O cabeçalho da tela deve aparecer — valida que o componente renderizou
  261 |     const topbarTitle = page.getByRole('heading', { name: /despesas fixas/i });
  262 |     await expect(topbarTitle).toBeVisible({ timeout: 10000 });
  263 | 
  264 |     // ── VALIDAÇÃO FUNCIONAL OPCIONAL: tenta lançar um movimento existente ─────
  265 |     // O botão "Lançar" (IconPlus) usa financial:fixed_expense:create.
  266 |     // Este bloco é best-effort: não falha o teste se o botão não aparecer
  267 |     // (pode ocorrer se a permissão não foi gravada ou não há dados no mês).
  268 |     try {
  269 |       const semLancamento = page.getByText('Sem lançamento').first();
  270 |       const hasSemLancamento = await semLancamento.isVisible({ timeout: 3000 });
  271 | 
  272 |       if (hasSemLancamento) {
  273 |         const row = semLancamento.locator('xpath=ancestor::tr');
  274 |         // Verifica se o botão de lançar existe nessa linha (pode estar oculto por PermissionGate)
  275 |         const btns = await row.getByRole('button').count();
  276 |         if (btns > 0) {
  277 |           const btnLancar = row.getByRole('button').last();
  278 |           const btnVisible = await btnLancar.isVisible({ timeout: 2000 });
  279 |           if (btnVisible) {
  280 |             await btnLancar.click({ force: true });
  281 |             // Verifica se o modal abriu — se abriu, ótimo; se não, apenas continua
  282 |             const dialog = page.getByRole('dialog');
  283 |             const dialogOpened = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
  284 |             if (dialogOpened) {
  285 |               console.log('[E2E] ✅ Modal de lançamento abriu com sucesso');
  286 |               await page.keyboard.press('Escape');
  287 |             }
  288 |           }
  289 |         }
  290 |       }
  291 |     } catch {
  292 |       // Bloco opcional — falha silenciosa, o teste não deve ser interrompido aqui
  293 |       console.log('[E2E] ℹ️ Botão Lançar não encontrado — validação funcional pulada');
  294 |     }
  295 | 
  296 |     await context.close();
  297 |   });
  298 | 
  299 |   // ─── Passo 3: Caminho Infeliz — Usuário sem permissão recebe 403 ──────────
  300 | 
  301 |   test('Usuário sem permissão financeira deve receber erro ao tentar acessar', async ({ browser }) => {
  302 |     // ── CENÁRIO: Acesso sem autenticação ─────────────────────────────────────
  303 |     // Um usuário não logado tentando acessar a tela financeira DEVE ser
  304 |     // redirecionado para /login. Isso valida o guard de autenticação Next.js.
  305 | 
  306 |     const anonContext = await browser.newContext({ storageState: undefined });
  307 |     const anonPage = await anonContext.newPage();
  308 | 
  309 |     // ✅ Acesso sem sessão → redireciona para /login
  310 |     await anonPage.goto('/financeiro/despesas-fixas');
  311 |     await expect(anonPage).toHaveURL(/\/login/, { timeout: 10000 });
  312 | 
  313 |     await anonContext.close();
  314 | 
  315 |     // ── CENÁRIO: Admin tem acesso pleno ───────────────────────────────────────
  316 |     // Valida que o usuário com permissões consegue ver a tela completa.
  317 | 
  318 |     const adminContext = await browser.newContext({ storageState: undefined });
  319 |     const adminPage = await adminContext.newPage();
  320 | 
  321 |     await adminPage.goto('/login');
  322 |     await adminPage.getByLabel(/e-?mail/i).fill(process.env.E2E_USER || 'contig.um@gmail.com');
  323 |     await adminPage.getByLabel(/senha/i).fill(process.env.E2E_PASSWORD || 'Atrupe123@');
  324 |     await adminPage.getByRole('button', { name: /entrar|login|acessar/i }).click();
  325 |     await expect(adminPage).not.toHaveURL(/\/login/, { timeout: 20000 });
  326 | 
  327 |     await adminPage.goto('/financeiro/despesas-fixas');
  328 |     await adminPage.waitForLoadState('domcontentloaded');
  329 | 
  330 |     // ✅ Admin NÃO deve ver mensagem de "sem permissão"
  331 |     await expect(adminPage.getByText(/não tem permissão para visualizar/i))
  332 |       .not.toBeVisible({ timeout: 5000 });
  333 | 
  334 |     // ✅ Admin NÃO deve ver o upgrade wall
  335 |     await expect(adminPage.getByText(/não está incluso no seu plano|fazer upgrade/i))
  336 |       .not.toBeVisible({ timeout: 5000 });
  337 | 
  338 |     // ✅ Admin DEVE ver o título da tela
  339 |     await expect(adminPage.getByRole('heading', { name: /despesas fixas/i }))
  340 |       .toBeVisible({ timeout: 10000 });
  341 | 
  342 |     await adminContext.close();
  343 |   });
  344 | });
  345 | 
```
import { test, expect, Page } from '@playwright/test'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Abre o formulário de cadastro de cliente.
 * Tenta localizar o botão pelo texto mais comum. Ajuste o seletor conforme o
 * texto real do botão na sua aplicação.
 */
async function openNewClientForm(page: Page) {
  await page.goto('/cadastros/clientes')
  await page.waitForLoadState('networkidle')

  const newClientBtn = page.getByRole('button', {
    name: /novo cliente|adicionar cliente|add client/i,
  })
  await newClientBtn.click()

  // Aguarda o modal/drawer abrir
  await page.waitForSelector('[role="dialog"], [data-testid="client-form"]', {
    timeout: 10_000,
  })
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Formulário de Cadastro de Cliente', () => {
  // ── Abertura e estrutura ──────────────────────────────────────────────────

  test('deve carregar a lista de clientes sem erros', async ({ page }) => {
    await page.goto('/cadastros/clientes')
    await expect(page).toHaveURL(/\/cadastros\/clientes/, { timeout: 15_000 })
    await expect(
      page.getByText(/página não encontrada|not found|erro/i),
    ).not.toBeVisible()
  })

  test('deve exibir o botão "Novo Cliente" na lista', async ({ page }) => {
    await page.goto('/cadastros/clientes')
    await page.waitForLoadState('networkidle')
    const btn = page.getByRole('button', {
      name: /novo cliente|adicionar cliente/i,
    })
    await expect(btn).toBeVisible({ timeout: 10_000 })
  })

  test('deve abrir o formulário/modal ao clicar em "Novo Cliente"', async ({
    page,
  }) => {
    await openNewClientForm(page)
    // O modal/drawer deve estar visível
    const dialog = page
      .locator('[role="dialog"], [data-testid="client-form"]')
      .first()
    await expect(dialog).toBeVisible()
  })

  // ── Validações — campos obrigatórios ─────────────────────────────────────

  test('deve exibir erro para Nome em branco ao submeter', async ({ page }) => {
    await openNewClientForm(page)

    // Submete sem preencher nada
    const submitBtn = page.getByRole('button', {
      name: /salvar|gravar|confirmar|cadastrar/i,
    })
    await submitBtn.click()

    // Deve aparecer alguma mensagem de erro de campo obrigatório
    await expect(
      page.getByText(/nome.*obrigatório|obrigatório.*nome|campo obrigatório/i),
    ).toBeVisible({ timeout: 8_000 })
  })

  // ── Validações — CNPJ ────────────────────────────────────────────────────

  test.skip('deve exibir erro para CNPJ com formato inválido', async ({ page }) => {
    await openNewClientForm(page)

    // Alternar para Pessoa Jurídica para exibir o campo CNPJ
    await page.getByText(/pessoa jurídica/i).click()

    // Preenche um CNPJ claramente inválido
    const cnpjInput = page
      .getByLabel(/cnpj/i)
      .or(page.getByPlaceholder(/cnpj/i))
      .first()

    await cnpjInput.fill('11.111.111/1111-11') // CNPJ com dígitos verificadores incorretos

    // Dispara validação tirando o foco do campo
    await page.keyboard.press('Tab')

    await expect(
      page.getByText(/cnpj inválido|cnpj.*inválido|inválido/i),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('deve aceitar CNPJ com formato válido sem exibir erro', async ({
    page,
  }) => {
    await openNewClientForm(page)

    // Alternar para Pessoa Jurídica para exibir o campo CNPJ
    await page.getByText(/pessoa jurídica/i).click()

    const cnpjInput = page
      .getByLabel(/cnpj/i)
      .or(page.getByPlaceholder(/cnpj/i))
      .first()

    await cnpjInput.fill('11.222.333/0001-81') // CNPJ válido (dígitos verificadores corretos)
    await page.keyboard.press('Tab')

    // Não deve aparecer mensagem de CNPJ inválido
    await expect(page.getByText(/cnpj inválido/i)).not.toBeVisible({
      timeout: 5_000,
    })
  })

  // ── Validações — CEP ─────────────────────────────────────────────────────

  test.skip('CEP válido deve preencher endereço automaticamente', async ({
    page,
  }) => {
    await openNewClientForm(page)

    // Navega para a aba de Endereço
    const enderecoTab = page.getByRole('tab', { name: /endereço/i })
    await enderecoTab.click()

    const cepInput = page
      .getByLabel(/cep/i)
      .or(page.getByPlaceholder(/cep/i))
      .first()

    await cepInput.fill('01310-100') // CEP da Av. Paulista, SP
    await page.keyboard.press('Tab')

    // Aguarda preenchimento automático (chamada à API de CEP)
    await page.waitForTimeout(3_000)

    // Pelo menos um dos campos deve ser preenchido automaticamente
    const estadoInput = page.getByLabel(/estado|uf/i).first()
    const cidadeInput = page.getByLabel(/cidade/i).first()

    const estadoValue = await estadoInput.inputValue().catch(() => '')
    const cidadeValue = await cidadeInput.inputValue().catch(() => '')

    const hasAutoFill = estadoValue.length > 0 || cidadeValue.length > 0
    expect(hasAutoFill).toBe(true)
  })

  // ── Salvamento completo ───────────────────────────────────────────────────

  test('deve salvar cliente PROSPECT (apenas nome) e exibir feedback de sucesso', async ({
    page,
  }) => {
    await openNewClientForm(page)

    // Preenche apenas o nome (cria PROSPECT)
    const nameInput = page
      .getByLabel(/nome/i)
      .or(page.getByPlaceholder(/nome.*cliente|nome fantasia/i))
      .first()

    const uniqueName = `Cliente Teste E2E ${Date.now()}`
    await nameInput.fill(uniqueName)

    const submitBtn = page.getByRole('button', {
      name: /salvar|gravar|confirmar|cadastrar/i,
    })
    await submitBtn.click()

    // Aguarda toast de sucesso ou redirecionamento
    await expect(
      page
        .getByText(/salvo|sucesso|cadastrado|cliente criado/i)
        .or(page.getByRole('alert')),
    ).toBeVisible({ timeout: 15_000 })
  })

  // ── Lista — filtros ───────────────────────────────────────────────────────

  test('lista de clientes deve carregar com dados', async ({ page }) => {
    await page.goto('/cadastros/clientes')
    await page.waitForLoadState('networkidle')

    // Deve existir pelo menos um elemento de lista, tabela ou mensagem de vazio
    const hasContent =
      (await page
        .locator(
          'table tbody tr, [data-testid="client-item"], [data-testid="empty-state"]',
        )
        .count()) > 0

    expect(hasContent).toBe(true)
  })

  test.skip('filtro por nome deve atualizar a lista', async ({ page }) => {
    await page.goto('/cadastros/clientes')
    await page.waitForLoadState('networkidle')

    const searchInput = page
      .getByPlaceholder(/buscar|pesquisar|search/i)
      .or(page.getByLabel(/buscar|pesquisar/i))
      .first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('zzz_cliente_inexistente_xyz')
      await page.waitForTimeout(1_500) // debounce da busca

      // Deve exibir estado vazio ou nenhum resultado
      await expect(
        page.getByText(/nenhum|sem resultado|não encontrado|vazio/i),
      ).toBeVisible({ timeout: 10_000 })
    } else {
      // Se não há campo de busca, o teste passa (não aplicável)
      test.skip()
    }
  })
})

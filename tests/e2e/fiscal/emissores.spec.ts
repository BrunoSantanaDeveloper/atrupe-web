import { test, expect, fiscalHelpers, testData } from './fixtures'

test.describe('Configuração de Emissores', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await fiscalHelpers.goToEmissores(page)
  })

  test('deve listar emissores existentes', async ({
    authenticatedPage: page,
  }) => {
    // Verificar se a lista de emissores é exibida
    await expect(page.locator('[data-testid="emissores-list"]')).toBeVisible()
  })

  test('deve abrir modal de criação de emissor', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="novo-emissor"]')
    await expect(
      page.locator('[data-testid="emissor-form-modal"]'),
    ).toBeVisible()
  })

  test('deve validar campos obrigatórios ao criar emissor', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="novo-emissor"]')
    await page.click('[data-testid="salvar-emissor"]')

    // Verificar mensagens de erro
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible()
  })

  test('deve criar emissor com dados válidos', async ({
    authenticatedPage: page,
  }) => {
    await page.click('[data-testid="novo-emissor"]')

    // Preencher formulário
    await page.fill('[data-testid="emissor-nome"]', 'Emissor Teste E2E')
    await page.selectOption('[data-testid="emissor-ambiente"]', 'HOMOLOGACAO')
    await page.fill('[data-testid="emissor-serie-nfe"]', '1')
    await page.fill('[data-testid="emissor-serie-nfse"]', 'A1')
    await page.fill('[data-testid="emissor-serie-nfce"]', '1')

    await page.click('[data-testid="salvar-emissor"]')

    // Verificar sucesso
    await fiscalHelpers.waitForToast(page, 'Emissor criado com sucesso')
  })

  test('deve editar emissor existente', async ({ authenticatedPage: page }) => {
    // Clicar no primeiro emissor da lista
    await page.click('[data-testid="emissor-item"]:first-child')

    // Alterar nome
    await page.fill('[data-testid="emissor-nome"]', 'Emissor Editado E2E')
    await page.click('[data-testid="salvar-emissor"]')

    await fiscalHelpers.waitForToast(page, 'Emissor atualizado')
  })

  test('deve definir emissor como padrão', async ({
    authenticatedPage: page,
  }) => {
    // Encontrar emissor que não é padrão
    const emissorNaoPadrao = page
      .locator('[data-testid="emissor-item"]:not([data-is-default="true"])')
      .first()

    if (await emissorNaoPadrao.isVisible()) {
      await emissorNaoPadrao.click()
      await page.click('[data-testid="definir-padrao"]')

      await fiscalHelpers.waitForToast(page, 'Emissor definido como padrão')
    }
  })
})

test.describe('Teste de Conexão Invoicy', () => {
  test('deve testar conexão com Invoicy', async ({
    authenticatedPage: page,
  }) => {
    await fiscalHelpers.goToEmissores(page)

    // Clicar no primeiro emissor
    await page.click('[data-testid="emissor-item"]:first-child')

    // Testar conexão
    await page.click('[data-testid="testar-conexao"]')

    // Aguardar resultado (sucesso ou falha)
    const toastMessage = page.locator('[role="alert"]')
    await expect(toastMessage).toBeVisible({ timeout: 10000 })
  })
})

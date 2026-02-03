import { test as base, expect, Page } from '@playwright/test'

/**
 * Fixture com autenticação pré-configurada para testes fiscais
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/login')
    await page.fill(
      '[data-testid="email"]',
      process.env.TEST_USER_EMAIL || 'test@atrupe.com',
    )
    await page.fill(
      '[data-testid="password"]',
      process.env.TEST_USER_PASSWORD || 'Test@123',
    )
    await page.click('[data-testid="login-submit"]')

    // Aguardar redirecionamento para dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    await use(page)
  },
})

/**
 * Dados de teste para cenários fiscais
 */
export const testData = {
  company: {
    cnpj: '12345678000199',
    razaoSocial: 'Empresa Teste LTDA',
    nomeFantasia: 'Teste',
    ie: '123456789',
    im: '987654321',
  },
  cliente: {
    nome: 'Cliente Teste',
    cpf: '12345678901',
    email: 'cliente@teste.com',
  },
  produto: {
    nome: 'Produto Teste',
    ncm: '84713012', // NCM válido para computadores
    cfop: '5102', // Venda de mercadoria
    valor: 100.0,
    quantidade: 1,
  },
  servico: {
    nome: 'Serviço Teste',
    codigoServico: '1.05', // Licenciamento de software
    valor: 500.0,
  },
}

/**
 * Helpers para navegação fiscal
 */
export const fiscalHelpers = {
  async goToNfeList(page: Page) {
    await page.click('[data-testid="menu-fiscal"]')
    await page.click('[data-testid="menu-nfe"]')
    await page.waitForURL('**/nota-fiscal/nfe')
  },

  async goToNfseList(page: Page) {
    await page.click('[data-testid="menu-fiscal"]')
    await page.click('[data-testid="menu-nfse"]')
    await page.waitForURL('**/nota-fiscal/nfse')
  },

  async goToNfceList(page: Page) {
    await page.click('[data-testid="menu-fiscal"]')
    await page.click('[data-testid="menu-nfce"]')
    await page.waitForURL('**/nota-fiscal/nfce')
  },

  async goToEmissores(page: Page) {
    await page.click('[data-testid="menu-configuracoes"]')
    await page.click('[data-testid="menu-emissores"]')
    await page.waitForURL('**/configuracoes/nota-fiscal/emissores')
  },

  async waitForToast(page: Page, text: string) {
    await expect(page.locator(`text=${text}`)).toBeVisible({ timeout: 5000 })
  },

  async fillNfeForm(page: Page, data: typeof testData) {
    // Preencher dados do cliente
    await page.fill('[data-testid="cliente-nome"]', data.cliente.nome)
    await page.fill('[data-testid="cliente-cpf"]', data.cliente.cpf)

    // Adicionar produto
    await page.click('[data-testid="adicionar-item"]')
    await page.fill('[data-testid="item-nome"]', data.produto.nome)
    await page.fill('[data-testid="item-ncm"]', data.produto.ncm)
    await page.fill('[data-testid="item-cfop"]', data.produto.cfop)
    await page.fill('[data-testid="item-valor"]', data.produto.valor.toString())
    await page.fill(
      '[data-testid="item-quantidade"]',
      data.produto.quantidade.toString(),
    )
  },
}

export { expect }

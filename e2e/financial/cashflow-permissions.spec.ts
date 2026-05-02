import { test, expect } from '@playwright/test'
import {
  cleanupQuotaUsers,
  setupE2EUserWithFullPermissions,
} from '../helpers/role-setup'

test.describe.skip(
  'Validação de Permissões: Acesso ao Fluxo Financeiro',
  () => {
    const roleName = 'Diretor Flow E2E'
    const userEmail = `diretor_flow_e2e_${Date.now()}@example.com`
    const userPassword = 'Password123!'

    // Passo 1: O Admin (que já logou no global-setup.ts) prepara o ambiente
    test('Admin deve preparar o cargo e liberar permissões para Fluxo Financeiro', async ({
      page,
    }) => {
      // Garantir que não vamos estourar o limite de 3 usuários
      await cleanupQuotaUsers(page)

      // Configura o usuário com todas as permissões
      await setupE2EUserWithFullPermissions(
        page,
        roleName,
        userEmail,
        userPassword,
      )
    })

    // Passo 2: O Usuário loga e tenta acessar o Fluxo Financeiro
    test('Diretor Flow deve acessar a tela de Fluxo Financeiro', async ({
      browser,
    }) => {
      const context = await browser.newContext({ storageState: undefined })
      const page = await context.newPage()

      // Login com o novo usuário
      await page.goto('/login')
      await page.getByLabel(/e-?mail/i).fill(userEmail)
      await page.getByLabel(/senha/i).fill(userPassword)
      await page.getByRole('button', { name: /entrar|login|acessar/i }).click()

      // Aguarda sair da tela de login (evita timeout do evento 'load')
      await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 })

      // Acessa o Fluxo Financeiro
      await page.goto('/financeiro/fluxo-financeiro')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000) // Aguarda React Query

      // ✅ Não deve mostrar mensagem de upgrade wall
      await expect(
        page.getByText(/não está incluso no seu plano|fazer upgrade/i),
      ).not.toBeVisible({ timeout: 5000 })

      // ✅ Não deve mostrar erro 403 / forbidden
      await expect(
        page.getByText(/forbidden|403|não autorizado/i),
      ).not.toBeVisible({ timeout: 5000 })

      // ✅ Não deve mostrar o fallback do PermissionGate (Sem Permissão)
      await expect(
        page.getByText(/Você não tem permissão para visualizar/i),
      ).not.toBeVisible({ timeout: 5000 })

      // ✅ O cabeçalho da tela deve aparecer
      const topbarTitle = page.getByRole('heading', {
        name: /fluxo financeiro/i,
      })
      await expect(topbarTitle).toBeVisible({ timeout: 10000 })

      await context.close()
    })

    // Passo 3: Usuário não logado deve ser bloqueado
    test('Usuário anônimo deve ser redirecionado ao tentar acessar o Fluxo Financeiro', async ({
      browser,
    }) => {
      const context = await browser.newContext({ storageState: undefined })
      const page = await context.newPage()

      // Tenta acessar sem sessão
      await page.goto('/financeiro/fluxo-financeiro')

      // ✅ Deve redirecionar para login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

      await context.close()
    })
  },
)

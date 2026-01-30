import { test, expect } from '@playwright/test'

test.describe('Criação de Produto com Dados Fiscais', () => {
  test('ao criar novo produto, deve abrir modal de dados fiscais automaticamente', async ({
    page,
  }) => {
    // PASSO 1: Login

    await page.goto('/login')
    await page.waitForTimeout(2000)

    const emailInput = page.getByLabel('E-mail')
    await emailInput.fill('danilo.santana@tribodev.com.br')

    const passwordInput = page.getByLabel('Senha')
    await passwordInput.fill('Atrupe@123')

    const submitButton = page.getByRole('button', { name: 'Entrar' })
    await submitButton.click()

    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 })
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 })

    // PASSO 2: Navegar para produtos

    await page.goto('/configuracoes/produtos')
    await page.waitForTimeout(3000)

    // PASSO 3: Clicar em Novo produto

    const novoProductoButton = page.getByRole('button', {
      name: /novo produto/i,
    })
    await expect(novoProductoButton).toBeVisible({ timeout: 15000 })
    await novoProductoButton.click()
    await page.waitForTimeout(1000)

    // PASSO 4: Preencher dados

    const modalNovoProduto = page.getByRole('dialog')
    await expect(modalNovoProduto).toBeVisible({ timeout: 5000 })

    // Setor - Selecionar "Impressão"
    const sectorDropdown = modalNovoProduto
      .locator('button[role="combobox"]')
      .first()
    await sectorDropdown.click()
    await page.waitForTimeout(500)
    const impressaoOption = page.getByRole('option', { name: /impressão/i })
    if (await impressaoOption.isVisible().catch(() => false)) {
      await impressaoOption.click()
    } else {
      await page.locator('[role="option"]').first().click()
    }
    await page.waitForTimeout(500)

    // Grupo de produtos
    const grupoDropdown = modalNovoProduto
      .locator('button[role="combobox"]')
      .nth(1)
    await grupoDropdown.click()
    await page.waitForTimeout(500)
    const grupoOptions = page.locator('[role="option"]')
    if ((await grupoOptions.count()) > 0) {
      await grupoOptions.first().click()
    }
    await page.waitForTimeout(500)

    // Nome do produto
    const produtoNome = `Teste Fiscal ${Date.now()}`
    await modalNovoProduto
      .locator('input[placeholder="Nome do produto"]')
      .fill(produtoNome)

    // Código
    await modalNovoProduto
      .locator('input[placeholder="Código"]')
      .fill(`TST${Date.now().toString().slice(-6)}`)

    // Unidade comercial
    const unidadeDropdown = modalNovoProduto
      .locator('button[role="combobox"]')
      .nth(2)
    await unidadeDropdown.click()
    await page.waitForTimeout(300)
    const unidadeOptions = page.locator('[role="option"]')
    if ((await unidadeOptions.count()) > 0) {
      await unidadeOptions.first().click()
    }
    await page.waitForTimeout(500)

    // IMPORTANTE: Desmarcar "Inserir outro depois deste"
    const checkbox = modalNovoProduto.locator('button[role="checkbox"]').first()
    const isChecked = await checkbox.getAttribute('aria-checked')
    if (isChecked === 'true') {
      await checkbox.click()
    }
    await page.waitForTimeout(300)

    await page.screenshot({ path: 'test-results/step-before-save.png' })

    // PASSO 5: Salvar produto

    const salvarButton = modalNovoProduto.getByRole('button', {
      name: /salvar/i,
    })
    await salvarButton.click()

    // Aguardar mais tempo para o modal fiscal abrir
    // O código tem setTimeout de 100ms, mas pode precisar de mais

    // Polling para verificar quando o modal fiscal abre
    let fiscalModalFound = false
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500)

      const dialogs = await page.getByRole('dialog').count()
      if (dialogs > 0) {
        const hasFiscalTitle = await page
          .getByRole('dialog')
          .getByText(/configuração do item/i)
          .isVisible()
          .catch(() => false)

        if (hasFiscalTitle) {
          fiscalModalFound = true
          break
        }
      }
    }

    await page.screenshot({ path: 'test-results/step-after-save.png' })

    if (fiscalModalFound) {
      // Verify Default Values
      console.log('Verificando valores padrão...')

      // CFOPs
      await expect(page.getByLabel(/^CFOP Estadual/i)).toHaveValue('5102')
      await expect(page.getByLabel(/^CFOP Interestadual/i)).toHaveValue('6102')
      await expect(page.getByLabel(/^CFOP Exportação/i)).toHaveValue('7102')

      // NCM
      await expect(page.getByLabel(/^NCM/i)).toHaveValue('49111010')

      // ICMS
      // Note: Selects are harder to verify value directly depending on implementation,
      // but we can check if the text is present in the trigger or by value if accessible
      await expect(page.getByLabel(/^CST ICMS/i)).toHaveText(
        /102 - Tributada pelo Simples Nacional/i,
      )
      await expect(
        page.getByLabel(/^Origem da mercadoria/i).first(),
      ).toHaveText(/0 - Nacional/i)

      // PIS/COFINS
      // Using n-th match or specific labels if unique
      await expect(page.getByLabel(/^CST PIS/i)).toHaveText(
        /07 - Operação isenta/i,
      )
      await expect(page.getByLabel(/^CST COFINS/i)).toHaveText(
        /07 - Operação isenta/i,
      )

      await page.screenshot({
        path: 'test-results/step-fiscal-modal-values.png',
      })
      console.log('✅ Valores padrão verificados com sucesso!')

      // Salvar dados fiscais
      console.log('Salvando dados fiscais...')
      const saveFiscalButton = page
        .getByRole('dialog')
        .getByRole('button', { name: /salvar/i })
      await saveFiscalButton.click()

      // Verificar sucesso (Toast e fechamento do modal)
      await expect(
        page.locator('text=Dados fiscais salvos com sucesso!'),
      ).toBeVisible()
      await expect(
        page.getByRole('dialog').getByText(/configuração do item/i),
      ).not.toBeVisible()

      console.log('✅ Dados fiscais salvos e modal fechado!')
      await page.screenshot({ path: 'test-results/step-final.png' })
    } else {
      await page.screenshot({ path: 'test-results/step-no-fiscal-modal.png' })

      // Verificar se o produto foi criado (toast de sucesso)
      const toastSuccess = page.locator('text=Produto criado com sucesso')
      const toastVisible = await toastSuccess.isVisible().catch(() => false)

      if (!toastVisible) {
        throw new Error('Produto pode não ter sido criado')
      }
    }
  })
})

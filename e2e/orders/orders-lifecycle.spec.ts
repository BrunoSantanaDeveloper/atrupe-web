import { test, expect } from '@playwright/test'

test.describe.skip('Ciclo de Vida do Pedido (Orçamento -> OS)', () => {
  test('Deve criar um orçamento, adicionar itens, condição de pagamento e aprovar', async ({
    page,
  }) => {
    test.setTimeout(60000) // 60 segundos porque o fluxo completo pode demorar

    // 1. Acessar a listagem de orçamentos e abrir o modal de criação
    await page.goto('/vendas/orcamentos')

    // Tenta encontrar o botão "Novo orçamento" (pode estar na tela principal)
    const newQuotationBtn = page.getByRole('button', {
      name: /novo orçamento|nova cotação/i,
    })
    await expect(newQuotationBtn).toBeVisible()
    await newQuotationBtn.click()

    // 2. Preencher os dados do novo orçamento (Cliente)
    // Clica no combobox de Cliente
    const clientCombobox = page
      .locator('label:has-text("Cliente")')
      .locator('..')
      .locator('button, input')
      .first()
    await clientCombobox.click()
    await page.keyboard.type('a', { delay: 100 }) // Busca genérica
    await page.waitForTimeout(1500) // Aguarda debounce/API
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Clica no botão para salvar e criar o orçamento
    const submitBtn = page.getByRole('button', { name: /criar orçamento/i })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // 3. Aguardar o redirecionamento para a página de detalhes do orçamento
    await expect(page).toHaveURL(/\/vendas\/orcamentos\/.+/, { timeout: 15000 })

    // Aguardar carregamento da página de detalhes
    await page.waitForLoadState('domcontentloaded')

    // 4. Adicionar um Produto ao orçamento
    const addProductBtn = page
      .getByRole('button', { name: /adicionar produto|novo item/i })
      .first()
    if (await addProductBtn.isVisible()) {
      await addProductBtn.click()

      // Interage com o campo de produto
      const productSelect = page
        .locator('label:has-text("Produto")')
        .locator('..')
        .locator('button, input')
        .first()
      await productSelect.click()
      await page.keyboard.type('a', { delay: 100 })
      await page.waitForTimeout(1500)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')

      // Confirma adição do produto (Salvar/Adicionar)
      const saveProductBtn = page
        .getByRole('dialog')
        .getByRole('button', { name: /salvar|adicionar/i })
      await saveProductBtn.click()
      await page.waitForTimeout(1000)
    }

    // 5. Configurar Condição de Pagamento
    const paymentCondTab = page
      .getByRole('button', { name: /condição de pagamento|financeiro/i })
      .first()
    if (await paymentCondTab.isVisible()) {
      await paymentCondTab.click()
    }

    // Abre a edição da condição de pagamento (às vezes é um botão de "Editar" ou o próprio Select)
    const paymentSelect = page
      .locator('label:has-text("Condição de Pagamento")')
      .locator('..')
      .locator('button, input')
      .first()
      .or(page.getByRole('button', { name: /editar.*condição/i }))

    if (await paymentSelect.isVisible()) {
      await paymentSelect.click()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')

      // Caso haja um botão Salvar para a condição
      const savePaymentBtn = page.getByRole('button', {
        name: /salvar.*condição/i,
      })
      if (await savePaymentBtn.isVisible()) {
        await savePaymentBtn.click()
        await page.waitForTimeout(1000)
      }
    }

    // 6. Aprovar Orçamento
    const approveBtn = page
      .getByRole('button', { name: /aprovar orçamento/i })
      .first()
    await expect(approveBtn).toBeVisible({ timeout: 5000 })
    await approveBtn.click()

    // Confirmar na dialog de aprovação
    const confirmApproveBtn = page
      .getByRole('dialog')
      .getByRole('button', { name: /aprovar/i })
      .first()
    await expect(confirmApproveBtn).toBeVisible()
    await confirmApproveBtn.click()

    // 7. Validar conversão para Ordem de Serviço (redirecionamento)
    await expect(page).toHaveURL(/\/vendas\/ordens-de-servico\/.+/, {
      timeout: 15000,
    })
  })
})

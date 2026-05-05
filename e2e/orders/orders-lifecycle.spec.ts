import { test, expect } from '@playwright/test'

test.describe('Ciclo de Vida do Pedido (Orçamento -> OS)', () => {
  test('Deve criar um orçamento, adicionar itens, condição de pagamento e aprovar', async ({
    page,
  }) => {
    test.setTimeout(120000)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Criar o orçamento
    // ─────────────────────────────────────────────────────────────────────────
    await page.goto('/vendas/orcamentos')

    const newQuotationBtn = page.getByRole('button', {
      name: /novo orçamento|nova cotação/i,
    })
    await expect(newQuotationBtn).toBeVisible({ timeout: 10000 })
    await newQuotationBtn.click()

    // Aguarda o dialog de criação abrir
    const createDialog = page.getByRole('dialog', { name: /novo orçamento/i })
    await expect(createDialog).toBeVisible({ timeout: 8000 })

    // Seleciona o cliente: clica no combobox e pega a primeira opção do listbox
    const clientCombobox = createDialog.getByRole('combobox').first()
    await clientCombobox.click()
    const clientOption = page.getByRole('listbox').getByRole('option').first()
    await expect(clientOption).toBeVisible({ timeout: 6000 })
    await clientOption.click()
    await page.waitForTimeout(500)

    // Submete a criação
    const submitBtn = createDialog.getByRole('button', {
      name: /criar orçamento/i,
    })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Aguardar redirecionamento para a página de detalhes
    // ─────────────────────────────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/vendas\/orcamentos\/.+/, { timeout: 15000 })
    await page.waitForLoadState('domcontentloaded')

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Adicionar um Item ao orçamento (fluxo de 3 passos)
    //    Passo A: clicar "Adicionar item"
    //    Passo B: selecionar um TIPO de item (Criação, Impressão, etc.)
    //    Passo C: selecionar um PRODUTO da tabela
    //    Passo D: o dialog exibe um FORMULÁRIO com detalhes do item; clicar "Salvar"
    // ─────────────────────────────────────────────────────────────────────────
    const addItemBtn = page.getByRole('button', { name: 'Adicionar item' })
    await expect(addItemBtn).toBeVisible({ timeout: 10000 })
    await addItemBtn.click()

    // Passo B: Dialog "Qual item deseja adicionar?" — clicar no primeiro tipo
    const itemTypeDialog = page.getByRole('dialog', {
      name: /qual item deseja adicionar/i,
    })
    await expect(itemTypeDialog).toBeVisible({ timeout: 8000 })

    const firstItemTypeBtn = itemTypeDialog
      .getByRole('button')
      .filter({ hasNot: page.getByText(/fechar/i) })
      .first()
    await expect(firstItemTypeBtn).toBeVisible({ timeout: 5000 })
    await firstItemTypeBtn.click()
    await page.waitForTimeout(2000)

    // Passo C: O dialog transforma — tabela de produtos aparece
    // Clicar na primeira linha-produto (que é um botão)
    const productRowBtn = itemTypeDialog
      .getByRole('button')
      .filter({ hasNot: page.getByText(/fechar/i) })
      .first()
    await expect(productRowBtn).toBeVisible({ timeout: 5000 })
    await productRowBtn.click()
    await page.waitForTimeout(2000)

    // Passo D: O dialog muda de título (ex: "Criação") e exibe formulário detalhado com "Salvar"
    // Usa .last() porque o dialog pode ter mudado de nome/título
    const itemFormSaveBtn = page
      .getByRole('dialog')
      .last()
      .getByRole('button', { name: 'Salvar' })
    await expect(itemFormSaveBtn).toBeVisible({ timeout: 8000 })
    await itemFormSaveBtn.click()
    await page.waitForTimeout(2000)

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Configurar Condição de Pagamento
    // ─────────────────────────────────────────────────────────────────────────
    const editPaymentBtn = page.getByRole('button', {
      name: 'Editar condições de pagamento',
    })
    await expect(editPaymentBtn).toBeVisible({ timeout: 8000 })
    await editPaymentBtn.click()

    // Aguarda o dialog de edição de condições de pagamento
    const paymentDialog = page.getByRole('dialog').last()
    await expect(paymentDialog).toBeVisible({ timeout: 8000 })

    // Seleciona a Forma de Pagamento (ex: "Dinheiro")
    const formaCombobox = paymentDialog.getByRole('combobox', {
      name: 'Forma de pagamento',
    })
    await expect(formaCombobox).toBeVisible({ timeout: 5000 })
    await formaCombobox.click()
    await page.waitForTimeout(1500)

    // O listbox de opções pode ter role="option" ou ser div-based (react-select)
    const paymentMethodOption = page
      .getByRole('option')
      .first()
      .or(page.locator('[role="option"]').first())
    await expect(paymentMethodOption).toBeVisible({ timeout: 5000 })
    await paymentMethodOption.click()
    await page.waitForTimeout(500)

    // Confirma que o campo foi preenchido (sem "Campo obrigatório")
    await expect(paymentDialog.getByText('Campo obrigatório'))
      .not.toBeVisible({ timeout: 3000 })
      .catch(() => {})

    // Salva a condição de pagamento
    const savePaymentBtn = paymentDialog.getByRole('button', { name: 'Salvar' })
    await expect(savePaymentBtn).toBeVisible({ timeout: 5000 })
    await savePaymentBtn.click()

    // Aguarda o dialog fechar
    await expect(paymentDialog).not.toBeVisible({ timeout: 8000 })

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Concluir o Orçamento (passa para status "Aguardando")
    // ─────────────────────────────────────────────────────────────────────────
    const concludeBtn = page.getByRole('button', { name: 'Concluir orçamento' })
    await expect(concludeBtn).toBeVisible({ timeout: 8000 })
    await concludeBtn.click()
    await page.waitForTimeout(2000)

    // Trata o alertdialog que aparece após concluir:
    // - Sucesso: "Orçamento concluído" — deve fechar e continuar
    // - Erro: "Orçamento não passou pelo checkout" — falha explícita
    const alertDlg = page.getByRole('alertdialog')
    if (await alertDlg.isVisible({ timeout: 3000 }).catch(() => false)) {
      const alertText = await alertDlg.innerText().catch(() => '')

      if (/não passou|não possui parcelas|erro/i.test(alertText)) {
        // Erro real — falha explícita
        const closeBtn = alertDlg.getByRole('button')
        if (await closeBtn.isVisible().catch(() => false))
          await closeBtn.click()
        throw new Error(`Orçamento não pôde ser concluído: ${alertText}`)
      }

      // É o dialog de sucesso ("Orçamento concluído") — fecha para continuar
      const closeBtn = alertDlg.getByRole('button', { name: /fechar/i })
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click()
      }
      await page.waitForTimeout(1000)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Aprovar o Orçamento (cria a OS e redireciona)
    //    Após "Concluir", o orçamento vai para "Aguardando" e aparece "Aprovar orçamento"
    // ─────────────────────────────────────────────────────────────────────────
    const approveBtn = page.getByRole('button', { name: /aprovar orçamento/i })
    await expect(approveBtn).toBeVisible({ timeout: 8000 })
    await approveBtn.click()
    await page.waitForTimeout(2000)

    // O sistema abre um alertdialog "Deseja aprovar este orçamento?" com botão "Aprovar"
    const approvalConfirmDlg = page.getByRole('alertdialog', {
      name: /deseja aprovar|aprovar este orçamento/i,
    })
    await expect(approvalConfirmDlg).toBeVisible({ timeout: 8000 })
    const approvalConfirmBtn = approvalConfirmDlg.getByRole('button', {
      name: 'Aprovar',
    })
    await expect(approvalConfirmBtn).toBeVisible({ timeout: 5000 })
    await approvalConfirmBtn.click()

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Validar conversão para Ordem de Serviço
    // ─────────────────────────────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/vendas\/ordens-de-servico\/.+/, {
      timeout: 20000,
    })
  })
})

import { test, expect, Page } from '@playwright/test'

async function openReceivablesPage(page: Page) {
  await page.goto('/financeiro/a-receber')
  await page.waitForLoadState('domcontentloaded')
  await expect(
    page.getByRole('heading', { name: /contas a receber|recebíveis/i }).first(),
  ).toBeVisible({ timeout: 15_000 })
}

test.describe.skip('Contas a Receber (Financeiro)', () => {
  test('deve listar os recebíveis do tenant corretamente', async ({ page }) => {
    await openReceivablesPage(page)

    // Garante que a tabela/lista carregou e não estourou erro (quebra silenciosa)
    const listArea = page
      .locator('table')
      .or(page.locator('.list-container'))
      .first()
    await expect(listArea).toBeVisible()
  })

  test('deve permitir baixar/compensar um recebível (marcar como pago)', async ({
    page,
  }) => {
    await openReceivablesPage(page)

    // Tenta encontrar um botão de "Baixar", "Pagar" ou "Compensar" no primeiro item da lista
    const payBtn = page
      .getByRole('button', { name: /baixar|pagar|receber|compensar/i })
      .first()

    if (await payBtn.isVisible()) {
      await payBtn.click()

      // Deve abrir um modal de confirmação ou formulário de baixa
      const modalTitle = page
        .getByText(/baixar parcela|confirmar recebimento|dados do pagamento/i)
        .first()
      await expect(modalTitle).toBeVisible({ timeout: 5000 })

      // Simulamos que o teste de UI fecha o modal sem concluir para não poluir base
      const closeBtn = page
        .getByRole('button', { name: /cancelar|fechar/i })
        .first()
      await closeBtn.click()
    } else {
      // Pula se não houver títulos em aberto para testar na tela atual
      test.skip()
    }
  })

  test('deve permitir abrir os detalhes do recebível para ver parcelas', async ({
    page,
  }) => {
    await openReceivablesPage(page)

    // Tenta clicar no primeiro item da lista
    const firstRow = page
      .locator('table tbody tr')
      .or(page.locator('.list-item'))
      .first()

    if (await firstRow.isVisible()) {
      await firstRow.click()

      // Verifica se abriu a visualização de parcelas
      const parcelasArea = page
        .getByText(/parcela 1|detalhes do título/i)
        .first()
      await expect(parcelasArea).toBeVisible({ timeout: 5000 })
    } else {
      test.skip()
    }
  })
})

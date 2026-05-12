import { test, expect, type Page, type TestInfo } from '@playwright/test'

/**
 * Teste VISUAL para emissão de NFs listadas como "Em digitação".
 *
 * Fluxo coberto:
 *  1. Acessa a tela de emissão (/nota-fiscal/emitir)
 *  2. Aplica o filtro "Em digitação" no select de fase da NF
 *  3. Captura screenshot da listagem filtrada
 *  4. Verifica que a badge "Em digitação" aparece (ou que vimos o empty-state)
 *  5. Para o primeiro rascunho da lista, verifica que o botão "Cancelar rascunho"
 *     está disponível e captura screenshot
 *  6. Acessa o formulário de emissão do rascunho e captura screenshot final
 *     verificando o header com a badge "Em digitação" + botão "Emitir NF-e"
 *
 * O login é feito via global-setup (./e2e/global-setup.ts). Os screenshots ficam
 * no diretório do test-info (test-results/<spec>/<test>) — visíveis no relatório HTML.
 */

async function shot(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(name)
  await page.screenshot({ path, fullPage: true })
  await info.attach(name, { path, contentType: 'image/png' })
}

async function selectEmDigitacaoFilter(page: Page) {
  // O Select do shadcn é um botão com role=combobox (mostra "Não emitida" por padrão)
  const filterTrigger = page
    .getByRole('combobox')
    .filter({ hasText: /não emitida|em digitação|emitida|todas/i })
    .first()

  await expect(filterTrigger).toBeVisible({ timeout: 15_000 })
  await filterTrigger.click()

  // Opção "Em digitação" no popover
  const option = page.getByRole('option', { name: /em digitação/i })
  await expect(option).toBeVisible({ timeout: 10_000 })
  await option.click()

  // URL deve refletir o filtro
  await expect(page).toHaveURL(/nfeStatus=EM_DIGITACAO/, { timeout: 10_000 })
}

test.describe('NF "Em digitação" — Visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nota-fiscal/emitir')
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir/, { timeout: 15_000 })
  })

  test('lista NFs em digitação e captura screenshots da fase visual', async ({
    page,
  }, testInfo) => {
    // Aguarda a tabela ou o empty-state
    await expect(
      page.getByRole('table').or(page.getByText(/nenhuma ordem encontrada/i)),
    ).toBeVisible({ timeout: 20_000 })

    // 1) Screenshot do estado inicial (filtro padrão "Não emitida")
    await shot(page, testInfo, '01-listagem-padrao.png')

    // 2) Aplica o filtro "Em digitação"
    await selectEmDigitacaoFilter(page)

    // Aguarda recarregamento da tabela ou empty-state após o filtro
    const table = page.getByRole('table')
    const emptyState = page.getByText(/nenhuma ordem encontrada/i)
    await expect(table.or(emptyState)).toBeVisible({ timeout: 20_000 })

    // 3) Screenshot da listagem filtrada por "Em digitação"
    await shot(page, testInfo, '02-filtro-em-digitacao.png')

    // Se não há rascunhos no ambiente, encerramos com sucesso (estado visual capturado)
    const isEmpty = await emptyState.isVisible().catch(() => false)
    if (isEmpty) {
      testInfo.annotations.push({
        type: 'info',
        description:
          'Nenhum rascunho "Em digitação" no ambiente — screenshot do empty-state capturado.',
      })
      return
    }

    // 4) Verifica que a badge "Em digitação" aparece em pelo menos uma linha da TABELA
    //    (escopado para não confundir com o texto do SelectTrigger do filtro)
    const emDigitacaoBadge = table.getByText(/^em digitação$/i).first()
    await expect(emDigitacaoBadge).toBeVisible({ timeout: 10_000 })

    // 5) O botão de ação para rascunhos é "Cancelar rascunho" (ActionButton expõe
    //    o tooltip como aria-label no <Button>, então getByRole funciona)
    const cancelDraftBtn = page
      .getByRole('button', { name: /cancelar rascunho/i })
      .first()
    await expect(cancelDraftBtn).toBeVisible({ timeout: 10_000 })

    // Foca a primeira linha de rascunho para o screenshot
    const draftRow = table
      .locator('tr')
      .filter({ has: page.getByText(/^em digitação$/i) })
      .first()
    await draftRow.scrollIntoViewIfNeeded()
    await draftRow.hover()

    await shot(page, testInfo, '03-rascunho-com-acao-cancelar.png')
  })

  test('abre o formulário de emissão de um rascunho e captura o header "Em digitação"', async ({
    page,
  }, testInfo) => {
    // Aplica o filtro Em digitação
    const table = page.getByRole('table')
    const emptyState = page.getByText(/nenhuma ordem encontrada/i)

    await expect(table.or(emptyState)).toBeVisible({ timeout: 20_000 })

    await selectEmDigitacaoFilter(page)

    await expect(table.or(emptyState)).toBeVisible({ timeout: 20_000 })

    const isEmpty = await emptyState.isVisible().catch(() => false)
    if (isEmpty) {
      testInfo.annotations.push({
        type: 'info',
        description: 'Nenhum rascunho "Em digitação" disponível no ambiente.',
      })
      await shot(page, testInfo, '04-empty-state.png')
      return
    }

    // Encontra a primeira linha da tabela que contém a badge "Em digitação"
    const draftRow = table
      .locator('tr')
      .filter({ has: page.getByText(/^em digitação$/i) })
      .first()
    await expect(draftRow).toBeVisible({ timeout: 10_000 })

    // A UI da listagem só expõe "Cancelar rascunho" para drafts. Para acessar o
    // formulário de digitação navegamos diretamente para /nota-fiscal/emitir/{orderId}.
    // O orderId está no id="check-<orderId>" do Checkbox da linha (Radix renderiza
    // o Checkbox como <button role="checkbox">).
    const checkboxEl = draftRow.locator('[id^="check-"]').first()
    const idAttr = await checkboxEl.getAttribute('id').catch(() => null)
    const orderId = idAttr?.startsWith('check-')
      ? idAttr.replace('check-', '')
      : null

    if (!orderId) {
      testInfo.annotations.push({
        type: 'warning',
        description:
          'Não foi possível extrair o orderId da linha — capturando apenas a listagem.',
      })
      await shot(page, testInfo, '04-listagem-sem-orderid.png')
      return
    }

    await page.goto(`/nota-fiscal/emitir/${orderId}`)
    await expect(page).toHaveURL(new RegExp(`/nota-fiscal/emitir/${orderId}`), {
      timeout: 15_000,
    })

    // Header da emissão: título + badge "Em digitação" + botões de ação
    await expect(
      page.getByRole('heading', { name: /emissão de nf-e/i }),
    ).toBeVisible({ timeout: 20_000 })

    // A badge "Em digitação" está no header de emissão
    await expect(page.getByText(/^em digitação$/i).first()).toBeVisible({
      timeout: 10_000,
    })

    const emitBtn = page.getByRole('button', { name: /emitir nf-e/i }).first()
    const cancelBtn = page
      .getByRole('button', { name: /cancelar digitação/i })
      .first()

    await expect(emitBtn).toBeVisible({ timeout: 10_000 })
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 })

    await shot(page, testInfo, '05-formulario-em-digitacao.png')
  })
})

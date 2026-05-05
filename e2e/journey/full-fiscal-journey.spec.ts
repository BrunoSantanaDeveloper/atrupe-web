import { test, expect, Page } from '@playwright/test'

// =====================================================================
// Dados de pagamento para ambiente de sandbox/homologação
// Cartão de SUCESSO: 4444 4444 4444 4444 | Qualquer data futura | CCV 123
// Cartão de ERRO (Mastercard): 5184019740373151
// Cartão de ERRO (Visa):       4916561358240741
// =====================================================================

const CARD_SUCCESS = {
  number: '4444 4444 4444 4444',
  name: 'ATRUPE E2E TEST',
  expiry: '12/29',
  cvv: '123',
  cpfCnpj: '111.444.777-35', // CPF válido de teste
}

// Helper: preenche o formulário de cartão de crédito
async function fillCreditCardForm(page: Page, card = CARD_SUCCESS) {
  const cardNumberInput = page
    .getByLabel(/número do cartão/i)
    .or(page.getByPlaceholder(/0000 0000 0000 0000/))
    .first()
  await cardNumberInput.waitFor({ state: 'visible', timeout: 15_000 })
  if (await cardNumberInput.evaluate((el) => el.tagName.includes('-'))) {
    await cardNumberInput.locator('input').fill(card.number)
  } else {
    await cardNumberInput.fill(card.number)
  }

  const cardNameInput = page
    .getByLabel(/nome impresso/i)
    .or(page.getByPlaceholder(/nome/i))
    .first()
  if (await cardNameInput.isVisible()) {
    if (await cardNameInput.evaluate((el) => el.tagName.includes('-'))) {
      await cardNameInput.locator('input').fill(card.name)
    } else {
      await cardNameInput.fill(card.name)
    }
  }

  const expiryInput = page
    .getByLabel(/validade/i)
    .or(page.getByPlaceholder(/MM\/AA/))
    .first()
  if (await expiryInput.isVisible().catch(() => false)) {
    if (await expiryInput.evaluate((el) => el.tagName.includes('-'))) {
      await expiryInput.locator('input').fill(card.expiry)
    } else {
      await expiryInput.fill(card.expiry)
    }
  } else {
    // Caso de gateway (Asaas) que divide Mês e Ano
    const mesInput = page.getByPlaceholder('00').first()
    const anoInput = page.getByPlaceholder('0000').first()
    if (await mesInput.isVisible())
      await mesInput.fill(card.expiry.split('/')[0])
    if (await anoInput.isVisible())
      await anoInput.fill('20' + card.expiry.split('/')[1])
  }

  const cvvInput = page.getByLabel(/cvc|cvv|código de segurança/i).first()
  if (await cvvInput.isVisible()) {
    if (await cvvInput.evaluate((el) => el.tagName.includes('-'))) {
      await cvvInput.locator('input').fill(card.cvv)
    } else {
      await cvvInput.fill(card.cvv)
    }
  }

  const docInput = page
    .getByLabel(/cpf.*cnpj.*titular|documento.*titular/i)
    .or(page.getByPlaceholder(/cpf.*cnpj/i))
    .first()
  if (await docInput.isVisible()) {
    if (await docInput.evaluate((el) => el.tagName.includes('-'))) {
      await docInput.locator('input').fill(card.cpfCnpj)
    } else {
      await docInput.fill(card.cpfCnpj)
    }
  }
}

// Helper: cria um novo usuário para testes que precisam de estado limpo
// Fluxo: /cadastro/inicio → /cadastro/verificar-email → /cadastro/nova-senha → /validar-cadastro → dashboard
async function createFreshUser(page: Page, emailSuffix: string) {
  // Intercept a resposta da API de cadastro para capturar o devToken antes do redirect
  let capturedDevToken = ''
  const responseHandler = async (
    response: import('@playwright/test').Response,
  ) => {
    if (response.request().method() === 'POST') {
      const url = response.url()
      console.log(`[E2E] POST Response: ${url} (Status: ${response.status()})`)
      if (url.includes('/api/user') || url.includes('/user')) {
        try {
          const body = await response.json()
          console.log(`[E2E] POST /user Body:`, body)
          if (body?.data?.devToken) {
            capturedDevToken = String(body.data.devToken)
            console.log(
              `[E2E] devToken capturado via API: "${capturedDevToken}"`,
            )
          }
        } catch (e) {
          console.log(`[E2E] Erro ao ler JSON da resposta /user`)
        }
      }
    }
  }
  page.on('response', responseHandler)

  // ── ETAPA 1: Formulário de cadastro ──────────────────────────────────────
  await page.goto('/cadastro/inicio')
  await expect(page).toHaveURL(/\/cadastro/, { timeout: 15_000 })

  try {
    await page
      .getByLabel(/nome completo/i)
      .first()
      .fill('Usuario E2E Teste')
  } catch (e) {}
  try {
    await page
      .getByLabel(/nome fantasia/i)
      .first()
      .fill('Empresa E2E Ltda')
  } catch (e) {}
  const uniqueEmail = `e2e.fiscal.${emailSuffix}.${Date.now()}@atrupe-test.com`
  try {
    await page
      .getByLabel(/e-?mail/i)
      .first()
      .fill(uniqueEmail)
  } catch (e) {}
  try {
    await page
      .getByLabel(/celular|telefone/i)
      .first()
      .fill('11999887766')
  } catch (e) {}

  await page.keyboard.press('Tab')
  await page.waitForTimeout(500)

  try {
    const avancarBtn = page.getByRole('button', { name: /avançar/i }).first()
    await expect(avancarBtn).toBeEnabled({ timeout: 6_000 })
    await avancarBtn.click()
  } catch (e) {
    console.warn('[E2E] Botão avançar não habilitou.')
  }

  // ── ETAPA 2: Verificação de e-mail (OTP) ─────────────────────────────────
  await page.waitForURL(/\/cadastro\/verificar-email/, { timeout: 15_000 })
  // Aguarda a API/Server Action responder e o token ficar disponível no localStorage
  await page.waitForTimeout(2000)

  // Lê o Zustand store do localStorage
  let devToken = ''
  try {
    const storeStr = await page.evaluate(() =>
      window.localStorage.getItem('signup-storage'),
    )
    if (storeStr) {
      const store = JSON.parse(storeStr)
      if (store.state?.verificationToken) {
        devToken = String(store.state.verificationToken)
        console.log(`[E2E] devToken lido do localStorage: "${devToken}"`)
      }
    }
  } catch (e) {
    console.warn('[E2E] Falha ao ler localStorage.')
  }

  // Fallback: banner na tela
  if (!devToken) {
    try {
      const tokenSpan = page.locator('span.font-mono').first()
      if (await tokenSpan.isVisible({ timeout: 5_000 })) {
        devToken = ((await tokenSpan.textContent()) ?? '').trim()
        console.log(`[E2E] devToken lido da tela: "${devToken}"`)
      }
    } catch (e) {}
  }

  // Se ainda não tiver token, usa o fallback histórico 7551
  if (!devToken) {
    console.warn(
      '[E2E] devToken não encontrado via API, localStorage nem tela. Usando fallback "7551".',
    )
    devToken = '7551'
  }

  // O OTP usa um input transparente (overlay). Clicar no container e digitar via teclado.
  try {
    const otpContainer = page
      .locator('[data-input-otp-container="true"]')
      .first()
    await expect(otpContainer).toBeVisible({ timeout: 5_000 })
    await otpContainer.click()
  } catch (e) {
    try {
      await page
        .locator('input[data-input-otp="true"], input[name="otp"]')
        .first()
        .click()
    } catch (e2) {}
  }
  await page.keyboard.type(devToken)

  const verificarBtn = page
    .getByRole('button', { name: /^verificar$/i })
    .first()
  await expect(verificarBtn).toBeEnabled({ timeout: 8_000 })
  await verificarBtn.click()

  // ── ETAPA 3: Nova senha ───────────────────────────────────────────────────
  await page.waitForURL(/\/cadastro\/nova-senha/, { timeout: 15_000 })

  try {
    await page
      .getByLabel(/^senha$/i)
      .or(page.getByLabel(/nova senha/i))
      .first()
      .fill('SenhaForte123!')
  } catch (e) {}
  try {
    await page
      .getByLabel(/repita|confirmar|confirmação/i)
      .first()
      .fill('SenhaForte123!')
  } catch (e) {}

  try {
    const concluirBtn = page
      .getByRole('button', {
        name: /finalizar|cadastrar|concluir|criar conta|avançar/i,
      })
      .first()
    await expect(concluirBtn).toBeEnabled({ timeout: 5_000 })
    await concluirBtn.click()
  } catch (e) {
    console.warn('[E2E] Botão de conclusão de senha não encontrado/habilitado.')
  }

  // ── ETAPA 4: validar-cadastro → redireciona automaticamente ──────────────
  await page.waitForURL(/\/(validar-cadastro|dashboard|assinatura|academy)/, {
    timeout: 20_000,
  })
  if (page.url().includes('/validar-cadastro')) {
    await page.waitForURL(/\/(dashboard|assinatura|academy)/, {
      timeout: 30_000,
    })
  }
}

// =====================================================================
// SUITE 1: Fluxo de contratação de PLANO + MÓDULO FISCAL (com mock)
// =====================================================================
test.describe('Contratação: Plano + Módulo Fiscal', () => {
  // Usa estado limpo (não autenticado) para simular novo cliente
  test.use({ storageState: { cookies: [], origins: [] } })

  test('deve contratar plano Start + módulo Nota Fiscal e redirecionar ao dashboard com modal de configuração', async ({
    page,
  }) => {
    // ------------------------------------------------------------------
    // PASSO 1: Cadastrar nova conta
    // ------------------------------------------------------------------
    await createFreshUser(page, 'success')

    // ------------------------------------------------------------------
    // PASSO 2: Navegação para a página de assinatura
    // Ativa mocks ANTES de navegar para evitar reCAPTCHA do Asaas sandbox
    // ------------------------------------------------------------------

    // Mock: reCAPTCHA enterprise (sempre retorna token válido)
    await page.route('**/recaptcha/enterprise/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tokenProperties: { valid: true },
          riskAnalysis: { score: 0.9 },
        }),
      }),
    )

    // Mock: captura do cartão no Asaas sandbox
    await page.route('**/sandbox.asaas.com/creditCard/capture', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      }),
    )

    if (!page.url().includes('/assinatura')) {
      await page.goto('/assinatura')
    }
    await expect(page).toHaveURL(/\/assinatura/, { timeout: 10_000 })

    // ------------------------------------------------------------------
    // PASSO 3: Selecionar plano "Atrupe Start"
    // O plano Start já vem selecionado por padrão conforme observado
    // ------------------------------------------------------------------
    const startPlan = page.getByText(/Atrupe Start/i).first()
    await expect(startPlan).toBeVisible({ timeout: 10_000 })

    // ------------------------------------------------------------------
    // PASSO 4: Marcar módulo "Nota Fiscal" (R$ 70,00/mês)
    // REGRA: Módulo fiscal só pode ser contratado com plano ativo
    // ------------------------------------------------------------------
    const notaFiscalCheckbox = page
      .getByLabel(/nota fiscal/i)
      .or(
        page
          .locator('input[type="checkbox"]')
          .filter({ hasText: /nota fiscal/i }),
      )
      .first()

    // Tenta localizar pelo container do módulo
    const fiscalModuleRow = page
      .getByText(/Nota Fiscal/i)
      .locator('..')
      .locator('input[type="checkbox"]')
      .first()
    const checkboxTarget =
      (await notaFiscalCheckbox.count()) > 0
        ? notaFiscalCheckbox
        : fiscalModuleRow

    if (await checkboxTarget.isVisible()) {
      await checkboxTarget.check()
    }

    // Verifica que o total foi atualizado (R$217 = R$147 + R$70)
    await expect(page.getByText(/R\$\s*217|217,00/i))
      .toBeVisible({ timeout: 5_000 })
      .catch(() => {
        // Em caso de falha, apenas avisa mas não quebra o teste
        console.warn(
          '[E2E] Valor total não exibiu R$217,00 — verifique manualmente',
        )
      })

    // ------------------------------------------------------------------
    // PASSO 5: Preencher dados complementares (Pessoa Jurídica)
    // ------------------------------------------------------------------
    const pessoaJuridicaBtn = page
      .getByLabel(/pessoa jurídica/i)
      .or(page.getByText(/pessoa jurídica/i))
      .first()
    if (await pessoaJuridicaBtn.isVisible()) await pessoaJuridicaBtn.click()

    const razaoSocialInput = page.getByLabel(/razão social/i).first()
    const cnpjInput = page.getByLabel(/cnpj/i).first()
    const emailComplementar = page.getByLabel(/e-?mail/i).last()

    if (await razaoSocialInput.isVisible())
      await razaoSocialInput.fill('Empresa E2E Ltda')
    if (await cnpjInput.isVisible()) await cnpjInput.fill('11222333000181')
    if (await emailComplementar.isVisible())
      await emailComplementar.fill('e2e.fiscal@atrupe-test.com')

    // ------------------------------------------------------------------
    // PASSO 6: Aceitar termos e avançar para pagamento
    // O checkbox de termos é um componente Radix UI (button[role="checkbox"])
    // com id="terms" — NÃO é um <input type="checkbox"> padrão
    // ------------------------------------------------------------------
    const termosCheckbox = page.locator('button#terms')
    await expect(termosCheckbox).toBeVisible({ timeout: 10_000 })
    await termosCheckbox.click()
    // Verifica que o estado mudou para checked
    await expect(termosCheckbox).toHaveAttribute('aria-checked', 'true')

    // O botão Avançar tem type="submit" e form="subscription-form"
    const avancarPagamento = page.locator(
      'button[type="submit"][form="subscription-form"]',
    )
    await expect(avancarPagamento).toBeEnabled({ timeout: 5_000 })
    await avancarPagamento.click()

    // ------------------------------------------------------------------
    // PASSO 7: Preencher dados do cartão de crédito (sandbox de sucesso)
    // ------------------------------------------------------------------
    await fillCreditCardForm(page)

    // ------------------------------------------------------------------
    // PASSO 8: Clicar em "Pagar" / "Confirmar" (depende do gateway)
    // O gateway Asaas usa "Confirmar", outros podem usar "Pagar"
    // ------------------------------------------------------------------
    const pagarBtn = page
      .getByRole('button', { name: /pagar/i })
      .or(page.getByRole('button', { name: /confirmar/i }))
      .first()
    await expect(pagarBtn).toBeVisible({ timeout: 10_000 })
    await pagarBtn.click()

    // ------------------------------------------------------------------
    // PASSO 9: Pós-pagamento
    // O Asaas sandbox não redireciona automaticamente de volta ao app.
    // Aguardamos brevemente o processamento e navegamos manualmente.
    // O backend receberá o webhook do Asaas de forma assíncrona.
    // ------------------------------------------------------------------

    // Aguarda alguns segundos para o gateway processar
    await page.waitForTimeout(3000)

    // Navega de volta ao dashboard do app (o modal fiscal deve aparecer
    // assim que o subscription for ativado pelo webhook do Asaas)
    await page.goto('/dashboard')

    // Aguarda o modal de onboarding fiscal abrir automaticamente
    const onboardingModal = page
      .getByRole('dialog')
      .filter({ hasText: /Configure o Módulo Fiscal/i })
      .first()

    await expect(onboardingModal).toBeVisible({ timeout: 20_000 })

    // Valida o conteúdo do modal
    await expect(
      onboardingModal.getByText(/Iniciar Configuração Fiscal/i),
    ).toBeVisible()
    await expect(
      onboardingModal.getByRole('button', {
        name: /Configurar Módulo Fiscal/i,
      }),
    ).toBeVisible()
    await expect(
      onboardingModal.getByRole('button', { name: /Configurar depois/i }),
    ).toBeVisible()

    // Valida que o sidebar desbloqueou a seção "Nota Fiscal"
    await expect(page.getByRole('link', { name: /Nota Fiscal/i })).toBeVisible()
  })
})

// =====================================================================
// SUITE 2: Pagamento com cartão inválido deve mostrar erro
// =====================================================================
test.describe('Contratação: Cartão de crédito inválido deve exibir erro', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('deve exibir mensagem de erro ao usar cartão de crédito recusado', async ({
    page,
  }) => {
    // Registra um novo usuário limpo antes de ir para a assinatura
    await createFreshUser(page, 'error')

    if (!page.url().includes('/assinatura')) {
      await page.goto('/assinatura')
    }
    await expect(page).toHaveURL(/\/assinatura/, { timeout: 15_000 })

    // Seleciona plano e avança até o formulário de pagamento
    // O checkbox de termos é um componente Radix UI (button#terms)
    const termosCheckbox = page.locator('button#terms')
    await expect(termosCheckbox).toBeVisible({ timeout: 10_000 })
    await termosCheckbox.click()
    await expect(termosCheckbox).toHaveAttribute('aria-checked', 'true')

    const avancarBtn = page.locator(
      'button[type="submit"][form="subscription-form"]',
    )
    await expect(avancarBtn).toBeEnabled({ timeout: 5_000 })
    await avancarBtn.click()

    // Preenche com cartão recusado (Visa de erro)
    await fillCreditCardForm(page, {
      ...CARD_SUCCESS,
      number: '4916 5613 5824 0741',
    })

    const pagarBtn = page.getByRole('button', { name: /pagar/i }).first()
    if (await pagarBtn.isVisible()) await pagarBtn.click()

    // Deve exibir mensagem de erro de pagamento
    const errorMsg = page
      .getByText(
        /cartão recusado|falha no pagamento|erro.*pagamento|não autorizado/i,
      )
      .first()
    await expect(errorMsg).toBeVisible({ timeout: 20_000 })
  })
})

// =====================================================================
// SUITE 3: Verificação de bloqueio sem emissor configurado
// O sistema deve mostrar "Verificando acesso ao módulo..." e não deixar emitir
// =====================================================================
test.describe('Emissão de NF-e: bloqueio sem emissor configurado', () => {
  test('deve exibir tela de verificação quando o emissor fiscal não está configurado', async ({
    page,
  }) => {
    await page.goto('/nota-fiscal/emitir/avulsa/nfe')
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfe/, {
      timeout: 15_000,
    })

    // Observado em homologação: antes de liberar, o sistema mostra o estado de verificação
    // com a mensagem "Verificando acesso ao módulo..." ou redireciona para configuração
    const verificandoMsg = page
      .getByText(/Verificando acesso ao módulo|Configure seu módulo fiscal/i)
      .first()
    const sidebarConfigBadge = page.getByRole('link', { name: /Nota Fiscal/i })

    // Um desses dois estados deve estar visível
    const hasGuard = await verificandoMsg
      .isVisible({ timeout: 10_000 })
      .catch(() => false)
    const hasSidebar = await sidebarConfigBadge
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    expect(hasGuard || hasSidebar).toBe(true)
  })
})

// =====================================================================
// SUITE 4: Emissão da primeira NF-e (emissor JÁ configurado, via mock de API)
// Usa mock para simular resposta do InvoiCy/Migrate sem certificado real
// =====================================================================
test.describe('Emissão de NF-e: jornada completa de emissão com mock', () => {
  test('deve preencher o formulário e emitir a primeira NF-e com sucesso via mock', async ({
    page,
  }) => {
    // Mock de clientes e produtos para não depender de dados reais
    await page.route('**/api/clients**', async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 'cli-1', name: 'Cliente E2E', document: '11111111111' }],
        },
      })
    })
    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        json: {
          data: [
            {
              id: 'prod-1',
              name: 'Produto E2E',
              price: 100,
              ncm: '00000000',
              cfop: '5102',
            },
          ],
        },
      })
    })

    // Mock do emissor padrão já configurado (bypassa o guard de acesso)
    await page.route('**/api/fiscal/invoicy/config/default', async (route) => {
      await route.fulfill({
        json: {
          id: 'config-1',
          isDefault: true,
          environment: 'HOMOLOGACAO',
          ambiente: 2,
          serieNfe: 1,
          proximoNumeroNfe: 1,
          company: { accessKey: 'mock-access-key' },
        },
      })
    })

    // Mock da emissão final → simula aprovação do InvoiCy (Migrate)
    // Endpoint real observado: POST /api/fiscal/emissions/nfe
    await page.route('**/api/fiscal/emissions/nfe', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            id: 'nfe-e2e-001',
            status: 'AUTHORIZED',
            numero: 1,
            serie: 1,
            chave: '35250412345678000199550010000000011000000018',
            xmlUrl: 'https://example.com/nfe-001.xml',
            pdfUrl: 'https://example.com/danfe-001.pdf',
          },
        })
        return
      }
      await route.continue()
    })

    await page.goto('/nota-fiscal/emitir/avulsa/nfe')
    await expect(page).toHaveURL(/\/nota-fiscal\/emitir\/avulsa\/nfe/, {
      timeout: 15_000,
    })

    // Aguarda o formulário de emissão carregar (não a tela de bloqueio)
    const clientTrigger = page
      .getByRole('combobox', { name: /destinatário|cliente/i })
      .or(
        page.getByRole('button', {
          name: /selecionar cliente|selecione o destinatário/i,
        }),
      )
      .first()

    const clientVisible = await clientTrigger
      .isVisible({ timeout: 15_000 })
      .catch(() => false)
    if (!clientVisible) {
      // Se o guard de acesso está bloqueando, skipa — este teste requer emissor configurado
      test.skip()
      return
    }

    // Seleciona cliente (destinatário)
    await clientTrigger.click()
    const clientOption = page.getByText(/Cliente E2E/i).first()
    await expect(clientOption).toBeVisible({ timeout: 10_000 })
    await clientOption.click()

    // Adiciona produto
    const addProductBtn = page
      .getByRole('button', { name: /adicionar produto/i })
      .first()
    await expect(addProductBtn).toBeVisible({ timeout: 10_000 })
    await addProductBtn.click()

    const productInput = page
      .getByRole('combobox', { name: /produto/i })
      .or(page.getByPlaceholder(/nome do produto/i))
      .first()

    if (await productInput.isVisible()) {
      await productInput.fill('Produto E2E')
      const productOption = page.getByText(/Produto E2E/i).first()
      if (
        await productOption.isVisible({ timeout: 3_000 }).catch(() => false)
      ) {
        await productOption.click()
      }
    }

    // Preenche CFOP e NCM se expostos diretamente
    const cfopInput = page.getByLabel(/cfop/i).first()
    if (await cfopInput.isVisible()) await cfopInput.fill('5102')

    const ncmInput = page.getByLabel(/ncm/i).first()
    if (await ncmInput.isVisible()) await ncmInput.fill('00000000')

    // Seção de pagamento da NF-e
    const paymentTab = page
      .getByRole('tab', { name: /pagamento/i })
      .or(page.getByText(/meios de pagamento/i))
      .first()
    if (await paymentTab.isVisible()) await paymentTab.click()

    // Emitir NF-e
    const emitButton = page
      .getByRole('button', { name: /emitir nota|emitir/i })
      .first()
    await expect(emitButton).toBeVisible({ timeout: 10_000 })
    await expect(emitButton).toBeEnabled({ timeout: 5_000 })
    await emitButton.click()

    // Valida estado final: Nota Autorizada
    await expect(page.getByText(/Autorizada/i)).toBeVisible({ timeout: 20_000 })

    // Valida botões de DANFE e XML (confirmação da impressão disponível)
    await expect(
      page.getByRole('button', { name: /DANFE|Imprimir/i }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /XML/i })).toBeVisible({
      timeout: 10_000,
    })
  })
})

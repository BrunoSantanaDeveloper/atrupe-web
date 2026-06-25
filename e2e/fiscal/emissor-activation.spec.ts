import { test, expect } from '@playwright/test'

import {
  createEmissor,
  createFiscalApiClient,
  deleteEmissor,
  getEmissor,
  getReadiness,
  setNumbering,
  type FiscalApiClient,
} from '../helpers/fiscal-api'

/**
 * Cobertura e2e da tela de emissores (Plano 4 — configuração/ativação NFC-e).
 *
 * Estratégia (decisão: seed/fixture de backend):
 *  - Os estados são semeados pela API real (`helpers/fiscal-api.ts`), que
 *    autentica via JWT e cria/limpa emissores por ambiente.
 *  - A tela busca dados via *server actions* (não interceptáveis por
 *    `page.route`), então as asserções de UI rodam contra o estado real
 *    semeado.
 *  - Estados que exigem autorização real no Invoicy/SEFAZ (readiness
 *    `ready === true`, ativação concluída) NÃO são semeáveis sem certificado e
 *    CSC reais de homologação — permanecem `test.skip` com justificativa.
 *
 * As asserções de contrato de backend (P0 numeração ambiental, P1
 * `providerConfigured`) validam exatamente a superfície nova que o frontend
 * consome.
 */
test.describe('Emissores — configuração e ativação NFC-e', () => {
  test.describe('UI (estado real semeado)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/configuracoes/nota-fiscal/emissores')
      await expect(page).toHaveURL(/\/configuracoes\/nota-fiscal\/emissores/, {
        timeout: 15_000,
      })
    })

    test('a página de emissores carrega sem erro', async ({ page }) => {
      await expect(
        page.getByText(/página não encontrada|not found/i),
      ).not.toBeVisible()
      await expect(page.getByText('Emissores de Nota Fiscal')).toBeVisible({
        timeout: 15_000,
      })
    })

    test('NFC-e não exibe mais o rótulo fixo "Indisponível"', async ({
      page,
    }) => {
      // Regressão da §2.3: o card de NFC-e deixou de ter estado hardcoded.
      const firstCard = page
        .locator('div.cursor-pointer')
        .filter({ hasText: /CNPJ|Razão|NF-e|Homologação|Produção/i })
        .first()

      if (await firstCard.isVisible().catch(() => false)) {
        await firstCard.click().catch(() => {})
      }

      await expect(page.getByText('Indisponível', { exact: true })).toHaveCount(
        0,
      )
    })
  })

  test.describe('Contrato de backend (P0/P1) via fixture', () => {
    let client: FiscalApiClient | null = null
    const createdIds: string[] = []

    test.beforeAll(async () => {
      try {
        client = await createFiscalApiClient()
      } catch (err) {
        // Sem API/credenciais disponíveis (ex.: dev local sem E2E_*): pula.
        console.warn(`[emissor-activation] fixture indisponível: ${err}`)
        client = null
      }
    })

    test.afterAll(async () => {
      if (client) {
        for (const id of createdIds) await deleteEmissor(client, id)
        await client.dispose()
      }
    })

    test('[P1] emissor recém-criado expõe environments[] e providerConfigured=false', async () => {
      test.skip(!client, 'Fixture de API indisponível neste ambiente')
      const { id } = await createEmissor(client!, `E2E NFC-e ${Date.now()}`)
      createdIds.push(id)

      const emissor = await getEmissor(client!, id)
      expect(Array.isArray(emissor.environments)).toBe(true)
      // Sem accessKey nem credencial cifrada → não configurado.
      expect(emissor.company.providerConfigured).toBe(false)
      // activeEnvironment ainda não definido antes de ativar.
      expect(emissor.activeEnvironment ?? null).toBeNull()
    })

    test('[P0] setNumbering rejeita valores < 1 e persiste valores válidos (nfce_numbering PASS)', async () => {
      test.skip(!client, 'Fixture de API indisponível neste ambiente')
      const { id } = await createEmissor(client!, `E2E Numeração ${Date.now()}`)
      createdIds.push(id)

      const invalid = await setNumbering(client!, id, 'PRODUCAO', 0, 1)
      expect(invalid.status).toBe(400)

      const valid = await setNumbering(client!, id, 'PRODUCAO', 2, 55)
      expect(valid.ok).toBe(true)

      const readiness = await getReadiness(client!, id, 'PRODUCAO')
      const numbering = readiness.checks?.find(
        (c: { check: string }) => c.check === 'nfce_numbering',
      )
      expect(numbering?.status).toBe('PASS')
    })
  })

  // ─── Cenários que exigem autorização real no Invoicy/SEFAZ ───────────────
  // Não semeáveis sem certificado + CSC reais de homologação.
  test.skip('ativação de produção conclui com readiness ready=true', async () => {
    // Requer emissor com certificado válido, CSC real e autenticação Invoicy
    // bem-sucedida — fora do alcance determinístico de uma fixture.
  })

  test.skip('teste de autenticação retorna sucesso no ambiente', async () => {
    // Requer credencial Invoicy real válida para o ambiente.
  })
})

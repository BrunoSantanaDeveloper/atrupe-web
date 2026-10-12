import { expect, request, test, type APIRequestContext } from '@playwright/test'

import {
  getTestCredentials,
  hasTestCredentials,
  type TestPlan,
} from '../helpers/credentials'

/**
 * Portões de plano na API, conta por conta (contrato da camada de planos,
 * §3).
 *
 * Abaixo do plano mínimo (padrão de fábrica), a rota GET com portão recusa
 * com 403, `userMessage.code` FEATURE_NOT_AVAILABLE e, em `availableFrom`,
 * o plano que libera (acima do plano da conta); no plano dono, responde
 * 2xx. Entra direto na API (E2E_API_URL) com as contas por plano
 * (E2E_<PLANO>_EMAIL/PASSWORD); sem a credencial, o plano é pulado.
 */

const API_URL = process.env.E2E_API_URL ?? 'https://dev.atrupe.com.br'

const PLAN_ORDER: TestPlan[] = ['START', 'LITE', 'PRO', 'ELITE', 'FULL']

// Um id qualquer: o portão das abas do cadastro vale antes de procurar o
// cliente ou o fornecedor.
const ANY_ID = '00000000-0000-4000-8000-000000000000'

interface GatedApiRoute {
  path: string
  feature: string
  /** O primeiro plano da trilha que tem a chave, no padrão de fábrica. */
  minPlan: TestPlan
}

const GATED_GET_ROUTES: GatedApiRoute[] = [
  {
    path: '/financial/receivable',
    feature: 'accounts_receivable',
    minPlan: 'LITE',
  },
  { path: '/financial/payable', feature: 'accounts_payable', minPlan: 'LITE' },
  {
    path: '/financial/cash-control',
    feature: 'cash_control',
    minPlan: 'LITE',
  },
  {
    // Sem status: as abas "Produção" e "Todos" da Agenda.
    path: '/sale/delivery-schedule',
    feature: 'delivery_production_tabs',
    minPlan: 'LITE',
  },
  {
    path: `/sale/quotation?clientId=${ANY_ID}`,
    feature: 'client_additional_tabs',
    minPlan: 'LITE',
  },
  {
    path: `/sale/order?clientId=${ANY_ID}`,
    feature: 'client_additional_tabs',
    minPlan: 'LITE',
  },
  {
    path: `/financial/flow?clientId=${ANY_ID}`,
    feature: 'client_additional_tabs',
    minPlan: 'LITE',
  },
  {
    path: `/financial/flow?supplierId=${ANY_ID}`,
    feature: 'supplier_additional_tabs',
    minPlan: 'LITE',
  },
  { path: '/asset', feature: 'cost_base', minPlan: 'PRO' },
  // A lista do cadastro de materiais. A busca de venda direta
  // (directSale=true) não entra aqui: ela responde lista vazia, não 403,
  // a quem não tem a base de custos.
  { path: '/material?page=1&limit=1', feature: 'cost_base', minPlan: 'PRO' },
]

const planOrder = (planType: string) => PLAN_ORDER.indexOf(planType as TestPlan)

for (const plan of PLAN_ORDER) {
  test.describe(`Portões de plano na API: ${plan}`, () => {
    test.skip(
      !hasTestCredentials(plan),
      `Sem credencial do plano ${plan} (E2E_${plan}_EMAIL/PASSWORD).`,
    )

    let api: APIRequestContext

    test.beforeAll(async () => {
      const credentials = getTestCredentials(plan)
      if (!credentials) return

      const auth = await request.newContext({ baseURL: API_URL })
      const res = await auth.post('/auth/login', {
        data: { username: credentials.email, password: credentials.password },
      })
      expect(res.ok(), `login do plano ${plan} em ${API_URL}`).toBeTruthy()
      const token: string | undefined = (await res.json())?.access_token
      await auth.dispose()
      expect(token, 'resposta de login sem access_token').toBeTruthy()

      api = await request.newContext({
        baseURL: API_URL,
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      })
    })

    test.afterAll(async () => {
      await api?.dispose()
    })

    for (const route of GATED_GET_ROUTES) {
      const below = planOrder(plan) < planOrder(route.minPlan)

      test(`GET ${route.path} ${below ? 'recusa' : 'responde'} (${route.feature} a partir do ${route.minPlan})`, async () => {
        const res = await api.get(route.path)

        if (!below) {
          expect(res.status(), await res.text()).toBeLessThan(300)
          return
        }

        expect(res.status()).toBe(403)
        const body = await res.json()
        expect(body?.userMessage?.code).toBe('FEATURE_NOT_AVAILABLE')

        // O plano que libera vem do servidor e fica acima do plano da conta.
        const availableFrom = body?.userMessage?.availableFrom
        expect(availableFrom, 'availableFrom no 403').toBeTruthy()
        expect(planOrder(availableFrom.planType)).toBeGreaterThan(
          planOrder(plan),
        )
      })
    }
  })
}

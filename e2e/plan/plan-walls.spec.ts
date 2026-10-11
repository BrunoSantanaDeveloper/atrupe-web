import { expect, test } from '@playwright/test'

import {
  hasTestCredentials,
  planStorageState,
  type TestPlan,
} from '../helpers/credentials'

/**
 * Paredes de plano, conta por conta (camada de planos).
 *
 * Cada rota com portão de plano tem a chave que a libera e o plano mínimo
 * no padrão de fábrica (plans-complete.ts, no backend). Abaixo do plano
 * mínimo, a rota mostra a parede e o item some do menu; no plano dono, a
 * tela abre.
 *
 * Usa as contas por plano (E2E_<PLANO>_EMAIL/PASSWORD), com a sessão que o
 * global-setup grava em e2e/.auth/<plano>.json; sem a credencial, o plano é
 * pulado. Se o superadmin mudar a composição dos planos no ambiente, a
 * tabela muda junto.
 */

const PLAN_ORDER: TestPlan[] = ['START', 'LITE', 'PRO', 'ELITE', 'FULL']

interface GatedRoute {
  path: string
  /** A chave que o portão da página pede. */
  feature: string
  /** O primeiro plano da trilha que tem a chave, no padrão de fábrica. */
  minPlan: TestPlan
  /** O h1 da página, que a parede mantém. */
  title: RegExp
  /** A rota tem item próprio no menu lateral. */
  inMenu?: boolean
}

const GATED_ROUTES: GatedRoute[] = [
  {
    path: '/financeiro/a-receber',
    feature: 'accounts_receivable',
    minPlan: 'LITE',
    title: /Movimentações a receber/i,
    inMenu: true,
  },
  {
    path: '/financeiro/a-pagar',
    feature: 'accounts_payable',
    minPlan: 'LITE',
    title: /Movimentações a pagar/i,
    inMenu: true,
  },
  {
    path: '/financeiro/controle-de-caixa',
    feature: 'cash_control',
    minPlan: 'LITE',
    title: /Controle de caixa/i,
    inMenu: true,
  },
  {
    path: '/financeiro/frente-de-caixa',
    feature: 'pdv_screen',
    minPlan: 'LITE',
    title: /Frente de caixa/i,
    inMenu: true,
  },
  {
    path: '/configuracoes/vendas/status-de-orcamento',
    feature: 'quotation_status_configuration',
    minPlan: 'LITE',
    title: /Status de orçamento/i,
  },
  {
    path: '/configuracoes/vendas/motivos-de-rejeicao-e-cancelamento',
    feature: 'quotation_rejection_reasons',
    minPlan: 'LITE',
    title: /Motivos de rejeição e cancelamento/i,
  },
  {
    path: '/configuracoes/empresa-e-sistema/setores',
    feature: 'sectors_configuration',
    minPlan: 'START',
    title: /Configuração de setores/i,
  },
]

/** O texto da parede de plano, com o mapa de chaves ou sem ele. */
const WALL_TEXT =
  /Disponível a partir do plano|não faz parte do seu plano atual|não está disponível nos planos atuais/i

const isBelow = (plan: TestPlan, minPlan: TestPlan) =>
  PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(minPlan)

for (const plan of PLAN_ORDER) {
  test.describe(`Paredes de plano: ${plan}`, () => {
    test.skip(
      !hasTestCredentials(plan),
      `Sem credencial do plano ${plan} (E2E_${plan}_EMAIL/PASSWORD).`,
    )
    test.use({ storageState: planStorageState(plan) })

    for (const route of GATED_ROUTES) {
      if (isBelow(plan, route.minPlan)) {
        test(`${route.path} mostra a parede (${route.feature} a partir do ${route.minPlan})`, async ({
          page,
        }) => {
          await page.goto(route.path)

          // A parede ocupa a página: o título dela é o h1.
          await expect(
            page.getByRole('heading', { level: 1, name: route.title }),
          ).toBeVisible()
          await expect(page.getByText(WALL_TEXT)).toBeVisible()

          if (route.inMenu) {
            // O grupo do menu da rota abre sozinho; o item fica fora dele.
            await expect(
              page.locator(`aside nav a[href="${route.path}"]`),
            ).toHaveCount(0)
          }
        })
      } else {
        test(`${route.path} abre`, async ({ page }) => {
          await page.goto(route.path)

          await expect(
            page.getByRole('heading', { level: 1, name: route.title }),
          ).toBeVisible()
          await expect(page.getByText(WALL_TEXT)).toHaveCount(0)
        })
      }
    }
  })
}

import { test, expect, type Page } from '@playwright/test'

import { DEMO_ROUTES } from '../src/config/routes'

/**
 * Fronteira do mock (plano de implementação dos planos, 5.4 item 10 e 5.6).
 *
 * No build SEM a flag de demonstração (NEXT_PUBLIC_DEMO_DATA), nenhuma tela,
 * dado ou ação de exemplo pode aparecer: as rotas de DEMO_ROUTES e o /sandbox
 * respondem "página não encontrada", o menu não leva a elas e as telas reais
 * não mostram nome de exemplo. Roda contra o build de produção (local, com
 * `next build` sem a flag, ou o ambiente depois do deploy) e barra o deploy
 * se algo vazar:
 *
 *   npx playwright test --grep @fronteira
 *
 * Contra um alvo com a flag ligada (homolog, ou local com a flag) a suíte não
 * faz sentido: quem roda declara a flag do alvo no ambiente do teste (o
 * playwright.config lê o .env.local), e então ela é pulada.
 */
const TARGET_HAS_DEMO_FLAG = process.env.NEXT_PUBLIC_DEMO_DATA === 'on'

/** Nomes que só existem nos dados de exemplo (src/actions PROVISÓRIO). */
const EXAMPLE_NAMES = ['Renata Alves', 'Lona 440', 'Impressão de exemplo']

/** Um id qualquer para os segmentos entre colchetes das rotas. */
const FAKE_ID = 'e2e-fronteira'

const toUrl = (route: string) =>
  route
    .split('/')
    .map((segment) => (segment.startsWith('[') ? FAKE_ID : segment))
    .join('/')

/** Cada rota de demonstração, mais subpáginas e as vitrines do /sandbox. */
const NOT_FOUND_URLS = [
  ...DEMO_ROUTES.map(toUrl),
  '/base-de-custos/resumo',
  '/precificacao/materiais',
  '/estoque/entrada-de-nota',
  `/producao/projetos/${FAKE_ID}/ficha`,
  '/configuracoes/empresa-e-sistema/patrimonios/grupos',
  `/vendas/orcamentos/${FAKE_ID}/composicao/proposta`,
  '/sandbox/orcamento',
  '/sandbox/fluxo',
  '/sandbox/aproveitamento',
  '/sandbox/tema',
]

/**
 * As telas reais que tiveram dado de exemplo por perto (inventário de telas,
 * "compartilhada, mock parcial") ou que trocaram de tela pela flag.
 */
const REAL_URLS = [
  '/dashboard',
  '/vendas/orcamentos',
  '/vendas/ordens-de-servico',
  '/cadastros/clientes',
  '/configuracoes/produtos',
  '/configuracoes/empresa-e-sistema',
  '/configuracoes/empresa-e-sistema/setores',
  '/configuracoes/vendas',
  '/configuracoes/financeiro/contas-bancarias',
  '/configuracoes/financeiro/folhas-de-pagamento',
  '/financeiro/controle-de-caixa',
  '/financeiro/frente-de-caixa',
  '/producao/agenda-de-entrega',
]

/** Textos que só aparecem nas telas e marcas de demonstração. */
const DEMO_TEXTS = [
  // Legenda e cartões das marcas de revisão
  'Tela nova, criada nesta revisão',
  'Recurso ainda não desenvolvido',
  'A agenda como quadro de gestão à vista',
  // Cartões de configuração que levam a telas de demonstração
  'Cadastre máquinas, equipamentos, móveis e veículos',
  'Pule o cadastro do orçamento e caia direto na escolha do item.',
  'Defina o markup padrão aplicado ao custo do terceirizado lançado na hora.',
]

async function expectNotFound(page: Page, url: string) {
  const response = await page.goto(url)
  expect(response?.status(), `status de ${url}`).toBe(404)
  await expect(page.getByText('Página não encontrada')).toBeVisible()
}

test.describe('Fronteira do mock: build sem a flag de demonstração @fronteira', () => {
  test.skip(
    TARGET_HAS_DEMO_FLAG,
    'O alvo tem a flag de demonstração ligada (NEXT_PUBLIC_DEMO_DATA=on).',
  )

  for (const url of NOT_FOUND_URLS) {
    test(`${url} responde não encontrada`, async ({ page }) => {
      await expectNotFound(page, url)
    })
  }

  test('rota de demonstração sem sessão também responde não encontrada', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const page = await context.newPage()
    await expectNotFound(page, toUrl(DEMO_ROUTES[0]))
    await context.close()
  })

  for (const url of REAL_URLS) {
    test(`${url} não mostra dado nem marca de demonstração`, async ({
      page,
    }) => {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      const text = await page.locator('body').innerText()
      for (const name of [...EXAMPLE_NAMES, ...DEMO_TEXTS]) {
        expect(text, `"${name}" em ${url}`).not.toContain(name)
      }
    })
  }

  test('o menu não leva a tela de demonstração', async ({ page }) => {
    // Cada visita abre o grupo do menu da rota, onde os itens novos ficariam
    const groups: { path: string; hidden: string[] }[] = [
      {
        path: '/producao/agenda-de-entrega',
        hidden: [
          '/producao/gerenciador',
          '/producao/projetos',
          '/producao/produtividade',
        ],
      },
      {
        path: '/cadastros/clientes',
        hidden: [
          '/configuracoes/produtos/materiais',
          '/configuracoes/produtos/processos',
        ],
      },
      {
        path: '/configuracoes/empresa-e-sistema',
        hidden: ['/configuracoes/producao'],
      },
    ]

    for (const group of groups) {
      await page.goto(group.path)
      await page.waitForLoadState('networkidle')
      for (const href of group.hidden) {
        await expect(page.locator(`aside nav a[href="${href}"]`)).toHaveCount(0)
      }
    }

    // Os grupos que só têm telas de demonstração somem inteiros
    await expect(
      page.locator('aside nav').getByText('Custos e preços'),
    ).toHaveCount(0)
    await expect(
      page.locator('aside nav').getByText('Estoque', { exact: true }),
    ).toHaveCount(0)
  })

  test('a busca do "adicionar item" não lista material de exemplo', async ({
    page,
  }) => {
    // Usa um orçamento em digitação que já exista: o teste não cria dado
    await page.goto('/vendas/orcamentos?status=digitacao')
    await page.waitForLoadState('networkidle')

    const quotationLink = page
      .locator('table a[href^="/vendas/orcamentos/"]')
      .first()
    test.skip(
      (await quotationLink.count()) === 0,
      'A conta de teste não tem orçamento em digitação.',
    )

    await quotationLink.click()
    await expect(page).toHaveURL(/\/vendas\/orcamentos\/[^/?]+/)

    const addItem = page.getByRole('button', { name: 'Adicionar item' })
    test.skip(
      !(await addItem.isVisible({ timeout: 10_000 }).catch(() => false)),
      'O orçamento não permite adicionar item.',
    )
    await addItem.click()

    const dialog = page.getByRole('dialog', {
      name: /qual item deseja adicionar/i,
    })
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Buscar pelo nome').fill('Lona')
    await page.waitForLoadState('networkidle')

    await expect(dialog.getByText('Lona 440')).toHaveCount(0)
    // O item montado na hora também é de demonstração
    await expect(
      dialog.getByRole('button', { name: 'Composição' }),
    ).toHaveCount(0)

    await page.keyboard.press('Escape')
  })
})

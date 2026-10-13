import { test, expect, type Page } from '@playwright/test'

import { DEMO_ROUTES } from '../src/config/routes'

/**
 * Fronteira do mock (plano de implementação dos planos, 5.4 item 10 e 5.6).
 *
 * No build SEM a flag de demonstração (NEXT_PUBLIC_DEMO_DATA), nenhuma tela,
 * dado ou ação de exemplo pode aparecer: as rotas de DEMO_ROUTES e o /sandbox
 * respondem "página não encontrada", o menu não leva a elas e as telas reais
 * não mostram nome de exemplo nem a versão de demonstração no lugar da real.
 * Roda contra o build sem a flag servido localmente, com uma API de mentira e
 * uma sessão com todas as chaves de plano (playwright.fronteira.config.ts), e
 * barra o deploy de produção se algo vazar (.github/workflows/fronteira.yml):
 *
 *   npx playwright test -c playwright.fronteira.config.ts
 *
 * Pela config principal (contra homolog, que tem a flag, ou com uma conta sem
 * as chaves mais altas) a suíte passaria em vazio, por isso é pulada.
 */
const TARGET_HAS_DEMO_FLAG = process.env.NEXT_PUBLIC_DEMO_DATA === 'on'
const RUN_BY_FRONTEIRA_CONFIG = process.env.FRONTEIRA_FULL_SESSION === '1'
const STUB_API = process.env.FRONTEIRA_STUB_API === '1'

/**
 * Nomes que só existem nos dados de exemplo (src/actions PROVISÓRIO). Nome
 * de material (Lona 440, MDF 10 mm) não entra: um cliente pode ter o mesmo.
 */
const EXAMPLE_NAMES = ['Renata Alves', 'Impressão de exemplo']

/** Um id qualquer para os segmentos entre colchetes das rotas. */
const FAKE_ID = 'e2e-fronteira'

const toUrl = (route: string) =>
  route
    .split('/')
    .map((segment) => (segment.startsWith('[') ? FAKE_ID : segment))
    .join('/')

/** Cada rota de demonstração, mais subpáginas: o middleware responde 404. */
const NOT_FOUND_URLS = [
  ...DEMO_ROUTES.map(toUrl),
  '/base-de-custos/resumo',
  '/precificacao/materiais',
  '/estoque/entrada-de-nota',
  `/producao/projetos/${FAKE_ID}/ficha`,
  '/configuracoes/empresa-e-sistema/patrimonios/grupos',
  `/vendas/orcamentos/${FAKE_ID}/composicao/proposta`,
]

/**
 * Segmento com ponto: o middleware não vê essas URLs (o matcher deixa de fora
 * caminho com ponto, que é de arquivo), e quem barra é o notFound() da
 * própria página. O status fica 200 e a troca para a página de não encontrada
 * às vezes quebra no navegador (React #310, também nas páginas reais que
 * chamam notFound()); o que vale aqui é a tela de demonstração não aparecer,
 * e toda tela dela tem o título da página (h1).
 */
const DOTTED_URLS = [
  '/vendas/orcamentos/a.b/composicao',
  '/producao/projetos/a.b',
]

/** As vitrines do /sandbox: o middleware responde "não encontrada" (404). */
const SANDBOX_URLS = [
  '/sandbox/orcamento',
  '/sandbox/fluxo',
  '/sandbox/aproveitamento',
  '/sandbox/tema',
  '/sandbox/estados-de-plano',
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
  test.skip(
    !RUN_BY_FRONTEIRA_CONFIG,
    'Rode pela config da fronteira: npx playwright test -c playwright.fronteira.config.ts',
  )

  for (const url of NOT_FOUND_URLS) {
    test(`${url} responde não encontrada`, async ({ page }) => {
      await expectNotFound(page, url)
    })
  }

  for (const url of DOTTED_URLS) {
    test(`${url} (ponto no segmento) não abre a tela de demonstração`, async ({
      page,
    }) => {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h1')).toHaveCount(0)
      await expect(page.locator('[data-demo]')).toHaveCount(0)
    })
  }

  for (const url of SANDBOX_URLS) {
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

      // Controle positivo: a sessão de teste valeu e a tela real abriu. Sem
      // ele, uma sessão recusada mandaria tudo para o login, e as asserções
      // negativas abaixo passariam em vazio
      expect(new URL(page.url()).pathname, `${url} abriu`).toBe(url)
      await expect(page.locator('aside nav')).toBeVisible()

      const text = await page.locator('body').innerText()
      for (const name of [...EXAMPLE_NAMES, ...DEMO_TEXTS]) {
        expect(text, `"${name}" em ${url}`).not.toContain(name)
      }
      // A raiz das versões de demonstração (caixa, PDV, contas bancárias,
      // folha) leva data-demo: no lugar da tela real, ela aparece mesmo vazia
      await expect(page.locator('[data-demo]')).toHaveCount(0)
    })
  }

  test('o menu não leva a tela de demonstração', async ({ page }) => {
    // Cada visita abre o grupo do menu da rota, onde os itens novos ficariam
    // `shown` é o controle positivo: um item real do mesmo grupo, que tem
    // de estar lá (sem ele, o menu vazio de uma sessão recusada passaria)
    const groups: { path: string; shown: string; hidden: string[] }[] = [
      {
        path: '/producao/agenda-de-entrega',
        shown: '/producao/agenda-de-entrega',
        hidden: [
          '/producao/gerenciador',
          '/producao/projetos',
          '/producao/produtividade',
        ],
      },
      {
        path: '/configuracoes/empresa-e-sistema',
        shown: '/configuracoes/empresa-e-sistema',
        hidden: ['/configuracoes/producao'],
      },
    ]

    for (const group of groups) {
      await page.goto(group.path)
      await page.waitForLoadState('networkidle')
      await expect(
        page.locator(`aside nav a[href="${group.shown}"]`),
      ).toHaveCount(1)
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
    // Precisa de um orçamento real; com a API de mentira não há. As actions
    // dos materiais de exemplo estão cobertas pela checagem estática das
    // guardas (scripts/check-demo-guards.mjs)
    test.skip(STUB_API, 'A API de mentira não tem orçamento em digitação.')

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

    await expect(dialog.getByText('Lona 440', { exact: true })).toHaveCount(0)
    // O item montado na hora também é de demonstração
    await expect(
      dialog.getByRole('button', { name: 'Composição' }),
    ).toHaveCount(0)

    await page.keyboard.press('Escape')
  })
})

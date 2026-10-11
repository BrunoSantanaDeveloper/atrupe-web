import { test, expect, type Page } from '@playwright/test'

// Confere a tela da Base de custos contra o checklist do openspec/design.md (§15).
// Os dados vêm das actions provisórias de src/actions/cost-base.ts.

const BASE = '/base-de-custos'
const ADMIN = `${BASE}/despesas-administrativas`

const TABS = [
  ['Resumo', 'resumo'],
  ['Despesas administrativas', 'despesas-administrativas'],
  ['Mão de obra', 'mao-de-obra'],
  ['Comparativo', 'comparativo'],
  ['Patrimônios', 'patrimonios'],
  ['Distribuição', 'distribuicao'],
  ['Por setor', 'por-setor'],
] as const

// brand-500 do globals.css (design.md §3.1)
const BRAND_500 = 'rgb(9, 146, 96)'

async function openAdminExpenses(page: Page, query = '') {
  await page.goto(`${ADMIN}${query}`)
  await expect(
    page.getByRole('heading', { name: 'Base de custos' }),
  ).toBeVisible()
}

const table = (page: Page) => page.getByRole('table')
const row = (page: Page, name: string) =>
  table(page).getByRole('row').filter({ hasText: name })

test.describe('Base de custos — estrutura (design.md §4, §5.2, §10) @mock', () => {
  test('a rota raiz abre a aba Resumo', async ({ page }) => {
    await page.goto(BASE)
    await expect(page).toHaveURL(new RegExp(`${BASE}/resumo$`))
  })

  test('título em caixa de frase e sete abas como rotas filhas', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    // Cada sub-página tem o próprio título de aba (tipografia-e-hierarquia,
    // hierarquia-de-pagina: "Título do documento").
    await expect(page).toHaveTitle(
      /^Despesas administrativas · Base de custos · Atrupe$/,
    )
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Base de custos',
    )

    const tabs = page.getByRole('tablist').getByRole('tab')
    await expect(tabs).toHaveText(TABS.map(([label]) => label))

    for (const [label, slug] of TABS) {
      await page.getByRole('tab', { name: label }).click()
      await expect(page).toHaveURL(new RegExp(`${BASE}/${slug}$`))
      await expect(page.getByRole('tab', { name: label })).toHaveAttribute(
        'data-state',
        'active',
      )
    }
  })

  test('aba sem tela aprovada explica o motivo', async ({ page }) => {
    await page.goto(`${BASE}/comparativo`)
    await expect(
      page.getByText('Esta aba ainda não tem tela de referência aprovada.'),
    ).toBeVisible()
  })

  test('não há botões de recalcular ou salvar tudo (DC-17)', async ({
    page,
  }) => {
    await openAdminExpenses(page)
    await expect(page.getByRole('button', { name: /recalcular/i })).toHaveCount(
      0,
    )
    await expect(
      page.getByRole('button', { name: /salvar alterações/i }),
    ).toHaveCount(0)
  })
})

test.describe('Despesas administrativas — listagem (design.md §5.1, §6, §7) @mock', () => {
  test('cartões de totais com rótulo e valor', async ({ page }) => {
    await openAdminExpenses(page)

    for (const label of [
      'Contas na base',
      'Por média',
      'Manuais',
      'Custo mensal de referência',
    ]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
    }
    await expect(page.getByText(/^R\$\s?[\d.]+,\d{2}$/).first()).toBeVisible()
  })

  test('cabeçalho da tabela em bg-gray-50 e larguras somando 100%', async ({
    page,
  }) => {
    await openAdminExpenses(page)
    // Espera os dados: o esqueleto de carregamento também tem cabeçalho
    await expect(row(page, 'Aluguel')).toBeVisible()

    const header = table(page).locator('thead tr')
    await expect(header).toHaveClass(/bg-gray-50/)

    const widths = await header
      .locator('th')
      .evaluateAll((cells) =>
        cells.map((cell) =>
          Number(cell.className.match(/w-\[(\d+)%\]/)?.[1] || 0),
        ),
      )
    expect(widths.reduce((sum, width) => sum + width, 0)).toBe(100)
  })

  test('colunas de valor alinhadas à direita, texto à esquerda', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    const align = (name: string) =>
      table(page)
        .getByRole('columnheader', { name })
        .evaluate((cell) => getComputedStyle(cell).textAlign)

    for (const name of [
      'Último mês',
      'Média 3 meses',
      'Média 6 meses',
      'Média 12 meses',
    ]) {
      expect(await align(name)).toBe('right')
    }
    expect(await align('Conta')).not.toBe('right')

    const valueCell = row(page, 'Aluguel').getByRole('cell').nth(1)
    expect(
      await valueCell.evaluate((cell) => getComputedStyle(cell).textAlign),
    ).toBe('right')
  })

  test('valor sem histórico aparece como "-", nunca R$ 0,00', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    // "Sistemas e assinaturas" não tem 6 nem 12 meses de histórico
    const cells = row(page, 'Sistemas e assinaturas').getByRole('cell')
    await expect(cells.nth(3)).toHaveText('-')
    await expect(cells.nth(4)).toHaveText('-')
  })

  test('média do critério em destaque e badge neutro', async ({ page }) => {
    await openAdminExpenses(page)

    const cells = row(page, 'Aluguel').getByRole('cell')
    await expect(cells.nth(3)).toHaveClass(/text-gray-900/) // Média 6 meses
    await expect(cells.nth(1)).not.toHaveClass(/text-gray-900/)

    const badge = cells.nth(5).locator('div, span').first()
    await expect(badge).toHaveText('Média 6 meses')
    await expect(badge).toHaveClass(/bg-gray-100/)
  })

  test('lista plana, sem divisão por grupo e sem paginação', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    // A divisão por grupo saiu: ela repetia a hierarquia do plano de contas
    // (decisão do time em 22/09/2026)
    await expect(page.getByText('Ocupação')).toHaveCount(0)
    await expect(page.getByLabel('Grupo')).toHaveCount(0)

    await expect(page.getByRole('navigation', { name: /pagina/i })).toHaveCount(
      0,
    )
    await expect(page.getByText(/^\d+ contas$/)).toBeVisible()
  })

  test('botões de ícone com aria-label e tooltip do termo', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    await expect(
      page.getByRole('button', { name: 'Editar critério' }).first(),
    ).toBeVisible()

    const info = page.getByRole('button', {
      name: 'O que é o custo mensal de referência',
    })
    await info.hover()
    await expect(page.getByRole('tooltip')).toContainText(
      'base de custos da empresa',
    )
  })

  test('mostra o mês de referência das médias', async ({ page }) => {
    await openAdminExpenses(page)
    await expect(
      page.getByText(/Médias calculadas até \w{3}\/\d{4}/),
    ).toBeVisible()
  })
})

test.describe('Despesas administrativas — filtros na URL (design.md §8) @mock', () => {
  test('filtro de critério grava na URL e filtra a lista', async ({ page }) => {
    await openAdminExpenses(page)

    await page.getByRole('combobox', { name: 'Critério' }).click()
    await page.getByRole('option', { name: 'Manual' }).click()

    await expect(page).toHaveURL(/criterion=MANUAL/)
    await expect(row(page, 'Limpeza')).toBeVisible()
    await expect(row(page, 'Aluguel')).toHaveCount(0)
  })

  test('busca grava na URL', async ({ page }) => {
    await openAdminExpenses(page)

    await page.getByRole('searchbox', { name: 'Buscar' }).fill('energia')
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()

    await expect(page).toHaveURL(/search=energia/)
    await expect(row(page, 'Energia elétrica')).toBeVisible()
    await expect(row(page, 'Aluguel')).toHaveCount(0)
  })

  test('filtro sem resultado usa o estado de busca vazia', async ({ page }) => {
    await openAdminExpenses(page, '?search=nao-existe')
    await expect(
      page.getByRole('button', { name: 'Refazer busca' }),
    ).toBeVisible()
  })
})

test.describe('Despesas administrativas — modal de edição (design.md §5.4, §6.6, §12) @mock', () => {
  test('modal com título, descrição e critérios com valor', async ({
    page,
  }) => {
    await openAdminExpenses(page)

    await row(page, 'Aluguel')
      .getByRole('button', { name: 'Editar critério' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Editar critério' }),
    ).toBeVisible()
    await expect(dialog).toContainText('Aluguel')
    await expect(dialog).toContainText('Média 6 meses')
    await expect(dialog).toContainText('R$ 8.666,67')

    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    const submit = dialog.getByRole('button', { name: 'Salvar critério' })
    expect(
      await submit.evaluate(
        (button) => getComputedStyle(button).backgroundColor,
      ),
    ).toBe(BRAND_500)
  })

  test('critério sem histórico não é oferecido', async ({ page }) => {
    await openAdminExpenses(page)

    await row(page, 'Sistemas e assinaturas')
      .getByRole('button', { name: 'Editar critério' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Média 3 meses')
    await expect(dialog).not.toContainText('Média 6 meses')
    await expect(dialog).not.toContainText('Média 12 meses')
  })

  test('manual exige valor e grava com toast', async ({ page }) => {
    await openAdminExpenses(page)

    await row(page, 'Correios e entregas')
      .getByRole('button', { name: 'Editar critério' })
      .click()
    const dialog = page.getByRole('dialog')

    await dialog.getByRole('radio', { name: /Manual/ }).click()
    await dialog.getByRole('button', { name: 'Salvar critério' }).click()
    await expect(
      dialog.getByText('Informe o valor mensal desta conta'),
    ).toBeVisible()

    await dialog.getByLabel('Valor mensal').fill('12000')
    await dialog.getByRole('button', { name: 'Salvar critério' }).click()

    await expect(page.getByText('Critério atualizado')).toBeVisible()
    await expect(dialog).toBeHidden()
    await expect(row(page, 'Correios e entregas')).toContainText('R$ 120,00')
    await expect(row(page, 'Correios e entregas')).toContainText(
      'Informado manualmente',
    )

    // Devolve a conta ao critério original, para o teste poder rodar de novo
    await row(page, 'Correios e entregas')
      .getByRole('button', { name: 'Editar critério' })
      .click()
    await page
      .getByRole('dialog')
      .getByRole('radio', { name: /Média 6 meses/ })
      .click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Salvar critério' })
      .click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

test.describe('Despesas administrativas — texto e celular (design.md §10, §11) @mock', () => {
  test('sem exclamação nem "com sucesso"', async ({ page }) => {
    await openAdminExpenses(page)
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/!|com sucesso/)
  })

  test('em 390px a página não rola na horizontal; a tabela rola dentro do cartão', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAdminExpenses(page)
    await expect(table(page)).toBeVisible()

    const pageOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    const tableScrolls = await table(page).evaluate((element) => {
      const wrapper = element.parentElement as HTMLElement
      return wrapper.scrollWidth > wrapper.clientWidth
    })
    expect(tableScrolls).toBe(true)
  })
})

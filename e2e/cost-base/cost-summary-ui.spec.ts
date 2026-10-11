import { test, expect, type Page } from '@playwright/test'

// Confere a aba Resumo contra a proposta registrada em
// openspec/regras-de-negocio/areas/05-base-de-custos.md §8 e §8.1.

const ROUTE = '/base-de-custos/resumo'

async function openSummary(page: Page) {
  await page.goto(ROUTE)
  await expect(page.getByText('Custo mensal de referência')).toBeVisible()
}

test.describe('Resumo — conteúdo @mock', () => {
  test('mostra o total, o mês das médias e o aviso da depreciação', async ({
    page,
  }) => {
    await openSummary(page)

    await expect(page.getByText(/Médias calculadas até/)).toBeVisible()
    await expect(page.getByText(/inclui depreciação/)).toBeVisible()
  })

  test('tem um cartão por origem, cada um levando à sua aba', async ({
    page,
  }) => {
    await openSummary(page)

    const origins: [string, string][] = [
      ['Despesas administrativas', '/base-de-custos/despesas-administrativas'],
      ['Mão de obra', '/base-de-custos/mao-de-obra'],
      ['Custos de patrimônios', '/base-de-custos/patrimonios'],
      ['Depreciação', '/base-de-custos/patrimonios'],
    ]

    for (const [label, href] of origins) {
      const card = page.getByRole('link', { name: new RegExp(label) }).first()
      await expect(card).toHaveAttribute('href', href)
    }
  })

  test('o custo por setor aparece em barras, do maior para o menor', async ({
    page,
  }) => {
    await openSummary(page)

    const bars = page.getByRole('img')
    await expect(bars.first()).toBeVisible()

    // Administração é o maior custo da base de exemplo
    await expect(bars.first()).toHaveAttribute('aria-label', /Administração/)
  })

  test('separa estrutura produtiva e administrativa (custo puro)', async ({
    page,
  }) => {
    await openSummary(page)

    await expect(page.getByText('Estrutura produtiva')).toBeVisible()
    await expect(page.getByText('Estrutura administrativa')).toBeVisible()
    await expect(
      page.getByText('Nenhum custo administrativo está sendo distribuído'),
    ).toBeVisible()
  })
})

test.describe('Resumo — padrões da interface @mock', () => {
  test('funciona em 390px, sem rolagem horizontal da página', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openSummary(page)

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})

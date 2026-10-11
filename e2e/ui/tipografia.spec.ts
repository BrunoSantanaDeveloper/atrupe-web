import { test, expect, type Locator } from '@playwright/test'

// Papéis tipográficos e tabela (design/openspec/changes/tipografia-e-hierarquia).
// Usa a vitrine /sandbox/tipografia, que não depende de dados da conta.

async function style(locator: Locator) {
  return locator.evaluate((el) => {
    const c = getComputedStyle(el)
    return {
      fontSize: c.fontSize,
      lineHeight: c.lineHeight,
      fontWeight: c.fontWeight,
      textTransform: c.textTransform,
      fontVariantNumeric: c.fontVariantNumeric,
      textAlign: c.textAlign,
    }
  })
}

test.describe('Papéis tipográficos @mock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sandbox/tipografia')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('título da página é o maior texto e o único h1', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await style(page.locator('h1'))).toMatchObject({
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '600',
    })
  })

  test('KPI é tabular e maior que o rótulo', async ({ page }) => {
    const value = await style(page.locator('.type-kpi-value').first())
    const label = await style(page.locator('.type-kpi-label').first())
    expect(value.fontSize).toBe('24px')
    expect(value.fontVariantNumeric).toContain('tabular-nums')
    expect(label.fontSize).toBe('14px')
  })

  test('caixa alta só no eyebrow', async ({ page }) => {
    expect(
      (await style(page.locator('.type-eyebrow').first())).textTransform,
    ).toBe('uppercase')
    const uppercaseOutsideEyebrow = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('main *')).filter(
          (el) =>
            getComputedStyle(el).textTransform === 'uppercase' &&
            !el.closest('.type-eyebrow, .type-nav-group'),
        ).length,
    )
    expect(uppercaseOutsideEyebrow).toBe(0)
  })

  test('nenhum texto abaixo de 12 px', async ({ page }) => {
    const sizes = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main *'))
        .filter((el) =>
          Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          ),
        )
        .map((el) => parseFloat(getComputedStyle(el).fontSize)),
    )
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12)
  })
})

test.describe('Tabela @mock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sandbox/tipografia')
  })

  test('linha de grupo ocupa as colunas do cabeçalho', async ({ page }) => {
    const table = page.locator('table').first()
    const columns = await table.locator('thead th').count()
    await expect(
      table.locator('tbody th[scope=colgroup]').first(),
    ).toHaveAttribute('colspan', String(columns))
  })

  test('sem cabeçalho, a linha de grupo mede as linhas de dado', async ({
    page,
  }) => {
    const table = page.getByTestId('tabela-sem-cabecalho')
    await expect(table.locator('th[scope=colgroup]')).toHaveAttribute(
      'colspan',
      '2',
    )
  })

  test('coluna numérica alinha à direita com numerais tabulares', async ({
    page,
  }) => {
    const cell = page.locator('table').first().locator('tbody td').nth(2)
    const s = await style(cell)
    expect(s.textAlign).toBe('right')
    expect(s.fontVariantNumeric).toContain('tabular-nums')
    expect(
      await style(page.locator('table').first().locator('thead th').nth(2)),
    ).toMatchObject({
      textAlign: 'right',
    })
  })
})

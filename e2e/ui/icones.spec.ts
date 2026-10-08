import { test, expect, type Locator } from '@playwright/test'

// Ícones (design/openspec/changes/icones). Usa a vitrine /sandbox/icones,
// que não depende de dados da conta.

async function box(locator: Locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return {
      width: Math.round(r.width),
      height: Math.round(r.height),
      stroke: el.getAttribute('stroke-width'),
    }
  })
}

test.describe('Ícones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sandbox/icones')
    await expect(page.locator('h1')).toHaveText('Ícones')
  })

  test('três tamanhos: 16, 20 e 24 px, traço 1,5 no grande', async ({
    page,
  }) => {
    const rows = page.locator('[data-vitrine="tamanhos"] [data-icon-size]')
    await expect(rows).toHaveCount(3)
    // Valores fixos: comparar com ICON_SIZE seria comparar a constante com
    // ela mesma
    const sizes = [16, 20, 24]
    const all = await rows.all()
    for (let i = 0; i < all.length; i++) {
      const row = all[i]
      const expected = sizes[i]
      const svg = await box(row.locator('svg'))
      expect(svg.width).toBe(expected)
      expect(svg.height).toBe(expected)
      expect(svg.stroke).toBe(expected === 24 ? '1.5' : '2')
    }
  })

  test('o botão dá ao ícone o próprio tamanho', async ({ page }) => {
    const small = page.getByRole('button', { name: 'Novo', exact: true })
    const medium = page.getByRole('button', { name: 'Novo orçamento' })
    expect((await box(small.locator('svg'))).width).toBe(16)
    expect((await box(medium.locator('svg'))).width).toBe(20)
  })

  test('ícone decorativo fica oculto do leitor de tela', async ({ page }) => {
    const svgs = page.locator('[data-vitrine="dicionario"] svg')
    expect(await svgs.count()).toBeGreaterThan(20)
    for (const svg of await svgs.all())
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  test('botão só com ícone tem nome', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Editar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Excluir' })).toBeVisible()
  })

  test('ver é olho e buscar é lupa', async ({ page }) => {
    const glyph = (gesto: string) =>
      page
        .locator('[data-vitrine="dicionario"] li')
        .filter({ hasText: new RegExp(`^${gesto}$`) })
        .locator('svg')
    await expect(glyph('ver')).toHaveClass(/tabler-icon-eye\b/)
    await expect(glyph('buscar')).toHaveClass(/tabler-icon-search\b/)
    await expect(glyph('excluir')).toHaveClass(/tabler-icon-trash\b/)
    await expect(glyph('inativar')).toHaveClass(/tabler-icon-ban\b/)
  })

  test('ícone em destaque: círculo de 32/40/48 com ícone de 16/20/24', async ({
    page,
  }) => {
    const pairs: [number, number][] = [
      [32, 16],
      [40, 20],
      [48, 24],
    ]
    const circles = page.locator('[data-slot="featured-icon"]')
    for (const [outer, inner] of pairs) {
      const sized = circles.filter({
        has: page.locator(`svg[width="${inner}"]`),
      })
      const first = sized.first()
      const b = await box(first)
      expect(b.width).toBe(outer)
      expect(b.height).toBe(outer)
      expect(
        await first.evaluate((el) => getComputedStyle(el).borderRadius),
      ).toBe('9999px')
    }
  })

  test('nenhum ícone do Lucide na página', async ({ page }) => {
    await expect(page.locator('svg.lucide')).toHaveCount(0)
  })

  test('logo tem nome para leitor de tela', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: 'Banco do Brasil' }),
    ).toBeVisible()
    await expect(page.getByRole('img', { name: 'Pix' })).toBeVisible()
  })
})

import { test, expect, type Page } from '@playwright/test'

// Tema claro/escuro — design/openspec/changes/tema-claro-escuro
// Roda na página de login (pública): a escolha de tema vale sem sessão.

const STORAGE_KEY = 'atrupe-tema'
const LOGIN = '/login'

test.use({ storageState: { cookies: [], origins: [] } })

const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'))

test.describe('Preferência de tema', () => {
  test('sem escolha salva, segue o sistema (escuro)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(LOGIN)
    expect(await isDark(page)).toBe(true)
  })

  test('sem escolha salva, segue o sistema (claro)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(LOGIN)
    expect(await isDark(page)).toBe(false)
  })

  test('Escuro salvo sobrevive ao recarregar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(LOGIN)
    await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY)
    await page.reload()
    expect(await isDark(page)).toBe(true)
  })

  test('Claro escolhido ignora o sistema escuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(LOGIN)
    await page.evaluate(
      (key) => localStorage.setItem(key, 'light'),
      STORAGE_KEY,
    )
    await page.reload()
    expect(await isDark(page)).toBe(false)

    // Escolha fixa não acompanha o sistema
    await page.emulateMedia({ colorScheme: 'light' })
    await page.emulateMedia({ colorScheme: 'dark' })
    expect(await isDark(page)).toBe(false)
  })

  test('Sistema acompanha a troca do sistema sem recarregar', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(LOGIN)
    await page.evaluate(
      (key) => localStorage.setItem(key, 'system'),
      STORAGE_KEY,
    )
    await page.reload()
    expect(await isDark(page)).toBe(false)

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(() => isDark(page)).toBe(true)
  })

  test('troca numa aba vale na outra aba', async ({ context }) => {
    const first = await context.newPage()
    const second = await context.newPage()
    await first.emulateMedia({ colorScheme: 'light' })
    await second.emulateMedia({ colorScheme: 'light' })
    await first.goto(LOGIN)
    await second.goto(LOGIN)
    expect(await isDark(second)).toBe(false)

    await first.evaluate(
      (key) => localStorage.setItem(key, 'dark'),
      STORAGE_KEY,
    )
    await expect.poll(() => isDark(second)).toBe(true)
  })

  test('carrega já no tema escolhido, sem quadro claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(LOGIN)
    await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY)

    // Registra a classe e o fundo no primeiro quadro com conteúdo: o callback
    // do requestAnimationFrame roda logo antes de o navegador pintar. Quadros
    // sem <body> (HTML ainda chegando, comum no next dev frio) não pintam nada
    // e vêm antes do script do next-themes, então são ignorados.
    await page.addInitScript(() => {
      const sample = () => {
        if (!document.body) return requestAnimationFrame(sample)
        ;(window as unknown as { __firstFrame: unknown }).__firstFrame = {
          dark: document.documentElement.classList.contains('dark'),
          background: getComputedStyle(document.body).backgroundColor,
        }
      }
      requestAnimationFrame(sample)
    })
    await page.reload()

    const first = (await page.evaluate(
      () => (window as unknown as { __firstFrame: unknown }).__firstFrame,
    )) as { dark: boolean; background: string }
    expect(first.dark).toBe(true)
    // Fundo já escuro no primeiro quadro (cada canal abaixo de 64: nada claro)
    const channels = (first.background.match(/\d+/g) ?? []).map(Number)
    expect(Math.max(...channels.slice(0, 3))).toBeLessThan(64)
  })
})

test.describe('Tema escuro: contraste dos tokens', () => {
  type Rgb = [number, number, number]

  const luminance = ([r, g, b]: Rgb) => {
    const [R, G, B] = [r, g, b].map((v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * R + 0.7152 * G + 0.0722 * B
  }
  const contrast = (a: Rgb, b: Rgb) => {
    const [x, y] = [luminance(a), luminance(b)]
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
  }

  test('textos, primária e foco atendem os mínimos', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(LOGIN)
    expect(await isDark(page)).toBe(true)

    // Lê os tokens já resolvidos pelo navegador (com .dark aplicado)
    const tokens = await page.evaluate(() => {
      const names = [
        'surface',
        'surface-raised',
        'on-primary',
        'gray-300-bg',
        'gray-200-bg',
        'gray-25',
        'gray-50',
        'gray-100',
        'gray-300',
        'gray-400',
        'gray-500',
        'gray-600',
        'gray-700',
        'gray-800',
        'gray-900',
        'brand-300',
        'brand-600',
        'error-600',
        'brand-primary',
        'brand-primary-hover',
        'brand-primary-active',
      ]
      const probe = document.createElement('div')
      document.body.appendChild(probe)
      const out: Record<string, number[]> = {}
      for (const name of names) {
        probe.style.color = `var(--${name})`
        const rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) ?? []
        out[name] = rgb.slice(0, 3).map(Number)
      }
      probe.remove()
      return out
    })
    const t = (name: string) => tokens[name] as Rgb
    const surfaces = ['surface', 'surface-raised', 'gray-50', 'gray-100']

    // Menos luz, mesma ordem: trilho < página < hover < sutil < cartão < camada sobreposta
    const levels = [
      'gray-300-bg',
      'gray-200-bg',
      'gray-100',
      'gray-50',
      'gray-25',
      'surface',
      'surface-raised',
    ]
    for (let i = 1; i < levels.length; i++)
      expect(
        luminance(t(levels[i])),
        `${levels[i]} mais claro que ${levels[i - 1]}`,
      ).toBeGreaterThan(luminance(t(levels[i - 1])))
    expect(
      contrast(t('surface'), t('gray-100')),
      'cartão vs página',
    ).toBeGreaterThanOrEqual(1.1)
    expect(
      contrast(t('surface-raised'), t('surface')),
      'camada vs cartão',
    ).toBeGreaterThanOrEqual(1.1)

    // Texto principal e secundário ≥ 4,5:1; apoio e exemplo ≥ 3:1
    for (const bg of surfaces) {
      for (const text of ['gray-900', 'gray-800', 'gray-700', 'gray-600'])
        expect(
          contrast(t(text), t(bg)),
          `${text} sobre ${bg}`,
        ).toBeGreaterThanOrEqual(4.5)
      for (const text of ['gray-500', 'gray-400'])
        expect(
          contrast(t(text), t(bg)),
          `${text} sobre ${bg}`,
        ).toBeGreaterThanOrEqual(3)
    }

    // Texto colorido sobre a superfície
    for (const text of ['brand-600', 'error-600'])
      expect(contrast(t(text), t('surface')), text).toBeGreaterThanOrEqual(4.5)

    // Primária iluminada: mais clara que o cartão, tinta escura ≥ 4,5:1,
    // destaque ≥ 3:1; o mouse acrescenta luz
    for (const state of [
      'brand-primary',
      'brand-primary-hover',
      'brand-primary-active',
    ]) {
      expect(
        contrast(t('on-primary'), t(state)),
        `tinta sobre ${state}`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(t(state), t('surface')),
        `${state} sobre o cartão`,
      ).toBeGreaterThanOrEqual(3)
      expect(
        luminance(t(state)),
        `${state} mais clara que o cartão`,
      ).toBeGreaterThan(luminance(t('surface')))
    }
    expect(luminance(t('brand-primary-hover'))).toBeGreaterThan(
      luminance(t('brand-primary')),
    )

    // Hierarquia: principal > secundário > apoio > exemplo
    const order = ['gray-900', 'gray-700', 'gray-500', 'gray-400']
    for (let i = 1; i < order.length; i++)
      expect(contrast(t(order[i - 1]), t('surface'))).toBeGreaterThan(
        contrast(t(order[i]), t('surface')),
      )

    // Borda de foco perceptível
    expect(contrast(t('brand-300'), t('surface'))).toBeGreaterThanOrEqual(3)
  })
})

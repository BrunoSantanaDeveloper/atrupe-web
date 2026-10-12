import { test, expect } from '@playwright/test'

// Confere a composição contra a documentação funcional §9 e §10 e as decisões
// DC-2, DC-14, DC-15, P-16, P-18 e MT-5.

const PRODUCTS = '/configuracoes/produtos'
// A composição vive dentro do produto, sem cadastro paralelo (CP-17)
const composition = (id: string) => `${PRODUCTS}/${id}/composicao`

// Os processos já leem a API: o e2e deles está em e2e/processes

test.describe('Composições — produto do START com custo (DC-2, DC-15) @mock', () => {
  test('a lista de produtos abre a composição de cada produto', async ({
    page,
  }) => {
    await page.goto(PRODUCTS)

    // Não existe mais aba "Composições": a composição é ação da linha (CP-17)
    await expect(page.getByRole('tab', { name: 'Composições' })).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: /Composição de/ }).first(),
    ).toBeVisible()
  })

  test('a página mostra as etapas e permite adotar o preço sugerido', async ({
    page,
  }) => {
    await page.goto(composition('banner'))

    await expect(page.getByText('Etapas de produção')).toBeVisible()
    await expect(page.getByText('Impressão em lona')).toBeVisible()
    await expect(page.getByText('Tempo total previsto: 20 min')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Adotar preço sugerido' }),
    ).toBeEnabled()
  })

  test('produto sem composição explica que continua sendo vendido', async ({
    page,
  }) => {
    await page.goto(composition('adesivo'))

    await expect(
      page.getByText(/continua sendo\s+vendido normalmente/),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Adotar preço sugerido' }),
    ).toBeDisabled()
  })
})

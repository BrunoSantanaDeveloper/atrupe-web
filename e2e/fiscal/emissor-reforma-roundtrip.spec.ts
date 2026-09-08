import { test, expect } from '@playwright/test'

import {
  createEmissor,
  createFiscalApiClient,
  deleteEmissor,
  getEmissor,
  updateEmissor,
  type FiscalApiClient,
} from '../helpers/fiscal-api'

/**
 * Round-trip dos campos da aba Reforma e do NCM padrão pela API real.
 *
 * Em 04/09/2026 o cliente configurou cIndOp e regime IBS/CBS, salvou e, ao
 * reabrir, viu tudo vazio. O backend gravava e devolvia; a perda estava no
 * frontend. Este contrato garante que a API continue gravando, devolvendo e
 * distinguindo "não mexer" (PATCH parcial) de "limpar" (''/null) — a metade
 * que dá para provar sem tela.
 */
test.describe('Emissor — campos da Reforma e NCM padrão (contrato da API)', () => {
  let client: FiscalApiClient | null = null
  const createdIds: string[] = []

  test.beforeAll(async () => {
    try {
      client = await createFiscalApiClient()
    } catch (err) {
      console.warn(`[emissor-reforma] fixture indisponível: ${err}`)
      client = null
    }
  })

  test.afterAll(async () => {
    if (client) {
      for (const id of createdIds) await deleteEmissor(client, id)
      await client.dispose()
    }
  })

  test('PATCH grava e GET devolve cIndOp, regime IBS/CBS, NCM padrão e alíquota CBS', async () => {
    test.skip(!client, 'Fixture de API indisponível neste ambiente')
    const { id } = await createEmissor(client!, `E2E Reforma ${Date.now()}`)
    createdIds.push(id)

    const patch = await updateEmissor(client!, id, {
      indicadorOperacaoNfse: '100301',
      regApIbsCbsSn: 2,
      defaultNcm: '49111010',
      aliquotaCbs: 0.9,
    })
    expect(patch.ok, JSON.stringify(patch.body)).toBe(true)

    const emissor = await getEmissor(client!, id)
    expect(emissor.indicadorOperacaoNfse).toBe('100301')
    expect(emissor.regApIbsCbsSn).toBe(2)
    expect(emissor.defaultNcm).toBe('49111010')
    expect(emissor.aliquotaCbs).toBe(0.9)
  })

  test('PATCH parcial preserva os campos; vazio e null limpam', async () => {
    test.skip(!client, 'Fixture de API indisponível neste ambiente')
    const nome = `E2E Reforma parcial ${Date.now()}`
    const { id } = await createEmissor(client!, nome)
    createdIds.push(id)

    await updateEmissor(client!, id, {
      indicadorOperacaoNfse: '100301',
      regApIbsCbsSn: 2,
    })

    // Só o nome: é o PATCH que o modal manda quando o usuário mexe em outra
    // aba. Não pode apagar o que está gravado.
    const parcial = await updateEmissor(client!, id, { name: `${nome} v2` })
    expect(parcial.ok, JSON.stringify(parcial.body)).toBe(true)
    const depoisDoParcial = await getEmissor(client!, id)
    expect(depoisDoParcial.indicadorOperacaoNfse).toBe('100301')
    expect(depoisDoParcial.regApIbsCbsSn).toBe(2)

    // Limpeza explícita: '' no texto e null no select.
    const limpeza = await updateEmissor(client!, id, {
      indicadorOperacaoNfse: '',
      regApIbsCbsSn: null,
    })
    expect(limpeza.ok, JSON.stringify(limpeza.body)).toBe(true)
    const depoisDaLimpeza = await getEmissor(client!, id)
    expect(depoisDaLimpeza.indicadorOperacaoNfse).toBeNull()
    expect(depoisDaLimpeza.regApIbsCbsSn).toBeNull()
  })
})

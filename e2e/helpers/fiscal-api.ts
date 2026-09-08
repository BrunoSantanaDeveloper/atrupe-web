import { request, type APIRequestContext } from '@playwright/test'

import { getTestCredentials } from './credentials'

/**
 * Fixture helper para semear/limpar estado fiscal real no backend durante os
 * testes e2e (Plano 4). Autentica direto na API (JWT) e expõe operações de
 * emissor por ambiente.
 *
 * Requer:
 *  - E2E_API_URL  → base da API (fallback: https://dev.atrupe.com.br)
 *  - E2E_USER_EMAIL / E2E_USER_PASSWORD (mesmos do global-setup)
 *
 * Observação: estados que exigem autorização real no Invoicy/SEFAZ
 * (readiness `ready === true`, ativação bem-sucedida) NÃO são semeáveis sem
 * certificado e CSC reais de homologação — esses cenários permanecem fora do
 * alcance determinístico desta fixture.
 */

const API_URL = process.env.E2E_API_URL ?? 'https://dev.atrupe.com.br'

export type FiscalEnv = 'HOMOLOGACAO' | 'PRODUCAO'

export interface FiscalApiClient {
  ctx: APIRequestContext
  token: string
  dispose: () => Promise<void>
}

export async function createFiscalApiClient(): Promise<FiscalApiClient> {
  const { email, password } = getTestCredentials()

  const ctx = await request.newContext({ baseURL: API_URL })
  const res = await ctx.post('/auth/login', {
    data: { username: email, password },
  })
  if (!res.ok()) {
    await ctx.dispose()
    throw new Error(
      `[fiscal-api] login falhou (${res.status()}) em ${API_URL}/auth/login`,
    )
  }
  const body = await res.json()
  const token: string | undefined = body?.access_token
  if (!token) {
    await ctx.dispose()
    throw new Error('[fiscal-api] resposta de login sem access_token')
  }
  return { ctx, token, dispose: () => ctx.dispose() }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/** Cria um emissor com nome único e retorna o registro criado. */
export async function createEmissor(
  client: FiscalApiClient,
  name: string,
): Promise<{ id: string }> {
  const res = await client.ctx.post('/fiscal/emissores', {
    headers: authHeaders(client.token),
    data: { name },
  })
  if (!res.ok()) {
    throw new Error(`[fiscal-api] criar emissor falhou (${res.status()})`)
  }
  const body = await res.json()
  const id = body?.id ?? body?.data?.id
  if (!id) throw new Error('[fiscal-api] criação de emissor sem id')
  return { id }
}

export async function getEmissor(client: FiscalApiClient, id: string) {
  const res = await client.ctx.get(`/fiscal/emissores/${id}`, {
    headers: authHeaders(client.token),
  })
  if (!res.ok()) {
    throw new Error(`[fiscal-api] obter emissor falhou (${res.status()})`)
  }
  return res.json()
}

export async function setNumbering(
  client: FiscalApiClient,
  id: string,
  environment: FiscalEnv,
  nfceSeries: number,
  nfceNextNumber: number,
) {
  const res = await client.ctx.patch(
    `/fiscal/emissores/${id}/environments/${environment}/numbering`,
    {
      headers: authHeaders(client.token),
      data: { nfceSeries, nfceNextNumber },
    },
  )
  return { status: res.status(), ok: res.ok() }
}

export async function getReadiness(
  client: FiscalApiClient,
  id: string,
  environment: FiscalEnv,
) {
  const res = await client.ctx.get(
    `/fiscal/emissores/${id}/environments/${environment}/readiness`,
    { headers: authHeaders(client.token) },
  )
  if (!res.ok()) {
    throw new Error(`[fiscal-api] readiness falhou (${res.status()})`)
  }
  return res.json()
}

/** PATCH genérico do emissor; devolve status e corpo para asserções de contrato. */
export async function updateEmissor(
  client: FiscalApiClient,
  id: string,
  data: Record<string, unknown>,
) {
  const res = await client.ctx.patch(`/fiscal/emissores/${id}`, {
    headers: authHeaders(client.token),
    data,
  })
  const body = await res.json().catch(() => null)
  return { status: res.status(), ok: res.ok(), body }
}

export async function deleteEmissor(client: FiscalApiClient, id: string) {
  await client.ctx
    .delete(`/fiscal/emissores/${id}`, { headers: authHeaders(client.token) })
    .catch(() => undefined)
}

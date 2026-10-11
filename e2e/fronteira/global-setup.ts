import fs from 'node:fs'
import path from 'node:path'
import { encode } from 'next-auth/jwt'

import { FEATURES } from '../../src/consts/features'

/** Onde a sessão de teste da fronteira é gravada. */
export const FRONTEIRA_STATE = './e2e/.auth/fronteira-full.json'

/** Todas as chaves de plano de FEATURES (o plano mais alto, e mais). */
function allFeatureKeys(node: unknown, keys: string[] = []): string[] {
  if (typeof node === 'string') keys.push(node)
  else if (node && typeof node === 'object') {
    for (const value of Object.values(node)) allFeatureKeys(value, keys)
  }
  return keys
}

/**
 * Gera a sessão da suíte da fronteira sem passar pela tela de login: um
 * administrador titular com todas as chaves de plano. Com todas as chaves, o
 * menu mostraria qualquer item de demonstração que perdesse o `demo: true`,
 * e a suíte pega. A sessão vale só para o build local, assinado com o
 * AUTH_SECRET desta execução.
 */
export default async function globalSetup() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error(
      '[fronteira] AUTH_SECRET não definido: use o mesmo valor do build e do next start.',
    )
  }

  const baseURL = new URL(
    `http://localhost:${process.env.FRONTEIRA_PORT || 3100}`,
  )
  const features = Array.from(
    new Set([...allFeatureKeys(FEATURES), 'nota_fiscal']),
  )

  const token = {
    id: 'fronteira-admin',
    name: 'Fronteira',
    email: 'fronteira@exemplo.invalid',
    role: 'Admin',
    isAdmin: true,
    isSystemAdmin: false,
    permissions: ['values:values:view'],
    companyId: 'fronteira-empresa',
    companyName: 'Empresa da fronteira',
    subscription: 'FULL',
    subscriptionActive: true,
    features,
    limits: { max_users: -1 },
    blockLevel: 'NONE',
    accessToken: 'fronteira',
    sessionId: 'fronteira',
    isOwner: true,
  }

  // Em http, o cookie da sessão do Auth.js é o sem prefixo __Secure-
  const cookieName = 'authjs.session-token'
  const value = await encode({ token, secret, salt: cookieName })

  fs.mkdirSync(path.dirname(FRONTEIRA_STATE), { recursive: true })
  fs.writeFileSync(
    FRONTEIRA_STATE,
    JSON.stringify(
      {
        cookies: [
          {
            name: cookieName,
            value,
            domain: baseURL.hostname,
            path: '/',
            expires: Math.floor(new Date().getTime() / 1000) + 4 * 60 * 60,
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
          },
        ],
        origins: [],
      },
      null,
      1,
    ),
  )
}

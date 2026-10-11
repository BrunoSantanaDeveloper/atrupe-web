/**
 * Credenciais das contas usadas pelos testes e2e.
 *
 * Lidas exclusivamente do ambiente — sem fallback literal no repositório.
 * Um fallback hardcoded acaba versionado no histórico do git e continua válido
 * mesmo depois de rotacionado, então a ausência da variável é erro explícito.
 *
 * Local: defina em `.env` (ver `.env.example`).
 * CI: secrets `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` (ver `.github/workflows/e2e.yml`).
 *
 * Contas por plano (camada de planos): `E2E_<PLANO>_EMAIL` e
 * `E2E_<PLANO>_PASSWORD` (ex.: `E2E_LITE_EMAIL`). São opcionais: sem a
 * credencial de um plano, os testes daquele plano são pulados.
 */

function requiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `[E2E] A variável de ambiente ${name} é obrigatória e não foi definida. ` +
        `Defina-a no .env local (ver .env.example) ou nos secrets do GitHub Actions.`,
    )
  }

  return value
}

/** Os planos com conta de teste. O TRIAL tem composição editável à parte. */
export const TEST_PLANS = [
  'TRIAL',
  'START',
  'LITE',
  'PRO',
  'ELITE',
  'FULL',
] as const
export type TestPlan = (typeof TEST_PLANS)[number]

export interface TestCredentials {
  email: string
  password: string
}

/**
 * Sem plano, a conta padrão (obrigatória). Com o plano, a conta daquele
 * plano, ou `null` quando a credencial não foi definida.
 */
export function getTestCredentials(): TestCredentials
export function getTestCredentials(plan: TestPlan): TestCredentials | null
export function getTestCredentials(plan?: TestPlan): TestCredentials | null {
  if (!plan) {
    return {
      email: requiredEnv('E2E_USER_EMAIL'),
      password: requiredEnv('E2E_USER_PASSWORD'),
    }
  }

  const email = process.env[`E2E_${plan}_EMAIL`]
  const password = process.env[`E2E_${plan}_PASSWORD`]
  return email && password ? { email, password } : null
}

export const hasTestCredentials = (plan: TestPlan) =>
  getTestCredentials(plan) !== null

/** Onde o global-setup grava a sessão da conta do plano. */
export const planStorageState = (plan: TestPlan) =>
  `./e2e/.auth/${plan.toLowerCase()}.json`

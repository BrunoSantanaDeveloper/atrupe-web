/**
 * Credenciais da conta usada pelos testes e2e.
 *
 * Lidas exclusivamente do ambiente — sem fallback literal no repositório.
 * Um fallback hardcoded acaba versionado no histórico do git e continua válido
 * mesmo depois de rotacionado, então a ausência da variável é erro explícito.
 *
 * Local: defina em `.env` (ver `.env.example`).
 * CI: secrets `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` (ver `.github/workflows/e2e.yml`).
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

export function getTestCredentials(): { email: string; password: string } {
  return {
    email: requiredEnv('E2E_USER_EMAIL'),
    password: requiredEnv('E2E_USER_PASSWORD'),
  }
}

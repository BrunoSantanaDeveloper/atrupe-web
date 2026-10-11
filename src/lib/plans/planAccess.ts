/**
 * Regras de acesso por plano que o front repete em mais de uma tela.
 */

/** Só o titular contrata: quem não é titular lê a quem pedir. */
export const ASK_PRINCIPAL_ADMIN = 'Peça ao administrador principal da conta.'

/**
 * O limite de usuários da sessão (`max_users`, já com os usuários
 * adicionais). `null` = sem limite: a chave ausente e o -1 (ilimitado), a
 * mesma regra do servidor.
 */
export function getUserLimit(
  limits?: Record<string, number> | null,
): number | null {
  const value = limits?.max_users
  if (typeof value !== 'number' || value === -1) return null
  return value
}

/** O plano dá acesso a usuários: só o limite 0 esconde a tela e a permissão. */
export function planAllowsUsers(limits?: Record<string, number> | null) {
  const limit = getUserLimit(limits)
  return limit === null || limit > 0
}

/** A cota de usuários com acesso está cheia (-1 e nulo nunca enchem). */
export function isUsersQuotaFull(
  quota?: { used: number; limit: number | null } | null,
) {
  if (!quota || quota.limit === null || quota.limit === -1) return false
  return quota.used >= quota.limit
}

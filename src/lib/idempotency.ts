/**
 * Gera uma chave de idempotência única baseada em UUID v4
 * Esta chave deve ser incluída no header 'idempotency-key' para prevenir duplicação de requisições
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${crypto.randomUUID()}`
}

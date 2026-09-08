/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mensagem legível a partir do corpo de erro da API.
 *
 * O HttpExceptionFilter do backend responde `{ statusCode, timestamp, path,
 * userMessage }` — não existe `message` na raiz — e o 400 do class-validator
 * traz `userMessage.message` como array. Quem lia `data.message` direto
 * mostrava "Erro desconhecido." ou o array cru.
 */
export function extractApiErrorMessage(payload: any): string {
  const userMessage = payload?.userMessage
  const message =
    userMessage?.message ||
    payload?.message ||
    payload?.data?.message ||
    payload?.data?.error ||
    userMessage

  return Array.isArray(message)
    ? message[0]
    : typeof message === 'string'
      ? message
      : 'Erro desconhecido.'
}

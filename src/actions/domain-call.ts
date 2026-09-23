/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import apiInstance from '@/lib/api'
import type { CheckoutActionResult } from '@/types/checkout'

/**
 * Chamadas ao backend que preservam o CÓDIGO de domínio do erro
 * (PRICE_CHANGED, OPEN_CHARGE, EMAIL_HAS_ACCOUNT...), que as telas usam para
 * decidir o que fazer. Usado pelas ações da contratação e da transferência de
 * titularidade; só roda no servidor (as ações o importam).
 */
export async function domainCall<T>(
  request: (
    api: Awaited<ReturnType<typeof apiInstance>>,
  ) => Promise<{ data: T }>,
): Promise<CheckoutActionResult<T>> {
  try {
    const res = await request(await apiInstance())
    return { success: true, data: res.data }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const payload = error?.response?.data
    const userMessage = payload?.userMessage
    const body =
      userMessage && typeof userMessage === 'object' ? userMessage : {}
    const rawMessage =
      typeof userMessage === 'string' ? userMessage : body.message
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code, message: _ignored, statusCode, error: _e, ...details } = body

    return {
      success: false,
      status: error?.response?.status,
      code,
      message: message || 'Não foi possível concluir agora. Tente novamente.',
      details,
    }
  }
}

/**
 * O IP e o navegador de quem aceita: sem isso, o aceite registraria o IP do
 * servidor do frontend.
 */
export async function clientMeta(): Promise<Record<string, string>> {
  const h = headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || ''
  const userAgent = h.get('user-agent') || ''
  return {
    ...(ip ? { 'x-user-ip': ip } : {}),
    ...(userAgent ? { 'x-user-agent': userAgent } : {}),
  }
}

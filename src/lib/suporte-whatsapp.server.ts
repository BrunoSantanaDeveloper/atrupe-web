import { SUPORTE_WHATSAPP_TAG } from './suporte-whatsapp'

/**
 * O número do WhatsApp do suporte escolhido em Super Admin › Atendimento ›
 * WhatsApp, só com os dígitos. A rota da API não pede sessão, porque também
 * serve à página de senha. Sem o cliente de lib/api, que leva a /logout
 * quando a API não responde. O Next guarda o número por 5 minutos, e a troca
 * no superadmin limpa o cache na hora. Devolve null quando o atendimento não
 * tem número; aí as telas escondem o contato.
 */
export async function buscarNumeroDoSuporte(): Promise<string | null> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/atendimento/contato`, {
      next: { revalidate: 300, tags: [SUPORTE_WHATSAPP_TAG] },
    })
    if (!res.ok) return null
    const body = (await res.json()) as { whatsapp?: unknown }
    return typeof body.whatsapp === 'string' &&
      /^\d{10,15}$/.test(body.whatsapp)
      ? body.whatsapp
      : null
  } catch {
    return null
  }
}

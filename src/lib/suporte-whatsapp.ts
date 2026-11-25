/**
 * Etiqueta do cache do Next para o número do suporte. O repasse das telas do
 * atendimento limpa o cache quando o superadmin troca ou tira um número.
 */
export const SUPORTE_WHATSAPP_TAG = 'suporte-whatsapp'

/** O link que abre a conversa com o suporte no WhatsApp, com a mensagem já escrita. */
export function linkDoSuporte(numero: string, texto?: string) {
  const base = `https://wa.me/${numero}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

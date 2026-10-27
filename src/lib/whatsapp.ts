// "Chamar no WhatsApp" (CRM-3, CRM-5, 27/10/2026): abre o aplicativo com o
// telefone do cliente e a mensagem do modelo preenchida. Sem integração: o
// vendedor lê, ajusta se quiser e envia.

export type TemplateVars = {
  cliente?: string | null
  numero?: string | null
  valor?: string | null
  validade?: string | null
  vendedor?: string | null
  empresa?: string | null
}

/** Só os dígitos, com o 55 do Brasil quando faltar. */
export function whatsappNumber(phone?: string | null): string | null {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length < 10) return null
  return digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`
}

export function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key as keyof TemplateVars]
    return value === undefined || value === null ? match : String(value)
  })
}

export function whatsappLink(
  phone: string | null | undefined,
  text: string,
): string | null {
  const number = whatsappNumber(phone)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

/** As variáveis que os modelos aceitam, para a tela de configuração. */
export const TEMPLATE_VARS: { key: keyof TemplateVars; label: string }[] = [
  { key: 'cliente', label: 'nome do cliente' },
  { key: 'numero', label: 'número do orçamento' },
  { key: 'valor', label: 'valor' },
  { key: 'validade', label: 'validade da proposta' },
  { key: 'vendedor', label: 'vendedor' },
  { key: 'empresa', label: 'empresa' },
]

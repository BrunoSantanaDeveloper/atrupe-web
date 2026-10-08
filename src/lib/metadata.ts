// Título da aba do navegador: "Página · Módulo" (o layout raiz acrescenta
// "· Atrupe"). Cada sub-página de um módulo tem o seu, para as abas e o
// histórico serem distinguíveis.
export function pageTitle(...parts: string[]) {
  return parts.filter(Boolean).join(' · ')
}

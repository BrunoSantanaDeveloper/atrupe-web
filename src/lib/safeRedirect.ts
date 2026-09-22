const BACKSLASH = String.fromCharCode(92)

/**
 * Destino interno seguro para depois do login ou do cadastro.
 *
 * Aceita só caminhos da própria aplicação: `/algo`, nunca `//outro-site`
 * nem `https://…`. Sem isso, um link `?to=https://site-falso` levava a pessoa
 * para fora logo depois de ela entrar com a senha. A barra invertida logo
 * após a primeira barra também é recusada: alguns navegadores a tratam como
 * `//`.
 */
export function safeRedirectPath(value?: string | null): string | null {
  if (!value) return null
  const path = value.trim()
  if (!path.startsWith('/')) return null
  if (path.startsWith('//') || path.startsWith('/' + BACKSLASH)) return null
  return path
}

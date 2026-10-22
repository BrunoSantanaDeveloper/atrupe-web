const BACKSLASH = String.fromCharCode(92)

// Caracteres de controle (TAB, quebra de linha…) e DEL: o navegador os remove
// ao montar a URL, então "/\t/site.com" vira "//site.com" depois da checagem
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/

// Origem fictícia só para o URL resolver o caminho relativo; nunca é usada
const BASE = 'https://atrupe.invalid'

/**
 * Destino interno seguro para depois do login ou do cadastro.
 *
 * Aceita só caminhos da própria aplicação: `/algo`, nunca `//outro-site`
 * nem `https://…`. Sem isso, um link `?to=https://site-falso` levava a pessoa
 * para fora logo depois de ela entrar com a senha. A barra invertida é
 * recusada (alguns navegadores a tratam como `/`), e também os caracteres de
 * controle, que o navegador apaga e assim montam um `//` depois da checagem.
 * Por fim o caminho é resolvido como URL: se a origem não for a própria, sai.
 */
export function safeRedirectPath(value?: string | null): string | null {
  if (!value) return null
  const path = value.trim()
  if (!path.startsWith('/')) return null
  if (CONTROL_CHARS.test(path) || path.includes(BACKSLASH)) return null
  if (path.startsWith('//')) return null

  try {
    const url = new URL(path, BASE)
    if (url.origin !== BASE) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

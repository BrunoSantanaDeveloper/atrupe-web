import type { PlatformSettings } from '@/lib/atendimento-kit/shared/settings.mjs'

export interface ImportSummary {
  version: string | null
  updated: number
  added: number
  kept: number
}

/**
 * Lê uma versão da base de suporte (Markdown) na API e devolve o contexto do
 * robô com ela aplicada, sem gravar (a tela mostra e o superadmin salva).
 */
export async function importSupportBase(
  markdown: string,
): Promise<{ settings: PlatformSettings; summary: ImportSummary }> {
  const response = await fetch('/api/atendimento/config/importar-base', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ markdown }),
  })
  const json = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(json?.message ?? 'Não deu para ler a base agora.')
  }
  return json
}

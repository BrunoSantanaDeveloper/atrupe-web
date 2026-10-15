// O anexo da tarefa de produção (GP-25, GP-26) vai do navegador direto para
// a API, com o token da sessão: um arquivo de até 20 MB não passa pela server
// action (10 MB) nem pelo limite de corpo da Vercel. A API guarda o arquivo
// em armazenamento privado e devolve o anexo com o link assinado.

// Actions
import { productionUploadBase } from '@/actions/production-manager'

// Utils
import { extractApiErrorMessage } from '@/lib/api-error-message'

import type { AttachmentKind } from '@/app/(app-sidebar)/producao/gerenciador/manager'

/** O mesmo teto da API (D32, PO 13/10/2026). */
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024

export async function uploadProductionAttachment({
  token,
  taskId,
  attachmentId,
  name,
  kind,
  file,
}: {
  token: string | null | undefined
  taskId: string
  // Com o id, é uma versão nova de um anexo existente
  attachmentId?: string | null
  name: string
  kind: AttachmentKind
  file: File
}): Promise<{ success: boolean; message: string }> {
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return { success: false, message: 'O arquivo passa de 20 MB' }
  }
  if (!token) {
    return { success: false, message: 'Sessão expirada: entre de novo' }
  }
  const base = (await productionUploadBase()).data
  const route = attachmentId
    ? `/production/task/${taskId}/attachment/${attachmentId}/version`
    : `/production/task/${taskId}/attachment`
  const form = new FormData()
  form.append('file', file)
  if (!attachmentId) {
    form.append('name', name)
    form.append('kind', kind)
  }
  try {
    const response = await fetch(`${base}${route}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      return {
        success: false,
        message:
          response.status === 413
            ? 'O arquivo passa de 20 MB'
            : extractApiErrorMessage(payload) ||
              'Não foi possível guardar o anexo',
      }
    }
    return { success: true, message: 'Anexo guardado' }
  } catch {
    return { success: false, message: 'Não foi possível guardar o anexo' }
  }
}

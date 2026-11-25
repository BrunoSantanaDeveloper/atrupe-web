// O anexo da tarefa de produção (GP-25, GP-26) vai do navegador sem passar
// pela server action (10 MB) nem pelo limite de corpo da Vercel.
//
// Arquivos de produção com espaço medido (GP-48 item 27): o navegador pede à
// API um link de envio, manda o arquivo direto ao armazenamento (com o
// progresso) e confirma; a API confere o tamanho real e o espaço da empresa.
// Sem a faixa contratada, cada arquivo vai até 20 MB e o espaço é a cota
// grátis do plano (1 GB de partida); com a faixa, até 2 GB por arquivo.

// Actions
import { productionUploadBase } from '@/actions/production-manager'

// Utils
import { extractApiErrorMessage } from '@/lib/api-error-message'

import type { AttachmentKind } from '@/app/(app-sidebar)/producao/gerenciador/manager'

/** O teto de quem não contrata (D32, PO 13/10/2026). */
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024

/** O espaço dos arquivos de produção da empresa. */
export type ProductionStorage = {
  usedBytes: number
  // Nulo = sem limite
  quotaBytes: number | null
  freeBytes: number | null
  maxFileBytes: number
  tier: { key: string; name: string; storageGb: number } | null
  directUpload: boolean
}

type Result = { success: boolean; message: string; code?: string }

/**
 * O token da sessão já vem como "Bearer …" (src/lib/auth.ts); acrescentar de
 * novo dava "Bearer Bearer …" e a API recusava (401) todo envio do navegador.
 */
const bearer = (token: string) =>
  /^Bearer\s/i.test(token) ? token : `Bearer ${token}`

const api = async (
  token: string,
  route: string,
  init: { method?: string; body?: unknown } = {},
) => {
  const base = (await productionUploadBase()).data
  const response = await fetch(`${base}${route}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: bearer(token),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })
  const payload = await response.json().catch(() => null)
  return { ok: response.ok, status: response.status, payload }
}

const oneDecimal = (value: number) =>
  value.toFixed(1).replace('.', ',').replace(/,0$/, '')

/** Tamanho para ler: GB com uma casa, MB ou KB. */
export const formatBytes = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${oneDecimal(bytes / 1024 ** 3)} GB`
  if (bytes >= 1024 ** 2) return `${oneDecimal(bytes / 1024 ** 2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export async function fetchProductionStorage(
  token: string | null | undefined,
): Promise<ProductionStorage | null> {
  if (!token) return null
  try {
    const res = await api(token, '/production/task/storage')
    return res.ok ? (res.payload as ProductionStorage) : null
  } catch {
    return null
  }
}

/**
 * O PUT direto ao armazenamento, com o progresso (0 a 1). O link assina o
 * tamanho e o tipo: o Content-Type vai exatamente como a API devolveu com o
 * link (não o `file.type` do navegador, que pode ser outro), e o
 * Content-Length o navegador põe sozinho.
 */
const putFile = (
  url: string,
  file: File,
  mime: string,
  onProgress?: (ratio: number) => void,
) =>
  new Promise<boolean>((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', mime)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300)
    xhr.onerror = () => resolve(false)
    xhr.send(file)
  })

const failure = (payload: unknown, fallback: string): Result => ({
  success: false,
  message: extractApiErrorMessage(payload) || fallback,
  code:
    payload && typeof payload === 'object' && 'code' in payload
      ? String((payload as { code: unknown }).code)
      : undefined,
})

/** Envia um arquivo: anexo novo ou, com o id, versão nova de um anexo. */
export async function uploadProductionAttachment({
  token,
  taskId,
  attachmentId,
  name,
  kind,
  file,
  storage,
  onProgress,
}: {
  token: string | null | undefined
  taskId: string
  // Com o id, é uma versão nova de um anexo existente
  attachmentId?: string | null
  name: string
  kind: AttachmentKind
  file: File
  storage?: ProductionStorage | null
  onProgress?: (ratio: number) => void
}): Promise<Result> {
  if (!token) {
    return { success: false, message: 'Sessão expirada: entre de novo' }
  }
  const maxBytes = storage?.maxFileBytes ?? ATTACHMENT_MAX_BYTES
  if (file.size > maxBytes) {
    return {
      success: false,
      code: 'FILE_TOO_LARGE',
      message:
        maxBytes <= ATTACHMENT_MAX_BYTES
          ? `${file.name} passa de 20 MB. Com os arquivos de produção contratados, cada arquivo pode ter até 2 GB.`
          : `${file.name} passa de ${formatBytes(maxBytes)}.`,
    }
  }
  try {
    if (storage?.directUpload) {
      const link = await api(
        token,
        `/production/task/${taskId}/attachment/upload-link`,
        { method: 'POST', body: { fileName: file.name, size: file.size } },
      )
      if (!link.ok) {
        return failure(link.payload, 'Não foi possível enviar o arquivo')
      }
      const sent = await putFile(
        link.payload.url,
        file,
        link.payload.mime,
        onProgress,
      )
      if (!sent) {
        return {
          success: false,
          message: `${file.name} não chegou ao armazenamento. Envie de novo.`,
        }
      }
      // O nome é o mesmo do pedido do link (a API confere com a chave); o
      // tipo vale o do link
      const body = {
        key: link.payload.key,
        fileName: file.name,
        ...(attachmentId ? {} : { name, kind }),
      }
      const saved = await api(
        token,
        attachmentId
          ? `/production/task/${taskId}/attachment/${attachmentId}/version/direct`
          : `/production/task/${taskId}/attachment/direct`,
        { method: 'POST', body },
      )
      return saved.ok
        ? { success: true, message: 'Anexo guardado' }
        : failure(saved.payload, 'Não foi possível guardar o anexo')
    }

    // Sem o envio direto: o arquivo passa pela API, até 20 MB
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
    const response = await fetch(`${base}${route}`, {
      method: 'POST',
      headers: { Authorization: bearer(token) },
      body: form,
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      return response.status === 413
        ? { success: false, message: 'O arquivo passa de 20 MB' }
        : failure(payload, 'Não foi possível guardar o anexo')
    }
    onProgress?.(1)
    return { success: true, message: 'Anexo guardado' }
  } catch {
    return { success: false, message: 'Não foi possível guardar o anexo' }
  }
}

/* ---------------------------------------------------------------------------
 * Arquivos da O.S. (GP-49): vê quem vê a O.S.; mesmo espaço dos arquivos
 * ------------------------------------------------------------------------- */

export type OrderFile = {
  id: string
  fileName: string
  size: number
  mime: string
  uploadedBy: string
  uploadedAt: string
  // Apagado na limpeza do espaço: sem link
  removedAt: string | null
  url: string | null
}

export async function fetchOrderFiles(
  token: string | null | undefined,
  orderId: string,
): Promise<{ files: OrderFile[]; storage: ProductionStorage | null } | null> {
  if (!token) return null
  try {
    const res = await api(token, `/sale/order-file/${orderId}`)
    return res.ok
      ? (res.payload as { files: OrderFile[]; storage: ProductionStorage })
      : null
  } catch {
    return null
  }
}

export async function deleteOrderFile(
  token: string | null | undefined,
  orderId: string,
  fileId: string,
): Promise<Result> {
  if (!token)
    return { success: false, message: 'Sessão expirada: entre de novo' }
  const res = await api(token, `/sale/order-file/${orderId}/${fileId}`, {
    method: 'DELETE',
  })
  return res.ok
    ? { success: true, message: 'Arquivo apagado' }
    : failure(res.payload, 'Não foi possível apagar o arquivo')
}

/** Envia um arquivo à O.S.: direto ao armazenamento ou pela API (20 MB). */
export async function uploadOrderFile({
  token,
  orderId,
  file,
  storage,
  onProgress,
}: {
  token: string | null | undefined
  orderId: string
  file: File
  storage?: ProductionStorage | null
  onProgress?: (ratio: number) => void
}): Promise<Result> {
  if (!token) {
    return { success: false, message: 'Sessão expirada: entre de novo' }
  }
  const maxBytes = storage?.maxFileBytes ?? ATTACHMENT_MAX_BYTES
  if (file.size > maxBytes) {
    return {
      success: false,
      code: 'FILE_TOO_LARGE',
      message: `${file.name} passa de ${formatBytes(maxBytes)}.`,
    }
  }
  try {
    if (storage?.directUpload) {
      const link = await api(token, `/sale/order-file/${orderId}/upload-link`, {
        method: 'POST',
        body: { fileName: file.name, size: file.size },
      })
      if (!link.ok) {
        return failure(link.payload, 'Não foi possível enviar o arquivo')
      }
      const sent = await putFile(
        link.payload.url,
        file,
        link.payload.mime,
        onProgress,
      )
      if (!sent) {
        return {
          success: false,
          message: `${file.name} não chegou ao armazenamento. Envie de novo.`,
        }
      }
      // O nome é o mesmo do pedido do link (a API confere com a chave)
      const saved = await api(token, `/sale/order-file/${orderId}/direct`, {
        method: 'POST',
        body: { key: link.payload.key, fileName: file.name },
      })
      return saved.ok
        ? { success: true, message: 'Arquivo guardado' }
        : failure(saved.payload, 'Não foi possível guardar o arquivo')
    }
    const base = (await productionUploadBase()).data
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(`${base}/sale/order-file/${orderId}`, {
      method: 'POST',
      headers: { Authorization: bearer(token) },
      body: form,
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      return response.status === 413
        ? { success: false, message: 'O arquivo passa de 20 MB' }
        : failure(payload, 'Não foi possível guardar o arquivo')
    }
    onProgress?.(1)
    return { success: true, message: 'Arquivo guardado' }
  } catch {
    return { success: false, message: 'Não foi possível guardar o arquivo' }
  }
}

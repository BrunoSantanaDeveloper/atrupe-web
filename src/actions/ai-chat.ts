'use server'

// O assistente de IA: as rotas /ai da API. O acesso vem do plano
// (ai_assistant), da chave global e da cota do mês; a cota estourada volta
// 429. As propostas (seção 9 do documento de 28/10/2026) a tela confirma ou
// descarta; o servidor aplica pelos serviços das telas.

import apiInstance from '@/lib/api'
import { getItem, createItemNew } from '@/actions/_cruds'
import type {
  AiQuota,
  AiAction,
  AiMessage,
  AiConversation,
  AiChatResponse,
  AiAccessStatus,
  QuotationDraftEdits,
} from '@/types/ai-chat'

const BASE_ROUTE = '/ai'

export async function getAiAccessStatus(): Promise<AiAccessStatus> {
  const api = await apiInstance()
  const res = await api.get(`${BASE_ROUTE}/access-status`)
  return res.data
}

// A falha volta como dado, e não como erro: em produção o erro da action
// chega à tela sem a mensagem da API
export type AiChatFailure = {
  failed: true
  status?: number
  message: string
  quota?: AiQuota
}

export async function sendAiChatMessage(data: {
  message: string
  conversationId?: string
  context?: {
    currentPath?: string
    quotationId?: string
    quotationItemId?: string
    productId?: string
    payableId?: string
  }
}): Promise<AiChatResponse | AiChatFailure> {
  try {
    const api = await apiInstance()
    const res = await api.post(`${BASE_ROUTE}/chat`, data)
    return res.data
  } catch (error) {
    const response = (
      error as {
        response?: {
          status?: number
          data?: { message?: string; quota?: AiQuota }
        }
      }
    ).response
    return {
      failed: true,
      status: response?.status,
      message:
        response?.data?.message ||
        'Não foi possível enviar a mensagem para a IA.',
      quota: response?.data?.quota,
    }
  }
}

export async function getAiConversations(): Promise<AiConversation[]> {
  const api = await apiInstance()
  const res = await api.get(`${BASE_ROUTE}/conversations`)
  return res.data
}

export async function getAiMessages(
  conversationId: string,
): Promise<AiMessage[]> {
  const api = await apiInstance()
  const res = await api.get(
    `${BASE_ROUTE}/conversations/${conversationId}/messages`,
  )
  return res.data
}

export async function deleteAiConversation(
  conversationId: string,
): Promise<{ success: boolean }> {
  const api = await apiInstance()
  const res = await api.delete(`${BASE_ROUTE}/conversations/${conversationId}`)
  return res.data
}

// --- As propostas -----------------------------------------------------------

export const getAiAction = async (id: string) => {
  const res = await getItem({ route: `${BASE_ROUTE}/actions/${id}` })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: res.data as AiAction, message: '' }
}

// Aplicar grava pelos serviços das telas; `edited` é o que a pessoa mudou no
// cartão. A recusa da regra (falta escolher) volta com a mensagem
export const applyAiAction = async ({
  id,
  edited,
}: {
  id: string
  edited?: QuotationDraftEdits | Record<string, unknown>
}) => {
  const res = await createItemNew({
    route: `${BASE_ROUTE}/actions/${id}/apply`,
    data: edited ? { edited } : {},
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return {
    success: true,
    data: (res.data || {}) as Record<string, unknown>,
    message: '',
  }
}

export const discardAiAction = async (id: string) => {
  const res = await createItemNew({
    route: `${BASE_ROUTE}/actions/${id}/discard`,
    data: {},
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: res.data, message: '' }
}

// "Montar com IA": o texto do cliente vira a proposta, sem passar pelo chat.
// Conta uma mensagem na cota; a cota estourada volta 429
export const createAiQuotationDraft = async ({
  text,
  quotationId,
}: {
  text: string
  quotationId?: string
}) => {
  const res = await createItemNew({
    route: `${BASE_ROUTE}/quotation-draft`,
    data: { text, ...(quotationId ? { quotationId } : {}) },
  })
  if (!res.success) {
    return {
      success: false,
      data: null,
      message: res.message,
      status: res.status as number | undefined,
    }
  }
  return { success: true, data: res.data as AiAction, message: '' }
}

'use server'

import apiInstance from '@/lib/api'
import type { AiChatResponse, AiConversation, AiMessage } from '@/types/ai-chat'

const BASE_ROUTE = '/ai'

export async function getAiAccessStatus(): Promise<{ enabled: boolean }> {
  const api = await apiInstance()
  const res = await api.get(`${BASE_ROUTE}/access-status`)
  return res.data
}

export async function sendAiChatMessage(data: {
  message: string
  conversationId?: string
  context?: { currentPath?: string }
}): Promise<AiChatResponse> {
  const api = await apiInstance()
  const res = await api.post(`${BASE_ROUTE}/chat`, data)
  return res.data
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

export type AiToolCallStatus = 'success' | 'denied' | 'error'

export type AiMessageRole = 'user' | 'assistant' | 'tool' | 'system'

export interface AiConversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  toolCalls?: { name: string; status: AiToolCallStatus }[] | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface AiChatResponse {
  conversationId: string
  message: string
  sources?: string[]
  toolCalls?: { name: string; status: AiToolCallStatus }[]
}

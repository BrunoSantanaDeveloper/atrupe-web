// O pedido que uma tela faz ao assistente (seção 9 do documento de
// 28/10/2026): os botões de contexto — "Escrever descritivo" no produto e no
// item, "Sugerir categoria" no lançamento — abrem o chat com a mensagem e o
// contexto da tela, e a proposta volta como cartão.

import { create } from 'zustand'

export type AiChatContext = {
  currentPath?: string
  quotationId?: string
  quotationItemId?: string
  productId?: string
  payableId?: string
}

export type AiChatRequest = {
  message: string
  context?: AiChatContext
}

type AiChatStore = {
  request: AiChatRequest | null
  ask: (request: AiChatRequest) => void
  clear: () => void
}

export const useAiChat = create<AiChatStore>((set) => ({
  request: null,
  ask: (request) => set({ request }),
  clear: () => set({ request: null }),
}))

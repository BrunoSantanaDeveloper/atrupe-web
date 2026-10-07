'use client'

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { Bot, MessageSquare, Plus, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  deleteAiConversation,
  getAiAccessStatus,
  getAiConversations,
  getAiMessages,
  sendAiChatMessage,
} from '@/actions/ai-chat'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { AiConversation, AiMessage } from '@/types/ai-chat'

type LocalMessage = AiMessage & { pending?: boolean }

export function AiChatWidget() {
  const pathname = usePathname()
  const [accessEnabled, setAccessEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [message, setMessage] = useState('')
  const [conversationId, setConversationId] = useState<string>()
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === conversationId),
    [conversationId, conversations],
  )

  const loadAccessStatus = useCallback(async () => {
    try {
      const status = await getAiAccessStatus()
      setAccessEnabled(status.enabled)
      if (!status.enabled) setOpen(false)
    } catch {
      setAccessEnabled(false)
    }
  }, [])

  const loadConversations = useCallback(async () => {
    try {
      const data = await getAiConversations()
      setConversations(data)
    } catch {
      await loadAccessStatus()
      toast.error('Nao foi possivel carregar as conversas.')
    }
  }, [loadAccessStatus])

  useEffect(() => {
    loadAccessStatus()
  }, [loadAccessStatus])

  useEffect(() => {
    if (!open) return
    loadConversations()
  }, [loadConversations, open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function selectConversation(id: string) {
    setConversationId(id)
    setLoadingMessages(true)
    try {
      const data = await getAiMessages(id)
      setMessages(data)
    } catch {
      await loadAccessStatus()
      toast.error('Nao foi possivel carregar esta conversa.')
    } finally {
      setLoadingMessages(false)
    }
  }

  function startNewConversation() {
    setConversationId(undefined)
    setMessages([])
    setMessage('')
  }

  async function removeConversation(id: string) {
    try {
      await deleteAiConversation(id)
      if (conversationId === id) startNewConversation()
      setConversations((current) => current.filter((item) => item.id !== id))
    } catch {
      await loadAccessStatus()
      toast.error('Nao foi possivel excluir a conversa.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading) return

    const userMessage: LocalMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      pending: true,
    }

    setMessages((current) => [...current, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const response = await sendAiChatMessage({
        message: text,
        conversationId,
        context: { currentPath: pathname },
      })

      setConversationId(response.conversationId)
      setMessages((current) => [
        ...current.map((item) =>
          item.id === userMessage.id ? { ...item, pending: false } : item,
        ),
        {
          id: `local-assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          toolCalls: response.toolCalls || [],
          createdAt: new Date().toISOString(),
        },
      ])
      await loadConversations()
    } catch (error: unknown) {
      const actionError = error as {
        response?: { data?: { message?: string } }
      }
      setMessages((current) =>
        current.filter((item) => item.id !== userMessage.id),
      )
      await loadAccessStatus()
      toast.error(
        actionError.response?.data?.message ||
          'Nao foi possivel enviar a mensagem para a IA.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!accessEnabled) return null

  return (
    <>
      <Button
        type="button"
        size="iconLg"
        rounded="full"
        className="fixed bottom-5 right-5 z-40 shadow-xl"
        onClick={() => setOpen(true)}
        aria-label="Abrir assistente IA"
      >
        <Bot className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[82vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4">
            <DialogTitle>Assistente IA</DialogTitle>
            <DialogDescription>
              Consulte operacao, relatorios e funcionalidades da conta.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr] bg-white">
            <aside className="border-r border-gray-200 bg-gray-50 min-h-0">
              <div className="p-3 border-b border-gray-200">
                <Button
                  type="button"
                  variant="secondaryOutline"
                  className="w-full justify-start"
                  LeftIcon={Plus}
                  onClick={startNewConversation}
                >
                  Nova conversa
                </Button>
              </div>
              <ScrollArea className="h-[calc(82vh-154px)]">
                <div className="p-2 space-y-1">
                  {conversations.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'group flex items-center gap-1 rounded-md',
                        item.id === conversationId && 'bg-brand-50',
                      )}
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => selectConversation(item.id)}
                      >
                        <MessageSquare className="size-4 shrink-0 text-gray-500" />
                        <span className="truncate">{item.title}</span>
                      </button>
                      <Button
                        type="button"
                        variant="neutralGhost"
                        size="iconSm"
                        className="mr-1 opacity-0 group-hover:opacity-100"
                        onClick={() => removeConversation(item.id)}
                        aria-label="Excluir conversa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {!conversations.length && (
                    <p className="px-2 py-3 text-xs text-gray-500">
                      Nenhuma conversa ainda.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </aside>

            <section className="flex min-h-0 flex-col">
              <div className="border-b border-gray-100 px-5 py-3">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {activeConversation?.title || 'Nova conversa'}
                </p>
              </div>

              <ScrollArea className="flex-1 bg-gray-50">
                <div className="space-y-4 p-5">
                  {loadingMessages ? (
                    // Esqueleto no formato da conversa
                    <div className="space-y-4" aria-label="Carregando">
                      <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
                      <Skeleton className="h-16 w-3/4 rounded-2xl" />
                      <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                    </div>
                  ) : messages.length ? (
                    messages
                      .filter(
                        (item) =>
                          item.role === 'user' || item.role === 'assistant',
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex',
                            item.role === 'user'
                              ? 'justify-end'
                              : 'justify-start',
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm',
                              item.role === 'user'
                                ? 'bg-brand-600 text-white'
                                : 'bg-white text-gray-800 border border-gray-200',
                              item.pending && 'opacity-70',
                            )}
                          >
                            <p className="whitespace-pre-wrap">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex h-[46vh] items-center justify-center text-center">
                      <div>
                        <Bot className="mx-auto mb-3 size-8 text-brand-600" />
                        <p className="text-sm font-semibold text-gray-800">
                          Como posso ajudar?
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Pergunte sobre caixa, vendas, clientes, relatorios ou
                          uso do sistema.
                        </p>
                      </div>
                    </div>
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                        Pensando...
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <form
                onSubmit={handleSubmit}
                className="border-t border-gray-200 bg-white p-4"
              >
                <div className="flex items-end gap-3">
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Digite sua pergunta"
                    className="min-h-11 max-h-32 resize-none bg-white"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="iconMd"
                    isLoading={loading}
                    disabled={!message.trim()}
                    aria-label="Enviar mensagem"
                  >
                    <Send className="size-5" />
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

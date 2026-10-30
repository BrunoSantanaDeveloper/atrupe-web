'use client'

// O assistente de IA (área 11): o botão flutuante e a janela do chat. Obedece
// ao plano e à cota (seção 9 do documento de 28/10/2026): sem o assistente
// no plano ou com a chave global desligada, não aparece; com a cota do mês
// estourada, mostra o aviso e não envia. As propostas da IA chegam como
// cartões abaixo da resposta, com Aplicar e Descartar.

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'
import {
  IconRobot as Bot,
  IconMessage as MessageSquare,
  IconPlus as Plus,
  IconSend as Send,
  IconTrash as Trash2,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { toast } from 'sonner'

import {
  deleteAiConversation,
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
import type {
  AiMessage,
  AiConversation,
  AiActionSummary,
} from '@/types/ai-chat'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { AiProposalCard } from './AiProposalCard'
import { useAiAccess, quotaText } from '@/hooks/useAiAccess'
import { useQueryClient } from '@tanstack/react-query'

type LocalMessage = AiMessage & {
  pending?: boolean
  // As propostas desta resposta (o histórico traz o id na ferramenta)
  actions?: AiActionSummary[]
}

// As propostas de uma mensagem guardada: o id vem na ferramenta que propôs
const actionsOf = (message: AiMessage): AiActionSummary[] =>
  (message.toolCalls || [])
    .filter((tool) => tool.actionId)
    .map((tool) => ({
      id: tool.actionId as string,
      type: 'QUOTATION_DRAFT',
      summary: '',
    }))

export function AiChatWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { access, visible, exceeded, refetch, setQuotaExceeded } = useAiAccess()
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

  const loadConversations = useCallback(async () => {
    try {
      const data = await getAiConversations()
      setConversations(data)
    } catch {
      await refetch()
      toast.error('Não foi possível carregar as conversas.')
    }
  }, [refetch])

  useEffect(() => {
    if (!open) return
    loadConversations()
    refetch()
  }, [loadConversations, open, refetch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function selectConversation(id: string) {
    setConversationId(id)
    setLoadingMessages(true)
    try {
      const data = await getAiMessages(id)
      setMessages(data.map((item) => ({ ...item, actions: actionsOf(item) })))
    } catch {
      await refetch()
      toast.error('Não foi possível carregar esta conversa.')
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
      await refetch()
      toast.error('Não foi possível excluir a conversa.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading || exceeded) return

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

    const response = await sendAiChatMessage({
      message: text,
      conversationId,
      context: { currentPath: pathname },
    })
    setLoading(false)

    if ('failed' in response) {
      setMessages((current) =>
        current.filter((item) => item.id !== userMessage.id),
      )
      setMessage(text)
      // A cota do mês estourou (429): o aviso fica na janela
      if (response.status === 429) setQuotaExceeded(response.quota)
      else await refetch()
      toast.error(response.message)
      return
    }

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
        actions: response.actions || [],
        createdAt: new Date().toISOString(),
      },
    ])
    await loadConversations()
    refetch()
  }

  if (!visible) return null

  const quota = quotaText(access.quota)

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
        <Icon icon={Bot} size="lg" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[82vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4">
            <DialogTitle>Assistente IA</DialogTitle>
            <DialogDescription>
              Consulte a operação, os relatórios e o uso do sistema. O que ele
              propõe, você confere e aplica.
              {quota && <span className="block text-xs">{quota}</span>}
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
                        <Icon
                          icon={MessageSquare}
                          size="sm"
                          className="shrink-0 text-gray-500"
                        />
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
                        <Icon icon={Trash2} size="sm" />
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
                            'flex flex-col gap-2',
                            item.role === 'user' ? 'items-end' : 'items-start',
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
                          {/* O cartão de cada proposta desta resposta */}
                          {item.actions?.map((action) => (
                            <div key={action.id} className="w-full max-w-[92%]">
                              <AiProposalCard
                                actionId={action.id}
                                summary={action.summary}
                                onApplied={(_applied, result) => {
                                  queryClient.invalidateQueries()
                                  if (typeof result.quotationId === 'string') {
                                    setOpen(false)
                                    router.push(
                                      `/vendas/orcamentos/${result.quotationId}`,
                                    )
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex h-[46vh] items-center justify-center text-center">
                      <div>
                        <FeaturedIcon
                          tone="brand"
                          size="lg"
                          Icon={Bot}
                          className="mx-auto mb-3 flex"
                        />
                        <p className="text-sm font-semibold text-gray-800">
                          Como posso ajudar?
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Pergunte sobre caixa, vendas, clientes, relatórios ou
                          uso do sistema. Peça um orçamento a partir do pedido
                          do cliente.
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
                {exceeded && (
                  <p className="mb-3 rounded-lg bg-warning-50 px-4 py-2 text-sm text-warning-700">
                    Sua empresa usou as mensagens do assistente deste mês.
                    {access.quota &&
                      ` A cota renova em ${new Date(access.quota.renewsAt).toLocaleDateString('pt-BR')}.`}
                  </p>
                )}
                <div className="flex items-end gap-3">
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      exceeded ? 'Cota do mês esgotada' : 'Digite sua pergunta'
                    }
                    disabled={exceeded}
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
                    disabled={!message.trim() || exceeded}
                    aria-label="Enviar mensagem"
                  >
                    <Icon icon={Send} size="md" />
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

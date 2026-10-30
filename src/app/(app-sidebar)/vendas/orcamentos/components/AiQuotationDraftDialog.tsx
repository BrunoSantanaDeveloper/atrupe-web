'use client'

// "Montar com IA" (IA-1; seção 9 do documento de 28/10/2026): o vendedor
// cola o texto do cliente (WhatsApp, e-mail) e a IA devolve o rascunho do
// orçamento como proposta; a pessoa confere, ajusta e aplica. Só com o
// assistente no plano; conta uma mensagem na cota.

// React
import { useState } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { AiProposalCard } from '@/components/ai/AiProposalCard'

// Types
import type { AiAction } from '@/types/ai-chat'

// Actions
import { createAiQuotationDraft } from '@/actions/ai-chat'

// Hooks
import { useAiAccess, quotaText } from '@/hooks/useAiAccess'

// Third-party
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconSparkles } from '@tabler/icons-react'

export function AiQuotationDraftButton({
  quotationId,
}: {
  // Com o orçamento aberto, os itens entram nele; sem, nasce um novo
  quotationId?: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { visible, exceeded, access, setQuotaExceeded, refetch } = useAiAccess()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<AiAction | null>(null)

  if (!visible) return null

  const draft = async () => {
    setLoading(true)
    const res = await createAiQuotationDraft({
      text: text.trim(),
      quotationId,
    })
    setLoading(false)
    if (!res.success) {
      if (res.status === 429) setQuotaExceeded()
      return toast.error(res.message)
    }
    setAction(res.data)
    refetch()
  }

  const close = () => {
    setOpen(false)
    setAction(null)
    setText('')
  }

  return (
    <>
      <Button
        type="button"
        variant="neutralOutline"
        LeftIcon={IconSparkles}
        onClick={() => setOpen(true)}
      >
        Montar com IA
      </Button>
      <Dialog open={open} onOpenChange={(value) => !value && close()}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Montar com IA</DialogTitle>
            <DialogDescription>
              Cole o pedido do cliente como chegou. A IA monta o rascunho com os
              produtos do seu cadastro; você confere e aplica. Nada é gravado
              antes disso.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[68vh] space-y-4 overflow-y-auto">
            {exceeded ? (
              <p className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
                Sua empresa usou as mensagens do assistente deste mês.
                {access.quota &&
                  ` A cota renova em ${new Date(access.quota.renewsAt).toLocaleDateString('pt-BR')}.`}
              </p>
            ) : !action ? (
              <>
                <Textarea
                  value={text}
                  rows={8}
                  placeholder={
                    'Ex.: "Preciso de 500 cartões de visita 4x4 e um banner 1,20 x 0,80 para sexta"'
                  }
                  onChange={(event) => setText(event.target.value)}
                />
                {quotaText(access.quota) && (
                  <p className="text-xs text-gray">{quotaText(access.quota)}</p>
                )}
              </>
            ) : (
              <AiProposalCard
                actionId={action.id}
                initial={action}
                onApplied={(_applied, result) => {
                  queryClient.invalidateQueries({ queryKey: ['quotations'] })
                  const id =
                    typeof result.quotationId === 'string'
                      ? result.quotationId
                      : quotationId
                  close()
                  if (id) router.push(`/vendas/orcamentos/${id}`)
                }}
                onDiscarded={() => setAction(null)}
              />
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="neutralOutline" onClick={close}>
              {action ? 'Fechar' : 'Cancelar'}
            </Button>
            {!action && !exceeded && (
              <Button
                type="button"
                LeftIcon={IconSparkles}
                isLoading={loading}
                disabled={text.trim().length < 3}
                onClick={draft}
              >
                Montar o rascunho
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

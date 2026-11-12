'use client'

// O título "⚠️ Pendência" no detalhe da movimentação (PA-5 e PA-7,
// 12/11/2026): diz qual venda ele libera e o que a baixa faz. Liberar a
// venda sem o pagamento é aqui, no financeiro, com motivo; por enquanto só
// o administrador. Para quem não pode, o botão diz o caminho

// React
import { useState } from 'react'

// Next
import Link from 'next/link'

// UI
import { toast } from 'sonner'
import { AlertBanner } from '@/components/ui/alert-banner'
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

// Third-party
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { Pendency } from '@/components/common/PendencyBadge'

// Icons
import { IconAlertTriangle, IconLockOpen } from '@tabler/icons-react'

interface Props {
  receivableId: string
  pendency: Pendency
  clientName?: string | null
}

export function PendencyNotice({ receivableId, pendency, clientName }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const isAdmin = !!session?.user?.isAdmin

  if (!pendency) return null

  const sale = `#${pendency.reference}${clientName ? ` (${clientName})` : ''}`

  const handleRelease = async () => {
    setSaving(true)
    const res = await updateItemNew({
      route: `/financial/receivable/${receivableId}/release-sale`,
      data: { reason: reason.trim() },
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message)
      return
    }
    toast.success(
      `Venda ${sale} liberada: virou ordem de serviço. Este título continua a receber.`,
    )
    setOpen(false)
    setReason('')
    queryClient.invalidateQueries()
  }

  return (
    <>
      <AlertBanner
        variant="warning"
        icon={IconAlertTriangle}
        className="rounded-lg border"
        title={`⚠️ Pendência: este título libera a venda ${sale}`}
        description={
          <div className="space-y-1">
            <p>
              A venda foi aprovada com pagamento antecipado e espera este
              recebimento. Quando ele for baixado, a venda vira ordem de serviço
              sozinha.
            </p>
            {!isAdmin ? (
              <p>
                Para liberar a venda antes do pagamento, peça ao administrador:
                só ele faz isso, com o motivo.
              </p>
            ) : null}
          </div>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="neutralOutline" size="sm" asChild>
              <Link href={`/vendas/orcamentos/${pendency.quotationId}`}>
                Ver a venda
              </Link>
            </Button>
            {isAdmin ? (
              <Button
                type="button"
                size="sm"
                variant="neutralOutline"
                LeftIcon={IconLockOpen}
                onClick={() => setOpen(true)}
              >
                Liberar sem pagamento
              </Button>
            ) : null}
          </div>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Liberar a venda sem o pagamento</DialogTitle>
            <DialogDescription>
              {`A venda ${sale} vira ordem de serviço agora, sem esperar o pagamento antecipado. Este título continua a receber, e o motivo fica no histórico da venda e do título.`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2">
            <label htmlFor="release-reason" className="text-sm font-medium">
              Motivo
            </label>
            <Textarea
              id="release-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ex.: cliente antigo, pagamento combinado com o gerente"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleRelease}
              disabled={!reason.trim() || saving}
              isLoading={saving}
            >
              Liberar a venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

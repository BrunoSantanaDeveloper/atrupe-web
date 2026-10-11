'use client'

// React
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// Icons
import {
  IconAlertTriangle,
  IconArrowRight,
  IconShieldLock,
} from '@tabler/icons-react'

// Actions
import {
  cancelOwnershipTransfer,
  fetchOwnership,
  sendOwnershipTransfer,
} from '@/actions/ownership'

// Lib
import { maskCpfCnpj } from '@/lib/utils'

// Types
import type { OwnershipPeriod, OwnershipView } from '@/types/ownership'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

const dateBr = (value: string) =>
  new Date(value).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })

/**
 * Titularidade e transferência, na área Assinatura.
 *
 * Quem é o titular e quem já foi, do atual para os anteriores; e a
 * transferência — que só o titular envia e cancela. O envio pede só o e-mail
 * de destino e não se conclui num clique: a consequência é declarada e
 * precisa de confirmação explícita, porque entregar o ambiente é
 * irreversível.
 */
export function OwnershipSection() {
  const queryClient = useQueryClient()
  const [sendOpen, setSendOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data: res, isLoading } = useQuery({
    queryKey: ['ownership'],
    queryFn: () => fetchOwnership(),
  })
  const view = res?.success ? res.data : undefined

  const refresh = (next?: OwnershipView) => {
    if (next)
      queryClient.setQueryData(['ownership'], { success: true, data: next })
    else queryClient.invalidateQueries({ queryKey: ['ownership'] })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }
  if (!view) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card data-titularidade>
        <CardHeader>
          <CardTitle className="text-base">Titularidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {view.current ? (
            <ul className="flex flex-col">
              <PeriodItem period={view.current} />
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Sem titularidade registrada.
            </p>
          )}
          {view.previous.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold type-eyebrow tracking-wide text-gray-700">
                Titulares anteriores
              </p>
              <ul className="flex flex-col">
                {view.previous.map((period) => (
                  <PeriodItem
                    key={`${period.startedAt}-${period.holderName}`}
                    period={period}
                  />
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-transferencia>
        <CardHeader>
          <CardTitle className="text-base">
            Transferência de titularidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          {view.pending ? (
            <>
              <p className="text-sm text-gray-600">
                Convite enviado para{' '}
                <strong className="font-medium text-gray-900">
                  {view.pending.targetEmail}
                </strong>
                . Restam{' '}
                <strong className="font-medium text-gray-900">
                  {view.pending.daysLeft} dia(s)
                </strong>{' '}
                para o aceite.
              </p>
              {view.isOwner && (
                <Button
                  variant="errorOutline"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancelar transferência
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Transferir entrega o ambiente inteiro — colaboradores, usuários,
                orçamentos, histórico e assinatura — a outra conta. Quem
                transfere perde o acesso.
              </p>
              {view.isOwner && view.blocked && (
                <p className="text-sm text-warning-700" role="status">
                  {view.blocked.message}
                </p>
              )}
              {view.isOwner ? (
                <Button
                  RightIcon={IconArrowRight}
                  disabled={!view.canSend}
                  onClick={() => setSendOpen(true)}
                >
                  Transferir titularidade
                </Button>
              ) : (
                <p className="text-sm text-gray-500" data-so-o-titular>
                  Somente o administrador principal da conta (Usuário nº 1)
                  transfere a titularidade, altera o plano e os complementos e
                  cancela a assinatura.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SendTransferDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        ownEmail={view.owner?.email ?? ''}
        onSent={(next) => refresh(next)}
      />
      <CancelTransferDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCanceled={(next) => refresh(next)}
      />
    </div>
  )
}

function PeriodItem({ period }: { period: OwnershipPeriod }) {
  return (
    <li
      className="flex items-center justify-between gap-3 border-b border-gray-200 py-3 last:border-0"
      data-periodo
    >
      <span className="flex min-w-0 flex-col">
        <strong className="text-sm font-medium text-gray-900">
          {period.holderName}
        </strong>
        {period.document && (
          <span className="text-xs text-gray-500">
            {maskCpfCnpj(period.document)}
          </span>
        )}
      </span>
      <span className="shrink-0 text-sm text-gray-500">
        {dateBr(period.startedAt)}{' '}
        {period.endedAt ? `a ${dateBr(period.endedAt)}` : '· atual'}
      </span>
    </li>
  )
}

function SendTransferDialog({
  open,
  onOpenChange,
  ownEmail,
  onSent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownEmail: string
  onSent: (view: OwnershipView) => void
}) {
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const close = () => {
    setEmail('')
    setConfirmed(false)
    setError(null)
    onOpenChange(false)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const target = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(target)) {
      setError('Informe um e-mail válido.')
      return
    }
    if (target.toLowerCase() === ownEmail.trim().toLowerCase()) {
      setError('Informe o e-mail de quem vai receber o ambiente.')
      return
    }

    setIsSubmitting(true)
    const res = await sendOwnershipTransfer(target)
    setIsSubmitting(false)
    if (!res.success || !res.data) {
      setError(res.message ?? 'Não foi possível enviar a transferência.')
      return
    }

    toast.success(`Convite enviado para ${target}`)
    if (res.data.devInviteUrl) {
      // Fora de produção: o link aparece no console para testar sem e-mail.
      console.info('[transferência] link do convite:', res.data.devInviteUrl)
    }
    onSent(res.data)
    close()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(next) : close())}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="errorBorderedLight"
                Icon={IconShieldLock}
                rounded
              />
              <span>Transferir titularidade</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Pedimos apenas o e-mail. O CNPJ e os dados da empresa são informados
            por quem recebe — eles pertencem a ela.
          </DialogDescription>
        </DialogHeader>

        <form id="form-transferencia" onSubmit={submit} noValidate>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="transferencia-email">E-mail de destino</Label>
              <Input
                id="transferencia-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-error-300 bg-error-50 p-4 text-sm text-error-700">
              <strong className="font-semibold">
                Ao ser aceita, esta transferência:
              </strong>
              <ul className="list-disc pl-4">
                <li>
                  entrega colaboradores, usuários, orçamentos, histórico e a
                  assinatura à conta de destino;
                </li>
                <li>
                  retira o seu acesso a este ambiente, por completo e sem cópia;
                </li>
                <li>não pode ser desfeita.</li>
              </ul>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(value) => setConfirmed(value === true)}
                className="mt-0.5"
              />
              Entendo que perderei o acesso a este ambiente por completo.
            </label>

            {error && (
              <p className="text-sm text-error-600" role="alert">
                {error}
              </p>
            )}
          </DialogBody>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="neutralOutline" onClick={close}>
            Voltar
          </Button>
          <Button
            type="submit"
            form="form-transferencia"
            variant="error"
            disabled={!confirmed}
            isLoading={isSubmitting}
          >
            Enviar transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelTransferDialog({
  open,
  onOpenChange,
  onCanceled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCanceled: (view?: OwnershipView) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const confirm = async () => {
    setIsSubmitting(true)
    const res = await cancelOwnershipTransfer()
    setIsSubmitting(false)
    if (!res.success) {
      toast.error(res.message ?? 'Não foi possível cancelar a transferência.')
      onCanceled()
      return
    }
    toast.success('Transferência cancelada')
    onCanceled(res.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="warningBorderedLight"
                Icon={IconAlertTriangle}
                rounded
              />
              <span>Cancelar a transferência?</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            O link enviado deixa de valer. O ambiente permanece como está.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          <Button variant="error" onClick={confirm} isLoading={isSubmitting}>
            Cancelar transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

// Registrar contato (CRM-1, 27/10/2026): o gesto único do acompanhamento.
// Dois campos contam: o que aconteceu e quando volto a falar. O canal vem
// por padrão, o texto é opcional, e o marcador pode ser trocado no mesmo
// lugar. Usado na linha da lista (aba Aguardando) e no card do orçamento.
//
// Vem do padrão dos CRMs de mercado ("log activity" + "schedule next"):
// registrar e já marcar o próximo, para a negociação nunca ficar sem a
// próxima ação.

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconBrandWhatsapp,
  IconPhone,
  IconMail,
  IconUser,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'

import { registerContact } from '@/actions/follow-up'
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { cn } from '@/lib/utils'
import { todayLocalIso } from '@/lib/formatDate'
import { FOLLOW_UP_SUMMARY_KEY } from '@/hooks/queries/useFollowUp'
import {
  contactChannelLabel,
  contactOutcomeLabel,
  type ContactChannel,
  type ContactOutcome,
} from '@/types/sales/followUp'

const channels: { value: ContactChannel; Icon: typeof IconPhone }[] = [
  { value: 'WHATSAPP', Icon: IconBrandWhatsapp },
  { value: 'PHONE', Icon: IconPhone },
  { value: 'EMAIL', Icon: IconMail },
  { value: 'IN_PERSON', Icon: IconUser },
]

const outcomes: ContactOutcome[] = [
  'WAITING_CLIENT',
  'ADJUST_REQUESTED',
  'WILL_CLOSE',
  'NO_RESPONSE',
  'OTHER',
]

// Atalhos de data, como nos CRMs: o vendedor raramente sabe o dia exato
const quickDays = [
  { label: 'Amanhã', days: 1 },
  { label: 'Em 3 dias', days: 3 },
  { label: 'Próxima semana', days: 7 },
]

const plusDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return todayLocalIso(date)
}

export type ContactDialogQuotation = {
  id: string
  reference: string
  clientName: string
  nextContactAt?: string | null
  nextContactNote?: string | null
  tagId?: string | null
}

export function ContactDialog({
  quotation,
  open,
  onOpenChange,
  onSaved,
}: {
  quotation: ContactDialogQuotation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const queryClient = useQueryClient()
  const { hasFeature } = usePlanFeatures()
  const showTag = hasFeature(FEATURES.SALES.QUOTATION_STATUS_COLUMN)
  const { data: tagsList } = useQuotationTag()

  const [channel, setChannel] = useState<ContactChannel>('WHATSAPP')
  const [outcome, setOutcome] = useState<ContactOutcome>('WAITING_CLIENT')
  const [note, setNote] = useState('')
  const [nextDay, setNextDay] = useState('')
  const [nextNote, setNextNote] = useState('')
  const [tagId, setTagId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !quotation) return
    setChannel('WHATSAPP')
    setOutcome('WAITING_CLIENT')
    setNote('')
    setNextDay(
      quotation.nextContactAt
        ? todayLocalIso(new Date(quotation.nextContactAt))
        : '',
    )
    setNextNote(quotation.nextContactNote || '')
    setTagId(quotation.tagId || '')
  }, [open, quotation])

  const save = async () => {
    if (!quotation) return
    setSaving(true)
    // Meio-dia local: o dia não muda ao virar UTC
    const nextContactAt = nextDay
      ? (() => {
          const [y, m, d] = nextDay.split('-').map(Number)
          return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString()
        })()
      : null
    const res = await registerContact(quotation.id, {
      channel,
      outcome,
      note: note.trim() || undefined,
      nextContactAt,
      nextContactNote: nextDay ? nextNote.trim() || null : null,
      ...(showTag ? { tagId: tagId || null } : {}),
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message || 'Não foi possível registrar o contato.')
      return
    }
    toast.success(
      nextContactAt
        ? 'Contato registrado e próximo contato marcado.'
        : 'Contato registrado.',
    )
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-data'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-timeline'] })
    queryClient.invalidateQueries({ queryKey: [FOLLOW_UP_SUMMARY_KEY] })
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !saving && onOpenChange(value)}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Registrar contato</DialogTitle>
          <DialogDescription>
            {quotation?.clientName} · {quotation?.reference}. O que aconteceu e
            quando voltar a falar: o orçamento aparece em &quot;Para
            retomar&quot; no dia.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="space-y-2">
            <Label>Canal</Label>
            <div className="flex flex-wrap gap-2">
              {channels.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setChannel(option.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                    channel === option.value
                      ? 'border-brand-500 bg-brand-25 font-medium text-brand-700'
                      : 'border-gray-200 bg-white text-gray-700',
                  )}
                >
                  <Icon icon={option.Icon} size="sm" />
                  {contactChannelLabel[option.value]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-outcome">O que aconteceu</Label>
            <Select
              value={outcome}
              onValueChange={(value) => setOutcome(value as ContactOutcome)}
            >
              <SelectTrigger id="contact-outcome" autoFocus>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outcomes.map((value) => (
                  <SelectItem key={value} value={value}>
                    {contactOutcomeLabel[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-note">Observação (opcional)</Label>
            <Textarea
              id="contact-note"
              rows={2}
              value={note}
              placeholder="Ex.: vai confirmar com o sócio até sexta"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="contact-next">Quando volto a falar</Label>
              <div className="flex flex-wrap gap-1.5">
                {quickDays.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    size="sm"
                    variant={
                      nextDay === plusDays(option.days)
                        ? 'default'
                        : 'neutralOutline'
                    }
                    onClick={() => setNextDay(plusDays(option.days))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input
                id="contact-next"
                type="date"
                className="w-full sm:w-[200px]"
                value={nextDay}
                min={todayLocalIso(new Date())}
                onChange={(event) => setNextDay(event.target.value)}
              />
              <Input
                className="flex-1 min-w-[200px]"
                value={nextNote}
                placeholder="Lembrete (ex.: ligar depois do almoço)"
                disabled={!nextDay}
                onChange={(event) => setNextNote(event.target.value)}
              />
            </div>
            {!nextDay && (
              <p className="text-xs text-gray">
                Sem data, o orçamento fica sem próximo contato e aparece assim
                na aba Aguardando.
              </p>
            )}
          </div>

          {showTag && (
            <div className="space-y-2">
              <Label htmlFor="contact-tag">Fase da negociação</Label>
              <Select
                value={tagId || 'none'}
                onValueChange={(value) =>
                  setTagId(value === 'none' ? '' : value)
                }
              >
                <SelectTrigger id="contact-tag">
                  <SelectValue placeholder="Sem marcador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem marcador</SelectItem>
                  {(tagsList || []).map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={save} isLoading={saving}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

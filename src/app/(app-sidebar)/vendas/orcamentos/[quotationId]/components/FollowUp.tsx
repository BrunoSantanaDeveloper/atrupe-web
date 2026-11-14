'use client'

// Acompanhamento da negociação (CRM fase 1, 24/10/2026; fase 2, 27/10):
// o marcador, o próximo contato combinado com o cliente e o lembrete; o
// gesto "Registrar contato", o "Chamar no WhatsApp" e a linha do tempo com
// os contatos e os eventos do orçamento. A aba Aguardando da lista é a
// visão do dia, com o foco "Para retomar".

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconCalendarEvent,
  IconPencil,
  IconTrash,
  IconMessageCircle,
  IconCalendarPlus,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { QuotationTagDropdown } from '../../components/QuotationsTable/QuotationTagDropdown'

import { useQuotationTag } from '@/hooks/queries/useQuotationTag'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { formatToLocaleDate } from '@/lib/formatDate'
import { nextContactLabel, nextContactState } from '@/lib/nextContact'
import type { QuotationType } from '@/types/sales/quotation'
import { ContactDialog } from '../../components/FollowUp/ContactDialog'
import {
  NextContactDialog,
  saveNextContact,
  type NextContactBody,
} from '../../components/FollowUp/NextContactDialog'
import { WhatsAppButton } from '../../components/FollowUp/WhatsAppButton'
import { QuotationTimeline } from '../../components/FollowUp/QuotationTimeline'
import { formatCurrencyToBrl } from '@/lib/utils'

const stateVariant = {
  overdue: 'errorLight',
  today: 'warningLight',
  upcoming: 'neutralLight',
} as const

export function FollowUp({ data }: { data: QuotationType }) {
  const [open, setOpen] = useState(false)
  const [contacting, setContacting] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const reference = `${data?.serie?.quotation || ''}-${data?.serie?.code || ''}`
  const queryClient = useQueryClient()
  const { hasFeature } = usePlanFeatures()
  const showTag = hasFeature(FEATURES.SALES.QUOTATION_STATUS_COLUMN)
  const { data: tagsList } = useQuotationTag()
  // O acompanhamento comercial é do LITE (CRM-7, 29/10/2026)
  const followUp = hasFeature(FEATURES.SALES.SALES_FOLLOW_UP)

  // A negociação começa ao concluir o orçamento: em Digitação ele ainda não
  // foi ao cliente, e o card só aparece se já houver contato combinado. Depois
  // de aprovado ou rejeitado, fica se ainda houver um contato anotado, para não
  // sumir com ele. A venda rápida é de balcão e não tem acompanhamento
  // (revisão do LITE, 11/11/2026)
  const negotiating = ['OPEN', 'DONE', 'OVERDUE'].includes(data?.status)
  const sent = ['DONE', 'OVERDUE'].includes(data?.status)
  if (!followUp || data?.quickSale || (!sent && !data?.nextContactAt))
    return null
  // Nada combinado ainda: o card fica numa linha, com os gestos, e a linha do
  // tempo abre a pedido
  const compact = !data?.nextContactAt && !data?.tag?.id

  const state = nextContactState(data?.nextContactAt)

  const save = (body: NextContactBody) =>
    saveNextContact(queryClient, data.id, body)

  const dialogs = (
    <>
      <NextContactDialog open={open} onOpenChange={setOpen} quotation={data} />
      <ContactDialog
        open={contacting}
        onOpenChange={setContacting}
        quotation={{
          id: data.id,
          reference,
          clientName: data?.client?.name || 'Cliente não informado',
          nextContactAt: data?.nextContactAt,
          nextContactNote: data?.nextContactNote,
          tagId: data?.tag?.id,
        }}
      />
    </>
  )

  // O gesto único (CRM-1) e o WhatsApp com modelo (CRM-3, CRM-5)
  const gestures = (
    <>
      <Button
        type="button"
        LeftIcon={IconMessageCircle}
        onClick={() => setContacting(true)}
      >
        Registrar contato
      </Button>
      <WhatsAppButton
        variant="button"
        phone={data?.client?.phoneNumber}
        template={data?.status === 'DONE' ? 'validity' : 'resume'}
        vars={{
          cliente: data?.client?.name,
          numero: reference,
          valor: formatCurrencyToBrl(data?.totalValue || 0),
          validade: formatToLocaleDate(data?.dueDate),
          vendedor: data?.seller?.name,
        }}
      />
    </>
  )

  const tag = showTag ? (
    <QuotationTagDropdown quotation={data} tagsList={tagsList || []} />
  ) : null

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <FeaturedIcon tone="neutral" Icon={IconCalendarEvent} />
            <CardTitle>Acompanhamento</CardTitle>
            {tag}
            {negotiating ? (
              <PermissionGate permissions={['sale:quotation:edit']}>
                <div className="ml-auto flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="neutralOutline"
                    LeftIcon={IconCalendarPlus}
                    onClick={() => setOpen(true)}
                  >
                    Combinar próximo contato
                  </Button>
                  {gestures}
                </div>
              </PermissionGate>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => setShowTimeline((value) => !value)}
          >
            {showTimeline ? 'Ocultar linha do tempo' : 'Ver linha do tempo'}
          </Button>
          {showTimeline ? (
            <div className="pt-4">
              <QuotationTimeline quotationId={data.id} />
            </div>
          ) : null}
        </CardContent>
        {dialogs}
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FeaturedIcon tone="neutral" Icon={IconCalendarEvent} />
          <CardTitle>Acompanhamento</CardTitle>
          {negotiating ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <div className="ml-auto flex gap-1">
                <TooltipProvider>
                  {data?.nextContactAt ? (
                    <ActionButton
                      Icon={IconTrash}
                      tooltip="Limpar próximo contato"
                      onClick={async () => {
                        const ok = await save({
                          nextContactAt: null,
                          nextContactNote: null,
                        })
                        if (ok) toast.success('Próximo contato removido.')
                      }}
                    />
                  ) : null}
                  <ActionButton
                    Icon={IconPencil}
                    tooltip={
                      data?.nextContactAt
                        ? 'Alterar próximo contato'
                        : 'Combinar próximo contato'
                    }
                    onClick={() => setOpen(true)}
                  />
                </TooltipProvider>
              </div>
            </PermissionGate>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {tag ? (
            <div className="space-y-1">
              <p className="text-sm text-gray">Fase</p>
              {tag}
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-sm text-gray">Próximo contato</p>
            {data?.nextContactAt && state ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {formatToLocaleDate(data.nextContactAt)}
                </p>
                <Badge status variant={stateVariant[state]} size="sm">
                  {nextContactLabel[state]}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-900">Não combinado</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray">Lembrete</p>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {data?.nextContactNote || '-'}
            </p>
          </div>
        </div>
        {negotiating ? (
          <PermissionGate permissions={['sale:quotation:edit']}>
            <div className="flex flex-wrap gap-3 px-6 pt-6">{gestures}</div>
          </PermissionGate>
        ) : null}
        {/* A linha do tempo: contatos e eventos juntos (CRM-1) */}
        <div className="px-6 pt-6">
          <QuotationTimeline quotationId={data.id} />
        </div>
      </CardContent>
      {dialogs}
    </Card>
  )
}

'use client'

// A linha do tempo da negociação (CRM-1): os contatos registrados e os
// eventos automáticos do orçamento, do mais novo ao mais antigo. Mostra os
// três últimos e abre o resto a pedido, como a "atividade" dos CRMs.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IconBrandWhatsapp,
  IconPhone,
  IconMail,
  IconUser,
  IconHistory,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/ui/icon'
import { getQuotationTimeline } from '@/actions/follow-up'
import { formatToLocaleDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import {
  contactChannelLabel,
  contactOutcomeLabel,
  type ContactChannel,
  type TimelineItem,
} from '@/types/sales/followUp'

const channelIcon: Record<ContactChannel, typeof IconPhone> = {
  WHATSAPP: IconBrandWhatsapp,
  PHONE: IconPhone,
  EMAIL: IconMail,
  IN_PERSON: IconUser,
}

const SHORT = 3

const when = (iso: string) => {
  const date = new Date(iso)
  return `${formatToLocaleDate(iso)} ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function QuotationTimeline({ quotationId }: { quotationId: string }) {
  const [all, setAll] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['quotation-timeline', quotationId],
    queryFn: () => getQuotationTimeline(quotationId),
    staleTime: 60 * 1000,
  })
  const items: TimelineItem[] = data?.success ? data.data?.items || [] : []
  const visible = all ? items : items.slice(0, SHORT)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    )
  }
  if (!items.length) {
    return (
      <p className="text-sm text-gray">
        Nenhum contato registrado ainda. O primeiro vale: é ele que guarda o que
        o cliente disse e quando voltar a falar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        Linha do tempo
        {data?.success && data.data
          ? ` · ${data.data.contacts} ${data.data.contacts === 1 ? 'contato' : 'contatos'}`
          : ''}
      </p>
      <ol className="space-y-3">
        {visible.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="flex gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                item.kind === 'contact'
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-gray-100 text-gray-500',
              )}
            >
              <Icon
                icon={
                  item.kind === 'contact'
                    ? channelIcon[item.channel]
                    : IconHistory
                }
                size="sm"
              />
            </span>
            <div className="min-w-0 text-sm">
              {item.kind === 'contact' ? (
                <>
                  <p className="text-gray-900">
                    <span className="font-medium">
                      {contactOutcomeLabel[item.outcome]}
                    </span>{' '}
                    <span className="text-gray">
                      · {contactChannelLabel[item.channel]}
                    </span>
                  </p>
                  {item.note ? (
                    <p className="text-gray-700 whitespace-pre-line">
                      {item.note}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-gray-700">{item.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {when(item.at)}
                {item.by ? ` · ${item.by}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {items.length > SHORT ? (
        <Button
          type="button"
          size="sm"
          variant="neutralOutline"
          onClick={() => setAll((value) => !value)}
        >
          {all ? 'Ver menos' : `Ver tudo (${items.length})`}
        </Button>
      ) : null}
    </div>
  )
}

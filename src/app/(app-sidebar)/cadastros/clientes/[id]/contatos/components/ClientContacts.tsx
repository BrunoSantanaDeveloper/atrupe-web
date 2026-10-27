'use client'

// O cliente visto pelo acompanhamento (CRM-4): última compra e há quantos
// dias, negociações abertas, e a linha do tempo dos contatos de todos os
// orçamentos. Mostra; quem registra é o orçamento (regra de casa 1).

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  IconBrandWhatsapp,
  IconPhone,
  IconMail,
  IconUser,
  IconShoppingBag,
} from '@tabler/icons-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DuplicateQuotationButton } from '@/components/common/DuplicateQuotationButton'
import { WhatsAppButton } from '@/app/(app-sidebar)/vendas/orcamentos/components/FollowUp/WhatsAppButton'
import { TooltipProvider } from '@/components/ui/tooltip'

import { getClientTimeline } from '@/actions/follow-up'
import { formatToLocaleDate } from '@/lib/formatDate'
import { formatCurrencyToBrl } from '@/lib/utils'
import { quotationsStatusObj } from '@/consts/quotations'
import {
  contactChannelLabel,
  contactOutcomeLabel,
  type ContactChannel,
} from '@/types/sales/followUp'

const channelIcon: Record<ContactChannel, typeof IconPhone> = {
  WHATSAPP: IconBrandWhatsapp,
  PHONE: IconPhone,
  EMAIL: IconMail,
  IN_PERSON: IconUser,
}

export function ClientContacts({ clientId }: { clientId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['client-timeline', clientId],
    queryFn: () => getClientTimeline(clientId),
    staleTime: 60 * 1000,
  })
  const timeline = data?.success ? data.data : null

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (!timeline) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray">
          {data?.message || 'Não foi possível carregar os contatos.'}
        </CardContent>
      </Card>
    )
  }

  const phone = timeline.client.mobile || timeline.client.phone
  const last = timeline.lastPurchase

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon icon={IconShoppingBag} size="md" className="text-gray-600" />
            <CardTitle>Última compra</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate permissions={['sale:quotation:edit']}>
              <WhatsAppButton
                variant="button"
                phone={phone}
                template="resume"
                vars={{
                  cliente: timeline.client.name,
                  numero: last?.reference ?? '',
                  valor: last ? formatCurrencyToBrl(last.value) : '',
                }}
              />
            </PermissionGate>
            {last ? (
              <PermissionGate permissions={['sale:quotation:create']}>
                <TooltipProvider>
                  <DuplicateQuotationButton
                    quotationId={last.quotationId}
                    clientId={timeline.client.id}
                    clientName={timeline.client.name}
                    description={last.description || undefined}
                    tooltip="Novo orçamento a partir do último pedido"
                  />
                </TooltipProvider>
              </PermissionGate>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {last ? (
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <p className="text-gray">Quando</p>
                <p className="font-medium text-gray-900">
                  {formatToLocaleDate(last.at ?? undefined)}
                  {typeof last.daysSince === 'number'
                    ? ` · há ${last.daysSince} ${last.daysSince === 1 ? 'dia' : 'dias'}`
                    : ''}
                </p>
              </div>
              <div>
                <p className="text-gray">Pedido</p>
                <Link
                  href={`/vendas/orcamentos/${last.quotationId}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {last.reference}
                  {last.description ? ` · ${last.description}` : ''}
                </Link>
              </div>
              <PermissionGate permissions={['values:values:view']}>
                <div>
                  <p className="text-gray">Valor</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrencyToBrl(last.value)}
                  </p>
                </div>
              </PermissionGate>
              <div>
                <p className="text-gray">Em negociação</p>
                <p className="font-medium text-gray-900">
                  {timeline.openNegotiations}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray">
              Este cliente ainda não comprou.
              {timeline.openNegotiations
                ? ` Há ${timeline.openNegotiations} ${timeline.openNegotiations === 1 ? 'orçamento' : 'orçamentos'} em negociação.`
                : ''}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {timeline.items.length ? (
            <ol className="space-y-4">
              {timeline.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Icon icon={channelIcon[item.channel]} size="sm" />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="flex flex-wrap items-center gap-2 text-gray-900">
                      <span className="font-medium">
                        {contactOutcomeLabel[item.outcome]}
                      </span>
                      <span className="text-gray">
                        · {contactChannelLabel[item.channel]}
                      </span>
                      <Link
                        href={`/vendas/orcamentos/${item.quotation.id}`}
                        className="text-brand-700 hover:underline"
                      >
                        {item.quotation.reference}
                        {item.quotation.description
                          ? ` · ${item.quotation.description}`
                          : ''}
                      </Link>
                      <Badge
                        status
                        size="sm"
                        variant={
                          quotationsStatusObj[item.quotation.status]?.variant ||
                          'neutralLight'
                        }
                      >
                        {quotationsStatusObj[item.quotation.status]?.text ||
                          item.quotation.status}
                      </Badge>
                    </p>
                    {item.note ? (
                      <p className="text-gray-700 whitespace-pre-line">
                        {item.note}
                      </p>
                    ) : null}
                    <p className="text-xs text-gray-500">
                      {formatToLocaleDate(item.at)}
                      {item.by ? ` · ${item.by}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray">
              Nenhum contato registrado. Os contatos são registrados no
              orçamento, pelo botão &quot;Registrar contato&quot;.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

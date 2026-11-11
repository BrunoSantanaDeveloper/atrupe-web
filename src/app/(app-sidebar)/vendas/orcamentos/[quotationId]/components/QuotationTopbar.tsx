'use client'

// O cabeçalho do orçamento e da venda rápida. A venda rápida se diferencia
// pelo título e pelo selo ao lado do status, no cabeçalho padrão: a faixa
// colorida mudava a diagramação e o tamanho do título (revisão do LITE,
// 11/11/2026)

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Topbar } from '@/components/common/Topbar'
import { QuickSaleBadge } from '@/components/common/QuickSaleBadge'
import { getQuickSaleSettings } from '@/actions/quick-sale'
import { quotationsStatusObj } from '@/consts/quotations'
import type { QuotationType } from '@/types/sales/quotation'

interface Props {
  data: QuotationType
  previousUrl: string
  // A situação mostrada, quando não é a do orçamento (a venda enviada ao
  // caixa aparece como aprovada)
  status?: string
  primaryCta?: JSX.Element
}

export function QuotationTopbar({
  data,
  previousUrl,
  status,
  primaryCta,
}: Props) {
  const quickSale = !!data?.quickSale
  const { data: settingsRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
    enabled: quickSale,
  })
  const defaultClientId = settingsRes?.success
    ? settingsRes.data?.clientId
    : undefined
  // O cliente padrão da configuração não é cliente informado (VR-2)
  const withoutClient =
    quickSale && (!data?.client?.id || data.client.id === defaultClientId)

  const reference = `${data?.serie?.quotation || ''}-${data?.serie?.code || ''}`
  const tags: ReactNode = quickSale ? <QuickSaleBadge size="default" /> : null

  return (
    <Topbar
      title={`${quickSale ? 'Venda rápida' : 'Orçamento'} #${reference}`}
      supportText={
        // Até a configuração chegar, não mostra o cliente padrão como se
        // fosse o informado
        quickSale && !settingsRes
          ? ''
          : withoutClient
            ? 'Cliente não informado'
            : data?.client?.name || ''
      }
      previousPage={previousUrl}
      badge={
        quotationsStatusObj[status || data?.status] || {
          text: 'Desconhecido',
          variant: 'neutralLight',
        }
      }
      tags={tags}
      primaryCta={primaryCta}
    />
  )
}

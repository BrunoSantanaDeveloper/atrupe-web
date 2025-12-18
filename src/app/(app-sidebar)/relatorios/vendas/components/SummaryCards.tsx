'use client'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Icons
import {
  IconCheck,
  IconX,
  IconQuestionMark,
  IconCoin,
  IconPercentage,
  IconClock,
} from '@tabler/icons-react'

// Mock Data
import { mockSalesReportData } from '../mock-data'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function SummaryCards() {
  const { summary } = mockSalesReportData

  const cards = [
    {
      icon: IconCheck,
      variant: 'successLight' as const,
      label: `Aprovadas ${summary.approvedCount} OS`,
      value: formatCurrency(summary.approvedTotal),
    },
    {
      icon: IconX,
      variant: 'errorLight' as const,
      label: `Reprovadas/NS ${summary.rejectedCount}`,
      value: formatCurrency(summary.rejectedTotal),
    },
    {
      icon: IconQuestionMark,
      variant: 'warningLight' as const,
      label: 'Não respondidas NS',
      value: formatCurrency(summary.noResponseTotal),
    },
    {
      icon: IconCoin,
      variant: 'infoLight' as const,
      label: 'Juros/multa OS',
      value: formatCurrency(summary.averageTicket),
    },
    {
      icon: IconPercentage,
      variant: 'brandLight' as const,
      label: 'Comissão RBS',
      value: formatCurrency(summary.commission),
    },
    {
      icon: IconClock,
      variant: 'grayLight' as const,
      label: '% aprovação/mês',
      value: summary.approvalTime,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-4 flex items-center gap-3">
          <FeaturedIcon
            variant={card.variant as FeaturedIconProps['variant']}
            Icon={card.icon}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 truncate">{card.label}</span>
            <span className="text-lg font-semibold text-gray-900">
              {card.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

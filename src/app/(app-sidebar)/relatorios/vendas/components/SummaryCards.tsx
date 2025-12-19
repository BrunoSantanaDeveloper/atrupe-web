'use client'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Icons
import {
  IconX,
  IconCoin,
  IconClock,
  IconPercentage,
  IconCircleCheck,
  IconClockHour4,
} from '@tabler/icons-react'

// Mock Data
import { mockSalesReportData } from '../mock-data'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

export function SummaryCards() {
  const { summary } = mockSalesReportData

  const cards = [
    {
      icon: IconCircleCheck,
      variant: 'successLight',
      label: `Aprovadas (${summary.approvedCount})`,
      value: formatCurrencyToBrl(summary.approvedTotal),
    },
    {
      icon: IconClockHour4,
      variant: 'warningLight',
      label: `Aguardando (${summary.rejectedCount})`,
      value: formatCurrencyToBrl(summary.noResponseTotal),
    },
    {
      icon: IconX,
      variant: 'errorLight',
      label: `Não aprovadas (${summary.rejectedCount})`,
      value: formatCurrencyToBrl(summary.rejectedTotal),
    },
    {
      icon: IconCoin,
      variant: 'blueLight',
      label: 'Ticket médio O.S',
      value: formatCurrencyToBrl(summary.averageTicket),
    },
    {
      icon: IconPercentage,
      variant: 'blueLight',
      label: 'Comissão (8%)',
      value: formatCurrencyToBrl(summary.commission),
    },
    {
      icon: IconClock,
      variant: 'neutralLight',
      label: 'Aprovação média',
      value: summary.approvalTime,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

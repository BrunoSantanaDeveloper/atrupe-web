'use client'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Icons
import {
  IconCoin,
  IconCircleX,
  IconClockHour4,
  IconClockCheck,
  IconCircleCheck,
  IconReceiptDollar,
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
      icon: IconCircleX,
      variant: 'errorLight',
      label: `Não aprovadas (${summary.rejectedCount})`,
      value: formatCurrencyToBrl(summary.rejectedTotal),
    },
    {
      icon: IconCoin,
      variant: 'neutralLight',
      label: 'Ticket médio O.S',
      value: formatCurrencyToBrl(summary.averageTicket),
    },
    {
      icon: IconReceiptDollar,
      variant: 'neutralLight',
      label: 'Comissão (8%)',
      value: formatCurrencyToBrl(summary.commission),
    },
    {
      icon: IconClockCheck,
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
            size="md"
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

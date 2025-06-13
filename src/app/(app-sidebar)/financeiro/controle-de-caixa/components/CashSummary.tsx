'use client'

import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  IconDeviceImacDollar,
  IconDeviceImacUp,
  IconHistoryToggle,
  IconProps,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { CashControlType } from '@/types/financial/cashControl'

interface CashSummaryProps {
  data?: CashControlType
}

export function CashSummary({ data }: CashSummaryProps) {
  const cashInfo: {
    Icon: React.ComponentType<IconProps>
    label: string
    value: number
    variant: FeaturedIconProps['variant']
  }[] = [
    {
      Icon: IconDeviceImacUp,
      label: 'Abertura',
      value: data?.openingBalance || 0,
      variant: 'orangeLight',
    },
    {
      Icon: IconTrendingUp,
      label: 'Entrada',
      value: data?.totalIncomes || 0,
      variant: 'successLight',
    },
    {
      Icon: IconTrendingDown,
      label: 'Saída',
      value: data?.totalOutcomes || 0,
      variant: 'errorLight',
    },
    {
      Icon: IconHistoryToggle,
      label: 'Retroativo',
      value: data?.retroactive || 0,
      variant: 'neutralLight',
    },
    {
      Icon: IconDeviceImacDollar,
      label: 'Saldo',
      value: data?.transactionsAmount || 0,
      variant: 'blueLight',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 p-6">
      {cashInfo.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center text-center"
        >
          <FeaturedIcon
            rounded
            variant={item.variant}
            size="lg"
            Icon={item.Icon}
            className="mix-blend-multiply"
          />
          <p className="font-semibold mt-2">
            {formatCurrencyToBrl(item.value)}
          </p>
          <p className="text-xs text-gray">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

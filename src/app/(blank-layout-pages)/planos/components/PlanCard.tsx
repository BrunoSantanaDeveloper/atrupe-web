'use client'

import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { IconCheck } from '@tabler/icons-react'

import { cn, formatCurrencyToBrl } from '@/lib/utils'

interface PlanCardProps {
  name: string
  price: number
  description: string
  features: { title: string }[]
  isSelected?: boolean
  onSelect: () => void
}

export function PlanCard({
  name,
  price,
  description,
  features,
  isSelected,
  onSelect,
}: PlanCardProps) {
  return (
    <Card className={cn('overflow-hidden', isSelected && 'border-brand-300')}>
      <CardHeader
        className={cn(
          'space-y-0 bg-brand-50 cursor-pointer border-b ',
          isSelected && 'border-brand-300',
        )}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-base text-brand-800">
            {name}
          </CardTitle>
          <Button
            variant={isSelected ? 'default' : 'outline'}
            size="iconXxs"
            RightIcon={isSelected ? IconCheck : undefined}
          />
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="mt-4">
          <span className="text-xl font-semibold">
            {formatCurrencyToBrl(price)}
          </span>
          <span className="text-sm text-gray">/mês</span>
        </div>
        {description && (
          <p className="text-sm text-gray-500 my-4">{description}</p>
        )}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <IconCheck className="w-4 h-4 mr-2 text-primary" />
              {feature.title}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

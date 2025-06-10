'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { IconCheck } from '@tabler/icons-react'

interface ModuleCardProps {
  name: string
  price: number
  description: string
  isSelected?: boolean
  onSelect: () => void
}

export function ModuleCard({
  name,
  price,
  description,
  isSelected,
  onSelect,
}: ModuleCardProps) {
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
            className="rounded"
            RightIcon={isSelected ? IconCheck : undefined}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xl font-semibold">
            {formatCurrencyToBrl(price)}
          </span>
          <span className="text-sm text-gray">/mês</span>
        </div>
        <p className="text-sm text-gray">{description}</p>
      </CardContent>
    </Card>
  )
}

'use client'

// Ui
import { FeaturedIcon } from '@/components/ui/featured-icon'
import type { IconComponentType } from '@/components/ui/icon'
import { FormItem, FormField, FormMessage } from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Form
import { useFormContext } from 'react-hook-form'

// Icon
import { IconCheck } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

interface Props {
  options: {
    label: string
    description?: string
    value: string
    icon?: IconComponentType
  }[]
  onChange?: (value: string) => void
  name?: string
  groupClassName?: string
}

export function FormToggleCard({
  options,
  onChange,
  groupClassName,
  name = 'type',
}: Props) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <ToggleGroup
            type="single"
            value={field.value}
            onValueChange={(value) => {
              if (value) field.onChange(value)
              onChange?.(value)
            }}
            className={cn('gap-4 w-full', groupClassName)}
          >
            {options.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="w-full h-full bg-white rounded-lg data-[state=on]:bg-brand-50 border data-[state=on]:border-brand-200 hover:bg-white [&_.check-icon]:data-[state=on]:bg-brand [&_.check-icon]:data-[state=on]:border-brand [&_.toggle-label]:data-[state=off]:grayscale"
              >
                <div className="flex items-center justify-between gap-1 py-3 cursor-pointer w-full">
                  <div className="flex items-center gap-4 text-start">
                    {option.icon ? (
                      <FeaturedIcon Icon={option.icon} tone="brand" size="sm" />
                    ) : null}
                    <div className="toggle-label">
                      <p className="text-brand-800">{option.label}</p>
                      {option.description && (
                        <p className="text-brand font-normal">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="flex items-center justify-center h-4 min-w-4 rounded-full bg-white text-white border border-gray-300 check-icon transition-colors">
                    {/* Marca de controle dentro do círculo de 16 px, fora da escala de ícones */}
                    <IconCheck aria-hidden size={11} className="stroke-[4px]" />
                  </span>
                </div>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

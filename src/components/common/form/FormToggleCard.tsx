'use client'

// Ui
import { FormItem, FormField, FormMessage } from '@/components/ui/form'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Form
import { useFormContext } from 'react-hook-form'

// Icon
import { IconCheck, IconProps } from '@tabler/icons-react'

interface Props {
  options: {
    label: string
    description?: string
    value: string
    icon: React.ComponentType<IconProps>
  }[]
  onChange?: (value: string) => void
}

export default function FormToggleCard({ options, onChange }: Props) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem className="w-full">
          <ToggleGroup
            type="single"
            value={field.value}
            onValueChange={(value) => {
              if (value) field.onChange(value)
              onChange?.(value)
            }}
            className="gap-4 w-full"
          >
            {options.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="w-full h-full bg-white rounded-lg data-[state=on]:bg-brand-50 border data-[state=on]:border-brand-200 hover:bg-white [&_.check-icon]:data-[state=on]:bg-brand [&_.check-icon]:data-[state=on]:border-brand [&_.toggle-label]:data-[state=off]:grayscale"
              >
                <div className="flex items-center justify-between gap-1 py-4 cursor-pointer w-full">
                  <div className="flex items-center gap-4 text-start">
                    <FeaturedIcon
                      Icon={option.icon}
                      variant="borderedLight"
                      size="sm"
                      rounded
                    />
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
                    <IconCheck size={11} className="stroke-[4px]" />
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

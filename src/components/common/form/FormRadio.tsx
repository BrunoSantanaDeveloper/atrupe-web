// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Lib
import { cn } from '@/lib/utils'

// Form
import { useFormContext } from 'react-hook-form'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

interface RadioItems {
  value: string
  label: string
  disabled?: boolean
}

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  className?: string
  items: RadioItems[]
}

export function FormRadio<T extends FieldValues>({
  name,
  label,
  className,
  items,
}: Props<T>) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-3', className)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex items-center gap-4"
            >
              {items.length
                ? items.map((item) => (
                    <FormItem
                      key={item.value}
                      className="flex items-center space-x-2 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem
                          value={item.value}
                          disabled={item.disabled}
                        />
                      </FormControl>
                      <FormLabel
                        className={cn(item.disabled && 'text-gray-300')}
                      >
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))
                : null}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

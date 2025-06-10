// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

// Form
import { useFormContext } from 'react-hook-form'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder?: string
  className?: string
  width?: string
  rows?: number
  disabled?: boolean
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder = label,
  width = 'w-full',
  className = '',
  rows,
  disabled = false,
}: Props<T>) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn('resize-none', className)}
              disabled={disabled}
              rows={rows}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

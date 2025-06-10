// UI Component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Lib Imports
import { cn } from '@/lib/utils'
import React, { HTMLInputTypeAttribute } from 'react'

// Type Imports
import {
  type Path,
  type Control,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'
import { NumericFormat } from 'react-number-format'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  type?: HTMLInputTypeAttribute
  className?: string
  onHasChanged?: () => void
}

export function Hour<T extends FieldValues>({
  name,
  label,
  control,
  placeholder,
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
}: Props<T>) {
  const { setValue } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <NumericFormat
              customInput={Input}
              decimalScale={2}
              decimalSeparator=":"
              placeholder={placeholder}
              onValueChange={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, e.floatValue ?? (0 as any))
                onHasChanged?.()
              }}
              value={field?.value || ''}
              endAdornment={<>h</>}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

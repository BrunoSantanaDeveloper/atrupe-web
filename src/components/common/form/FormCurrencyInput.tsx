// UI component Imports
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
import { HTMLInputTypeAttribute } from 'react'

// Type Imports
import type { Path, Control, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
  width?: string
  type?: HTMLInputTypeAttribute | undefined
  className?: string
}

export function FormCurrencyInput<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  startAdornment,
  endAdornment,
  width = 'flex-[1_0_100px]',
  className,
  ...props
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              placeholder={placeholder}
              startAdornment={startAdornment}
              endAdornment={endAdornment}
              value={field.value || ''}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, '')
                value = (Number(value) / 100).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                field.onChange(value)
              }}
              className={className}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

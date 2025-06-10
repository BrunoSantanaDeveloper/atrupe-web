// UI
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Libs
import { cn } from '@/lib/utils'
import { HTMLInputTypeAttribute } from 'react'
import { useFormContext } from 'react-hook-form'

// Types
import { type Path, type FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  label?: string
  placeholder?: string
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
  width?: string
  type?: HTMLInputTypeAttribute | undefined
  className?: string
  additionalOnChange?: (value: number | null) => void
}

// Função para formatar o valor como moeda BRL
function formatCurrency(value: number): string {
  return (value / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Função para desformatar o valor de moeda para centavos
function parseCurrency(value: string): number {
  const numericValue = value.replace(/\D/g, '')
  return parseInt(numericValue, 10) || 0
}

export function FormBrlInput<T extends FieldValues>({
  name,
  label,
  placeholder = label,
  startAdornment,
  endAdornment,
  width = 'flex-[1_0_100px]',
  className,
  additionalOnChange,
  ...props
}: Props<T>) {
  const { control } = useFormContext()

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
              value={formatCurrency(field.value || 0)}
              onChange={(e) => {
                const value = e.target.value
                const parsedValue = parseCurrency(value)
                field.onChange(parsedValue)
                additionalOnChange?.(parsedValue)
              }}
              className={className}
              inputMode="numeric"
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

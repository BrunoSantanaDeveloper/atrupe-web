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
import {
  type Path,
  type Control,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

// Third-party Imports
import { NumericFormat } from 'react-number-format'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  type?: HTMLInputTypeAttribute | undefined
  className?: string
  onHasChanged?: () => void
}

// Função para converter metros para quilômetros
function metersToKilometers(meters: number): number {
  return meters / 1000
}

// Função para converter quilômetros para metros
function kilometersToMeters(kilometers: number): number {
  return kilometers * 1000
}

export function Kilometers<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
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
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <NumericFormat
              customInput={Input}
              decimalScale={3}
              placeholder={placeholder}
              onValueChange={(e) => {
                const kilometersValue = e.floatValue ?? 0
                // Converter quilômetros para metros antes de salvar
                const metersValue = kilometersToMeters(kilometersValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, metersValue as any)
                onHasChanged?.()
              }}
              // Converter metros para quilômetros na exibição
              value={
                field?.value ? metersToKilometers(field.value).toString() : ''
              }
              endAdornment={<>KM</>}
              className={className}
              inputMode="decimal"
              allowedDecimalSeparators={['.', ',']}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

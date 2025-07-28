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

// Função para converter mililitros para litros
function millilitersToLiters(milliliters: number): number {
  return milliliters / 1000
}

// Função para converter litros para mililitros
function litersToMilliliters(liters: number): number {
  return liters * 1000
}

export function Liters<T extends FieldValues>({
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
              decimalScale={2}
              allowedDecimalSeparators={['.', ',']}
              placeholder={placeholder}
              onValueChange={(e) => {
                const litersValue = e.floatValue ?? 0
                // Converter litros para mililitros antes de salvar
                const millilitersValue = litersToMilliliters(litersValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, millilitersValue as any)
                onHasChanged?.()
              }}
              // Converter mililitros para litros na exibição
              value={
                field?.value ? millilitersToLiters(field.value).toString() : ''
              }
              endAdornment={<>l</>}
              className={className}
              inputMode="decimal"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

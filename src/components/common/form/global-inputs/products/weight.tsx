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
  defaultUnit?: string
  getUnitAbbreviation?: (code: string) => string
}

// Função para converter miligramas para quilogramas
function milligramsToKilograms(milligrams: number): number {
  return milligrams / 1_000_000
}

// Função para converter quilogramas para miligramas
function kilogramsToMilligrams(kilograms: number): number {
  return kilograms * 1_000_000
}

export function Weight<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
  defaultUnit = 'KG',
  getUnitAbbreviation = (code) => code.toLowerCase(),
}: Props<T>) {
  const { setValue } = useFormContext()

  const unitAbbreviation = getUnitAbbreviation(defaultUnit)

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
              decimalScale={3}
              allowedDecimalSeparators={['.', ',']}
              placeholder={placeholder}
              onValueChange={(e) => {
                const kilogramsValue = e.floatValue ?? 0
                // Converter quilogramas para miligramas antes de salvar
                const milligramsValue = kilogramsToMilligrams(kilogramsValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, milligramsValue as any)
                onHasChanged?.()
              }}
              // Converter miligramas para quilogramas na exibição
              value={
                field?.value
                  ? milligramsToKilograms(field.value).toString()
                  : ''
              }
              endAdornment={<>{unitAbbreviation}</>}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

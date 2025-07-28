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

export function Liters<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
  defaultUnit = 'LT',
  getUnitAbbreviation = (code) => code.toLowerCase(),
}: Props<T>) {
  const { setValue } = useFormContext()

  const unitAbbreviation = getUnitAbbreviation(defaultUnit)

  // Funções de conversão dinâmicas baseadas na unidade padrão
  const convertToMilliliters = (value: number) => {
    switch (defaultUnit) {
      case 'ML':
        return value // já em mililitros
      case 'LT':
        return value * 1000 // litros para mililitros
      default:
        return value * 1000
    }
  }

  const convertFromMilliliters = (value: number) => {
    switch (defaultUnit) {
      case 'ML':
        return value // já em mililitros
      case 'LT':
        return value / 1000 // mililitros para litros
      default:
        return value / 1000
    }
  }

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
                const inputValue = e.floatValue ?? 0
                // Converter para mililitros baseado na unidade padrão
                const millilitersValue = convertToMilliliters(inputValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, millilitersValue as any)
                onHasChanged?.()
              }}
              // Converter mililitros para unidade padrão na exibição
              value={
                field?.value
                  ? convertFromMilliliters(field.value).toString()
                  : ''
              }
              endAdornment={<>{unitAbbreviation}</>}
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

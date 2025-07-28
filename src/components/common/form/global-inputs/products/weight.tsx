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

  // Funções de conversão dinâmicas baseadas na unidade padrão
  const convertToMilligrams = (value: number) => {
    switch (defaultUnit) {
      case 'MG':
        return value // já em miligramas
      case 'GR':
        return value * 1000 // gramas para miligramas
      case 'KG':
        return value * 1_000_000 // quilogramas para miligramas
      default:
        return value * 1_000_000
    }
  }

  const convertFromMilligrams = (value: number) => {
    switch (defaultUnit) {
      case 'MG':
        return value // já em miligramas
      case 'GR':
        return value / 1000 // miligramas para gramas
      case 'KG':
        return value / 1_000_000 // miligramas para quilogramas
      default:
        return value / 1_000_000
    }
  }

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
                const inputValue = e.floatValue ?? 0
                // Converter para miligramas baseado na unidade padrão
                const milligramsValue = convertToMilligrams(inputValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, milligramsValue as any)
                onHasChanged?.()
              }}
              // Converter miligramas para unidade padrão na exibição
              value={
                field?.value
                  ? convertFromMilligrams(field.value).toString()
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

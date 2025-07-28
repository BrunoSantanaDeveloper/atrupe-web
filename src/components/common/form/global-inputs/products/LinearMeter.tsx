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
import { cn, metersToMillimeters, millimetersToMeters } from '@/lib/utils'
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

export function LinearMeter<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
  defaultUnit = 'MT',
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
              placeholder={placeholder}
              onValueChange={(e) => {
                const metersValue = e.floatValue ?? 0
                // Converter metros para milímetros antes de salvar
                const millimetersValue = metersToMillimeters(metersValue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(name, millimetersValue as any)
                onHasChanged?.()
              }}
              // Converter milímetros para metros na exibição
              value={
                field?.value ? millimetersToMeters(field.value).toString() : ''
              }
              endAdornment={<>{unitAbbreviation}</>}
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

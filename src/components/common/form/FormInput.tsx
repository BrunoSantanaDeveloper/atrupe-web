// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Form
import { useFormContext } from 'react-hook-form'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  label?: string
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
  width?: string
  additionalOnChange?: (value: string | number | null) => void
  formatValue?: (value: string | number | null) => string | number | null
}

export function FormInput<T extends FieldValues>({
  type,
  name,
  label,
  startAdornment,
  endAdornment,
  width = 'flex-[1_0_100px]',
  additionalOnChange,
  formatValue,
  ...props
}: Props<T>) {
  const { control, setError, clearErrors } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const displayValue = formatValue
          ? formatValue(field.value)
          : field.value

        return (
          <FormItem className={cn('flex flex-col', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Input
                type={type}
                startAdornment={startAdornment}
                endAdornment={endAdornment}
                placeholder={label}
                {...field}
                value={displayValue ?? ''}
                {...props}
                onChange={(e) => {
                  let value

                  if (type === 'number') {
                    const valueNumber = Number(e.target.value)
                    const maxNumber = Number(props.max)

                    if (e.target.value === '') {
                      value = null
                    } else if (valueNumber > maxNumber) {
                      value = maxNumber
                      setError(name, {
                        type: 'max',
                        message: `Máximo permitido: ${maxNumber}`,
                      })
                    } else {
                      value = valueNumber
                      clearErrors(name)
                    }
                  } else {
                    value = e.target.value
                  }

                  field.onChange(value)
                  additionalOnChange?.(value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

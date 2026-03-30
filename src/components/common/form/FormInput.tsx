// React
import { useState } from 'react'

// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// UI
import { Button } from '@/components/ui/button'

// Form
import { useFormContext } from 'react-hook-form'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Icons
import { IconEye, IconEyeOff } from '@tabler/icons-react'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  label?: string
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
  showPasswordToggle?: boolean
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
  showPasswordToggle = true,
  width = 'flex-[1_0_100px]',
  additionalOnChange,
  formatValue,
  ...props
}: Props<T>) {
  const { control, setError, clearErrors } = useFormContext()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const displayValue = formatValue
          ? formatValue(field.value)
          : field.value

        return (
          <FormItem className={cn('flex flex-col relative', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Input
                type={type === 'password' && showPassword ? 'text' : type}
                startAdornment={startAdornment}
                endAdornment={endAdornment}
                placeholder={label}
                autoComplete="off"
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
                onBlur={(e) => {
                  field.onBlur()
                  props.onBlur?.(e)

                  if (
                    type !== 'password' &&
                    type !== 'number' &&
                    typeof e.target.value === 'string'
                  ) {
                    const trimmedValue = e.target.value.trim()
                    if (trimmedValue !== e.target.value) {
                      field.onChange(trimmedValue)
                      additionalOnChange?.(trimmedValue)
                    }
                  }
                }}
              />
            </FormControl>
            {type === 'password' && showPasswordToggle && (
              <Button
                type="button"
                variant="neutralGhost"
                size="iconSm"
                onClick={() => setShowPassword(!showPassword)}
                RightIcon={showPassword ? IconEyeOff : IconEye}
                className="absolute right-2 top-5 bg-white hover:bg-white active:bg-white"
                tabIndex={-1}
              />
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

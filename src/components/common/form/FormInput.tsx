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
}

export function FormInput<T extends FieldValues>({
  type,
  name,
  label,
  startAdornment,
  endAdornment,
  width = 'flex-[1_0_100px]',
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
              type={type}
              startAdornment={startAdornment}
              endAdornment={endAdornment}
              placeholder={label}
              {...field}
              {...props}
              onChange={(e) => {
                const value =
                  type === 'number'
                    ? e.target.value === ''
                      ? null
                      : Number(e.target.value)
                    : e.target.value

                field.onChange(value)
                additionalOnChange?.(value)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

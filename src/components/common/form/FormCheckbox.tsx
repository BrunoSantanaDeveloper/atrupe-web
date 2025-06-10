'use client'

// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// Form
import { useFormContext } from 'react-hook-form'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> {
  name: Path<T>
  label: string
  className?: string
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  className,
  disabled,
  onChange,
}: Props<T>) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                  onChange?.(checked as boolean)
                }}
              />
            </FormControl>
            <FormLabel className={cn(disabled && 'text-gray-300')}>
              {label}
            </FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface CheckboxBasicProps extends Omit<CheckboxProps, 'onCheckedChange'> {
  name: string
  label?: string
  className?: string
  onCheckedChange?: (checked: boolean /*  | 'indeterminate' */) => void
}

export function CheckboxBasic({
  name,
  label,
  className = 'flex-[1_0_100px]',
  ...props
}: CheckboxBasicProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Checkbox id={name} {...props} />
      {label && <Label htmlFor={name}>{label}</Label>}
    </div>
  )
}

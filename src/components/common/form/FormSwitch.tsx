// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

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
  checked?: boolean
  additionalOnChange?: (value: boolean) => void
}

export function FormSwitch<T extends FieldValues>({
  name,
  label,
  className,
  additionalOnChange,
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
              <Switch
                checked={field.value}
                onCheckedChange={(value) => {
                  field.onChange(value)
                  additionalOnChange?.(value)
                }}
              />
            </FormControl>
            <FormLabel>{label}</FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  // return (
  //   <div className={cn('flex items-center gap-2', className)}>
  //     <Switch id={name} checked={checked} onCheckedChange={setChecked} />
  //     <Label htmlFor={name}>{label}</Label>
  //   </div>
  // )
}

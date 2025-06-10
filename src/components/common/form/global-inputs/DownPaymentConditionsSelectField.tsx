'use client'

// UI
import {
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from '@/components/ui/form'
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectGroup,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useFormContext } from 'react-hook-form'
import { useDownPaymentConditions } from '@/hooks/queries/useDownPaymentConditions'

import { cn } from '@/lib/utils'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  onChange?: (value: string) => void
}

export function DownPaymentConditionsSelectField<T extends FieldValues>({
  name,
  label = 'Condição de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  onChange,
}: Props<T>) {
  const { data: paymentConditions } = useDownPaymentConditions({
    listAll: true,
  })
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <Select
            onValueChange={(value) => {
              field.onChange(value)
              onChange?.(value)
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {paymentConditions?.length ? (
                paymentConditions.map((group) => (
                  <SelectGroup key={group.paymentMethod.id}>
                    <SelectLabel>{group.paymentMethod.name}</SelectLabel>
                    {group.conditions.map((condition) => (
                      <SelectItem
                        key={condition.id}
                        value={condition.id}
                        className="ml-2"
                      >
                        {condition.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              ) : (
                <div className="text-gray-400 cursor-not-allowed">Vazio</div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

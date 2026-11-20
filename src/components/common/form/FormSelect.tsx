import type * as React from 'react'
// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import { type Path, useFormContext, type FieldValues } from 'react-hook-form'

export interface SelectOption {
  label: string | JSX.Element
  value: string
  /** Opção visível mas não selecionável — usada para sinalizar o que ainda
   *  não é suportado, em vez de esconder e deixar o usuário procurar. */
  disabled?: boolean
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  options: SelectOption[]
  width?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
  additionalOnChange?: (value: string) => void
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  placeholder = label,
  options,
  width = 'flex-[1_0_100px]',
  disabled,
  className,
  emptyMessage = 'Vazio',
  additionalOnChange,
}: FormSelectProps<T>) {
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
              additionalOnChange?.(value)
            }}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {options.length ? (
                  options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectLabel className="text-gray-400 cursor-not-allowed">
                    {emptyMessage}
                  </SelectLabel>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface SelectBasicProps {
  name: string
  label?: string
  // O (i) ao lado do rótulo (20/11/2026), no lugar de uma linha solta
  // embaixo do campo
  labelSuffix?: React.ReactNode
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
  emptyMessage?: string
  value?: string
  onChange?: (value: string) => void
}

export function SelectBasic({
  name,
  label,
  labelSuffix,
  placeholder = label,
  options,
  className = 'flex-[1_0_100px]',
  emptyMessage = 'Vazio',
  value,
  onChange,
}: SelectBasicProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {labelSuffix ? (
        <div className="mb-2 flex items-center gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          {labelSuffix}
        </div>
      ) : (
        <Label htmlFor={name} className="mb-2">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectGroup>
          <SelectContent>
            {options.length ? (
              options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectLabel className="text-gray-400 cursor-not-allowed">
                {emptyMessage}
              </SelectLabel>
            )}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}

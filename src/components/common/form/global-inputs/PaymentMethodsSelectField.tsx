'use client'

import React, { useMemo, useRef, useState } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectContent,
  SelectTrigger,
  SelectSeparator,
} from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

// Hooks
import { usePaymentMethod } from '@/hooks/queries/usePaymentMethods'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Icons
import { IconPlus } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const CREATE_NEW_VALUE = '__CREATE_NEW__'

function generateCode(name: string): string {
  const words = name.trim().toUpperCase().split(/\s+/).filter(Boolean)
  if (words.length >= 3)
    return words
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
  if (words.length === 2)
    return (words[0].slice(0, 2) + words[1][0]).toUpperCase()
  return name.replace(/\s/g, '').slice(0, 3).toUpperCase()
}

interface CreateFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder: string
  width: string
  disabled?: boolean
  additionalOnChange?: (value: string, label: string) => void
}

function SelectPaymentMethodCreateField<T extends FieldValues>({
  name,
  label,
  placeholder,
  width,
  disabled,
  additionalOnChange,
}: CreateFieldProps<T>) {
  const { control } = useFormContext()
  const { data: paymentMethods } = usePaymentMethod()
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newMethodName, setNewMethodName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const fieldOnChangeRef = useRef<(val: string) => void>(() => {})

  const options = useMemo(() => {
    return paymentMethods?.map((m) => ({ value: m.id, label: m.name })) ?? []
  }, [paymentMethods])

  const handleCreate = async () => {
    if (!newMethodName.trim()) return
    setIsCreating(true)
    const code = generateCode(newMethodName)
    const result = await createItemNew({
      route: '/payment-method',
      data: { name: newMethodName.trim(), code },
    })
    setIsCreating(false)
    if (!result.success) {
      toast.error(result.message || 'Erro ao criar forma de pagamento')
      return
    }
    const newId = result.data?.id
    const newName = newMethodName.trim()
    await queryClient.refetchQueries({ queryKey: ['payment-method-list'] })
    if (newId) {
      fieldOnChangeRef.current(newId)
      additionalOnChange?.(newId, newName)
    }
    toast.success('Forma de pagamento criada com sucesso')
    setNewMethodName('')
    setCreateDialogOpen(false)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) setNewMethodName('')
    setCreateDialogOpen(open)
  }

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          fieldOnChangeRef.current = field.onChange
          return (
            <FormItem className={cn('flex flex-col', width)}>
              {label ? <FormLabel>{label}</FormLabel> : null}
              <Select
                onValueChange={(val) => {
                  if (val === CREATE_NEW_VALUE) {
                    setCreateDialogOpen(true)
                    return
                  }
                  field.onChange(val)
                  const selected = options.find((opt) => opt.value === val)
                  additionalOnChange?.(val, selected?.label ?? '')
                }}
                value={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectItem value={CREATE_NEW_VALUE}>
                      <span className="flex items-center gap-1.5 text-primary font-medium">
                        <IconPlus size={14} />
                        Adicionar nova forma
                      </span>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova forma de pagamento</DialogTitle>
            <DialogDescription className="sr-only">
              Criar nova forma de pagamento
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-payment-method-name">Nome</Label>
              <Input
                id="new-payment-method-name"
                placeholder="Ex: Transferência Bancária"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
                autoFocus
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!newMethodName.trim() || isCreating}
              isLoading={isCreating}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  disabled?: boolean
  allowCreate?: boolean
  additionalOnChange?: (value: string, label: string) => void
}

export function SelectPaymentMethodField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  noForm,
  disabled,
  allowCreate,
  additionalOnChange,
  ...props
}: Props<T>) {
  const { data: paymentMethods } = usePaymentMethod()

  const options = useMemo(() => {
    return paymentMethods?.map((paymentMethod) => ({
      value: paymentMethod.id,
      label: paymentMethod.name,
    }))
  }, [paymentMethods])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: 'Todas' }, ...(options || [])]}
        value={value}
        onChange={(val) => additionalOnChange?.(val, '')}
        className={width}
        disabled={disabled}
        {...props}
      />
    )

  if (allowCreate) {
    return (
      <SelectPaymentMethodCreateField<T>
        name={name}
        label={label}
        placeholder={placeholder}
        width={width}
        disabled={disabled}
        additionalOnChange={additionalOnChange}
      />
    )
  }

  const handleChange = (value: string) => {
    const selectedOption = options?.find((opt) => opt.value === value)
    additionalOnChange?.(value, selectedOption?.label ?? '')
  }

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      additionalOnChange={handleChange}
      disabled={disabled}
      {...props}
    />
  )
}

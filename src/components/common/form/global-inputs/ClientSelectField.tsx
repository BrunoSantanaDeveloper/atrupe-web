'use client'

import * as React from 'react'
import { User, ChevronDown } from 'lucide-react'
// Type Imports
import type { Path, Control, FieldValues } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useClientSearch } from '@/hooks/queries/useClients'
import { Input } from '@/components/ui/input'
import { FormField, FormLabel, FormMessage } from '@/components/ui/form'

interface Props<T extends FieldValues> {
  control?: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  width?: string
  value?: string
  onChange?: (value: string) => void
  defaultQuery?: string
}

export function ClientSelectField<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  defaultQuery = '',
}: Props<T>) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState(defaultQuery || '')
  const { data: clients, isLoading } = useClientSearch(query)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('space-y-1', width)}>
          {/* <Label htmlFor={name}>{label}</Label> */}
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full border text-sm text-gray-500 border-gray-300 bg-white shadow-sm focus-within:border-brand focus-within:ring-1 focus-within:ring-brand data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 overflow-hidden justify-between"
              >
                <div
                  className={cn(
                    'flex flex-row font-normal',
                    query && 'text-gray-900',
                  )}
                >
                  <User className="h-5 w-5 shrink-0 opacity-50 mr-2 " />
                  {query || 'Digite para buscar (pelo menos 3 caracteres)'}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className=" p-0 w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
              <Command className="w-full">
                <div className={cn('p-2', width)}>
                  <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    className={cn('border rounded px-2 py-1 w-[100%]')}
                  />
                </div>
                <CommandList>
                  {isLoading && <CommandEmpty>Buscando...</CommandEmpty>}
                  {!isLoading && clients?.length === 0 && (
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  )}
                  <CommandGroup>
                    {clients?.map((client) => (
                      <CommandItem
                        key={client.id}
                        {...field}
                        defaultValue={value}
                        onSelect={() => {
                          setQuery(client.name)
                          onChange?.(client.id)
                          setOpen(false)
                        }}
                      >
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </div>
      )}
    />
  )
}

'use client'

// React
import { useEffect, useState } from 'react'

// UI
import {
  Command,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Lib
import { cn } from '@/lib/utils'

// Hook
import { useClientSearch } from '@/hooks/queries/useClients'

// Type
import { type Path, type FieldValues, useFormContext } from 'react-hook-form'

// Icon
import { User } from 'lucide-react'
import { IconChevronDown } from '@tabler/icons-react'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  value?: string
  onChange: (value: string) => void
  defaultValues?: {
    id?: string
    name?: string
  }
}

export function ClientSelectField<T extends FieldValues>({
  name,
  label = 'Cliente',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  defaultValues,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState({
    id: defaultValues?.id || '',
    name: defaultValues?.name || '',
  })

  const { data: clients, isLoading } = useClientSearch(query)

  const { control } = useFormContext()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      setOpen(true)
      setQuery(e.key)
    }
  }

  useEffect(() => {
    if (!selectedClient.id) {
      onChange('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient])

  // TODO : melhorar acessibilidade na navegação entre as opções do popover aberto
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={
                  control?._formState.errors[name] ? 'inputError' : 'input'
                }
                role="combobox"
                aria-expanded={open}
                LeftIcon={User}
                leftIconSize={20}
                RightIcon={IconChevronDown}
                rightIconSize={20}
                className="w-full"
                onKeyDown={handleKeyDown}
              >
                <div
                  className={cn(
                    'flex flex-row font-normal',
                    selectedClient.name && 'text-gray-900',
                  )}
                >
                  {selectedClient.name || 'Digite para buscar'}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
              <Command className="w-full">
                <div className="p-2">
                  <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                  />
                </div>
                <CommandList>
                  {isLoading && <CommandEmpty>Buscando...</CommandEmpty>}
                  {!isLoading && !clients?.length && (
                    <CommandEmpty>
                      {query.length < 3
                        ? 'Digite pelo menos 3 caracteres...'
                        : 'Nenhum cliente encontrado'}
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {clients?.map((client) => (
                      <CommandItem
                        key={client.id}
                        {...field}
                        defaultValue={value}
                        onSelect={() => {
                          onChange(client.id)
                          setOpen(false)
                          setSelectedClient({
                            id: client.id,
                            name: client.name,
                          })
                        }}
                      >
                        {`${client.name} - ${client?.cnpj || client?.cpf || ''}`}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

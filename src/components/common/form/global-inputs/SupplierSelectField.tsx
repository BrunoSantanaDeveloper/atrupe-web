'use supplier'

// React
import { useState } from 'react'

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
import { useSupplierSearch } from '@/hooks/queries/useSupplier'

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

export function SupplierSelectField<T extends FieldValues>({
  name,
  label = 'Fornecedor',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  defaultValues,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState({
    id: defaultValues?.id || '',
    name: defaultValues?.name || '',
  })
  const { data: suppliers, isLoading } = useSupplierSearch(query)

  const { control } = useFormContext()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Abre o popover quando uma letra é digitada
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      setOpen(true)
      setQuery(e.key)
    }
  }

  // useEffect(() => {
  //   if (!selectedSupplier.id) {
  //     onChange('')
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedSupplier])

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
                    selectedSupplier.name && 'text-gray-900',
                  )}
                >
                  {selectedSupplier.name || 'Digite para buscar'}
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
                  {!isLoading && !suppliers?.length && (
                    <CommandEmpty>
                      {query.length < 3
                        ? 'Digite pelo menos 3 caracteres...'
                        : 'Nenhum fornecedor encontrado'}
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {suppliers?.map((supplier) => (
                      <CommandItem
                        key={supplier.id}
                        {...field}
                        defaultValue={value}
                        onSelect={() => {
                          onChange(supplier.id)
                          setOpen(false)
                          setSelectedSupplier({
                            id: supplier.id,
                            name: supplier.name,
                          })
                        }}
                      >
                        {`${supplier.name} - ${supplier.cnpj || supplier.cpf || ''}`}
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

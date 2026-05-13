'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// UI
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Icons
import {
  IconCheck,
  IconChevronDown,
  IconLoader2,
  IconTruckDelivery,
  IconX,
} from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

// Utils
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SupplierData {
  id: string
  name: string
  cnpjCpf?: string
  ie?: string
  address?: string
  addressNumber?: string
  city?: string
  state?: string
}

interface RawSupplier {
  id: string
  name?: string
  corporateName?: string
  cnpj?: string
  cpf?: string
  stateRegistration?: string
  addresses?: Array<{
    street?: string
    number?: string
    city?: string
    state?: string
  }>
}

function mapRawToSupplierData(raw: RawSupplier): SupplierData {
  const addr = raw.addresses?.[0]
  return {
    id: raw.id,
    name: raw.corporateName || raw.name || '',
    cnpjCpf: raw.cnpj || raw.cpf,
    ie: raw.stateRegistration,
    address: addr?.street,
    addressNumber: addr?.number,
    city: addr?.city,
    state: addr?.state,
  }
}

function formatDocument(doc?: string) {
  if (!doc) return ''
  const clean = doc.replace(/\D/g, '')
  if (clean.length === 14)
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  if (clean.length === 11)
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return doc
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  placeholder?: string
  onSelect: (supplier: SupplierData | null) => void
}

export function SupplierSelect({
  placeholder = 'Buscar transportadora por nome ou CNPJ...',
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [suppliers, setSuppliers] = useState<SupplierData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuppliers = useCallback(async (term: string) => {
    setIsLoading(true)
    setHasError(false)
    try {
      const result = await getData({
        route: '/supplier',
        filters: { search: term },
        perPage: '20',
      })
      if (result.success && result.data) {
        const raw = Array.isArray(result.data)
          ? result.data
          : result.data.data || []
        setSuppliers((raw as RawSupplier[]).map(mapRawToSupplierData))
      } else {
        setSuppliers([])
      }
    } catch {
      setHasError(true)
      setSuppliers([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!search.trim()) {
      setSuppliers([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      fetchSuppliers(search.trim())
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchSuppliers])

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSuppliers([])
      setHasSearched(false)
    }
  }, [open])

  const handleSelect = (s: SupplierData) => {
    onSelect(s)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="neutralOutline"
          size="sm"
          className="gap-1.5 text-xs"
          LeftIcon={IconTruckDelivery}
        >
          Alterar transportadora
          <IconChevronDown
            size={14}
            className={cn(
              'transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[380px]" align="end" sideOffset={6}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                <IconLoader2 size={16} className="animate-spin" />
                Buscando fornecedores...
              </div>
            )}

            {/* Error */}
            {hasError && !isLoading && (
              <div className="py-4 text-center text-sm text-error-600">
                Erro ao buscar fornecedores. Tente novamente.
              </div>
            )}

            {/* Empty prompt */}
            {!isLoading && !hasSearched && !hasError && (
              <div className="py-6 text-center text-sm text-gray-400">
                Digite para buscar transportadoras
              </div>
            )}

            {/* Empty results */}
            {!isLoading &&
              hasSearched &&
              !hasError &&
              suppliers.length === 0 && (
                <CommandEmpty>Nenhuma transportadora encontrada.</CommandEmpty>
              )}

            {/* Results */}
            {!isLoading && suppliers.length > 0 && (
              <CommandGroup heading="Fornecedores / Transportadoras">
                {suppliers.map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.id}
                    onSelect={() => handleSelect(s)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                  >
                    <IconCheck size={16} className="shrink-0 opacity-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-gray-800 truncate">
                        {s.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {s.cnpjCpf && <span>{formatDocument(s.cnpjCpf)}</span>}
                        {s.city && s.state && (
                          <>
                            {s.cnpjCpf && (
                              <span className="text-gray-300">·</span>
                            )}
                            <span>
                              {s.city} / {s.state}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Clear option */}
            {!isLoading && (
              <>
                <div className="px-3 py-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(null)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-error-600 transition-colors w-full"
                  >
                    <IconX size={14} />
                    Limpar transportadora
                  </button>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

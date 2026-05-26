'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  IconUser,
  IconUserPlus,
  IconX,
  IconLoader2,
} from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

// Utils
import { cn } from '@/lib/utils'
import { getBacenCodeByName } from '@/consts/country-codes'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClientData {
  id: string
  name: string
  cnpjCpf?: string
  email?: string
  phone?: string
  address?: string
  addressNumber?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  cep?: string
  ie?: string // Inscrição Estadual
  country?: string
  idEstrangeiro?: string
}

export interface ClientSelectProps {
  onSelect: (client: ClientData | null) => void
  selectedClient?: ClientData | null
  label?: string
  placeholder?: string
}

// Raw API shape returned from GET /client
interface RawClient {
  id: string
  name?: string
  corporateName?: string
  cnpj?: string
  cpf?: string
  email?: string
  phone?: string
  mobile?: string
  ie?: string
  addresses?: Array<{
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipcode?: string
    type?: string
    country?: string
  }>
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function mapRawToClientData(raw: RawClient): ClientData {
  const primaryAddress = raw.addresses?.[0]
  return {
    id: raw.id,
    name: raw.corporateName || raw.name || '',
    cnpjCpf: raw.cnpj || raw.cpf,
    email: raw.email,
    phone: raw.phone || raw.mobile,
    address: primaryAddress?.street,
    addressNumber: primaryAddress?.number,
    complement: primaryAddress?.complement,
    neighborhood: primaryAddress?.neighborhood,
    city: primaryAddress?.city,
    state: primaryAddress?.state,
    cep: primaryAddress?.zipcode,
    ie: raw.ie,
    country: primaryAddress?.country,
  }
}

// ─── Exported mapping functions ───────────────────────────────────────────────

export function clientToNfeRecipient(client: ClientData) {
  return {
    destCnpjCpf: client.cnpjCpf || '',
    destNome: client.name || '',
    destEndereco: client.address || '',
    destNumero: client.addressNumber || '',
    destComplemento: client.complement || '',
    destBairro: client.neighborhood || '',
    destMunicipio: client.city || '',
    destUf: client.state || '',
    destCep: client.cep || '',
    destEmail: client.email || '',
    destIe: client.ie || '',
    destPais: getBacenCodeByName(client.country || 'Brasil'),
    destIdEstrangeiro: client.idEstrangeiro || '',
  }
}

export function clientToNfseTomador(client: ClientData) {
  const cleanCnpjCpf = client.cnpjCpf?.replace(/\D/g, '') || ''
  return {
    cnpj: cleanCnpjCpf.length === 14 ? cleanCnpjCpf : undefined,
    cpf: cleanCnpjCpf.length === 11 ? cleanCnpjCpf : undefined,
    razaoSocial: client.name || '',
    endereco: client.address || '',
    numero: client.addressNumber || '',
    complemento: client.complement || '',
    bairro: client.neighborhood || '',
    municipio: client.city || '',
    uf: client.state || '',
    cep: client.cep || '',
    email: client.email || '',
    codigoPais: getBacenCodeByName(client.country || 'Brasil'),
    idEstrangeiro: client.idEstrangeiro || '',
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDocument(doc?: string) {
  if (!doc) return ''
  const clean = doc.replace(/\D/g, '')
  if (clean.length === 14) {
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return doc
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientSelect({
  onSelect,
  selectedClient,
  label = 'Cliente / Destinatário',
  placeholder = 'Buscar cliente por nome ou CNPJ/CPF...',
}: ClientSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<ClientData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchClients = useCallback(async (term: string) => {
    setIsLoading(true)
    setHasError(false)

    try {
      const result = await getData({
        route: '/client',
        filters: { search: term },
        perPage: '20',
      })

      if (result.success && result.data) {
        const mapped = (result.data as RawClient[]).map(mapRawToClientData)
        setClients(mapped)
      } else {
        setClients([])
      }
    } catch {
      setHasError(true)
      setClients([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!search.trim()) {
      setClients([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      fetchClients(search.trim())
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchClients])

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setClients([])
      setHasSearched(false)
    }
  }, [open])

  const handleSelect = (client: ClientData) => {
    onSelect(client)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
  }

  const triggerLabel = selectedClient ? selectedClient.name : placeholder

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full h-10 px-3 text-sm',
              !selectedClient && 'text-gray-400',
            )}
          >
            <IconUser
              size={16}
              className={cn(
                'shrink-0',
                selectedClient ? 'text-brand-600' : 'text-gray-400',
              )}
            />
            <span className="flex-1 truncate text-left">{triggerLabel}</span>
            <div className="flex items-center gap-1 shrink-0">
              {selectedClient && (
                <span
                  role="button"
                  onClick={handleClear}
                  className="flex items-center justify-center rounded-full p-0.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Limpar seleção"
                >
                  <IconX size={14} />
                </span>
              )}
              <IconChevronDown
                size={16}
                className={cn(
                  'text-gray-400 transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[320px]"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nome ou CNPJ/CPF..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                  <IconLoader2 size={16} className="animate-spin" />
                  Buscando clientes...
                </div>
              )}

              {/* Error state */}
              {hasError && !isLoading && (
                <div className="py-4 text-center text-sm text-error-600">
                  Erro ao buscar clientes. Tente novamente.
                </div>
              )}

              {/* Empty prompt — before any search */}
              {!isLoading && !hasSearched && !hasError && (
                <div className="py-6 text-center text-sm text-gray-400">
                  Digite para buscar clientes
                </div>
              )}

              {/* Empty results */}
              {!isLoading &&
                hasSearched &&
                !hasError &&
                clients.length === 0 && (
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                )}

              {/* Results */}
              {!isLoading && clients.length > 0 && (
                <CommandGroup heading="Clientes">
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => handleSelect(client)}
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                    >
                      <IconCheck
                        size={16}
                        className={cn(
                          'shrink-0 transition-opacity',
                          selectedClient?.id === client.id
                            ? 'opacity-100 text-brand-600'
                            : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-gray-800 truncate">
                          {client.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {client.cnpjCpf && (
                            <span>{formatDocument(client.cnpjCpf)}</span>
                          )}
                          {client.city && client.state && (
                            <>
                              {client.cnpjCpf && (
                                <span className="text-gray-300">·</span>
                              )}
                              <span>
                                {client.city} / {client.state}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* "Novo cliente" option — always shown when search is active */}
              {search.trim() && !isLoading && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="__novo_cliente__"
                      onSelect={() => {
                        // Navigate to client creation — parent can override via onSelect(null) + custom logic
                        window.open(
                          `/cadastros/clientes?nome=${encodeURIComponent(search.trim())}`,
                          '_blank',
                        )
                        setOpen(false)
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer text-brand-600"
                    >
                      <IconUserPlus size={16} className="shrink-0" />
                      <span className="font-medium">
                        Cadastrar &ldquo;{search.trim()}&rdquo; como novo
                        cliente
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected client summary card */}
      {selectedClient && (
        <div className="mt-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-brand-800 truncate">
                {selectedClient.name}
              </span>
              {selectedClient.cnpjCpf && (
                <span className="text-xs text-brand-600">
                  {formatDocument(selectedClient.cnpjCpf)}
                </span>
              )}
              {(selectedClient.address || selectedClient.city) && (
                <span className="text-xs text-gray-500 truncate">
                  {[
                    selectedClient.address,
                    selectedClient.addressNumber,
                    selectedClient.neighborhood,
                    selectedClient.city && selectedClient.state
                      ? `${selectedClient.city} / ${selectedClient.state}`
                      : selectedClient.city || selectedClient.state,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              )}
              {selectedClient.email && (
                <span className="text-xs text-gray-400">
                  {selectedClient.email}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="shrink-0 mt-0.5 text-gray-400 hover:text-error-600 transition-colors"
              aria-label="Remover cliente selecionado"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

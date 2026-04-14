'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// UI
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import {
  IconSearch,
  IconUserSearch,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { cn } from '@/lib/utils'

// Actions
import { getData } from '@/actions/_cruds'

interface ClientType {
  id: string
  name: string
  corporateName?: string
  cnpj?: string
  cpf?: string
}

interface Props {
  searchParams: SearchParamsType['searchParams']
}

export function ClientSearchSidebar({ searchParams }: Props) {
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const searchParamsHook = useSearchParams()

  const [clients, setClients] = useState<ClientType[]>([])

  const handleSearch = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!search.trim()) {
      setClients([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    try {
      const result = await getData({
        route: '/client',
        filters: { search: search.trim() },
        perPage: '20',
      })

      if (result.success && result.data) {
        const formattedClients = result.data.map((client: ClientType) => ({
          id: client.id,
          name: client.corporateName || client.name,
          cnpj: client.cnpj,
          cpf: client.cpf,
        }))
        setClients(formattedClients)
      } else {
        setClients([])
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClients([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectClient = (clientId: string) => {
    const params = new URLSearchParams(searchParamsHook.toString())

    if (params.get('clientId') === clientId) {
      params.delete('clientId')
    } else {
      params.set('clientId', clientId)
    }

    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const selectedClientId = searchParams?.clientId as string

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-2">
        <Label
          htmlFor="client-search"
          className="text-sm font-medium text-gray-700"
        >
          Nome do cliente
        </Label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="client-search"
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startAdornment={
                <IconSearch size={18} className="text-gray-400" />
              }
            />
          </div>
          <Button
            type="submit"
            size="iconMd"
            LeftIcon={isSearching ? IconLoader2 : IconSearch}
            disabled={isSearching}
            className={isSearching ? '[&>svg]:animate-spin' : ''}
            aria-label="Buscar clientes"
          />
        </form>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-auto bg-gray-50/50">
        {clients.length > 0 ? (
          <div className="flex flex-col">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client.id)}
                className={cn(
                  'flex items-center justify-between px-6 py-4 text-left border-b border-gray-100 transition-colors hover:bg-white',
                  selectedClientId === client.id &&
                    'bg-white border-l-4 border-l-success-600',
                )}
              >
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'font-medium text-gray-700',
                      selectedClientId === client.id && 'text-success-700',
                    )}
                  >
                    {client.name}
                  </span>
                  {(client.cnpj || client.cpf) && (
                    <span className="text-xs text-gray-400">
                      {client.cnpj || client.cpf}
                    </span>
                  )}
                </div>
                {selectedClientId === client.id && (
                  <IconCheck size={18} className="text-success-600" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="space-y-4">
              <FeaturedIcon
                Icon={IconUserSearch}
                size="xl"
                variant="borderedLight"
                rounded
                color="success"
              />
              <div className="space-y-1">
                <p className="font-semibold text-lg text-gray-900">
                  {isSearching ? 'Buscando...' : 'Sem clientes filtrados'}
                </p>
                <p className="text-sm text-gray-500">
                  {isSearching
                    ? 'Aguarde um momento'
                    : 'Digite um nome ou CNPJ para buscar'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

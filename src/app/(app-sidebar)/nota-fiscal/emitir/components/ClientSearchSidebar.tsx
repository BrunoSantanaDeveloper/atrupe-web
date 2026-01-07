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
import { Search } from 'lucide-react'
import { IconSearch, IconUserSearch, IconCheck } from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ClientType } from './IssueInvoice'
import { cn } from '@/lib/utils'

interface Props {
  searchParams: SearchParamsType['searchParams']
}

export function ClientSearchSidebar({ searchParams }: Props) {
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const searchParamsHook = useSearchParams()

  // Mock search results
  const [clients, setClients] = useState<ClientType[]>([])

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!search.trim()) {
      setClients([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    // Simulating API call
    setTimeout(() => {
      setClients([
        { id: '1', name: 'Nome do Cliente Ltda' },
        { id: '2', name: 'Outro Cliente Exemplo S.A.' },
        { id: '3', name: 'Cliente de Teste Me' },
      ])
    }, 500)
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
              placeholder="Buscar por..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startAdornment={<Search size={18} className="text-gray-400" />}
            />
          </div>
          <Button type="submit" size="iconMd" LeftIcon={IconSearch} />
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
                <span
                  className={cn(
                    'font-medium text-gray-700',
                    selectedClientId === client.id && 'text-success-700',
                  )}
                >
                  {client.name}
                </span>
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
                  {isSearching && !clients.length
                    ? 'Buscando...'
                    : 'Sem clientes filtrados'}
                </p>
                <p className="text-sm text-gray-500">
                  {isSearching && !clients.length
                    ? 'Aguarde um momento'
                    : 'Faça uma nova busca'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

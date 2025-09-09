'use client'

// React Imports
import { PropsWithChildren, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// UI component Imports
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'

// Icon Imports
import { Search } from 'lucide-react'
import { IconSearch } from '@tabler/icons-react'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

interface Props extends PropsWithChildren, SearchParamsType {}

export function TableFiltersHeader({ searchParams, children }: Props) {
  const [search, setSearch] = useState(searchParams.search || '')

  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()

    const query = search.trim()

    if (!query) {
      params.delete('search')
    } else {
      params.set('search', query)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
      {children}
      <form onSubmit={handleSearch} className="flex items-end gap-2 ml-auto">
        <div className="flex flex-col w-64 gap-2">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            type="search"
            value={search}
            placeholder="Buscar por..."
            startAdornment={<Search size={18} />}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          size="iconMd"
          title="buscar"
          aria-label="Botão de busca"
          LeftIcon={IconSearch}
        />
      </form>
    </CardHeader>
  )
}

'use client'

// React Imports
import { PropsWithChildren, useState } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI component Imports
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'

// Icon Imports
import { IconSearch } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

interface Props extends PropsWithChildren, SearchParamsType {}

export function TableFiltersHeader({ searchParams, children }: Props) {
  const [search, setSearch] = useState(searchParams.search || '')

  const router = useRouter()
  const pathname = usePathname()

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

    // Query vazia com `?` seria resolvida como URL relativa pelo Next e a
    // listagem não recarregaria; o pathname garante uma navegação real.
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <CardHeader className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
      <form
        onSubmit={handleSearch}
        className="flex items-end gap-2 w-full lg:w-auto"
      >
        <div className="flex flex-col flex-1 lg:flex-none lg:w-64 gap-2">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            type="search"
            value={search}
            placeholder="Buscar por..."
            startAdornment={<IconSearch aria-hidden size={ICON_SIZE.md} />}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          title="Buscar"
          aria-label="Buscar"
          LeftIcon={IconSearch}
        />
      </form>
    </CardHeader>
  )
}

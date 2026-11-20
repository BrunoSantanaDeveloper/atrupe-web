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
import { CollapsibleFilters } from '@/components/common/CollapsibleFilters'

// Icon Imports
import { IconSearch } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

interface Props extends PropsWithChildren, SearchParamsType {
  // Quantos filtros estão aplicados, para o número no funil do celular.
  // Sem ele, conta os parâmetros da URL que não são busca, aba, página nem
  // ordenação
  activeCount?: number
}

// Parâmetros da URL que não são filtro: não contam no número do funil.
// `endDate` anda junto com `startDate` (o período conta uma vez)
const NOT_FILTERS = new Set([
  'search',
  'page',
  'perPage',
  'limit',
  'status',
  'tab',
  'aba',
  'view',
  'orderBy',
  'sort',
  'endDate',
])

export function TableFiltersHeader({
  searchParams,
  children,
  activeCount,
}: Props) {
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

  const filtersApplied =
    activeCount ??
    Object.entries(searchParams || {}).filter(
      ([key, value]) => !NOT_FILTERS.has(key) && value && value !== 'all',
    ).length

  // No celular, os filtros e a busca ficam fechados atrás do funil e da lupa,
  // e a lista aparece primeiro (ajuste de mobile, 20/11/2026). A partir de
  // `sm` o wrapper some (display: contents) e a grade fica como sempre
  return (
    <CardHeader className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
      {/* Sem filtros, a coluna deles fica vazia a partir do tablet para a
          busca continuar à direita, como antes dos filtros recolhíveis */}
      {children ? null : <div aria-hidden className="hidden sm:block" />}
      <CollapsibleFilters
        className="sm:contents"
        contentClassName="sm:order-1"
        searchClassName="sm:order-2 sm:mt-1.5"
        activeCount={filtersApplied}
        searchActive={!!searchParams.search}
        search={
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
        }
      >
        {children ? (
          <div className="flex flex-wrap gap-4 items-end">{children}</div>
        ) : null}
      </CollapsibleFilters>
    </CardHeader>
  )
}

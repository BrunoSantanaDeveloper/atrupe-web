'use client'

// React
import { useRouter } from 'next/navigation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

// UI
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select'

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleSort = (key: string, value: string) => {
    if (!value || value === 'padrao') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'todos') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      <SortSelectorField
        name="sort"
        width="w-[220px]"
        value={searchParams?.sort || 'padrao'}
        onChange={(value) => handleSort('sort', value)}
      />

      <div className="w-[220px]">
        <Select
          value={searchParams?.module || 'todos'}
          onValueChange={(value) => handleFilter('module', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Módulos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Módulos</SelectItem>
            <SelectItem value="modulo1">Módulo 1</SelectItem>
            <SelectItem value="modulo2">Módulo 2</SelectItem>
            <SelectItem value="modulo3">Módulo 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[220px]">
        <Select
          value={searchParams?.state || 'todos'}
          onValueChange={(value) => handleFilter('state', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="sp">São Paulo</SelectItem>
            <SelectItem value="rj">Rio de Janeiro</SelectItem>
            <SelectItem value="mg">Minas Gerais</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

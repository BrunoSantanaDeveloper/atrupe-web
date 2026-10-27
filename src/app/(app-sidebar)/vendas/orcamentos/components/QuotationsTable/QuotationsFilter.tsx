'use client'

// React
import { useRouter } from '@/hooks/useRouter'
import type { DateRange } from 'react-day-picker'

// Components
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { ActionButton } from '@/components/common/ActionButton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Hooks
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function QuotationsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  // Filtro por marcador de acompanhamento (CRM fase 1): só com o recurso dos
  // marcadores. O número é quantos orçamentos em negociação têm cada um
  const { hasFeature } = usePlanFeatures()
  const showTagFilter = hasFeature(FEATURES.SALES.QUOTATION_STATUS_COLUMN)
  const { data: tags } = useQuotationTag()
  const tagOptions = (tags || []).map((tag) => ({
    value: tag.id,
    label:
      typeof tag.quotations === 'number'
        ? `${tag.title} (${tag.quotations})`
        : tag.title,
  }))

  const orderBy =
    searchParams?.orderBy === 'nextContactAt' ? 'nextContactAt' : 'createdAt'
  // Padrão: criação do mais novo para o mais antigo; próximo contato do mais
  // próximo para o mais distante
  const sort =
    searchParams?.sort === 'asc' || searchParams?.sort === 'desc'
      ? searchParams.sort
      : orderBy === 'nextContactAt'
        ? 'asc'
        : 'desc'

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const hasUrlParams = searchParams?.startDate && searchParams?.endDate

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateFromISO = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  const getDefaultDateRange = (): DateRange | undefined => {
    if (hasUrlParams) {
      return {
        from: parseDateFromISO(searchParams.startDate!),
        to: parseDateFromISO(searchParams.endDate!),
      }
    }

    return undefined
  }

  const defaultDateRange = getDefaultDateRange()

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      params.set('startDate', formatDateToISO(range.from))
      params.set('endDate', formatDateToISO(range.to))
    } else {
      params.delete('startDate')
      params.delete('endDate')
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      <DateRangePickerBasic
        label="Período"
        placeholder="Selecione o período"
        className="w-full sm:w-[220px]"
        value={defaultDateRange}
        onChange={handleDateRangeChange}
      />
      <SelectSerieField
        name="serie"
        label="Série"
        width="w-full sm:w-[220px]"
        noForm
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        name="seller"
        label="Vendedor"
        width="w-full sm:w-[220px]"
        noForm
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
      {showTagFilter ? (
        <SelectBasic
          name="tag"
          label="Status"
          className="w-full sm:w-[220px]"
          options={[{ value: 'all', label: 'Todos' }, ...tagOptions]}
          value={searchParams?.tagId || 'all'}
          onChange={(value) => handleFilter('tagId', value)}
        />
      ) : null}
      {/* Ordenação (27/10/2026): pela data de criação ou pela do próximo
          contato, crescente ou decrescente; os grupos da lista seguem */}
      <div className="flex items-end gap-2">
        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          className="w-full sm:w-[200px]"
          options={[
            { value: 'createdAt', label: 'Data de criação' },
            { value: 'nextContactAt', label: 'Próximo contato' },
          ]}
          value={orderBy}
          onChange={(value) =>
            handleFilter('orderBy', value === 'createdAt' ? '' : value)
          }
        />
        <TooltipProvider>
          <ActionButton
            tooltip={
              sort === 'asc' ? 'Mais novo primeiro' : 'Mais antigo primeiro'
            }
            size="iconMd"
            variant="neutralOutline"
            Icon={sort === 'asc' ? IconSortDescending : IconSortAscending}
            onClick={() =>
              handleFilter('sort', sort === 'asc' ? 'desc' : 'asc')
            }
          />
        </TooltipProvider>
      </div>
    </>
  )
}

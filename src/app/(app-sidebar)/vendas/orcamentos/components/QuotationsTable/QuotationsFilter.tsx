'use client'

// React
// import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Components
// import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Third-party
// import { format } from 'date-fns'
// import { ptBR } from 'date-fns/locale'

export function QuotationsFilter({ searchParams }: SearchParamsType) {
  // const [date, setDate] = useState<Date>()

  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* <FormDatePickerSingle
        name="date"
        label="Concluído até"
        placeholder="Selecione uma data"
        width="w-[220px]"
        value={date}
        onSelect={(value) => {
          if (value) {
            setDate(value)
            handleFilter('date', format(value, 'P', { locale: ptBR }))
          } else {
            setDate(undefined)
            handleFilter('date', '')
          }
        }}
      /> */}
      <SelectSerieField
        name="serie"
        label="Série"
        width="w-[220px]"
        noForm
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        name="seller"
        label="Vendedor"
        width="w-[220px]"
        noForm
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
    </>
  )
}

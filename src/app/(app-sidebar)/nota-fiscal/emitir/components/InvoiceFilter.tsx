'use client'

import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import { useState, useEffect } from 'react'

// Components
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { getData } from '@/actions/_cruds'

const NFE_STATUS_OPTIONS = [
  { value: 'NAO_EMITIDA', label: 'Não emitida' },
  { value: 'EM_DIGITACAO', label: 'Em digitação' },
  { value: 'EMITIDA', label: 'Emitida' },
  { value: 'TODAS', label: 'Todas' },
]

export function InvoiceFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = new URLSearchParams(searchParams as Record<string, string>)

  // Estado para armazenar a opção inicial selecionada para o cliente
  const [selectedClient, setSelectedClient] = useState<{
    value: string
    label: string
  } | null>(null)

  // Carregar o nome do cliente selecionado caso haja um clientId na URL
  useEffect(() => {
    const clientId = searchParams?.clientId as string
    if (clientId) {
      getData({ route: `/client/${clientId}` }).then((res) => {
        if (res?.data) {
          setSelectedClient({ value: res.data.id, label: res.data.name })
        }
      })
    }
  }, [searchParams?.clientId])

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

  const handleNfeStatusChange = (value: string) => {
    params.set('nfeStatus', value)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleClientChange = (
    option: { value: string; label: string } | null,
  ) => {
    setSelectedClient(option)
    if (option?.value) {
      params.set('clientId', option.value)
    } else {
      params.delete('clientId')
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const defaultDateRange: DateRange | undefined =
    searchParams?.startDate && searchParams?.endDate
      ? {
          from: parseDateFromISO(searchParams.startDate as string),
          to: parseDateFromISO(searchParams.endDate as string),
        }
      : undefined

  const currentNfeStatus = (searchParams?.nfeStatus as string) || 'NAO_EMITIDA'

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label>Fase</Label>
        <Select value={currentNfeStatus} onValueChange={handleNfeStatusChange}>
          <SelectTrigger className="w-[160px] h-11">
            <SelectValue placeholder="Fase da NF" />
          </SelectTrigger>
          <SelectContent>
            {NFE_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AsyncSelectBasic
        route="/client"
        label="Cliente"
        placeholder="Buscar cliente..."
        value={selectedClient}
        onChange={handleClientChange}
        width="w-[200px]"
      />

      <DateRangePickerBasic
        label="Período"
        placeholder="Selecione um período"
        value={defaultDateRange}
        onChange={handleDateRangeChange}
      />
    </div>
  )
}

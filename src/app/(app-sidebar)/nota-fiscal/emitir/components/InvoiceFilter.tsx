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

  const recordType = searchParams?.recordType as string | undefined

  const handleRecordTypeChange = (value: string) => {
    params.set('recordType', value)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end p-4 border-b border-gray-100">
      <div className="w-full sm:w-1/4">
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          Tipo de Registro
        </Label>
        <Select
          value={recordType || 'TODOS'}
          onValueChange={handleRecordTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="PEDIDOS">Pedidos de Venda</SelectItem>
            <SelectItem value="NOTAS_AVULSAS">Notas Avulsas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[35%]">
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          Cliente (Razão Social ou Nome Fantasia)
        </Label>
        <AsyncSelectBasic
          route="/client"
          placeholder="Buscar cliente..."
          value={selectedClient}
          onChange={handleClientChange}
        />
      </div>

      <div className="w-full sm:w-1/4">
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          Status da NF
        </Label>
        <Select
          value={(searchParams?.nfeStatus as string | undefined) || 'TODOS'}
          onValueChange={handleNfeStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status da NF..." />
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

      <div className="w-full sm:w-[35%]">
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          Período
        </Label>
        <DateRangePickerBasic
          value={defaultDateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  )
}

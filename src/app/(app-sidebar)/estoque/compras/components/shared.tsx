'use client'

// O que as telas de compras e lotes compartilham (ES-8 a ES-17): os rótulos
// das situações, a linha do tempo, a escolha do material (com a variação)
// e a do fornecedor (o cadastro ou só o nome).

// React
import { useMemo, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getMaterials } from '@/actions/materials'
import { getSupplierOptions } from '@/actions/purchasing'

// Utils
import { parseCurrency } from '@/lib/utils'
import { materialUnitSymbol } from '@/consts/materials'

// Types
import type { BadgeType } from '@/types/coreTypes'
import type { TimelineEvent } from '../types'

// Third-party
import { useQuery } from '@tanstack/react-query'

export const requestStatusObj: { [key: string]: BadgeType } = {
  REQUESTED: { text: 'Solicitada', variant: 'blueLight' },
  QUOTING: { text: 'Em cotação', variant: 'warningLight' },
  ORDERED: { text: 'Em pedido', variant: 'purpleLight' },
  RECEIVED: { text: 'Recebida', variant: 'successLight' },
  CANCELED: { text: 'Cancelada', variant: 'neutralLight' },
}

export const orderStatusObj: { [key: string]: BadgeType } = {
  PENDING_DELIVERY: { text: 'Entrega pendente', variant: 'warningLight' },
  CHECKING: { text: 'Conferência', variant: 'blueLight' },
  FINISHED: { text: 'Finalizado', variant: 'successLight' },
  CANCELED: { text: 'Cancelado', variant: 'neutralLight' },
}

export const lotStatusObj: { [key: string]: BadgeType } = {
  CLOSED: { text: 'Fechado', variant: 'blueLight' },
  OPEN: { text: 'Aberto', variant: 'warningLight' },
  FINISHED: { text: 'Finalizado', variant: 'successLight' },
  CANCELED: { text: 'Cancelado', variant: 'neutralLight' },
}

export const measureOptions = [
  { value: 'ROLL', label: 'Rolo (largura × comprimento)' },
  { value: 'SHEET', label: 'Chapa (largura × altura)' },
  { value: 'UNIT', label: 'Por quantidade' },
]

export const brDate = (value: string | null) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
      ).toLocaleDateString('pt-BR')
    : '-'

export const brDateTime = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const qty = (value: number | null | undefined) =>
  value === null || value === undefined
    ? '-'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

/** "12,50" → 1250 (centavos). */
export const toCents = (value: string) =>
  Math.round(parseCurrency(value || '0') * 100)

/** "1,22" → 1.22 */
export const toNumber = (value: string) =>
  Number(
    String(value || '')
      .replace(/\./g, '')
      .replace(',', '.'),
  ) || 0

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return null
  return (
    <ol className="space-y-2 border-l border-gray-200 pl-4">
      {events.map((event, index) => (
        <li key={index} className="relative text-sm">
          <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-brand-500" />
          <p className="text-gray-900">{event.text}</p>
          <p className="text-xs text-gray">
            {event.byName} · {brDateTime(event.at)}
          </p>
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------ material */

export type MaterialChoice = {
  materialId: string
  variationId: string | null
  name: string
  unit: string
}

export function useMaterialOptions(enabled = true) {
  const { data } = useQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ['purchase-material-options'],
    queryFn: () => getMaterials({}),
    enabled,
  })
  return data?.data || []
}

export function MaterialPicker({
  value,
  onChange,
  label = 'Material',
}: {
  value: MaterialChoice | null
  onChange: (value: MaterialChoice | null) => void
  label?: string
}) {
  const materials = useMaterialOptions()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Cada variação (marca e cor) é uma escolha; o material sem variação, uma
  const options = useMemo(
    () =>
      materials.flatMap((material): MaterialChoice[] => {
        const unit = materialUnitSymbol(material.unit)
        return material.variations.length
          ? material.variations.map((variation) => ({
              materialId: material.id,
              variationId: variation.id,
              name: `${material.name} · ${[variation.brand, variation.color]
                .filter(Boolean)
                .join(' · ')}`,
              unit,
            }))
          : [
              {
                materialId: material.id,
                variationId: null,
                name: material.name,
                unit,
              },
            ]
      }),
    [materials],
  )
  const term = search.trim().toLowerCase()
  const shown = (
    term
      ? options.filter((option) => option.name.toLowerCase().includes(term))
      : options
  ).slice(0, 60)

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="neutralOutline"
            className="justify-start truncate font-normal"
          >
            {value ? `${value.name} (${value.unit})` : 'Escolher o material'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar material"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    value="__none"
                    onSelect={() => {
                      onChange(null)
                      setOpen(false)
                    }}
                  >
                    Sem material (descrever)
                  </CommandItem>
                )}
                {shown.map((option) => (
                  <CommandItem
                    key={`${option.materialId}|${option.variationId ?? ''}`}
                    value={`${option.materialId}|${option.variationId ?? ''}`}
                    onSelect={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                  >
                    <span className="truncate">{option.name}</span>
                    <span className="ml-auto text-xs text-gray">
                      {option.unit}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ---------------------------------------------------- fornecedor */

export type SupplierChoice = { supplierId: string | null; supplierName: string }

const OTHER = '__outro'

export function SupplierField({
  value,
  onChange,
}: {
  value: SupplierChoice
  onChange: (value: SupplierChoice) => void
}) {
  const { data: suppliers = [] } = useQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ['purchase-supplier-options'],
    queryFn: () => getSupplierOptions(),
  })
  const selected = value.supplierId ?? (value.supplierName ? OTHER : '')
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SelectBasic
        name="supplier"
        label="Fornecedor"
        placeholder="Escolher"
        value={selected || undefined}
        options={[
          ...suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          })),
          { value: OTHER, label: 'Outro (sem cadastro)' },
        ]}
        onChange={(next) => {
          const id = String(next)
          if (id === OTHER) onChange({ supplierId: null, supplierName: '' })
          else
            onChange({
              supplierId: id,
              supplierName:
                suppliers.find((supplier) => supplier.id === id)?.name ?? '',
            })
        }}
      />
      {selected === OTHER && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="supplier-name">Nome do fornecedor</Label>
          <Input
            id="supplier-name"
            value={value.supplierName}
            onChange={(event) =>
              onChange({ supplierId: null, supplierName: event.target.value })
            }
          />
        </div>
      )}
    </div>
  )
}

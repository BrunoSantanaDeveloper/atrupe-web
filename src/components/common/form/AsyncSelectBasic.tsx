'use client'

import AsyncSelect from 'react-select/async'
import { IconChevronDown as ChevronDown } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { getData } from '@/actions/_cruds'
import { Label } from '@/components/ui/label'

export const selectClassNames = {
  control: ({ isFocused }: { isFocused: boolean }) =>
    cn(
      'flex h-10 items-center w-full text-left rounded-lg border border-gray-300 bg-white shadow-xs px-3.5 py-2 text-sm',
      'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      isFocused ? 'ring-1 ring-brand border-brand' : '',
    ),
  valueContainer: () => 'px-0',
  input: () => 'm-0 p-0',
  indicatorSeparator: () => 'hidden',
  menu: (props: unknown) =>
    cn(
      'z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md mt-1 text-sm absolute w-full',
      (props as { selectProps: { menuIsOpen: boolean } }).selectProps.menuIsOpen
        ? 'opacity-100 scale-100 animate-in fade-in-0 zoom-in-95'
        : 'opacity-0 scale-95 animate-out fade-out-0 zoom-out-95',
    ),
  menuList: () => 'p-1',
  option: ({ isFocused }: { isFocused: boolean }) =>
    cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-3 pr-2',
      isFocused ? 'bg-gray-100 text-gray-900' : '',
    ),
  noOptionsMessage: () => 'text-sm py-1.5 px-2 text-gray-500',
  loadingMessage: () => 'text-sm py-1.5 px-2 text-gray-500',
  placeholder: () => 'text-gray',
}

interface Option {
  value: string
  label: string
}

interface Props {
  route: string
  label?: string
  placeholder?: string
  width?: string
  value?: Option | null
  onChange: (value: Option | null) => void
  minChars?: number
}

export function AsyncSelectBasic({
  route,
  label,
  placeholder = 'Selecione',
  width = 'w-[200px]',
  value,
  onChange,
  minChars = 3,
}: Props) {
  const loadOptions = async (query: string) => {
    if (query.length < minChars) return []
    const data = await getData({
      route,
      filters: { search: query },
      perPage: '9999',
    })
    return (data?.data || []).map((c: Record<string, unknown>) => ({
      value: c.id as string,
      label: c.name as string,
    }))
  }

  const loadDefaultOptions = async () => {
    const data = await getData({
      route,
      filters: { orderBy: 'updatedAt', orderDirection: 'desc', limit: '5' },
    })
    return (data?.data || []).map((c: Record<string, unknown>) => ({
      value: c.id as string,
      label: c.name as string,
    }))
  }

  return (
    <div className={cn('flex flex-col gap-2', width)}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <AsyncSelect
          cacheOptions
          defaultOptions={true}
          loadOptions={(query) =>
            query.length >= minChars ? loadOptions(query) : loadDefaultOptions()
          }
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < minChars
              ? `Digite pelo menos ${minChars} caracteres`
              : 'Nenhum resultado'
          }
          loadingMessage={() => 'Buscando...'}
          placeholder={placeholder}
          classNames={selectClassNames}
          unstyled
          components={{
            DropdownIndicator: () => (
              <Icon
                icon={ChevronDown}
                size="md"
                className="text-gray-700 mr-2"
              />
            ),
          }}
          onChange={(newValue) => onChange(newValue as Option | null)}
          value={value}
          isClearable
        />
      </div>
    </div>
  )
}

'use client'

// Components
import {
  FormMessage,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
} from '@/components/ui/form'

// Icons
import { User, ChevronDown, LucideIcon } from 'lucide-react'

// Lib
import { cn } from '@/lib/utils'
import { getDataOld } from '@/actions/_cruds'
import AsyncSelect from 'react-select/async'
import { useFormContext } from 'react-hook-form'
import { MenuProps, GroupBase } from 'react-select'

// Tipo genérico para qualquer entidade com id e nome
export interface EntityBase {
  id: string
  name: string
  [key: string]: unknown // Permite propriedades adicionais
}

// Tipo para as opções do select
export interface SelectOption {
  value: string
  label: string
  [key: string]: unknown // Permite dados adicionais
}

// Função genérica para buscar entidades
async function fetchEntities<T extends EntityBase>(
  query: string,
  route: string,
  filterField: string = 'search',
  mapFunction?: (entity: T) => SelectOption,
): Promise<SelectOption[]> {
  if (query.length < 3) return []

  const data = await getDataOld({
    route,
    filters: { [filterField]: query },
    perPage: '9999',
  })

  // Função padrão de mapeamento
  const defaultMapper = (entity: T): SelectOption => ({
    value: entity.id,
    label: entity.name,
  })

  // Usar a função de mapeamento personalizada ou a padrão
  const mapper = mapFunction || defaultMapper

  return (data?.data || []).map(mapper)
}

const classNames = {
  control: ({ isFocused }: { isFocused: boolean }) =>
    cn(
      'flex h-11 items-center w-full text-left rounded-lg border border-gray-300 bg-white shadow-sm px-3.5 py-2 text-sm pl-10',
      'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      isFocused ? 'ring-1 ring-brand border-brand' : '',
    ),
  valueContainer: () => 'px-0',
  input: () => 'm-0 p-0',
  indicatorSeparator: () => 'hidden',
  menu: (props: MenuProps<SelectOption, false, GroupBase<SelectOption>>) =>
    cn(
      'z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md mt-1 text-sm',
      props.selectProps.menuIsOpen
        ? 'opacity-100 scale-100 animate-in fade-in-0 zoom-in-95'
        : 'opacity-0 scale-95 animate-out fade-out-0 zoom-out-95',
    ),
  menuList: () => 'p-1',
  option: ({ isFocused }: { isFocused: boolean }) =>
    cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2',
      isFocused ? 'bg-gray-100 text-gray-900' : '',
    ),
  noOptionsMessage: () => 'text-sm py-1.5 px-2 text-gray-500',
  loadingMessage: () => 'text-sm py-1.5 px-2 text-gray-500',
  placeholder: () => 'text-gray',
}

interface Props<T extends EntityBase = EntityBase> {
  name: string
  label: string
  placeholder?: string
  width?: string
  value?: string
  route: string // Rota da API para buscar os dados
  filterField?: string // Campo usado para filtrar na API (default: 'search')
  icon?: LucideIcon // Ícone personalizado
  minChars?: number // Mínimo de caracteres para iniciar a busca
  mapFunction?: (entity: T) => SelectOption // Função para mapear entidades para opções
  additionalOnChange?: (value: string) => void
  emptyMessage?: string // Mensagem quando não há resultados
  loadingMessage?: string // Mensagem durante o carregamento
}

export function FormAsyncSelect<T extends EntityBase = EntityBase>({
  name,
  label,
  width,
  placeholder,
  route,
  filterField = 'search',
  icon: Icon = User,
  minChars = 3,
  mapFunction,
  emptyMessage = 'Vazio',
  loadingMessage = 'Buscando...',
  additionalOnChange,
}: Props<T>) {
  const form = useFormContext()
  const { control } = form

  // Função de carregamento específica para esta instância
  const loadOptions = (query: string) =>
    fetchEntities<T>(query, route, filterField, mapFunction)

  // Handler para processar mudanças no select
  const handleChange = (selectedOption: SelectOption | null) => {
    // Se tiver um callback adicional, chame-o com o valor selecionado
    if (additionalOnChange && selectedOption) {
      additionalOnChange(selectedOption.value)
    }
  }

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <div className="relative">
              <Icon className="size-5 text-gray absolute z-10 left-3.5 top-1/2 -translate-y-1/2" />
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < minChars
                    ? `Digite pelo menos ${minChars} caracteres`
                    : emptyMessage
                }
                loadingMessage={() => loadingMessage}
                placeholder={placeholder}
                classNames={classNames}
                unstyled
                components={{
                  DropdownIndicator: () => (
                    <ChevronDown className="size-5 text-gray-700" />
                  ),
                }}
                onChange={(newValue) => {
                  field.onChange(newValue)
                  handleChange(newValue as SelectOption | null)
                }}
                value={field.value}
                onBlur={field.onBlur}
                name={field.name}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

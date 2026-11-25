'use client'

// A lista com busca (Lista Lite 24/11, item 9): para listas longas, como os
// bancos do Banco Central. Mesmo visual do AsyncSelectBasic, mas com as
// opções já na mão; a busca casa o texto da opção, sem acento.

import Select from 'react-select'
import { IconChevronDown as ChevronDown } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { selectClassNames } from './AsyncSelectBasic'

interface Option {
  value: string
  label: string
}

interface Props {
  id: string
  label?: string
  placeholder?: string
  options: Option[]
  value?: string
  onChange: (value: string) => void
  isLoading?: boolean
  className?: string
}

export function SearchSelectBasic({
  id,
  label,
  placeholder = 'Selecione',
  options,
  value,
  onChange,
  isLoading,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select<Option>
        inputId={id}
        options={options}
        value={options.find((option) => option.value === value) ?? null}
        onChange={(option) => onChange(option?.value ?? '')}
        placeholder={placeholder}
        isLoading={isLoading}
        noOptionsMessage={() => 'Nenhum resultado'}
        loadingMessage={() => 'Carregando...'}
        classNames={selectClassNames}
        unstyled
        components={{
          DropdownIndicator: () => (
            <Icon icon={ChevronDown} size="md" className="mr-2 text-gray-700" />
          ),
        }}
      />
    </div>
  )
}
